// const { copyFileSync } = require("fs")
// let http = require("http")

// http.createServer(function(req, res){
//     console.log(req)
//     res.end("Hello World")

// }).listen(8082)



const http = require('http')
const https = require('https')
const unzipper = require('unzipper')
const githubConfig = require('../../githubConfig')
const querystring = require('querystring')
const path = require('path')

const app = http.createServer(async (request, response) => {

  let urlPase = ''
  let query = {}
  try {
    let arr = request.url.match(/^([\s\S]*)\?([\s\S]*)$/)
    urlPase = arr[1]
    if (arr[2]) query = querystring.parse(arr[2])
  } catch(err) {
    urlPase = ''
    query = {}
  }

  // 用户同意登录，发来code
  if (urlPase.indexOf('/auth') === 0) {

    let result = await getToken(query.code)
    
    response.write(`<a href="http://localhost:8083/publish?token=${result.access_token}">Publish</a>`)
    
  } else if (urlPase.indexOf('/') === 0) {
    // 上传文件来了

    let userInfo = await getUserInfo(query.token)

    if (userInfo.login === 'niao-yu') {
      // 上传来了
      request.pipe(unzipper.Extract({path: path.join(__dirname, '../../server/public/')}))
      request.on('end', () => {
        response.write('success')
        response.end()
      })
    }
  }
})

app.listen(8082)


// 通过 code 获取 access_token
function getToken(code) {
  return new Promise(resolve => {
    const req = https.request({
      hostname: 'github.com',
      path: `/login/oauth/access_token?client_id=${githubConfig.ClientID}&client_secret=${githubConfig.ClientSecrets}&code=${code}`,
      method: 'POST',
      port: 443,
    }, res => {
      let body = ''
      res.on('data', chunk => {
        body += chunk.toString()
      })
      res.on('end', () => {
        let data = querystring.parse(body)
        resolve(data)
      })
    })
    req.end()
  })
}


async function getUserInfo(token) {
  return new Promise(resolve => {
    const req = https.request({
      hostname: `api.github.com`,
      path: `/user`,
      port: 443,
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'Mozilla/5.0',
      },
    }, res => {
      let body = ''
      res.on('data', chunk => {
        body += chunk.toString()
      })
      res.on('end', () => {
        let data = JSON.parse(body)
        resolve(data)
      })
    })
    req.end()
  })
}