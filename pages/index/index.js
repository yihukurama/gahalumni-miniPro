Page({
  data: {
    organization: '',   // 所属机构
    department:'',
    realName: '',       // 姓名
    userCode: '',       // 用户编码
    userHeadImage: '',  // 用户头像
    now_time: '',       // 当前日期与星期
    bindBoxAccountVal: '',
    status:'',
    alreadyBindAccount: '',  //已绑账号
  },
  statechange(e) {
    console.log(e);
  },
  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    
  },

  // 生命周期函数--监听页面显示
  onShow: function () {
    this.doRequestInit(true)
    this.doShowWeekDate();
    this.doWechatLogin(false);
  },

  // 帮助
  bindCallService: function (e) {
    wx.makePhoneCall({ phoneNumber: '0757-26637111' })
  },

  // 清理缓存
  bindRequestRefresh: function (e) {
      wx.showToast({ title: '操作成功', duration: 1000 });
  },

  // 退出登录
  bindExit: function (e) {
    wx.showModal({
      title: '操作确认', content: '确认退出登录吗？',
      success: function (res) {
        if (!res.confirm) return;
        wx.clearStorage();
        wx.redirectTo({ url: '/pages/login/login' });
      }
    })
  },

  // 根据token校验登录信息,获取个人信息
  doRequestInit: function (isRefresh) {
    var page = this;
    var userInfo = getApp().globals.userInfo;
    console.log(userInfo);
    if (!userInfo) {
      userInfo = getApp().globals.userInfo;
    }
    if (!userInfo) {
      wx.redirectTo({ url: '/pages/login/login' });
      return;
    }
    if (userInfo.emp){
      this.setData({
        organization: userInfo.emp.orgName,   // 所属机构
        department: userInfo.emp.departmentName,
        realName: userInfo.emp.realName,       // 姓名
        userCode: userInfo.emp.code,       // 用户编码
        status: userInfo.status
      });
    }else{
      page.setData({
        organization: '--',
        alreadyBindAccount: '--',
        realName: '--',
        userCode: '--',
        department:'--',
        status:0
      });
    }

    
    var params = { userName: userInfo.username, token: userInfo.token };
    
  },

  // 获取日期和星期 格式：2017年12月13日 星期三
  doShowWeekDate: function () {
    var page = this;
    var date = new Date();
    const format = n => { n = n.toString(); return n[1] ? n : '0' + n };
    var dateStr = date.getFullYear() + '年' + format(date.getMonth() + 1) + '月' + format(date.getDate()) + '日';
    var week = date.getDay();
    if (week == 0) {
      week = "星期日";
    } else if (week == 1) {
      week = "星期一";
    } else if (week == 2) {
      week = "星期二";
    } else if (week == 3) {
      week = "星期三";
    } else if (week == 4) {
      week = "星期四";
    } else if (week == 5) {
      week = "星期五";
    } else if (week == 6) {
      week = "星期六";
    }
    page.setData({ now_time: dateStr + ' ' + week });
  },

  // 微信登录状态校验
  doWechatLogin: function (isRefresh) {
    var page = this;
    wx.checkSession({
      success: function () {
        //session 未过期，并且在本生命周期一直有效
        var wechat_user = getApp().globals.wxUserInfo;
        if (!wechat_user) {
          
          wechat_user = getApp().globals.wxUserInfo;
        }
        if (wechat_user) {
          if (!isRefresh) {
            if (page.data.userHeadImage != wechat_user.avatarUrl) {
              page.setData({ userHeadImage: wechat_user.avatarUrl });
            }
            return;
          }
        }
        wx.getUserInfo({
          withCredentials: true,
          success: function (res) {
            if (res && res.userInfo) {
              wx.setStorageSync("wechat_user", res.userInfo);
              if (res.userInfo.avatarUrl) {
                page.setData({ userHeadImage: res.userInfo.avatarUrl });
              }
            }
          }
        })
      },
      fail: function () {
        //登录态过期
        wx.login({
          success: function (res) {
            
          },
          fail: function (res) {
            wx.showModal({ title: '提示信息', content: res.message || '微信授权登录失败', showCancel: false });
          }
        })
      }
    })
  },

  //绑定系统账号
  bindOpenBindBox: function () {
    this.setData({ bindIngAccount: true });
  },

  bindCloseBindBox: function () {
    this.setData({ bindIngAccount: false })
  },

  bindAccountInput: function (e) {
    this.setData({ bindBoxAccountVal: e.detail.value });
  },

  bindBindAccount: function () {
    const page = this;
    const userInfo = getApp().globals.userInfo;
    const bindBoxAccountVal = page.data.bindBoxAccountVal;

    if (!bindBoxAccountVal) { return; }
    let confirmText = '是否确定绑定账号：' + bindBoxAccountVal;
    if (page.data.alreadyBindAccount){
      confirmText = '是否重新绑定账号：' + bindBoxAccountVal;
    }
    wx.showModal({
      title: '操作确认', content: confirmText,
      success: function (res) {
        if (!res.confirm) return;
        bind();
      }
    })

    function bind() {
      
    }

  },


})