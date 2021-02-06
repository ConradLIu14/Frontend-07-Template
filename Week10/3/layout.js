const { time } = require("console")
const { symlink } = require("fs")

function getStyle(element){
    if(!element.style)
        element.style = []
    for(let prop in element.computedStyle){
        var p = element.computedStyle[prop].value 
        element.style[prop] = element.computedStyle[prop].value
        
        if(element.style[prop].toString().match(/px$/))
            element.style[prop] = parseInt(element.style[prop])
        if(element.style[prop].toString().match(/^[0-9\.]+$/)){
            element.style[prop] = parseInt(element.style[prop])
        }
    }
    return element.style
}

function layout(element){
    if(!element.computedStyle)
        return 
    var elementStyle = getStyle(element)
    if(elementStyle.display != 'flex')
        return // 暂时只考虑flex 排版 不考虑其他形式的排版

    var items  = element.children.filter(e=>e.type==='element')

    items.sort(function (a,b){
        return (a.order||0) - (b.order||0)// ???????????这句话是什么意思
    })
    var style = elementStyle

    ['width','height'].forEach(size=>{
        if(style[size]==='auto'||style[size]===''){
            style[size] = null
        }
    })

    if(!style.flexDirection||style.flexDirection==='auto')
        style.flexDirection = 'row'
    if(!style.alignItems||style.alignItems==='auto')
        style.alignItems = 'stretch'
    if(!style.justifyContent||style.justifyContent==='auto')
        style.justifyContent = 'flex-start'
    if(!style.flexWarp||style.flexWarp==='auto')
        style.flexWarp = 'nowrap'
    if(!style.alignContent||style.alignContent==='auto')
        style.alignContent = 'stretch'

    var mainSize,mainStart,minEnd,mainSign,mainBase,
        crossSize,crossStart,crossEnd,crossSign,crossBase
    if(style.flexDirection==='row')
    {
        mianSize = 'width'
        mainStart = 'left'
        mainEnd = 'right'
        mainSign = +1// 强调一下是正一


        mainBase = 0

        crossSize = 'height'
        crossStart = 'top'
        crossEnd = 'bottom'
    }
    if(style.flexDirection === 'row-reverse')
    {
        mainSize = 'width'
        mainStart = 'right'
        mainEnd = 'left'
        mainSign = -1
        mainBase = style.width

        crossSize = 'height'
        crossStart = 'top'
        crossEnd = 'bottom'
    }
    if(style.flexDirection === 'column'){
        mainSize = 'height'
        mainStart = 'top'
        mainEnd = 'bottom'
        mianSign = +1
        mainBase = 0
        crossSize = 'width'
        crossStart = 'left'
        crossEnd = "right"

    }
    if(style.flexDirection ==='column-reverse')
    {
        mainSize = 'height'
        mainStart = 'bottom'
        mainEnd = 'top'
        mianSign = -1
        mainBase = style.height
        crossSize = 'width'
        crossStart = 'left'
        crossEnd = 'right'
    }
    if(style.flexWarp === 'wrap-reverse')
    {
        var temp = crossStart
        crossStart = crossEnd
        crossEnd = temp
        crossSign = -1
    }
    else {
        crossBase = 0
        crossSign = 1
    }
    var isAutoMainSize = false// 如果父元素没有设置主轴尺寸；用item的尺寸撑开，这样无论如何都不会超过主轴尺寸
    if(!style[mainSize]){
        elementStyle[mianSize] = 0
        for(var i =0;i<items.length;i++){
            var item = items[i]
            if(itemStyle[mainSize] !==null ||itemStyle[main] !==(void 0)){// ？？？？？？？？？ 这一行有问题 先注释掉吧。Auto 后面 先单独处理
                                                                //  或者等研究好了再过来补齐
                elementStyle[mainSize] = elementStyle[mainSize] + item[mianSize]
            }
            isAutoMainSize = true
        }
    }

    var flexLine = []
    var flexLinex = [flexLine]
    var mainSpace = elementStyle[mainSize]
    var crossSpace = 0

    for(var i = 0; i < items.length; i++)
    {
        var item = items[i]
        var itemStyle = getStyle(item)

        if(itemStyle[mainSize] === null){
            itemStyle[mainSize] =0
        }
        if(itemStyle.flex){// 可伸缩的一定要放到这一行 不管这一行剩下多少空间
            flexLine.push(item)
        }else if(style.flexWrap ==='nowrap'&& isAutoMainSize){// 如果是auto main size 的话直接放入就可以了
            mainSpace -=itemStyle[mainSize]
            if(itemStyle[crossSize] !==null&&itemStyle[crossSize] !==(void 0)) // void其实是javascript中的一个函数，接受一个参数.返回值永远是undefined，
                                                                               // 可以说，使用void目的就是为了得到javascript中的undefined
                                                                               // 1 比 undefined 少3个字节
                                                                               // 2 undefined 并不是js 保留字
            {
                crossSpace = Math.max(crossSpace,itemStyle[crossSize])
            }
            flexLine.push(item) }
            else{
                if(itemStyle[mainSize] > style[mainSize])
                    itemStyle[mainSize]=style[mainSize] // 压倒和主轴尺寸一样大
            
            if(mainSpace<itemStyle[mainSize])// 如果主轴剩下的空间不足以容纳新的元素，那么换行
            {
                flexLine.mainSpace = mainSpace
                flexLine.crossSpace = crossSpace
                flexLine = [item]
                flexLine.push(flexLine)
                mainSpace = style[mainSize]
                crossSpace = 0
            }else{
                flexLine.push(item)// 如果能放下直接push进去就好了
            }
            if(itemStyle[crossSize] !=null && itemStyle[crossSize] !==(void 0))
                crossSpace  = Math.max(crossSpace,itemStyle[crossSize])
            mainSpace -= itemStyle[mainSize]
        }
    }
    flexLine.mainSpace = mainSpace// 写循环的一个技巧

    if(style.flexWrap == 'nowWrap'|| isAutoMainSize){
        flexLine.crossSpace = (style[crossSize]!==undefined?style[crossSize]:crossSpace) // yes :左边 否则:右边
    }else {
        flexLine.crossSpace = crossSpace
    }

    if(mainSpace<0)
    {
        var scale = style[mainSize]/(style[mainSize]-mainSpace)
        var currentMain = mainBase
        for(var i= 0;i<item.length;i++){
            var item = item[i]
            var itemStyle = getStyle(item)

            if(itemStyle.flex) // flex 是不参加压缩的
                itemStyle[mainSize] = 0
            
            itemStyle[mainSize] = itemStyle[mainSize] * scale

            itemStyle[mainStart] = currentMain
            itemStyle[mainEnd] = itemStyle[mainStart]+mainSign*itemStyle[mainSize]
            currentMain = itemStyle[mainEnd]
        }
    }else{
        // process each flex line
        flexLine.forEach(function (items){
            var mainSpace = items.mainSpace
            var flexTotal = 0
            for(var i = 0;i<item.length;i++){
                var item = items[i]
                var itemStyle = getStyle(item)

                if((itemStyle.flex !==null)&&(itemStyle.flex!==(void 0))){
                    flexTotal += itemStyle.flex
                    continue    
                }
            }
            if(flexTotal>0){
                var currentMain = mainBase
                for(var i = 0;i<items.length;i++){
                    var item = item[i]
                    var itemStyle = getStyle(item)

                    if(itemStyle.flex){
                        itemStyle[mainSize] = (mainSpace/flexTotal)*itemStyle.flex
                    }
                    itemStyle[mainStart] = currentMain
                    itemStyle[mainEnd] = itemStyle[mainStart] + mianSign*itemStyle[mainSize]
                    currentMain = itemStyle[mainEnd]
                }
            }else{
                if(style.justifyContent === 'flex-start')
                {
                    var currentMain = mainBase
                    var step = 0
                }
                if(style.justifyContent ==='flex-end')
                {
                    var currentMain = mainSpace / 2 * mainSign + mainBase
                    var step = 0
                }if(style.justifyContent === 'center')
                {
                    var currentMain = mainSpace / 2*mainSign + mainBase
                    var step = 0
                }if(style.justifyContent === 'space-between')
                {
                    var step = mainSpace/(items.length - 1) * mainSign
                    var currentMain = mainBase
                }if(style.justifyContent === 'space-around'){
                    var step = mainSpace / item.length * mainSign
                    var currentMain = step/2 + mainBase
                }
                for(var i = 0;i < item.length;i++){
                    var item = items[i]
                    itemStyle[mainStart,currentMain]
                    itemStyle[mainEnd] = itemStyle[mainStart] + mainSign*itemStyle[mainSize]
                    currentMain = itemStyle[mainEnd] + step
                }
            }
        })

    }
    // console.log(items)

}


module.exports = layout