Page({
  data: {
    phoneNo: '',
    verifyCode: '',
    smsStatus: { text: "获取验证码", disabled: false }
  },


  // 用户登录


    // 用户登录
    bindLogin: function (options) {
      getApp().init.loginOnServer(function (wxSession, userInfo) {
        if (wxSession && userInfo) {
          getApp().init.loadDatas(false, function () {
            //options.scene = 'eb8e8f168d8a4ce9b3ff1d317cfbc6ce';
            if (!options.scene || options.scene.length < 5) {
              // wx.switchTab({ url: '/pages/accident/index/index' });
              wx.redirectTo({ url: '/pages/index/index' });
              return;
            }
            getApp().init.redirectBySceneParams(options.scene, true);
          })
        }
      })


    }
 


}) 