module.exports = {
  name: 'Evestian Web Time Tracker',
  short_name: '__MSG_short_name__',
  description: '__MSG_description__',
  author: 'Ewelina Suska, Sebastian Tokarski',
  default_locale: 'en',
  offline_enabled: true,
  manifest_version: 2,
  icons: {
    16: 'assets/icon16.png',
    32: 'assets/icon32.png',
    48: 'assets/icon48.png',
    128: 'assets/icon128.png',
  },
  background: {
    scripts: ['background/index.js'],
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['contentscript/index.js'],
    },
  ],
  permissions: ['tabs', 'storage', 'unlimitedStorage', 'idle'],
  browser_action: {
    default_icon: {
      16: 'assets/icon16.png',
      32: 'assets/icon32.png',
      48: 'assets/icon48.png',
      128: 'assets/icon128.png',
    },
    default_title: 'Evestian Web Time Tracker',
    default_popup: 'popup/index.html',
  },
};
