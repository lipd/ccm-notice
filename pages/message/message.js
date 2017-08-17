const app = getApp()
const config = app.config

// message.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    message: {},
    inputContent: '',
    comment: false,
    to: '',
  },
  handleShare: function () {
    wx.showToast({
      title: '点击右上角进行分享',
      image: '../../img/share-hl.png',
    })
  },
  handleInput: function (e) {
    this.data.inputContent = e.detail.value
  },
  handleSubmit: function (e) {
    // const token = wx.getStorageSync('token')
    // const content = this.data.inputContent
    // if (content.length === 0) {
    //   wx.showToast({
    //     title: '内容不得为空'
    //   })
    //   return false
    // }
    // wx.request({
    //   url: `${config.protocol}://${config.host}/replys/${this.id}/comments`,
    //   method: 'POST',
    //   header: { 'Authorization': token },
    //   data: { content },
    //   success: (res) => {
    //     wx.showToast({ title: '发布成功' })
    //     const comments = res.data.data
    //     const commentContent = ''
    //     this.setData({ comments, commentContent })
    //   }
    // })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.id = options.id
    wx.request({
      url: `${config.protocol}://${config.host}/messages/${this.id}`,
      method: 'GET',
      success: (res) => {
        const message = res.data.message
        const date = new Date(message.createdAt)
        const minutesNum = date.getMinutes()
        const minutes = minutesNum < 10 ? '0' + minutesNum : minutesNum
        message.time = `${date.getFullYear()}/${date.getMonth()}/${date.getDate()} ${date.getHours()}:${minutes}`
        this.setData({ message })
      }
    })
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
  onShareAppMessage: function (res) {
    console.log(res)
    return {
      title: `${this.data.message.title}`,
      path: `/pages/message/message?id=${this.id}`
    }
  }
})