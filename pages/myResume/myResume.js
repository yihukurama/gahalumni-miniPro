// pages/myDetail/myDetail.js
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo:{},
    tags:{},
    hasTags:[],
    newTag:[],
    inputTag:''
  },

  // 输入事件
  bindinput: function (e) {
    var page = this;
    var data = page.data;
    var inputMember = e.target.dataset.inputMember;
    data[inputMember] = e.detail.value;
    page.setData(data);
  },

  bindFormSubmit: function (e) {
    var page = this;
    page.data.newTag.push(page.data.inputTag);
    console.debug(page.data.inputTag);
    console.debug(page.data.newTag);
    console.debug(page.data.userInfo);

    var params = {
      userId:page.data.userInfo.id,
      text: page.data.inputTag
    }
    app.helper.fn.request({
      url: app.helper.urls.comm.tagsCreate,
      method: 'POST',
      data: app.helper.fn.getRequestWrap( params ),
      loading: false ? '提交中..' : null,
      complete: function (datas) {
    
        if (!datas) {
          wx.showModal({ title: '提醒', content: '创建失败', showCancel: false });
          return;
        }
        wx.showModal({ title: '提醒', content: '创建成功', showCancel: false });
        page.doInitData(false);
        return;
      }
    })
  },


  
  doInitData: function (isRefresh) {
    var page = this;
    var userInfo = getApp().globals.userInfo;
    // 从后台获取个人标签
    app.helper.fn.request({
      url: app.helper.urls.comm.tagsList,
      method: 'POST',
      data: app.helper.fn.getRequestWrap({ userId: userInfo.id }),
      loading: isRefresh ? '查询中..' : null,
      complete: function (datas) {
        if (!datas || datas.length == 0) {
          page.setData({
            userInfo: userInfo,
            
          });
          return;
        }
        page.setData({
          userInfo:userInfo,
          tags: datas
        });
        console.log(datas);
      }
    })

  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var page = this;
    var userInfo = app.globals.userInfo;
    
    if (!userInfo) {
      wx.redirectTo({ url: '/pages/login/login' });
      return;
    }

    this.doInitData(true);
  },

  
})