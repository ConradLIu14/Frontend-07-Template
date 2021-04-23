// function createElement(type,attributes,...children){ 
//     let element;
//     if (typeof type == 'string') element = document.createElement(type);
//     else element = new type;
//     for (let name in attributes){
//         element.setAttribute(name,attributes[name]);
//     }
//     for (let child of children){
//         if (typeof child === "string") 
//            child = document.createTextNode(child);       
           
//         element.appendChild(child);
//     }
//     return element;
// }
// class Div{
//     constructor(){
//         this.root = document.createElement("div");
//     }
//     setAttribute(name, value){
//         this.root.setAttribute(name, value);
//     }
//     appendChild(child){
//         this.root.appendChild(child)

//     }
//     mountTo(parent){
        
//         parent.appendChild(this.root)
//     }
// }

// // -------------------------------------------------------------------------------------------------

// function createElement(type,attributes,...children){ 
//     let element;
//     if (typeof type == 'string') element = new ElementWrapper(type);
//     else element = new type;
//     for (let name in attributes){
//         element.setAttribute(name,attributes[name]);
//     }
//     for (let child of children){
//         if (typeof child === "string") 
//            child = new TextWrapper(child);       
           
//         element.appendChild(child);
//     }
//     return element;
// }
// class TextWrapper{
//     constructor(content){
//         this.root = document.createTextNode(content);
//     }
//     setAttribute(name, value){
//         this.root.setAttribute(name, value);
//     }
//     appendChild(child){
//         child.mountTo(this.root)
//     }
//     mountTo(parent){
        
//         parent.appendChild(this.root)
//     }


// }
// class ElementWrapper{
//     constructor(type){
//         this.root = document.createElement(type);
//     }
//     setAttribute(name, value){
//         this.root.setAttribute(name, value);
//     }
//     appendChild(child){
//         child.mountTo(this.root)
//     }
//     mountTo(parent){
        
//         parent.appendChild(this.root)
//     }

// }

// class Div{
//     constructor(){
//         this.root = document.createElement("div");
//     }
//     setAttribute(name, value){
//         this.root.setAttribute(name, value);
//     }
//     appendChild(child){
//         child.mountTo(this.root)

//     }
//     mountTo(parent){
        
//         parent.appendChild(this.root)
//     }
// }

// let a = <div id = "a">
// <span>a</span>
// <span>b</span>
// <span>c</span>
// </div>

// let b = <Div id = 'b'>
// <span>a</span>
// <span>b</span>
// <span>c</span>
// </Div>

// // document.body.appendChild(a);// div这这种常规 标签也改成了 mountTo 的形式
// a.mountTo(document.body)
// b.mountTo(document.body);
// // ---------------------------轮播图----------------------------------------------------------
import {Component,createElement} from "./framework.js"
class Carousel extends Component{
    constructor(){
        super();
        this.attributes = Object.create(null)
    }
    setAttribute(name,value){
        this.attributes[name] = value;
    }
    render(){
        
        // console.log(this.attributes.src)
        this.root = document.createElement("div");
        // 然后为了加CSS
        this.root.classList.add("carousel")
        for(let record of this.attributes.src){
            // let child = document.createElement("img");
            // child.src = record;
            // 用background-img 莱代替img 方案
            let child = document.createElement("div");
            child.style.backgroundImage = `url('${record}')`;
            this.root.appendChild(child);
        }

        let position = 0;


        this.root.addEventListener("mousedown",event =>{
            // console.log("mousedown");
// 一般处理拖拽就使用这种代码结构;这样就永远是三个一组了
            // let startX = event.clientX, startY = event.clientY;// 其实我们不需要Y轴信息
            let children = this.root.children;
            let startX = event.clientX;
            let move = event =>{
                // let x = event.clientX - startX, y = event.clientY - startY;
                // console.log(x,y);
                let x = event.clientX - startX;
                let current = position - ((x - x % 500) / 500)
                // console.log(x)
                for(let offset of [-1, 0, 1]){
                    let pos = current + offset;
                    pos = (pos + children.length) % children.length // 加上再取余数 不会发生变化.
                    children[pos].style.transition = "none";
                    children[pos].style.transform = `translateX(${-pos * 500 +   offset * 500 + x % 500}px)`;
                }


                // for (let child of children){
                //     child.style.transition = "none";
                //     child.style.transform = `translateX(${-position * 500 + x}px)`;
                // }
            }

            let up = event =>{
                // console.log("mouseup");
                // this.root.removeEventListener("mousemove",move);
                // this.root.removeEventListener("mouseup",up);
                let x = event.clientX - startX;
                position = position - Math.round (x / 500); 
                // for (let child of children){
                //     child.style.transition = "";
                //     child.style.transform = `translateX(${-position * 500}px)`;
                // }

                for(let offset of [0, -Math.sign(Math.round (x / 500) - x + 250 * Math.sign(x))]){
                    let pos = position + offset;
                    pos = (pos + children.length) % children.length // 加上再取余数 不会发生变化.
                    children[pos].style.transition = "none";
                    children[pos].style.transform = `translateX(${-pos * 500 +   offset * 500 }px)`;
                }

                document.removeEventListener("mousemove",move);
                document.removeEventListener("mouseup",up);
            }

            // this.root.addEventListener("mousemove",move);
            // this.root.addEventListener("mouseup",up);
            document.addEventListener("mousemove",move);
            document.addEventListener("mouseup",up);


        });
        
        // // ---------------------自动播放功能-------------------------------------------------
        // let currentIndex = 0;
        // setInterval(() => {
        //     let children = this.root.children;
        //     let nextIndex = (currentIndex + 1) % children.length;
        //     // console.log(currentIndex,nextIndex);
        //     let current = children[currentIndex];
        //     let next = children[nextIndex];
        //     next.style.transition = "none";
        //     next.style.transform = `translatex(${100 - nextIndex * 100}%)`
        //     // for(let child of children){
        //     //     child.style.transform = `translatex(-${current*100}%)`;
        //     // }
        //     setTimeout(() => {
        //         next.style.transition = "";
        //         current.style.transform = `translatex(${-100 - currentIndex * 100}%)`;
        //         next.style.transform = `translatex(${- nextIndex * 100}%)`; // 用两次requestAnimationFrames 也可以解决

        //         currentIndex = nextIndex;
        //     }, 16);// 16ms 是浏览器一帧的时间
        // }, 3000);// 3s

        // // --------------------------------------------------拖动轮播-----------------------------------------------------

        return this.root
    }
    mountTo(parent){
        parent.appendChild(this.render())
    }
}

let d = [
"https://static001.geekbang.org/resource/image/bb/21/bb38fb7c1073eaee1755f81131f11d21.jpg",
"https://static001.geekbang.org/resource/image/1b/21/1b809d9a2bdf3ecc481322d7c9223c21.jpg",
"https://static001.geekbang.org/resource/image/b6/4f/b6d65b2f12646a9fd6b8cb2b020d754f.jpg",
"https://static001.geekbang.org/resource/image/73/e4/730ea9c393def7975deceb48b3eb6fe4.jpg"
]

let a = <Carousel src = {d}/>
a.mountTo(document.body);
