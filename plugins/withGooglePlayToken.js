const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

// ⚠️ IMPORTANT: Replace this with the EXACT token from Google Play Console
// Go to: Play Console → Setup → App Signing → "Sign and upload an APK"
// Copy the full token string exactly as shown
const TOKEN = 'CJ3LTTJXHTHD4AAAAAAAAAAAAA';

const withGooglePlayToken = (config) => {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      // Primary path — standard Android assets location
      const assetsDir = path.join(
        config.modRequest.platformProjectRoot,
        'app',
        'src',
        'main',
        'assets'
      );

      // Create the assets directory if it doesn't exist
      if (!fs.existsSync(assetsDir)) {
        fs.mkdirSync(assetsDir, { recursive: true });
      }

      // Remove old incorrectly-named file if it exists
      const oldTokenFilePath = path.join(assetsDir, TOKEN);
      if (fs.existsSync(oldTokenFilePath)) {
        fs.unlinkSync(oldTokenFilePath);
      }

      // Write the token file — must be named adi-registration.properties
      const tokenFilePath = path.join(assetsDir, 'adi-registration.properties');
      fs.writeFileSync(tokenFilePath, TOKEN);

      console.log(`✅ Google Play token file written to: ${tokenFilePath}`);

      return config;
    },
  ]);
};

module.exports = withGooglePlayToken;