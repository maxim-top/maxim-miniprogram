//index.js
//获取应用实例

var QR = require("../../../third/qrcode.js");
Page({
  data: {
    searchText: '',
    rosterInfo: {},
    alias: '',
    navHeight: 0,
    profile: {},
  },


  onLoad: function () {
    let menuButtonObject = wx.getMenuButtonBoundingClientRect();
    wx.getSystemInfo({
      success: res => {
        let statusBarHeight = res.statusBarHeight,
          navHeight = statusBarHeight + menuButtonObject.height + (menuButtonObject.top - statusBarHeight) * 2;//导航高度
        this.setData({ navHeight });
      },
      fail(err) {
        console.log(err);
      }
    })


    const app = getApp().globalData;
    const uid = app.im.userManage.getUid();
    const info  = {
      info:{
        uid,
      },
      action: 'profile',
      source: 'wechat'
    }

    const infoStr = JSON.stringify(info);
    
    var size = this.setCanvasSize(); //动态设置画布大小 
    this.createQrCode(infoStr, "mycanvas", size.w, size.h);   


    const token = app.im.userManage.getToken();
    const app_id = app.im.userManage.getAppid();
    app.im.userManage.asyncGetProfile(true).then(profile => {
      let avatar = profile.avatar;
      if (avatar) {
        if (avatar.indexOf('http') !== 0) {
          avatar = 'https://api.maxim.top/file/download/avatar?object_name=' + avatar;
        }
        avatar = avatar + '&image_type=2' + '&access-token=' + token + '&app_id=' + app_id;
      } else {
        avatar = '../../image/roster.png';
      }
      profile.avatar = avatar;
      // profile.nick_name = profile.alias || profile.nick_name || profile.username;
      this.setData({ profile })
    });
  },

  setCanvasSize: function () {
    var size = {};
    try {
      var res = wx.getSystemInfoSync();
      var scale = 750 / 600; 
      var width = res.windowWidth / scale;
      var height = width; //canvas画布为正方形
      size.w = width;
      size.h = height;
    } catch (e) {
      // Do something when catch error
      console.log("获取设备信息失败" + e);
    }
    return size;
  },
  /**
   * 绘制二维码图片
   */
  createQrCode: function (url, canvasId, cavW, cavH) {
    //调用插件中的draw方法，绘制二维码图片
    QR.api.draw(url, canvasId, cavW, cavH);
    setTimeout(() => {
      this.canvasToTempImage();
    }, 1000);
  },
  /**
   * 获取临时缓存照片路径，存入data中
   */
  canvasToTempImage: function () {
    var that = this;
    //把当前画布指定区域的内容导出生成指定大小的图片，并返回文件路径。
    wx.canvasToTempFilePath({
      canvasId: 'mycanvas',
      success: function (res) {
        var tempFilePath = res.tempFilePath;
        console.log(tempFilePath);
        that.setData({
          imagePath: tempFilePath,
          // canvasHidden:true
        });
      },
      fail: function (res) {
        console.log(res);
      }
    });
  },
  

  backClick() {
    wx.navigateBack();
  },

  
})
