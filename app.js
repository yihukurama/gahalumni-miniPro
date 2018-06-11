App({
  helper: require("/utils/helper.js"),  // 常用工具
  init: require("/utils/init.js"),      // 初始化用户场景
 

  onLaunch: function () {

  },
  globals: {
    systemInfo: wx.getSystemInfoSync(),
    wxSession: null,
    wxUserInfo: null,
    userInfo: null,
    carLogos: null,
    departMents: null,
    serviceBranchs: null,

    orgId:"3a2e9ac84e8311e8984b6c92bf46f236"
  },


})