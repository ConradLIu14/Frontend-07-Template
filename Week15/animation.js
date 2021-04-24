// setInterval(() => {})

// let tick = () => {
//     setTimeout(tick, 16);
// }
const TICK = Symbol("tick")
const TICK_HEADLER = Symbol("tick-headler")
const ANIMATIONS = Symbol("animations")
const START_TIME = Symbol("start-time")
const PAUSE_START = Symbol("pause-start")
const PAUSE_TIME = Symbol("pause-time")
export class TimeLine {
    constructor() {
        this.state = "Inited";
        this[ANIMATIONS] = new Set();
        this[START_TIME] = new Map;


    }
    start(){
        if(this.state !== "Inited")
            return ;
        this.state = "started"
        let startTime = Date.now();
        this[PAUSE_TIME] = 0;
        this[TICK] = () => {
            // console.log('tick')
            let now = Date.now();
            for(let animation of this[ANIMATIONS]){
                // console.log(animation.duration);
                let t;
                if(this[START_TIME].get(animation) < startTime) 
                    t = now - startTime - this[PAUSE_TIME] - animation.delay // 减去一个pause time
                else    
                    t = now - this[START_TIME].get(animation) - this[PAUSE_TIME] - animation.delay // 减去一个pause time
                // let t0 = t; // 消除 超过 100 的问题(设定的是 100,)
                if(animation.duration < t){ 
                    this[ANIMATIONS].delete(animation);
                    t = animation.duration;
                }
                if(t > 0)
                    animation.receive(t)
            }
            // requestAnimationFrame(this[TICK])// 添加暂停逻辑,所以把tick 取消
            this[TICK_HEADLER] = requestAnimationFrame(this[TICK]) // 先把tick headler 存起来.
        }
        this[TICK]();
    }

    // set rate(){} // 这俩就先不做了
    // get rate(){}

    pause(){
        if(this.state !== "started")
            return ;
        this.state = "pause"
        this[PAUSE_START] = Date.now();
        cancelAnimationFrame(this[TICK_HEADLER]);
    }
    resume(){
        if(this.state !== "pause")
            return ;
        this.state = "started"
        this[PAUSE_TIME] += Date.now() - this[PAUSE_START];
        this[TICK]()

    }

    reset(){
        this.state = "Inited"
        this.pause()
        let startTime = Date.now();
        this[PAUSE_TIME] = 0;
        this[ANIMATIONS] = new Set();
        this[START_TIME] = new Map;
        this[TICK_HEADLER] = null;
        this[PAUSE_START] = 0;
    }

    add(animation, startTime){
        if(arguments.length < 2){
            startTime = Date.now();
        }
        this[ANIMATIONS].add(animation)
        this[START_TIME].set(animation, startTime);
    }


}

export class Animation{
    constructor(object, property, startValue, endValue, duration, delay, timingFunction, template){
        timingFunction = timingFunction || (v => v)
        template = template || (v => v)
        this.object = object;
        this.property = property;
        this.startValue = startValue;
        this.endValue = endValue;
        this.duration = duration;
        this.timingFunction = timingFunction;
        this.delay = delay;
        this.template = template;
    }
    receive(time){
        console.log(time);
        let range = (this.endValue - this.startValue)
        let progress =this.timingFunction( time / this.duration)
        this.object[this.property] = this.template(this.startValue + range * progress);  // 均匀变化 直接乘time / this.duration // 加一个template

    }

}

// let tick = () => {
//     requestAnimationFrame(tick)

// }