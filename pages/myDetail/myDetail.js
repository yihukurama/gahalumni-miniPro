// pages/myDetail/myDetail.js
var app = getApp();
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: app.globals.userInfo,
    showTopTips: false,
    summitDisable:false,
    radioItems: [
      { name: '私密（仅自己可见）', value: '1' },
      { name: '认证校友可见', value: '2', checked: true }
    ],

    isAgree: true,
    tips:'错误提示',
    departments: [],   //从后台获取的数据
    departmentNames: [], //部门名集合
    departmentNameIndex: 0, //所选部门下标

    //以下为后台数据
    wxuser: {},//从后台获取的微信用户数据
    empId: null,
    workAge: '',
    departmentId: '',   //部门id
    realName: '',
    code: '',
    note: '',
    phoneNo: '',

  },


  //选择毕业年份
  bindDateChange: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      workAge: e.detail.value
    })
  },
  
  //初始化页面数据
  doInitData: function (isRefresh) {

    var page = this;
    var userInfo = app.globals.userInfo;
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
          userInfo: userInfo,
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

        if (!userInfo.emp) {
          page.setData({
            departmentId: departMents[0].id,
            departmentNameIndex: 0
          });
        }

        for (var i = 0; i < departMents.length; i++) {
          departmentNames.push(departMents[i].text);
          if (userInfo.emp && userInfo.emp.departmentId == departMents[i].id){
              page.setData({
                departmentId: departMents[i].id,
                departmentNameIndex:i
              });
          } 

        }
        console.debug(departmentNames)
        page.setData({
          departments: departMents,
          departmentNames: departmentNames
        });
      }
    })

    app.helper.fn.request({
      url: app.helper.urls.comm.wxuserList,
      method: 'POST',
      data: app.helper.fn.getRequestWrap({ userId: userInfo.id }),
      loading: isRefresh ? '加载微信用户数据中..' : null,
      complete: function (datas) {

        if (datas) {
          console.log(datas)
          page.setData({
            wxuser: datas[0]

          })
        }

        switch (datas[0].privacyLevel) {
          case 1:
            page.setData({
              radioItems: [
                { name: '私密（仅自己可见）', value: '1', checked: true },
                { name: '认证校友可见', value: '2', checked: false },
              ],
            })
            break;
          case 2:
            page.setData({
              radioItems: [
                { name: '私密（仅自己可见）', value: '1', checked: false },
                { name: '认证校友可见', value: '2', checked: true },
              ],
            })
            break;
          case 3:
            page.setData({
              radioItems: [
                { name: '私密（仅自己可见）', value: '1', checked: false },
                { name: '认证校友可见', value: '2', checked: false },
              ],
            })
            break;
          default:
            page.setData({
              radioItems: [
                { name: '私密（仅自己可见）', value: '1', checked: false },
                { name: '认证校友可见', value: '2', checked: true },
              ],
            })

        }

      }
    })

    //设置个人信息
    for (var i = 0; i < page.data.departments.length; i++) {
      if (userInfo.emp &&userInfo.emp && userInfo.emp.departMentId == page.data.departments[i].id) {
        page.setData({
          departmentNameIndex: i
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
        department: '请选择校友会',
        workAge: '请选择国华毕业年份'
      });
    }

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

  // 输入事件
  bindinput: function (e) {
    var page = this;
    var data = page.data;
    var inputMember = e.target.dataset.inputMember;
    data[inputMember] = e.detail.value;
    page.setData(data);
  },


  doShowTopTips: function (tips) {
    var that = this;
    this.setData({
      tips: tips,
      showTopTips: true
      
    });
    setTimeout(function () {
      that.setData({
        showTopTips: false
      });
    }, 3000);
  },


  doCheckUpdateDatas: function(){
    var page = this;
    if (!page.data.departmentNames[page.data.departmentNameIndex]){
      page.doShowTopTips('请选择组织');
      return false;
    }
    if (!(/^1[34578]\d{9}$/.test(page.data.phoneNo))) {
      page.doShowTopTips('请输入正确的手机号');
      return false;
    }
    if (!page.data.realName) {
      page.doShowTopTips('请填写真实姓名');
      return false;
    }
    if (!page.data.workAge) {
      page.doShowTopTips('请填写毕业年份');
      return false;
    }
    if (!page.data.wxuser.schoolName) {
      page.doShowTopTips('请填写就读高校');
      return false;
    }
    if (!page.data.wxuser.occupation) {
      page.doShowTopTips('请填写社会职业');
      return false;
    }
    if (!page.data.wxuser.nowAddr) {
      page.doShowTopTips('请填写当前地址');
      return false;
    }
    if (!page.data.wxuser.companyName) {
      page.doShowTopTips('请填写就职公司');
      return false;
    }

    return true;
  },

  doCreateFormId:function(e){
    app.helper.fn.request({
      url: app.helper.urls.comm.createFormId,
      method: 'POST',
      data: app.helper.fn.getRequestWrap({ openId: app.globals.wxSession.openid,formId:e.detail.formId,status:1}),
      complete: function (datas) {
      }
    })
  },

  bindFormSubmit: function (e) {
    var page = this;
    page.setData({
      summitDisable: true,
    })
    page.doCreateFormId(e);

    var userInfo = page.data.userInfo;
    if(!page.doCheckUpdateDatas()){
      page.setData({
        summitDisable: false,
      })
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
    uploadDatas.wxuser = page.data.wxuser;
    // 更新员工
    app.helper.fn.request({
      url: app.helper.urls.comm.updateEmp,
      method: 'POST',
      data: app.helper.fn.getRequestWrap(uploadDatas),
      loading: '数据处理中..',
      complete: function (datas) {
        console.log(datas)
        if (datas) {
          wx.showModal({
            title: '提示',
            content: '操作成功',
            showCancel: false,
            
          })
          app.globals.userInfo.emp = datas;
          app.globals.userInfo.employeeName = datas.realName;
          
        } else {
          wx.showModal({
            title: '提示',
            content: '操作失败',
            showCancel: false,

          })

        }
        page.setData({
          summitDisable: false,
        })
      }
    })

  },



  //选择保密等级
  radioChange: function (e) {
    console.log('radio发生change事件，携带value值为：', e.detail.value);

    var radioItems = this.data.radioItems;
    var wxuser = this.data.wxuser;
    for (var i = 0, len = radioItems.length; i < len; ++i) {
      if(radioItems[i].value == e.detail.value){
        radioItems[i].checked = e.detail.value
        wxuser.privacyLevel = i+1;
      }else{
        radioItems[i].checked = false
      }

     
    }

    this.setData({
      radioItems: radioItems,
      wxuser:wxuser
    });
  },

  bindDepartmentNameChange: function (e) {
    console.log('picker country code 发生选择改变，携带值为', e.detail.value);

    this.setData({
      departmentNameIndex: e.detail.value,
      departmentId: this.data.departments[e.detail.value].id
    })
  },

  bindAgreeChange: function (e) {
    this.setData({
      isAgree: !!e.detail.value.length
    });
  }
})