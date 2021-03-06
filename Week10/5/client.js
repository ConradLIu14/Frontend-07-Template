const images = require('images')
function render(viewPort,element){
    if(element.style){
        var img = images(element.style.width,element.style.height)
        // var img = images(100,100)

        if(element.style["background-color"]){
            let color = element.style["background-color"] || "rgb(0,0,0)"
            // let color = "rgb(0,255,0)"
            color.match(/rgb\((\d+),(\d+),(\d+)\)/)
            img.fill(Number(RegExp.$1),Number(RegExp.$2),Number(RegExp.$3)) 
                                            // RegExp.$1是RegExp的一个属性,指的是与正则表达式匹配的第一个 子匹配(以括号为标志)字符串，
                                        // 以此类推，RegExp.$2，RegExp.$3，..RegExp.$99总共可以有99个匹配
            viewPort.draw(img,element.style.left||0,element.style.top||0)
        }
    }
}

const { rejects } = require("assert");
const net = require("net")
const parser = require("./parser.js")// Require是CommonJS的语法，CommonJS的模块是对象，输入时必须查找对象属性。

class Request{
    constructor(options){
        this.method = options.method || "GET";
        this.host = options.host;
        this.port = options.port || 80;
        this.path = options.path || '/';
        this.body = options.body || {}
        this.headers = options.headers ||{}
        if(!this.headers['Content-Type']){
            this.headers["Content-Type"] = 'application/x-www-form-urlencoded'
        }
        if(this.headers["Content-Type"]==='application/json')
            this.bodyText = JSON.stringify(this.body)
        else if(this.headers['Content-Type']==="application/x-www-form-urlencoded")
            this.bodyText = Object.keys(this.body).map(key=>`${key}=${encodeURIComponent(this.body[key])}`).join('&');// 这里是以& 字符来分隔的
        this.headers["Content-Length"] = this.bodyText.length;//length 不传会是一个非法请求
    }
    send(connection){
        return new Promise((reslove,reject)=>{
            const parser = new ResponseParser;
            // reslove("")
            if(connection){
                connection.write(this.toString())
            }else {
                connection = net.createConnection({
                    host:this.host,
                    port:this.port,
                },()=>{
                    connection.write(this.toString())
                })
            }
            connection.on('data',(data)=>{
                // console.log(data.toString());
                parser.receive(data.toString());
                if(parser.bodyParser.isFinished){
                    reslove(parser.bodyParser);// 从这里返回出去
                    connection.end();
                }
            })
            connection.on('error',(err)=>{
                reject(err)
                connection.end();
            })
        })
    }
    toString(){
        return `${this.method} ${this.path} HTTP/1.1\r
${Object.keys(this.headers).map(key=> `${key}: ${this.headers[key]}`).join('\r\n')}\r
\r
${this.bodyText}` // 这里面不能随便空格的
    }
}

class TrunkedBodyParser{
    constructor(){
        this.WAITING_LENGTH = 0
        this.WAITING_LENGTH_LINE_END = 1
        this.READING_TRUNK = 2 // 计算长度 已经不是一个严格的米利状态机了
        this.WAITING_NEW_LINE = 3
        this.WAITING_NEW_LINE_END = 4
        this.length = 0
        this.content = []
        this.isFinished = false
        this.current = this.WAITING_LENGTH
    }
    receiveChar(char){
        if(this.current === this.WAITING_LENGTH){
            if(char === '\r'){
                if(this.length === 0){
                    this.isFinished = true
                }
                this.current = this.WAITING_LENGTH_LINE_END
            }else{
                this.length *=16 // 因为是16进制,所以
                this.length +=parseInt(char,16)//在16进制种 e = 14；d = 13 改变 server 端的发送hello world  会改变此时接收的 长度
            }
        }
        else if(this.current === this.WAITING_LENGTH_LINE_END){
            if(char ==='\n')
                this.current = this.READING_TRUNK
        }else if(this.current ===this.READING_TRUNK){
            this.content.push(char)
            this.length --
            if(this.length===0){
                this.current = this.WAITING_NEW_LINE
            }
        }else if(this.current===this.WAITING_NEW_LINE){
            if(char ==='\r'){
                this.current = this.WAITING_NEW_LINE_END
            }
        }else if(this.current ===this.WAITING_NEW_LINE_END){
            if(char ==='\n')
                this.current =this.WAITING_LENGTH
            }
        // }else if(this.current === this.WAITING_HEADER_BLOCK_END){
        //     if(char === '\n'){
        //         this.current = this.WAITING_BODY
        //     }
        // }else if(this.current ===this.WAITING_BODY){
        //     this.bodyParser.receiveChar(char);
        // }
    }
}

class ResponseParser{
    constructor(){//? 可以将常量写法改成函数写法
        this.WAITING_STATUS_LINE = 0// /r 
        this.WAITING_STATUS_LINE_END = 1 // /n
        this.WAITING_HEADER_NAME = 2
        this.WAITING_HEADER_SPACE = 3
        this.WAITING_HEADER_VALUE = 4
        this.WAITING_HEADER_LINE_END = 5
        this.WAITING_HEADER_BLOCK_END = 6
        this.WAITING_BODY = 7

        this.current = this.WAITING_STATUS_LINE
        this.statusLine = ""
        this.headers = {}
        this.headerName = ''
        this.headerValue = ''
        this.bodyParser = null


    }
    receive(string){
        for(let i =0;i<string.length;i++){
            this.receiveChar(string.charAt(i))
        }
    }
    receiveChar(char){
        if(this.current ===this.WAITING_STATUS_LINE){
            if(char==='\r')
                this.current = this.WAITING_STATUS_LINE_END
            else 
                this.statusLine +=char
        }
        else if(this.current === this.WAITING_STATUS_LINE_END){
            if (char ==='\n')
                this.current = this.WAITING_HEADER_NAME
        }
        else if(this.current ===this.WAITING_HEADER_NAME){
            if(char===':')
                this.current = this.WAITING_HEADER_SPACE
            else if (char ==='\r') { 
                this.current = this.WAITING_HEADER_BLOCK_END
                if(this.headers['Transfer-Encoding']==='chunked')
                    this.bodyParser =new TrunkedBodyParser()}
            else
                this.headerName+=char
        }
        else if(this.current === this.WAITING_HEADER_SPACE){
            if(char ===' ') this.current = this.WAITING_HEADER_VALUE 
        }

        else if(this.current ===this.WAITING_HEADER_VALUE){
            if (char==='\r'){
                this.current = this.WAITING_HEADER_LINE_END
                // console.log(this.headerName,this.headerValue)
                this.headers[this.headerName]= this.headerValue
                // console.log(this.headerName,this.headers[this.headerName])
                this.headerName = ''
                this.headerValue = ''
            }else{
                this.headerValue +=char
            }
        }
        else if(this.current === this.WAITING_HEADER_LINE_END){
            if(char === '\n')
                this.current = this.WAITING_HEADER_NAME
        }
        else if(this.current == this.WAITING_HEADER_BLOCK_END){
            if(char === '\n')
                this.current = this.WAITING_BODY
        }
        else if (this.current === this.WAITING_BODY){
            // console.log(char)
            this.bodyParser.receiveChar(char)
        }


    }
}

void async function(){
    let request = new Request({
        method:"POST",
        host:'127.0.0.1',
        port:"8088",
        path:'/',
        headers:{
            ["X-Foo2"]:"customed",
        },
        body:{
            name:"Conrad",
        },
    });
    let response = await request.send()
    // console.log(response) 
    let dom = parser.parseHTML(response.content)// 这里 简单化了，变成得到全部body 再来处理；一般都是 逐段返回body 逐段parser 一边处理
                                             // 实际应该做成异步分段处理的
    // console.log(dom)
    console.log(JSON.stringify(dom,null,'    '))
    // console.log('')

    let viewPort = images(800,600)
    // render(viewPort,dom.children[0].children[3].children[1])
    // viewPort.save('viewport.jpg')
    render(viewPort,dom.children[0].children[3].children[1].children[3])
    viewPort.save('viewport.jpg')

}();

