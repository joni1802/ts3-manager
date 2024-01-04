const crypto = require("crypto");

/**
 * @link https://stackoverflow.com/a/72219174
 * The MD4 algorithm is not available anymore in Node.js 17+ (because of library SSL 3).
 * In that case, silently replace MD4 by the MD5 algorithm.
 */
try {
  crypto.createHash("md4");
} catch (e) {
  console.warn('Crypto "MD4" is not supported anymore by this Node.js version');
  const origCreateHash = crypto.createHash;
  crypto.createHash = (alg, opts) => {
    return origCreateHash(alg === "md4" ? "md5" : alg, opts);
  };
}

module.exports = {
  lintOnSave: undefined,
  runtimeCompiler: true,

  pwa: {
    name: "TS3 Manager",
    themeColor: "#FAFAFA",
    msTileColor: "#FFFFFF",
    appleMobileWebAppCapable: "yes",
    appleMobileWebAppStatusBarStyle: "black",
    manifestPath: "manifest.json",
    workboxOptions: {
      navigateFallback: "index.html",
      // Ignore api calls because this routes are handled on the server side (backend).
      navigateFallbackBlacklist: [/\/api\/.*/],
      // To make update on refresh available.
      // See https://stackoverflow.com/questions/54145735/vue-pwa-not-getting-new-content-after-refresh
      skipWaiting: true,
    },
    iconPaths: {
      favicon32: "img/icons/favicon.png",
      appleTouchIcon: "img/icons/ts3_manager.png",
      maskIcon: "img/icons/ts3_manager.svg",
      msTileImage: "img/icons/ts3_manager.png",
    },
  },
};
