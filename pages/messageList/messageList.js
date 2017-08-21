const app = getApp()
const config = app.config

Page({
  data: {
    sortedMessages: [],
    canSendMessage: wx.getStorageSync('authorities').canSendMessage,
    userId: wx.getStorageSync('id')
  },
  onReady: function () {
    wx.request({
      url: `${config.protocol}://${config.host}/messages`,
      method: 'GET',
      success: (res) => {
        const messages = res.data.data
        const sortedMessages = this.sortMessages(messages)
        this.setData({ sortedMessages })
        wx.stopPullDownRefresh()
      }
    })
  },
  onPullDownRefresh: function () {
    this.onReady()
  },
  handleShare: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/message/message?id=${id}`,
      success: () => {
        wx.showToast({
          title: '点击右上角进行分享',
          image: '../../img/share-hl.png',
          doration: 2000
        })
      }
    })
  },
  handleDownVote: function (e) {
    const id = e.currentTarget.dataset.id
    const index = e.currentTarget.dataset.index
    const token = wx.getStorageSync('token')
    wx.request({
      url: `${config.protocol}://${config.host}/messages/${id}/downvote`,
      header: { 'Authorization': token },
      method: 'PUT',
      success: (res) => {
        const sortedMessages = this.data.sortedMessages
        const message = sortedMessages[index].messages.find(message => message.id === id)
        message.voted = false
        message.votes -= 1
        this.setData({ sortedMessages })
      },
      fail: () => {
        wx.showToast({
          title: '取消投票失败'
        })
      }
    })
  },
  handleUpVote: function (e) {
    const id = e.currentTarget.dataset.id
    const index = e.currentTarget.dataset.index
    const token = wx.getStorageSync('token')
    wx.request({
      url: `${config.protocol}://${config.host}/messages/${id}/upvote`,
      header: { 'Authorization': token },
      method: 'PUT',
      success: (res) => {
        const sortedMessages = this.data.sortedMessages
        const message = sortedMessages[index].messages.find(message => message.id === id)
        message.voted = true
        message.votes += 1
        this.setData({ sortedMessages })
      },
      fail: () => {
        wx.showToast({
          title: '投票失败'
        })
      }
    })
  },
  // divide message into different array by date
  // switch the date format
  sortMessages: function(messages) {
    const sortedMessages = []
    const week = '日一二三四五六'
    for (const message of messages) {
      const userId = this.data.userId
      const dateObj = new Date(message.createdAt)
      const date = `${dateObj.getMonth()}月${dateObj.getDate()}日 星期${week[dateObj.getDay()]}`
      const minutes = dateObj.getMinutes()
      const messageData = {
        department: message.department,
        title: message.title,
        content: message.content,
        id: message._id,
        time: `${dateObj.getHours()}:${minutes < 10 ? '0' + minutes : minutes}`,
        voted: message.votes.includes(userId),
        votes: message.votes.length
      }
      const dailyMessages = sortedMessages.find(dailyMessages => dailyMessages.date === date)
      if (dailyMessages) {
        dailyMessages.messages.push(messageData)
      } else {
        sortedMessages.push({
          date: date,
          messages:[messageData]
        })
      }
    }
    return sortedMessages
  }
})