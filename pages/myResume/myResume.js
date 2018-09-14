// pages/myDetail/myDetail.js
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: {},
    tags: {},
    inputTag: '',
    delTag: false
  },

  bindTag: function (e) {

    var page = this;

    page.setData({
      delTag: !page.data.delTag
    })

    var tagData = e.currentTarget.dataset.item;
    wx.showModal({
      title: '提示',
      content: `是否删除标签${tagData.text}`,
      success: function (res) {
        if (res.confirm) {
          app.helper.fn.request({
            url: app.helper.urls.comm.tagRemove,
            method: 'POST',
            data: app.helper.fn.getRequestWrap({id:tagData.id}),
            loading: false ? '提交中..' : null,
            complete: function (datas) {

              if (!datas) {
                wx.showToast({
                  title: '操作失败',
                  icon: 'fail',
                  duration: 1000
                });
                return;
              }
              wx.showToast({
                title: '已完成',
                icon: 'success',
                duration: 1000
              });
              
              page.doInitData(false);
              return;
            }
          })
        }
      }
    });


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
    if (page.data.tags != null && page.data.tags.length > 3) {
      wx.showModal({ title: '提醒', content: '个人标签最多4个', showCancel: false });
      return;
    }

    if (page.data.inputTag == null || page.data.inputTag == '') {
      wx.showModal({ title: '提醒', content: '新增标签不能为空', showCancel: false });
    }
    var params = {
      userId: page.data.userInfo.id,
      text: page.data.inputTag
    }
    app.helper.fn.request({
      url: app.helper.urls.comm.tagsCreate,
      method: 'POST',
      data: app.helper.fn.getRequestWrap(params),
      loading: false ? '提交中..' : null,
      complete: function (datas) {

        if (!datas) {
          wx.showToast({
            title: '创建失败',
            icon: 'fail',
            duration: 1000
          });
          return;
        }
        wx.showToast({
          title: '创建成功',
          icon: 'success',
          duration: 1000
        });
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
          userInfo: userInfo,
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