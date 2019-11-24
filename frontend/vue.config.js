module.exports = {
  lintOnSave: undefined,
  runtimeCompiler: true,

  pwa: {
    name: 'TS3 Manager',
    themeColor: '#FAFAFA',
    msTileColor: '#FFFFFF',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black',
    manifestPath: 'manifest.json',
    workboxOptions: {
      navigateFallback: 'index.html',
      skipWaiting: true // To make update on refresh available. See https://stackoverflow.com/questions/54145735/vue-pwa-not-getting-new-content-after-refresh
    },
    iconPaths: {
      favicon32: 'img/icons/favicon.png',
      appleTouchIcon: 'img/icons/ts3_manager_logo.png',
      maskIcon: 'img/icons/ts3_manager_logo.svg',
      msTileImage: 'img/icons/ts3_manager_logo.png'
    }
  }
}
