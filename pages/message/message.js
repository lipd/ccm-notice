const app = getApp()
const config = app.config

// message.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    message: {},
    replys: [],
    inputContent: '',
    isComment: false,
    replyId: null,
    to: '',
    focus: false,
    placeholder: "有什么问题吗，写在这里吧!"
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
  handleTop: function () {
    this.setData({
      placeholder: "有什么问题吗，写在这里吧!",
      focus: true,
      isComment: false,
      replyId: null,
      to: ''
    })
  },
  handleReplyAt: function (e) {
    const author = e.currentTarget.dataset.author
    const id = e.currentTarget.dataset.id
    this.setData({
      placeholder: `回复${author}: `,
      focus: true,
      isComment: true,
      replyId: id,
      to: ''
    })
  },
  handleSubmit: function (e) {
    const content = this.data.inputContent
    if (content.length === 0) {
      wx.showToast({
        title: '内容不得为空'
      })
      return false
    }

    const token = wx.getStorageSync('token')
    const isComment = this.data.isComment
    const to = this.data.to
    if (!isComment) {
      wx.request({
        url: `${config.protocol}://${config.host}/messages/${this.id}/replys`,
        method: 'POST',
        header: { 'Authorization': token },
        data: { content },
        success: (res) => {
          const newReply = res.data.reply
          const time = new Date(newReply.createdAt)
          newReply.time = `${time.getFullYear()}/${time.getMonth()}/${time.getDate()}`
          const replys = this.data.replys
          const inputContent = ''
          replys.unshift(newReply)
          this.setData({ replys, inputContent })
          wx.showToast({
            title: '发送成功'
          })
        }
      })
    } else {
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
    }
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
        const replys = message.replys.map(reply => {
          const time = new Date(reply.createdAt)
          reply.time = `${time.getFullYear()}/${time.getMonth()}/${time.getDate()}`
          return reply
        })
        const date = new Date(message.createdAt)
        const minutesNum = date.getMinutes()
        const minutes = minutesNum < 10 ? '0' + minutesNum : minutesNum
        message.time = `${date.getFullYear()}/${date.getMonth()}/${date.getDate()} ${date.getHours()}:${minutes}`
        console.log(replys)
        this.setData({ message, replys })
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