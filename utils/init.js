
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
          loading: '登录中...',
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




/************读取解析场景 E************/
module.exports = {
  loginOnServer: loginOnServer,
  loadDatas: loadDatas
}