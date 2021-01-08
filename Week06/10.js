// js 定义类的三种方法: http://www.ruanyifeng.com/blog/2012/07/three_ways_to_define_a_javascript_class.html
// js 的封装：http://www.ruanyifeng.com/blog/2010/05/object-oriented_javascript_encapsulation.html
// 狗咬人
// 
function person(name) {
    　　　　this.name = name;
    　　}
let p = new person("Mike");
// 一 构造函数法
function dog_method1(name) {
    　　　　this.name = name;
    　　}
dog_method1.prototype.barking = function(){
    console.log("汪汪汪");
}
dog_method1.prototype.bit = function(target){
    console.log(this.name,"bite",target.name);
}

let dogm1_1 = new dog_method1("dogm1_1");
// console.log(dogm1_1.name)
console.log('dogm1_1',dogm1_1.name);
dogm1_1.barking();
dogm1_1.bit(p);

// 二、Object.create()法//各大浏览器的最新版本（包括IE9）都部署了这个方法。
var dog_obj = {
    name:'dog_obj_1',
    bit:function(target){
        console.log(this.name,"bite",target.name);
    }
}
var dog_obj_1 = Object.create(dog_obj);
console.log(dog_obj_1.name);
dog_obj_1.bit(p);

//三 极简法
var dog_method3={
    createNew:function (p){
        var dog = {

        };
        dog.name = 'dog_m3_3';
        dog.bit=function(target){
            console.log(this.name,"bite",target.name);
        };
        return dog;
    }
}
var dog_m3_3 = dog_method3.createNew();
console.log(dog_m3_3.name);
dog_m3_3.bit(p);

//继承/私有属性和私有方法
var flay_dog={
    createNew:function(){
        var dog = dog_method3.createNew();
        dog.name = 'flyDog';
        dog.fly = dog.name+"I can flay";
        var private = 'private';
        dog.showPrivate = function(){
            console.log(private);
        }
        return dog
    }
}
var flyDog = flay_dog.createNew();
console.log(flyDog.name);
flyDog.bit(p);
flyDog.showPrivate();

// .......................应该把bit 这个动作的影响设计到人身上。。。设计hurt。



