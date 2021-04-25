// let http = require("http");

// let request = http.request({
//     hostname: "127.0.0.1",
//     port: 8082
// },response => {
//     console.log(reaponse);
// });

// request.end();

const http = require('http')
const archiver = require('archiver')
const child_process = require('child_process')
const querystring = require('querystring')
const githubConfig = require('../../githubConfig')
const path = require('path')

const filePath = path.join(__dirname, '../web')

// 打开授权页面
child_process.exec(`open https://github.com/login/oauth/authorize?client_id=${githubConfig.ClientID}`)

const app = http.createServer((request, response) => {

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

  if (urlPase.indexOf('/publish') === 0) {

    let req = http.request({
      hostname: 'localhost',
      path: `/?token=${query.token}`,
      port: '8082',
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-strem',
      },
    }, () => {
      response.write('success')
      response.end()
    })
    
    const archive = archiver('zip', {
      zlib: {level: 9}
    })
    
    archive.directory(filePath, false)
    
    archive.finalize()
    
    archive.pipe(req)
    
    archive.on('end', () => {
      req.end()
    })
  }
})

app.listen(8083)