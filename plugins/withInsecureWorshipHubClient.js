const { withMainApplication } = require('@expo/config-plugins');

// WorshipHub's local server is HTTPS with a self-signed certificate (no
// CA anywhere on the LAN to sign it) — this is a deliberate trust model
// shared with the desktop app's Rust client (see
// standalone/songs/src-tauri/src/worshiphub_client.rs): the connection
// carries nothing secret (song lyrics), it's LAN-local, and the actual
// authorization is the human approving the pairing on WorshipHub's own
// screen plus the token that hands back — not the TLS cert. On iOS,
// react-native-blob-util's `trusty: true` config option handles this
// entirely on its own (see its ios/ReactNativeBlobUtilRequest.mm). On
// Android, its OkHttp client needs a trust manager registered once at
// app startup — this plugin injects that registration into
// MainApplication.kt so it survives every `expo prebuild`.
const IMPORTS = [
  'import com.ReactNativeBlobUtil.ReactNativeBlobUtilUtils',
  'import java.security.cert.X509Certificate',
  'import javax.net.ssl.X509TrustManager',
];

const TRUST_MANAGER_ASSIGNMENT = `
    ReactNativeBlobUtilUtils.sharedTrustManager = object : X509TrustManager {
      override fun checkClientTrusted(chain: Array<X509Certificate>, authType: String) {}
      override fun checkServerTrusted(chain: Array<X509Certificate>, authType: String) {}
      override fun getAcceptedIssuers(): Array<X509Certificate> = arrayOf()
    }
`;

function withInsecureWorshipHubClient(config) {
  return withMainApplication(config, (config) => {
    let contents = config.modResults.contents;

    if (!contents.includes('ReactNativeBlobUtilUtils')) {
      const lastImportIndex = contents.lastIndexOf('\nimport ');
      const lineEnd = contents.indexOf('\n', lastImportIndex + 1);
      contents = `${contents.slice(0, lineEnd + 1) + IMPORTS.join('\n')}\n${contents.slice(lineEnd + 1)}`;
    }

    if (!contents.includes('sharedTrustManager')) {
      contents = contents.replace('super.onCreate()', `super.onCreate()\n${TRUST_MANAGER_ASSIGNMENT}`);
    }

    config.modResults.contents = contents;
    return config;
  });
}

module.exports = withInsecureWorshipHubClient;
