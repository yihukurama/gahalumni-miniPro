Page({
  data: {
    searchCodes: ["姓名", "地址", "届别", "公司", "高校", "职业", "简介", "标签"],
    searchCodeIndex: 0,
    searchText: '', //查询内容
    employees: [], // 结果列表
    noReasult:false,
    pagination: {
      limit: 20,
      page: 1,
      total: 0
    }, // 分页参数
    scroll_view_height: 0, // 滚动组件高度
  },

  // 生命周期函数--监听页面加载
  onLoad: function(options) {
    var page = this;
    var searchType = options.type ? parseInt(options.type) : 1;
    
    // 处理标题
    var title = '';
    if (searchType == 1) title = "查询校友";
    wx.setNavigationBarTitle({
      title: title
    });


    // 计算页面高度
    var windowHeight = getApp().globals.systemInfo.windowHeight;
    var scroll_view_height = windowHeight - 108;
    // 赋值
    page.setData({
      searchType: searchType,
      scroll_view_height: scroll_view_height
    });
  },

  // 生命周期函数--监听页面显示
  onShow: function() {
    var page = this;
    
    page.doRequestSearch();
  },

  //绑定
  bindSearchCodesChange: function(e) {
    console.log('picker country code 发生选择改变，携带值为', e.detail.value);

    this.setData({
      searchCodeIndex: e.detail.value
    })
  },
  // 绑定-查询关键字录入
  bindSearchInput: function(e) {
    this.setData({
      searchText: e.detail.value
    })
  },

  // 绑定-查询按钮
  bindSearch: function(e) {
    var page = this;

    page.data.pagination = {
      limit: 20,
      page: 1,
      total: 0
    };
   
    page.doRequestSearch();
  },

  // 滚动到底部的事件
  bindScrollToLower: function(e) {
    var page = this;
    
    var pagination = page.data.pagination;
    console.log(pagination)
    if (pagination.limit * pagination.page < pagination.total) {
      page.data.pagination.page++;
      page.doRequestSearch(true);
    } else {
      wx.showToast({
        title: '已全部加载完成',
        duration: 2000
      })
    }
  },

 




  // 执行查询
  doRequestSearch: function(isAddData) {


    console.log("模糊查询")
    var page = this;
    var app = getApp();



    var params;
    console.debug(page.data.searchCodeIndex);
    if (page.data.searchText && page.data.searchText != '') {
      console.debug(page.data.searchCodeIndex);
      switch (parseInt(page.data.searchCodeIndex)) {
        case 0:
          params = {
            realName: page.data.searchText
          }
          break;
          params = {
            realName: page.data.searchText
          }
        case 1:
          params = {
            nowAddr: page.data.searchText
          }
          break;
        case 2:
          params = {
            workAge: page.data.searchText
          }
          break;
        case 3:
          params = {
            companyName: page.data.searchText
          }
          break;
        case 4:
          params = {
            schoolName: page.data.searchText
          }
          break;
        case 5:
          params = {
            occupation: page.data.searchText
          }
          break;
        case 6:
          params = {
            profile: page.data.searchText
          }
          break;
        case 7:
          params = {
            tagText: page.data.searchText
          }
          break;
        default:

      }




    } else {

    }
    console.log(page.data.pagination)
    app.helper.fn.request({
      url: app.helper.urls.comm.listEmpInfos,
      method: 'POST',
      data: {
        uid: getApp().globals.userInfo ? getApp().globals.userInfo.id : '',
        page: page.data.pagination.page,
        limit: page.data.pagination.limit,
        data: params},
      isOnlyData:false,
      loading: '加载中..',
      complete: function(datas) {
        if (!datas || !datas.success ) {
          
          page.setData({
            noReasult: true,
            
            employees: []
          });
          return;
        }
        if ( datas.data.length == 0) {
          wx.showToast({
            title: '未查询到数据',
            icon: 'none',
            duration: 2000
          });
          page.setData({
            noReasult: true,

            employees: datas.data,
            
          });
         
          return;
        }
        

        for(var i=0;i<datas.data.length;i++){
          datas.data[i].nickName = decodeURI(datas.data[i].nickName);
        }

        var employees = datas.data;
        if (isAddData){
          employees = page.data.employees;
          employees.push.apply(employees, datas.data);
        }
        
        page.setData({
          noReasult: false,
          
          employees: employees,
          pagination: {
            page:page.data.pagination.page,
            limit: page.data.pagination.limit,
            total: datas.total
          }
        });
      }
    })
  },


  bindPreview: function(e){
    console.debug(e);
    wx.navigateTo({
      url: '../wxuserDetail/wxuserDetail?id=' + e.currentTarget.id,
    })
  }

})