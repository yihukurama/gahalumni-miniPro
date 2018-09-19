
// 域名
const hosts = {
  comm: {

    host: 'http://localhost:8082',
    host_static: 'http://localhost',
    // host: 'https://www.ghxyh.cn/api',
    // host_static: 'https://www.ghxyh.cn',
  },
}

// 请求地址
const urls = {
  comm: {
    listEmpInfos: hosts.comm.host + "/MiniProV1Controller/listEmpInfos", //查询个人信息
    updateEmp: hosts.comm.host + "/MiniProV1Controller/updatePersonalInfo", //更新个人信息
    orgLoad: hosts.comm.host + "/AdminBaseController/Organization/load", //获取机构详情
    departMentsList: hosts.comm.host + "/AdminBaseController/Department/list",// 查询服务网点
    wxuserList: hosts.comm.host + "/BusinessBaseController/Wxuser/list",//查询绑定的微信数据
    serviceBranchList: hosts.comm.host + "/AdminBaseController/Servicebranch/list",// 查询服务网点
    jsCodeSession: hosts.comm.host + "/business/public/api/jscode2session", // 获取用户OPENID
    loginByOpenId: hosts.comm.host + "/business/public/api/loginByOpenId", // 根据openid登录
    bindWxuser: hosts.comm.host + "/business/public/api/bindWxUser", // 绑定微信用户
    tagsList: hosts.comm.host + "/BusinessBaseController/Tags/list", // 查询标签
    tagsCreate: hosts.comm.host + "/BusinessBaseController/Tags/create", // 标签创建
    tagRemove: hosts.comm.host + "/BusinessBaseController/Tags/remove", // 标签创建
    loadPreview: hosts.comm.host + "/MiniProV1Controller/loadPreview", // 查看校友详情
    createFormId: hosts.comm.host + "/BusinessBaseController/Formids/create", // 创建formId
    createFeedBack: hosts.comm.host + "/BusinessBaseController/Feedback/create", // 创建留言
    updateWxuser: hosts.comm.host + "/BusinessBaseController/Wxuser/update", // 更新微信用户
  }
}

// 常用方法
const fn = {
  formatTime: date => {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    const second = date.getSeconds()
    const formatNumber = n => {
      n = n.toString()
      return n[1] ? n : '0' + n
    }
    return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
  },
  // 获取请求参数包装
  getRequestWrap: params => {
    return {
      uid: getApp().globals.userInfo ? getApp().globals.userInfo.id : '',
      page: 0,
      limit: 0,
      data: params
    }
  },
  // 网络请求 opt:{ url,data,method,complete,isToast,loading,isOnlyData}
  request: (opt) => {
    var header = opt.header || 'application/x-www-form-urlencoded';
    if (!opt.data) opt.data = {};
    if (opt.data.hasOwnProperty('limit') && opt.data.hasOwnProperty('page')) { header = 'application/json'; }
    if (!opt.complete) opt.complete = function () { };
    if (!opt.hasOwnProperty('isOnlyData')) opt.isOnlyData = true;  // 只回调返回data.data的数据结果
    if (!opt.hasOwnProperty('isToast')) opt.isToast = false;
    if (!opt.hasOwnProperty('data')) opt.data = {};
    if (!opt.hasOwnProperty('method')) opt.method = 'POST';
    if (!opt.hasOwnProperty('loading')) opt.loading = '数据请求中';

    if (opt.loading) {
      wx.showLoading({ title: opt.loading, mask: true });
    }
    wx.request({
      url: opt.url, data: opt.data, method: opt.method, header: { 'content-type': header },
      fail: function (res) {
        if (opt.loading) wx.hideLoading();
        let content = opt.url + ' ' + res.statusCode;
        if (res.errMsg && /timeout/.test(res.errMsg)) {
          content = opt.url + ' ' + '接口请求超时';
        }
        wx.showModal({
          title: '网络错误', content: content, showCancel: false,
          complete: function () { opt.complete(null); }
        });
      },
      success: function (res) {
        if (res.statusCode && res.statusCode !== 200) {
          if (opt.loading) wx.hideLoading();
          wx.showModal({
            title: '网络错误', content: opt.url + ' ' + res.statusCode, showCancel: false,
            complete: function () { opt.complete(null); }
          });
          return;
        }
        var result = res.data;
        if (result.hasOwnProperty('success')) {
          if (result.success) {
            opt.complete(opt.isOnlyData ? result.data : result);
            if (opt.loading) wx.hideLoading();
            if (opt.isToast) { wx.showToast({ title: '操作成功', duration: 1500 }); }
          } else {
            if (opt.noShowError) {
              opt.complete(null);
            } else {
              if (opt.loading) wx.hideLoading();
              wx.showModal({
                title: '请求出错', content: result.msg || '数据请求失败', showCancel: false,
                complete: function () { opt.complete(null); }
              });
            }
          }
        } else {
          opt.complete(opt.isOnlyData ? result.data || result : result);
          if (opt.loading) wx.hideLoading();
        }
      }
    });
  },

  saveFormId: function (data) {
    fn.request({
      url: urls.comm.formidCreate, //保存formId
      method: 'POST',
      data: fn.getRequestWrap(data),
      loading: null,
    })
  },
}




module.exports = {
  hosts: hosts,
  urls: urls,
  fn: fn
}
