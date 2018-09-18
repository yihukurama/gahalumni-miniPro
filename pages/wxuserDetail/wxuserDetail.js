// pages/wxuserDetail/wxuserDetail.js
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    previewData:{},
    navigateId:'',
    userInfo:{}
  },
  doCreateFormId: function (e) {
    app.helper.fn.request({
      url: app.helper.urls.comm.createFormId,
      method: 'POST',
      data: app.helper.fn.getRequestWrap({ openId: app.globals.wxSession.openid, formId: e.detail.formId, status: 1 }),
      loading: '数据处理中..',
      complete: function (datas) {
      }
    })
  },
  doDataInit:function(){
    var page = this;
    app.helper.fn.request({
      url: app.helper.urls.comm.loadPreview,
      method: 'POST',
      data: app.helper.fn.getRequestWrap({id : page.data.navigateId}),
      loading: '加载中..',
      complete: function (datas) {
        if (!datas || datas.length == 0) {
          wx.showToast({
            title: '未查询到数据',
            icon: 'none',
            duration: 1000
          });
          
          return;
        }
        console.debug(datas);
        page.setData({
          previewData: datas
        });
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var page = this;
    console.debug(options);
    page.setData({
      navigateId:options.id,
      userInfo:app.globals.userInfo
    })
    if(options.id == null || options.id == ''){
      wx.showToast({
        title: '无法获得有效的id',
        icon: 'none',
        duration: 1000
      });

      return;
    }
    page.doDataInit();

  },

  bindFormSubmit:function(e){
    var page = this;
    page.doCreateFormId(e);
    if (!page.data.previewData || !page.data.previewData.employeeEntity.mobile){
      wx.showToast({
        title: '该校有没有号码信息',
        icon: 'none',
        duration: 1000
      });
    }
    wx.makePhoneCall({
      phoneNumber: page.data.previewData.employeeEntity.mobile
    })

  },

  bindCheck:function(){
    var page = this;
    app.helper.fn.request({
      url: app.helper.urls.comm.updateWxuser,
      method: 'POST',
      data: app.helper.fn.getRequestWrap({ id: page.data.navigateId,
      auth:true }),
      loading: '加载中..',
      complete: function (datas) {
        if (!datas || datas.length == 0) {
          wx.showToast({
            title: '认证失败',
            icon: 'none',
            duration: 1000
          });

          return;
        }
        wx.showModal({
          title: '提示',
          content: '认证成功',
          showCancel: false,

        })
        page.doDataInit();
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})