import {Component} from "./framework.js"
export class Carousel extends Component{
    constructor(){
        super();
        this.attributes = Object.create(null)
    }
    setAttribute(name,value){
        this.attributes[name] = value;
    }
    render(){
        
        this.root = document.createElement("div");
        this.root.classList.add("carousel")
        for(let record of this.attributes.src){
            let child = document.createElement("div");
            child.style.backgroundImage = `url('${record}')`;
            this.root.appendChild(child);
        }

        let position = 0;


        this.root.addEventListener("mousedown",event =>{
            let children = this.root.children;
            let startX = event.clientX;
            let move = event =>{
                let x = event.clientX - startX;
                let current = position - ((x - x % 500) / 500)
                for(let offset of [-1, 0, 1]){
                    let pos = current + offset;
                    pos = (pos + children.length) % children.length // 加上再取余数 不会发生变化.
                    children[pos].style.transition = "none";
                    children[pos].style.transform = `translateX(${-pos * 500 +   offset * 500 + x % 500}px)`;
                }

            }

            let up = event =>{

                let x = event.clientX - startX;
                position = position - Math.round (x / 500); 
  

                for(let offset of [0, -Math.sign(Math.round (x / 500) - x + 250 * Math.sign(x))]){
                    let pos = position + offset;
                    pos = (pos + children.length) % children.length // 加上再取余数 不会发生变化.
                    children[pos].style.transition = "none";
                    children[pos].style.transform = `translateX(${-pos * 500 +   offset * 500 }px)`;
                }

                document.removeEventListener("mousemove",move);
                document.removeEventListener("mouseup",up);
            }

            document.addEventListener("mousemove",move);
            document.addEventListener("mouseup",up);


        });
        


        return this.root
    }
    mountTo(parent){
        parent.appendChild(this.render())
    }
}
