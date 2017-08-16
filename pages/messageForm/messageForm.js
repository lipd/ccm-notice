const app = getApp()
const config = app.config

Page({
  data: {},
  handleSubmit: function (e) {
    const formData = e.detail.value
    if (formData.author === '' || formData.title === '' ||formData.content === '') {
      wx.showToast({
        title: '数据不得为空'
      })
      return this.setData({ isNotFill: true })
    }
    const token = wx.getStorageSync('token')
    wx.request({
      url: `${config.protocol}://${config.host}/messages`,
      data: formData,
      header: {
        'Authorization': token
      },
      method: 'POST',
      success: function(res){
        wx.showToast({
          title: '发布成功'
        })
        wx.switchTab({
          url: '/pages/messageList/messageList',
          success: () => {
            const newPage = getCurrentPages().pop()
            const sortedMessages = newPage.sortMessages(res.data.data)
            newPage.setData({ sortedMessages })
          }
        })
      }
    })
  }
})