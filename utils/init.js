
/************用户登录 S************/

// 微信登录
const _wxLogin = (complete) => {
  var app = getApp();
  var wxSession = wx.getStorageSync("WX_SESSION");
  const loginFn = () => {
    wx.login({
      complete: res => {
        if (!res || !res.code) {
          console.log("微信登录失败");
          complete(null);
          return;
        }
        app.helper.fn.request({
          url: app.helper.urls.comm.jsCodeSession, method: 'GET', data: { code: res.code, type: 1 }, loading: null,
          complete: function (data) {
            if (!data || !data.openid) {
              console.log("获取openId失败");
              complete(null);
              return;
            }
            console.log(data);
            wx.setStorageSync("WX_SESSION", data);
            complete(data);
          }
        })
      }
    })
  }
  if (wxSession && wxSession.openid) {
    wx.checkSession({
      success: function () { complete(wxSession); },
      fail: function () { loginFn(); }
    });
  }
  else loginFn();
}
// 获取微信用户信息
const _wxGetUserInfo = (complete) => {
  wx.getUserInfo({
    complete: res => {
      console.log(res);
      if (!res || !res.userInfo) {
        console.log("获取微信用户信息失败");
        complete(null);
        return;
      }
      wx.setStorageSync("WX_USERINFO", res.userInfo);
      complete(res.userInfo);
    }
  })
}
// 用户登录
const loginOnServer = (complete) => {
  var app = getApp();
  _wxLogin(function (wxSession) {
    if (wxSession) {
      _wxGetUserInfo(function (wxUserInfo) {
        if (!wxUserInfo) {
          wx.showModal({ title: '错误提醒', content: '微信获取用户信息失败', showCancel: false });
          return
        }

        var data = wxUserInfo;
        data.nickName = encodeURIComponent(wxUserInfo.nickName);
        data.perOpenId = wxSession.openid;
        data.type = 1;
        app.helper.fn.request({
          url: app.helper.urls.comm.loginByOpenId,
          method: 'POST',
          data: app.helper.fn.getRequestWrap(data),
          loading: null,
          complete: function (data) {
            var userInfo = data ? data : null;
            app.globals.wxSession = wxSession;
            // app.globals.wxUserInfo = wxUserInfo;
            app.globals.userInfo = userInfo;
            complete(wxSession, userInfo);
          }
        })
      })


    } else {
      wx.showModal({ title: '错误提醒', content: '微信授权登录失败', showCancel: false });
      complete(null, null, null);
    }
  })
}

/************用户登录 E************/





/************基础资料 S************/
//加载部门数据
const _requestDepartment = (isRefresh, complete) => {
  var app = getApp();
  var departMents = wx.getStorageSync("DEPARTMENT");
  if (departMents && !isRefresh) {
    app.globals.departMents = departMents;
    complete(departMents);
    return;
  }
  app.helper.fn.request({
    url: app.helper.urls.comm.departMentsList,
    method: 'POST',
    data: app.helper.fn.getRequestWrap({ orgId: '3a2e9ac84e8311e8984b6c92bf46f236'}),
    loading: isRefresh ? '加载部门中..' : null,
    complete: function (datas) {
      if (!datas || datas.length == 0) {
        console.log("获取部门数据失败");
        complete(null);
        return;
      }
      departMents = [];
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
      console.log(departMents)
      complete(departMents);
    }
  })
}

// 加载服务网点数据
const _requestServiceBranchs = (isRefresh, complete) => {
  var app = getApp();
  var serviceBranchs = wx.getStorageSync("SERVICE_BRANCHS");
  if (serviceBranchs && !isRefresh) {
    app.globals.serviceBranchs = serviceBranchs;
    complete(serviceBranchs);
    return;
  }
  app.helper.fn.request({
    url: app.helper.urls.comm.serviceBranchList,
    method: 'POST',
    data: app.helper.fn.getRequestWrap({}),
    loading: isRefresh ? '加载网点中..' : null,
    complete: function (datas) {
      if (!datas || datas.length == 0) {
        console.log("获取服务网点数据失败");
        complete(null);
        return;
      }
      serviceBranchs = [];
      for (var i = 0; i < datas.length; i++) {
        var item = datas[i];
        if (item.text == "名雅办公室" || item.text == "高层管理" || item.text == "报价岗"
          || item.text == "在线直赔点" || item.text == "测试网点" || item.text == "公司"
          || !item.lat || !item.lng)
          continue;
        serviceBranchs.push({
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
      wx.setStorageSync("SERVICE_BRANCHS", serviceBranchs);
      app.globals.serviceBranchs = serviceBranchs;
      complete(serviceBranchs);
    }
  })
}

// 加载上面全部资料
const loadDatas = (isRefresh, complete) => {
  _requestServiceBranchs(isRefresh, function (serviceBranchs) {
    complete(serviceBranchs);
  })
}


/************基础资料 E************/



/************读取解析场景 S************/

// 读取场景参数
const _loadScene = (scene, complete) => {
  if (!scene) {
    console.log("未找到场景参数");
    complete(null);
    return;
  }
  if (scene instanceof Object) {
    complete(scene);
    return;
  }
  var app = getApp();
  var params = app.helper.fn.getRequestWrap({ scene: scene });
  app.helper.fn.request({
    url: app.helper.urls.comm.wxaCodeList,
    method: 'POST',
    data: params,
    loading: null,
    complete: function (datas) {
      if (!datas || !datas.length || datas.length == 0) {
        console.log("未能从服务器找到场景参数");
        complete(null);
        return;
      }
      complete(datas[0]);
    }
  })
}



// 创建案件通知消息
const _createNotice = (aCase, type, params, complete) => {
  var app = getApp();
  var userInfo = app.globals.userInfo;
  var title = '';
  var content = '';
  if (type == 10) {
    title = '案件受理通知';
    content = '您的交通事故报案已被佛山快处快赔服务中心受理，点击可查询处理进度。';
  } else if (type == 20) {
    title = '案件现场音视频采集通知';
    content = '您的交通事故案件缺少相关资料，请点击此通知连线服务中心工作人员进行现场资料采集。';
  } else if (type == 30) {
    title = '案件资料补充通知';
    content = '您的交通事故案件缺少相关资料，请点击此处根据页面提示进行图片补充，如需帮助请拨0757-82622229';
  } else if (type == 40) {
    title = '案件协议书签名通知';
    content = '您好，根据您上传的事故现场情形图片，现已划分事故责任并出具了《道路交通事故自行协商协议书》，请点击此处接受并进行手写签名确认';
  }
  var notice = { title: title, content: content, toUser: userInfo.id, params: params, carPlates: aCase.acciPlate };
  app.helper.fn.request({
    url: app.helper.urls.comm.notifyCreate,
    method: 'POST',
    data: app.helper.fn.getRequestWrap(notice),
    loading: null,
    complete: function () {
      complete();
    }
  })
}




// 根据场景参数进行页面跳转,scene场景ID或者场景对象，isSplash是否在起始页面
const redirectBySceneParams = (scene, isSplash) => {
  var _redirect = (msg) => {
    if (isSplash) {
      if (msg) {
        wx.showModal({
          title: '信息提示',
          content: msg,
          showCancel: false,
          complete: () => {
            // wx.switchTab({ url: '/pages/accident/index/index' })
            wx.redirectTo({ url: '/pages/accident/index/index' });
          }
        });
      } else {
        // wx.switchTab({ url: '/pages/accident/index/index' });
        wx.redirectTo({ url: '/pages/accident/index/index' });
      }
    } else {
      wx.hideLoading();
      if (msg) {
        wx.showModal({ title: '信息提示', content: msg, showCancel: false });
      }
    }
  }

  if (!isSplash) wx.showLoading({ title: '加载中...', mask: true });
  if (!scene) { _redirect('参数错误'); return; }

  // 加载具体参数
  _loadScene(scene, function (sceneParams) {
    var params = JSON.parse(sceneParams && sceneParams.params ? sceneParams.params : '{}');
    console.log(params)
    if (!params || !params.type) { _redirect('该通知已失效'); return; }
    if (!params.caseId || !params.carId) { _redirect('案件已经失效或案件已关闭'); return; }
    // if (params.type == 20 && params.timestamp && new Date(params.timestamp).getTime() < new Date().getTime()) {
    //   _redirect('该视频通道已超过有效时间，如需要连线中心，可重新发起视频通道或电话呼叫中心'); return;
    // }

    // 加载案件
    loadCase(params.caseId, params.carId, function (aCase, car, isCarOwner) {
      if (!aCase || !car) { _redirect('案件已经失效或案件已关闭'); return; }
      if (params.type == 40 && !isCarOwner) { _redirect('该协议书的车辆不是您驾驶的，请联系中心修正'); return; }

      var url = '';
      var isTab = false;
      var caseStr = JSON.stringify(aCase);
      var carStr = JSON.stringify(car);
      var urlParams = '?case=' + caseStr + '&car=' + carStr + '&uid=' + params.uid + '&isOwner=' + isCarOwner;
      // 根据type 进入不同的页面，关注：10，视频：20，补充：30，签名：40
      switch (params.type) {
        case 20: url = '/pages/realVideo/realVideo'; isTab = false; break;
        case 30: url = '/pages/accident/supplementSubmit/supplementSubmit'; isTab = true; break;
        case 40: url = '/pages/accident/agreementSubmit/agreementSubmit'; isTab = true; break;
        default: url = '/pages/accident/index/index'; isTab = true; break;
      }
      var redirectByType = function () {
        wx.hideLoading();
        if (isTab) {
          // wx.switchTab({ url: url + urlParams });
          wx.redirectTo({ url: url + urlParams });
        } else {
          wx.redirectTo({ url: url + urlParams });
        }
      }
      if (isSplash) {
        _createNotice(aCase, params.type, sceneParams.params, function () { redirectByType(); })
      } else {
        redirectByType();
      }
    })
  })
}

/************读取解析场景 E************/
module.exports = {
  loginOnServer: loginOnServer,
  redirectBySceneParams: redirectBySceneParams,
  loadDatas: loadDatas
}