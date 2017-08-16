const { userLogin } = require('./library/auth')

const config = {
  host: "api.jiewangji.com",
  protocol: "https"
}
const login = userLogin(`${config.protocol}://${config.host}/login`)
App({
  config,
  onLaunch: login(),
  userLogin: login
})