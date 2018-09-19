// pages/index/feedBack/feedBack.js
var app=getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },

  // 输入事件
  bindinput: function (e) {
    var page = this;
    var data = page.data;
    var inputMember = e.target.dataset.inputMember;
    data[inputMember] = e.detail.value;
    page.setData(data);
  },
  
  doCreateFormId: function (e) {
    app.helper.fn.request({
      url: app.helper.urls.comm.createFormId,
      method: 'POST',
      data: app.helper.fn.getRequestWrap({ openId: app.globals.wxSession.openid, formId: e.detail.formId, status: 1 }),
      complete: function (datas) {
      }
    })
  },

  bindFormSubmit: function (e) {
    var page = this;
    

    if(!page.data.msg){
      wx.showModal({ title: '提醒', content: '请输入反馈信息', showCancel: false });
      return;
    }
    if (!app.globals.userInfo.emp) {
      wx.showModal({ title: '提醒', content: '请先完善个人信息再提建议', showCancel: false });
      return;
    }

    page.doCreateFormId(e);
    
    var feedBack = {
      uid:app.globals.userInfo.id,
      realName:app.globals.userInfo.emp.realName,
      content:page.data.msg
    }
    // 更新员工
    app.helper.fn.request({
      url: app.helper.urls.comm.createFeedBack,
      method: 'POST',
      data: app.helper.fn.getRequestWrap(feedBack),
      loading: '数据处理中..',
      complete: function (datas) {
        console.log(datas)
        if (datas) {
          wx.showModal({ title: '提醒', content: '操作成功', showCancel: false });
          
        } else {
          wx.showModal({ title: '提醒', content: '操作失败', showCancel: false });
        }

      }
    })

  },

})