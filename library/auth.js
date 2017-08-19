exports.userLogin = (url) => {
  return () => {
    wx.login({
      success: (res) => {
        let code = res.code
        if (code) {
          wx.getUserInfo({
            success: (res) => {
              wx.setStorageSync('user', res.userInfo)
              wx.request({
                url: url,
                method: 'POST',
                data: { code: code, nickName: res.userInfo.nickName, avatarUrl: res.userInfo.avatarUrl },
                success: res => {
                  wx.setStorageSync('token', res.data.token)
                  wx.setStorageSync('authorities', res.data.authorities)
                  wx.setStorageSync('id', res.data.id)
                }
              })
            }
          })
        }
        else {
          console.log("获取用户登录态失败" + res.errMsg)
        }
      }
    })
  }
}
