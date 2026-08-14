import ExpoModulesCore
import Network

// A minimal HTTP/1.1 server + Bonjour advertisement (`_whsongs._tcp`, same
// service type standalone/songs' desktop app advertises — see
// src-tauri/src/server.rs / discovery.rs there) so the desktop app finds
// and pushes to this device the exact same way it finds another desktop
// instance, instead of this app having to poll a saved desktop address.
//
// Deliberately thin: this only speaks raw HTTP (parse a request, hand it
// to JS, write back whatever JS decides to respond) — no routing, no JSON
// parsing, no database access. All of that already exists on the JS side
// (db/songs-repository.ts, lib/songs-peer-client.ts) and is reused as-is
// via the `onRequest` event / `respond()` round-trip below. Keeping the
// protocol logic in JS means this native half never has to be touched
// again if the wire format changes.
public class LocalSyncServerModule: Module {
  private var listener: NWListener?
  private var connectionsById: [String: NWConnection] = [:]
  private let queue = DispatchQueue(label: "LocalSyncServer")

  public func definition() -> ModuleDefinition {
    Name("LocalSyncServer")

    Events("onRequest")

    Function("start") { (serviceName: String, port: Int) in
      self.queue.async {
        self.startServer(serviceName: serviceName, port: port)
      }
    }

    Function("stop") {
      self.queue.async {
        self.stopServer()
      }
    }

    Function("respond") { (requestId: String, status: Int, body: String) in
      self.queue.async {
        self.sendResponse(requestId: requestId, status: status, body: body)
      }
    }

    OnDestroy {
      self.queue.async {
        self.stopServer()
      }
    }
  }

  private func startServer(serviceName: String, port: Int) {
    stopServer()
    guard let nwPort = NWEndpoint.Port(rawValue: UInt16(port)) else { return }

    let params = NWParameters.tcp
    params.includePeerToPeer = false
    guard let newListener = try? NWListener(using: params, on: nwPort) else { return }
    // Combining the listener with a Bonjour service is what gets us both
    // "accept connections on this port" AND "show up in mDNS browsing" —
    // no separate NetService needed.
    newListener.service = NWListener.Service(name: serviceName, type: "_whsongs._tcp")
    newListener.newConnectionHandler = { [weak self] connection in
      self?.accept(connection)
    }
    newListener.stateUpdateHandler = { _ in }
    newListener.start(queue: queue)
    listener = newListener
  }

  private func stopServer() {
    listener?.cancel()
    listener = nil
    for (_, connection) in connectionsById {
      connection.cancel()
    }
    connectionsById.removeAll()
  }

  private func accept(_ connection: NWConnection) {
    connection.start(queue: queue)
    receiveMore(connection, accumulated: Data())
  }

  private func receiveMore(_ connection: NWConnection, accumulated: Data) {
    connection.receive(minimumIncompleteLength: 1, maximumLength: 65536) { [weak self] data, _, isComplete, error in
      guard let self = self else { return }
      var buffer = accumulated
      if let data = data, !data.isEmpty {
        buffer.append(data)
      }
      if error != nil {
        connection.cancel()
        return
      }
      if let parsed = self.parseRequest(buffer) {
        // A browser (the web build) preflights any POST with a JSON
        // Content-Type — answered here directly, same as desktop's own
        // `cors_allow_all` Axum middleware, rather than round-tripping
        // to JS for something that's identical on every route.
        if parsed.method == "OPTIONS" {
          self.sendRaw(connection, status: 204, statusText: "No Content", body: Data())
          return
        }
        let requestId = UUID().uuidString
        self.connectionsById[requestId] = connection
        self.sendEvent("onRequest", [
          "requestId": requestId,
          "method": parsed.method,
          "path": parsed.path,
          "body": parsed.body,
        ])
        return
      }
      if isComplete {
        connection.cancel()
        return
      }
      self.receiveMore(connection, accumulated: buffer)
    }
  }

  private struct ParsedRequest {
    let method: String
    let path: String
    let body: String
  }

  // Returns nil (meaning "wait for more bytes") until the header block is
  // complete AND the full Content-Length body has arrived. Good enough
  // for the single small JSON POST/GET requests this server ever
  // receives — no chunked transfer encoding, no keep-alive/pipelining.
  private func parseRequest(_ data: Data) -> ParsedRequest? {
    let crlfcrlf = Data([0x0d, 0x0a, 0x0d, 0x0a])
    guard let headerEndRange = data.range(of: crlfcrlf) else { return nil }
    let headerData = data.subdata(in: data.startIndex..<headerEndRange.lowerBound)
    guard let headerText = String(data: headerData, encoding: .utf8) else { return nil }
    let lines = headerText.components(separatedBy: "\r\n")
    guard let requestLine = lines.first else { return nil }
    let parts = requestLine.split(separator: " ")
    guard parts.count >= 2 else { return nil }
    let method = String(parts[0])
    let path = String(parts[1])

    var contentLength = 0
    for line in lines.dropFirst() {
      let kv = line.split(separator: ":", maxSplits: 1)
      guard kv.count == 2, kv[0].trimmingCharacters(in: .whitespaces).lowercased() == "content-length" else { continue }
      contentLength = Int(kv[1].trimmingCharacters(in: .whitespaces)) ?? 0
    }

    let bodyStart = headerEndRange.upperBound
    let bodyBytesAvailable = data.distance(from: bodyStart, to: data.endIndex)
    if bodyBytesAvailable < contentLength { return nil }

    let bodyEnd = data.index(bodyStart, offsetBy: contentLength)
    let bodyData = data.subdata(in: bodyStart..<bodyEnd)
    let body = String(data: bodyData, encoding: .utf8) ?? ""
    return ParsedRequest(method: method, path: path, body: body)
  }

  private func sendResponse(requestId: String, status: Int, body: String) {
    guard let connection = connectionsById[requestId] else { return }
    connectionsById[requestId] = nil
    sendRaw(connection, status: status, statusText: statusText(status), body: body.data(using: .utf8) ?? Data())
  }

  // Every response — including the OPTIONS short-circuit above — carries
  // the same CORS headers desktop's `cors_allow_all` Axum middleware
  // adds to every route, since a browser (the web build) reaching this
  // server needs them regardless of which route answered.
  private func sendRaw(_ connection: NWConnection, status: Int, statusText: String, body: Data) {
    var responseText = "HTTP/1.1 \(status) \(statusText)\r\n"
    responseText += "Content-Type: application/json\r\n"
    responseText += "Content-Length: \(body.count)\r\n"
    responseText += "Access-Control-Allow-Origin: *\r\n"
    responseText += "Access-Control-Allow-Methods: GET, POST, OPTIONS\r\n"
    responseText += "Access-Control-Allow-Headers: content-type\r\n"
    responseText += "Connection: close\r\n\r\n"

    var responseData = responseText.data(using: .utf8) ?? Data()
    responseData.append(body)

    connection.send(content: responseData, completion: .contentProcessed { _ in
      connection.cancel()
    })
  }

  private func statusText(_ status: Int) -> String {
    switch status {
    case 200: return "OK"
    case 400: return "Bad Request"
    case 404: return "Not Found"
    default: return "Error"
    }
  }
}
