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
    submitHandler: {
      placeholder: "有什么问题吗，写在这里吧!",
      isComment: false,
      replyId: null,
      to: '',
    },
    voted: false,
    focus: false,
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
      submitHandler: {
        placeholder: "有什么问题吗，写在这里吧!",
        isComment: false,
      },
      focus: true,
    })
  },
  handleReplyComment: function (e) {
    const author = e.currentTarget.dataset.author
    const id = e.currentTarget.dataset.id
    this.setData({
      submitHandler: {
        placeholder: `回复${author}: `,
        isComment: true,
        replyId: id,
        to: ''
      },
      focus: true,
    })
  },
  handleMessageDownVote: function () {
    const id = this.id
    const message = this.data.message
    const token = wx.getStorageSync('token')
    wx.request({
      url: `${config.protocol}://${config.host}/messages/${id}/downvote`,
      header: { 'Authorization': token },
      method: 'PUT',
      success: (res) => {
        message.voted = false
        message.votesNum -= 1
        this.setData({ message })
        const pages = getCurrentPages()
        const lastPage = pages[pages.length - 2]
        lastPage.onReady()
      },
      fail: () => {
        wx.showToast({
          title: '取消投票失败'
        })
      }
    })
  },
  handleMessageUpVote: function () {
    const id = this.id
    const message = this.data.message
    const token = wx.getStorageSync('token')
    wx.request({
      url: `${config.protocol}://${config.host}/messages/${id}/upvote`,
      header: { 'Authorization': token },
      method: 'PUT',
      success: (res) => {
        message.voted = true
        message.votesNum += 1
        this.setData({ message })
        const pages = getCurrentPages()
        const lastPage = pages[pages.length - 2]
        lastPage.onReady()
      },
      fail: () => {
        wx.showToast({
          title: '投票失败'
        })
      }
    })
  },
  handleReplyUpVote: function (e) {
    const id = e.currentTarget.dataset.id
    const index = e.currentTarget.dataset.index
    const token = wx.getStorageSync('token')
    wx.request({
      url: `${config.protocol}://${config.host}/replys/${id}/upvote`,
      header: { 'Authorization': token },
      method: 'PUT',
      success: (res) => {
        const replys = this.data.replys
        const reply = replys[index]
        reply.voted = true
        reply.votesNum += 1
        this.setData({ replys })
      },
      fail: () => {
        wx.showToast({
          title: '投票失败'
        })
      }
    })
  },
  handleReplyDownVote: function (e) {
    const id = e.currentTarget.dataset.id
    const index = e.currentTarget.dataset.index
    const token = wx.getStorageSync('token')
    wx.request({
      url: `${config.protocol}://${config.host}/replys/${id}/upvote`,
      header: { 'Authorization': token },
      method: 'PUT',
      success: (res) => {
        const replys = this.data.replys
        const reply = replys[index]
        reply.voted = false
        reply.votesNum -= 1
        this.setData({ replys })
      },
      fail: () => {
        wx.showToast({
          title: '取消投票失败'
        })
      }
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
    const isComment = this.data.submitHandler.isComment
    const replyId = this.data.submitHandler.replyId
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
      const sendData = to ? { content, to } : { content }
      wx.request({
        url: `${config.protocol}://${config.host}/replys/${replyId}/comments`,
        method: 'POST',
        header: { 'Authorization': token },
        data: sendData, // FIXME:
        success: (res) => {
          wx.showToast({ title: '发布成功' })
          const comments = res.data.data
          const replys = this.data.replys
          const reply = replys.find(reply => reply._id === replyId)
          reply.comments = comments
          const inputContent = ''
          this.setData({ replys, inputContent })
        }
      })
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
        const userId = wx.getStorageSync('id')
        message.voted = message.votes.includes(userId)
        message.votesNum = message.votes.length
        const replys = message.replys.map(reply => {
          const time = new Date(reply.createdAt)
          const votes = reply.votes
          const userId = wx.getStorageSync('id')
          reply.time = `${time.getFullYear()}/${time.getMonth()}/${time.getDate()}`
          reply.voted = votes.includes(userId)
          reply.votesNum = votes.length
          return reply
        })
        const date = new Date(message.createdAt)
        const minutesNum = date.getMinutes()
        const minutes = minutesNum < 10 ? '0' + minutesNum : minutesNum
        message.time = `${date.getFullYear()}/${date.getMonth()}/${date.getDate()} ${date.getHours()}:${minutes}`
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
    return {
      title: `${this.data.message.title}`,
      path: `/pages/message/message?id=${this.id}`
    }
  }
})