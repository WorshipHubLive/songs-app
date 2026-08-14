package expo.modules.localsyncserver

import android.content.Context
import android.net.nsd.NsdManager
import android.net.nsd.NsdServiceInfo
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import java.io.BufferedOutputStream
import java.io.ByteArrayOutputStream
import java.io.InputStream
import java.net.ServerSocket
import java.net.Socket
import java.util.UUID
import java.util.concurrent.ConcurrentHashMap
import kotlin.concurrent.thread

// Android mirror of ios/LocalSyncServerModule.swift — see that file's
// header comment for the overall design (thin native HTTP+mDNS bridge,
// all protocol/DB logic stays in JS). NsdManager handles the Bonjour/mDNS
// side (`_whsongs._tcp.`, same service type standalone/songs' desktop app
// advertises), a plain ServerSocket handles the HTTP side — one thread
// accepting connections, one short-lived thread per connection (this
// server only ever sees one client, the desktop, at a time).
class LocalSyncServerModule : Module() {
  private var serverSocket: ServerSocket? = null
  private var nsdManager: NsdManager? = null
  private var registrationListener: NsdManager.RegistrationListener? = null
  private val sockets = ConcurrentHashMap<String, Socket>()

  override fun definition() = ModuleDefinition {
    Name("LocalSyncServer")

    Events("onRequest")

    Function("start") { serviceName: String, port: Int ->
      startServer(serviceName, port)
    }

    Function("stop") {
      stopServer()
    }

    Function("respond") { requestId: String, status: Int, body: String ->
      sendResponse(requestId, status, body)
    }

    OnDestroy {
      stopServer()
    }
  }

  private fun startServer(serviceName: String, port: Int) {
    stopServer()
    val socket = try {
      ServerSocket(port)
    } catch (e: Exception) {
      return
    }
    serverSocket = socket

    thread(start = true) {
      while (true) {
        val client = try {
          socket.accept()
        } catch (e: Exception) {
          break // socket closed by stopServer()
        }
        thread(start = true) { handleClient(client) }
      }
    }

    registerNsd(serviceName, port)
  }

  private fun registerNsd(serviceName: String, port: Int) {
    val context = appContext.reactContext ?: return
    val manager = context.getSystemService(Context.NSD_SERVICE) as? NsdManager ?: return
    val info = NsdServiceInfo().apply {
      this.serviceName = serviceName
      this.serviceType = "_whsongs._tcp."
      this.port = port
    }
    val listener = object : NsdManager.RegistrationListener {
      override fun onServiceRegistered(info: NsdServiceInfo) {}
      override fun onRegistrationFailed(info: NsdServiceInfo, errorCode: Int) {}
      override fun onServiceUnregistered(info: NsdServiceInfo) {}
      override fun onUnregistrationFailed(info: NsdServiceInfo, errorCode: Int) {}
    }
    try {
      manager.registerService(info, NsdManager.PROTOCOL_DNS_SD, listener)
      nsdManager = manager
      registrationListener = listener
    } catch (e: Exception) {
      // Advertising failed (e.g. permission revoked) — the HTTP server
      // still runs, it just won't show up in the desktop's mDNS browse;
      // manual "connect by address" (already supported) still works.
    }
  }

  private fun stopServer() {
    try {
      registrationListener?.let { nsdManager?.unregisterService(it) }
    } catch (e: Exception) {
      // wasn't registered — ignore
    }
    registrationListener = null
    nsdManager = null

    try {
      serverSocket?.close()
    } catch (e: Exception) {
      // already closed — ignore
    }
    serverSocket = null

    sockets.values.forEach {
      try {
        it.close()
      } catch (e: Exception) {
        // already closed — ignore
      }
    }
    sockets.clear()
  }

  private fun handleClient(socket: Socket) {
    try {
      val input = socket.getInputStream()
      val headerBytes = readUntilDoubleCrlf(input)
      if (headerBytes == null) {
        socket.close()
        return
      }
      val headerText = String(headerBytes, Charsets.UTF_8)
      val lines = headerText.split("\r\n")
      val requestLine = lines.firstOrNull()
      if (requestLine == null) {
        socket.close()
        return
      }
      val parts = requestLine.split(" ")
      if (parts.size < 2) {
        socket.close()
        return
      }
      val method = parts[0]
      val path = parts[1]

      var contentLength = 0
      for (line in lines.drop(1)) {
        val idx = line.indexOf(':')
        if (idx <= 0) continue
        val key = line.substring(0, idx).trim().lowercase()
        val value = line.substring(idx + 1).trim()
        if (key == "content-length") {
          contentLength = value.toIntOrNull() ?: 0
        }
      }

      val bodyBytes = ByteArray(contentLength)
      var read = 0
      while (read < contentLength) {
        val n = input.read(bodyBytes, read, contentLength - read)
        if (n < 0) break
        read += n
      }
      val body = String(bodyBytes, 0, read, Charsets.UTF_8)

      val requestId = UUID.randomUUID().toString()
      sockets[requestId] = socket

      sendEvent(
        "onRequest",
        mapOf(
          "requestId" to requestId,
          "method" to method,
          "path" to path,
          "body" to body
        )
      )
    } catch (e: Exception) {
      try {
        socket.close()
      } catch (ignored: Exception) {
      }
    }
  }

  // Reads raw bytes up through (and stops right after) the first
  // "\r\n\r\n", without over-reading past it — unlike a BufferedReader,
  // which would swallow following body bytes into its own internal
  // buffer where we couldn't get them back to read the body ourselves.
  private fun readUntilDoubleCrlf(input: InputStream): ByteArray? {
    val buffer = ByteArrayOutputStream()
    val target = byteArrayOf(13, 10, 13, 10) // \r\n\r\n
    var matched = 0
    while (true) {
      val b = input.read()
      if (b == -1) return null
      buffer.write(b)
      if (b == target[matched].toInt()) {
        matched++
        if (matched == target.size) {
          val bytes = buffer.toByteArray()
          return bytes.copyOfRange(0, bytes.size - 4)
        }
      } else {
        matched = if (b == target[0].toInt()) 1 else 0
      }
      if (buffer.size() > 65536) return null // guard against unbounded headers
    }
  }

  private fun sendResponse(requestId: String, status: Int, body: String) {
    val socket = sockets.remove(requestId) ?: return
    try {
      val bodyBytes = body.toByteArray(Charsets.UTF_8)
      val statusText = if (status == 200) "OK" else "Error"
      val header = "HTTP/1.1 $status $statusText\r\n" +
        "Content-Type: application/json\r\n" +
        "Content-Length: ${bodyBytes.size}\r\n" +
        "Connection: close\r\n\r\n"
      val output = BufferedOutputStream(socket.getOutputStream())
      output.write(header.toByteArray(Charsets.UTF_8))
      output.write(bodyBytes)
      output.flush()
    } catch (e: Exception) {
      // client likely disconnected already — nothing to do
    } finally {
      try {
        socket.close()
      } catch (ignored: Exception) {
      }
    }
  }
}
