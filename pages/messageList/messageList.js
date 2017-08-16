const app = getApp()
const config = app.config

Page({
  data: {
    sortedMessages: [],
    canSendMessage: wx.getStorageSync('authorities').canSendMessage
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
  // divide message into different array by date
  // switch the date format
  sortMessages: function(messages) {
    const sortedMessages = []
    const week = '日一二三四五六'
    for (const message of messages) {
      const dateObj = new Date(message.createdAt)
      const date = `${dateObj.getMonth()}月${dateObj.getDate()}日 星期${week[dateObj.getDay()]}`
      const minutes = dateObj.getMinutes()
      const messageData = {
        department: message.department,
        title: message.title,
        content: message.content,
        id: message._id,
        time: `${dateObj.getHours()}:${minutes < 10 ? '0' + minutes : minutes}`
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