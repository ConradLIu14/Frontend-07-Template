import {Component,STATE} from "./framework.js"
import {enableGesture} from "./gesture.js"
import {TimeLine, Animation} from "./animation.js"
import {ease} from "./ease.js"
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
        enableGesture(this.root)

        let position = 0;
        let children = this.root.children;

        let timeline = new Timeline();
        timeline.start();

        let handler = null;
        let children = this.root.children;
        this[STATE].position = 0;
        let t = 0;
        let ax = 0; // drag offset
        this.root.addEventListener("start", event => {
            
            timeline.pause();
            clearInterval(handler);
            let progress = (Date.now() - t) / 1500 >= 1 ? 1 : (Date.now() - t) / 1500;
            ax = ease(progress) * 500 - 500;
        })
        this.root.addEventListener("pen", event => {
            // console.log(event.clientX);
            let distX = event.clientX - event.startX - ax;
            let current = this[STATE].position - ((distX - distX % 500) / 500);
            for (let offset of [-1, 0, 1]) {
            let pos = current + offset;
            pos = (pos % children.length + children.length) % children.length;
            children[pos].style.transition = "none";
            children[pos].style.transform = `translateX(${(- pos + offset) * 500 + distX % 500}px)`;
            }
          })

          this.root.addEventListener("tap", event => {
            this.triggerEvent("click", { 
              data: this[ATTRIBUTE].src[this[STATE].position],
              position: this[STATE].position 
            });
          })
      
          this.root.addEventListener("end", event => {
            timeline.reset();
            timeline.start();
            handler = setInterval(nextPicture, 3000)
      
            let distX = event.clientX - event.startX - ax;
            let current = this[STATE].position - ((distX - distX % 500) / 500);
            let direction = Math.round((distX % 500) / 500);
      
            if (event.isFlick) {
              if (event.velocity > 0) {
                direction = Math.ceil((distX % 500) / 500);
              } else {
                direction = Math.floor((distX % 500) / 500);
              }
            }
      
            for (let offset of [-1, 0, 1]) {
              let pos = current + offset;
              pos = (pos % children.length + children.length) % children.length;
              children[pos].style.transition = "none";
              timeline.add(new Animation(children[pos].style, "transform",
                (- pos + offset) * 500 + distX % 500,
                (- pos + offset) * 500 + direction * 500,
                1500, 0, ease, v => `translateX(${v}px)`));
            }


        // this.root.addEventListener("mousedown",event =>{
        //     let children = this.root.children;
        //     let startX = event.clientX;
        //     let move = event =>{
        //         let x = event.clientX - startX;
        //         let current = position - ((x - x % 500) / 500)
        //         for(let offset of [-1, 0, 1]){
        //             let pos = current + offset;
        //             pos = (pos + children.length) % children.length // 加上再取余数 不会发生变化.
        //             children[pos].style.transition = "none";
        //             children[pos].style.transform = `translateX(${-pos * 500 +   offset * 500 + x % 500}px)`;
        //         }

        //     }

        //     let up = event =>{

        //         let x = event.clientX - startX;
        //         position = position - Math.round (x / 500); 
  

        //         for(let offset of [0, -Math.sign(Math.round (x / 500) - x + 250 * Math.sign(x))]){
        //             let pos = position + offset;
        //             pos = (pos + children.length) % children.length // 加上再取余数 不会发生变化.
        //             children[pos].style.transition = "none";
        //             children[pos].style.transform = `translateX(${-pos * 500 +   offset * 500 }px)`;
        //         }

        //         document.removeEventListener("mousemove",move);
        //         document.removeEventListener("mouseup",up);
        //     }

        //     document.addEventListener("mousemove",move);
        //     document.addEventListener("mouseup",up);


        // });

        this[STATE].position = this[STATE].position - ((distX - distX % 500) / 500) - direction;
        // if drag too far then position will be a large negtive number, make it to be positive one.
        this[STATE].position = (this[STATE].position % children.length + children.length) % children.length;
  
        this.triggerEvent("change", { position: this[STATE].position });
      })
  
      // currentIndex === position
      let nextPicture = () => {
        let children = this.root.children;
        let nextPosition = (this[STATE].position + 1) % children.length;
        let current = children[this[STATE].position];
        let next = children[nextPosition];
        t = Date.now();
  
        timeline.add(new Animation(current.style, "transform",
          - this[STATE].position * 500, -500 - this[STATE].position * 500, 1500, 0, ease, v => `translateX(${v}px)`));
        timeline.add(new Animation(next.style, "transform",
          500 - nextPosition * 500, - nextPosition * 500, 1500, 0, ease, v => `translateX(${v}px)`))
  
        this[STATE].position = nextPosition;
        this.triggerEvent("change", { position: this[STATE].position });
      }
      handler = setInterval(nextPicture, 3000)
        


        return this.root
    }
    // mountTo(parent){
    //     parent.appendChild(this.render())
    // }
}
