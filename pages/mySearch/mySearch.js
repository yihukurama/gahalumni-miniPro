Page({
  data: {
    realName: '',      // 姓名
    searchType: 0,      // 查询类型
    employees: [],          // 结果列表
    pagination: { limit: 20, page: 1, total: 0 },   // 分页参数
    scroll_view_height: 0,    // 滚动组件高度
  },

  // 生命周期函数--监听页面加载
  onLoad: function (options) {
    var page = this;
    var searchType = options.type ? parseInt(options.type) : 1;

    // 处理标题
    var title = '';
    if (searchType == 1) title = "查询校友";
    wx.setNavigationBarTitle({ title: title });

   
    // 计算页面高度
    var windowHeight = getApp().globals.systemInfo.windowHeight;
    var scroll_view_height = windowHeight - 108;
    // 赋值
    page.setData({ searchType: searchType,scroll_view_height: scroll_view_height });
  },

  // 生命周期函数--监听页面显示
  onShow: function () {
    var page = this;
    page.doRequestSearchStatistics();
    page.doRequestSearch();
  },

  // 绑定-查询关键字录入
  bindSearchInput: function (e) {
    this.setData({ realName: e.detail.value })
  },

  // 绑定-查询按钮
  bindSearch: function (e) {
    var page = this;
    var cases_statistics = { '149': 0, '160': 0, '40': 0, '35': 0, '400': 0, '80_1000': 0, '80_1100': 0 };
    page.setData({ cases: [], cases_distances: [], cases_locations: [], cases_statistics: cases_statistics });
    page.data.pagination = { limit: 20, page: 1, total: 0 };
    page.doRequestSearchStatistics();
    page.doRequestSearch();
  },

  // 滚动到底部的事件
  bindScrollToLower: function (e) {
    var page = this;
    if (page.data.searchType == 1) {
      return;
    }
    var pagination = page.data.pagination;
    if (pagination.limit * pagination.page < pagination.total) {
      page.data.pagination.page++;
      page.doRequestSearch();
    } else {
      wx.showToast({ title: '已全部加载完成', duration: 1000 })
    }
  },

  
  
  
  // 执行查询
  doRequestSearch: function () {


    console.log("模糊查询")
    var page = this;
    var app = getApp();



    var params;
    if (page.data.realName && page.data.realName!=''){
       params = { realName: page.data.realName }
    }
    
    app.helper.fn.request({
      url: app.helper.urls.comm.listEmpInfos,
      method: 'POST',
      data: app.helper.fn.getRequestWrap(params),
      loading: '加载中..' ,
      complete: function (datas) {
        if (!datas || datas.length == 0) {
          
          return;
        }
        page.setData({
          employees:datas
        });
      }
    })
  },

  // 执行查询查询统计数据,页面刷新才调用
  doRequestSearchStatistics: function () {
    var page = this;
    var acciPlate = page.data.acciPlate;
    var searchType = page.data.searchType;
    var userInfo = getApp().globals.userInfo;

    const format = n => { n = n.toString(); return n[1] ? n : '0' + n };
    var createDateGT = new Date().getFullYear() + '-'
      + format(new Date().getMonth() + 1) + '-'
      + format(new Date().getDate()) + ' 00:00:00';
    var createDateLT = new Date().getFullYear() + '-'
      + format(new Date().getMonth() + 1) + '-'
      + format(new Date().getDate()) + ' 23:59:59';

    
    
  },

  

  
  // 呼叫报案人
  bindCall: function (e) {
    wx.makePhoneCall({ phoneNumber: e.target.dataset.phoneNumber })
  },

 
})