// pages/myDetail/myDetail.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    empId: null,
    workAge: '',
    departments: [],   //从后台获取的数据
    departmentNames: [], //部门名集合
    selectDepartment: null,  //选择的数据
    departmentId: '',   //部门id
    realName: '',
    code: '',
    note: '',
    phoneNo: '',
    departmentIndex: 0
  },

  // 输入事件
  bindinput: function (e) {
    var page = this;
    var data = page.data;
    var inputMember = e.target.dataset.inputMember;
    data[inputMember] = e.detail.value;
    page.setData(data);
  },

  formSubmit: function (e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
    var page = this;
    var app = getApp();
    var userInfo = getApp().globals.userInfo;
    if (!userInfo.id || !page.data.departmentId || !app.globals.orgId || !page.data.phoneNo || !page.data.realName || !page.data.workAge || !page.data.code) {

      wx.showModal({ title: '错误提醒', content: '请填入所有数据', showCancel: false });
      return;
    }
    var uploadDatas = {};
    /**
     * 用户id
     */
    uploadDatas.userId = userInfo.id;
    /**
     * 员工id
     */
    console.log(userInfo)
    if (userInfo.emp && userInfo.emp.id) {
      uploadDatas.empId = userInfo.emp.id;
    }
    /**
     * 部门id
     */
    uploadDatas.departMentId = page.data.departmentId;

    /**
     * 机构id
     */
    uploadDatas.orgId = app.globals.orgId;
    /**
     * 电话号码
     */
    uploadDatas.phoneNum = page.data.phoneNo;
    /**
     * 真实姓名
     */
    uploadDatas.realName = page.data.realName;
    /**
     * 年限
     */
    uploadDatas.workAge = page.data.workAge;
    /**
     * 编码
     */
    uploadDatas.code = page.data.code;
    uploadDatas.note = page.data.note;
    // 更新员工
    app.helper.fn.request({
      url: app.helper.urls.comm.updateEmp,
      method: 'POST',
      data: app.helper.fn.getRequestWrap(uploadDatas),
      loading: '数据处理中..',
      complete: function (datas) {
        console.log(datas)
        if (datas) {
          wx.showModal({ title: '提醒', content: '更新成功', showCancel: false });
          app.globals.userInfo.emp = datas;
        } else {
          wx.showModal({ title: '提醒', content: '更新失败', showCancel: false });
        }

      }
    })

  },



  // 个人信息填充
  doRequestInit: function (isRefresh) {
    var page = this;
    var userInfo = getApp().globals.userInfo;
    if (!userInfo) {
      userInfo = getApp().globals.userInfo;
    }
    if (!userInfo) {
      wx.redirectTo({ url: '/pages/login/login' });
      return;
    }

    for (var i = 0; i < page.data.departments.length; i++) {
      if (userInfo.emp && userInfo.emp.departMentId == page.data.departments[i].id) {
        page.setData({
          departmentIndex: i
        })
      }
    }

    if (userInfo.emp) {
      this.setData({
        department: userInfo.emp.departmentName,
        phoneNo: userInfo.emp.mobile,
        organization: userInfo.emp.orgName,
        realName: userInfo.employeeName,
        code: userInfo.emp.code,
        departmentId: userInfo.emp.departmentId,
        workAge: userInfo.emp.workAge,
        note: userInfo.emp.note
      });
    } else {
      this.setData({
        workAge: '请选择'
      });
    }
    var params = { userName: userInfo.username, token: userInfo.token };
  },

  bindDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      workAge: e.detail.value
    })
  },
  bindDepChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)

    this.setData({
      selectDepartment: this.data.departments[e.detail.value],
      departmentId: this.data.departments[e.detail.value].id
    })
  },

  initData: function (isRefresh) {

    var page = this;
    var app = getApp();
    // 从后台获取机构
    app.helper.fn.request({
      url: app.helper.urls.comm.orgLoad,
      method: 'POST',
      data: app.helper.fn.getRequestWrap({ id: app.globals.orgId }),
      loading: isRefresh ? '加载机构中..' : null,
      complete: function (datas) {
        if (!datas || datas.length == 0) {
          complete(null);
          return;
        }
        page.setData({
          orgName: datas.text
        });
      }
    })

    // 从后台获取部门
    app.helper.fn.request({
      url: app.helper.urls.comm.departMentsList,
      method: 'POST',
      data: app.helper.fn.getRequestWrap({ orgId: '3a2e9ac84e8311e8984b6c92bf46f236' }),
      loading: isRefresh ? '加载部门中..' : null,
      complete: function (datas) {
        console.log("获取部门数据中。。。")
        if (!datas || datas.length == 0) {
          console.log("获取部门数据失败");
          complete(null);
          return;
        }
        var departMents = [];
        for (var i = 0; i < datas.length; i++) {
          var item = datas[i];
          departMents.push({
            id: item.id,
            code: item.code,
            tel: item.tel,
            text: item.text,
            principal: item.principal ? item.principal.realName : '',
            address: item.areaText + item.address,
            lat: item.lat,
            lng: item.lng
          })
        }
        wx.setStorageSync("DEPARTMENT", departMents);
        app.globals.departMents = departMents;
        var departmentNames = [];

        for (var i = 0; i < departMents.length; i++) {
          departmentNames.push(departMents[i].text);


        }

        page.setData({
          departments: departMents,
          departmentNames: departmentNames
        });
      }
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.initData(true);
    this.doRequestInit(true);
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