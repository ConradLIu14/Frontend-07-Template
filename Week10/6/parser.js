const css = require('css')
const layout = require("./layout.js")
const EOF = Symbol("EOF")// EOF: End Of File

let currentToken = null
let currentAttribute = null

let stack=[{type:'document',children:[]}]
let currentTextNode = null

let rules = [];
function addCssRules(text){
    var ast = css.parse(text)
    // console.log(JSON.stringify(ast,null,  "    "))
    rules.push(...ast.stylesheet.rules) // ... 的意思是把 套嵌的object 递归的全部展开 然后push
}
// 简单选择器有三种
function match(element,selector){
    if(!selector||!element.attributes)
        return false
    if(selector.charAt(0)==="#"){
        var attr = element.attributes.filter(attr=>attr.name === "id")[0]
        // console.log(attr)
        if(attr&&attr.value===selector.replace("#",''))
            return true
    }else if(selector.charAt(0)==="."){
        var attr = element.attributes.filter(attr=>attr.name==="class")[0]
        if(attr&&attr.value ===selector.replace(".",''))
            return true
    }else {
        if(element.tagName===selector){
            return true
        }
    }
    return false
}
function computeCSS(element){
    // console.log("rules",rules)
    // console.log("compute CSS for element",element)
    var elements = stack.slice().reverse()// slice 函数截取数组 一段或者全部
    if (!element.computedStyle)
        element.computedStyle = {}
    for(let rule of rules){
        var selectorParts = rule.selectors[0].split(" ").reverse();

        if(!match(element,selectorParts[0]))
            continue
        
        let matched = false

        var j = 1
        for(var i = 0;i<elements.length;i++){
            if(match(elements[i],selectorParts[j])){
                j++
            }
        }
        if(j>=selectorParts.length)
            matched = true
        if(matched)
        {
            // // console.log("Element",element,"matched rule",rule)
            // var computedStyle = element.computedStyle
            // for(var declaration of rule.declarations){
            //     if(!computedStyle[declaration.property]){
            //         computedStyle[declaration.property] = {}
            //     }
            //     computedStyle[declaration.property].value = declaration.value
            // }
            // console.log('computeCSS',element.computedStyle)
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
            var sp = specificity(rule.selectors[0])
            var computedStyle = element.computedStyle
            for(var declaration of rule.declarations)
            {
                if(!computedStyle[declaration.property])
                    computedStyle[declaration.property] = {}
                if(!computedStyle[declaration.property].specificity){
                    computedStyle[declaration.property].value  = declaration.value
                    computedStyle[declaration.property].specificity = sp
                }else if (compare(computedStyle[declaration.property].specificity,sp)<0){
                    computedStyle[declaration.property].value = declaration.value
                    computedStyle[declaration.property].specificity = sp
                }
            }
        }
    }
}

function specificity(selector){
    var p = [0,0,0,0]
    var selectorParts = selector.split(' ')
    for(var part of selectorParts){
        if(part.charAt(0)=='#'){
            p[1]+=1
        }else if(part.charAt(0)==='.'){
            part[2]+=1
        }else{
            part[3] +=1
        }
    }return p
}

function compare(sp1,sp2){
    if(sp1[0]-sp2[0])
        return sp1[0] - sp2[0]
    if(sp1[1] - sp2[1])
        return sp1[1] - sp2[1]
    if(sp1[2] - sp2[2])
        return sp1[2] - sp2[2]
    
    return sp1[3] - sp2[3]
}

function emit(token){
    // console.log(token)
    // if(token.type==="text")
    //     return 
    let top = stack[stack.length-1]

    if(token.type==='startTag'){// Tag 就是 那个名字 element 表示 tag所属的抽象概念 dom 树种只有 node 和 element 不会有tag
        let element={
            type:'element',
            children:[],
            attributes:[]
        }
        element.tagName = token.tagName
        for(let p in token){
            if(p!="type"&& p!="tagName")
                element.attributes.push({
                    name:p,
                    value:token[p],
                })
        }
        computeCSS(element)
        top.children.push(element)
        // element.parent = top // 这里 不要形成循环 引用，不然结尾的时候会出问题的。

        if(!token.isSelfClosing)
            stack.push(element)

        currentTextNode = null
    }else if(token.type ==="endTag"){
        if(top.tagName !=token.tagName){
            throw new Error("Tag start end doesn't match")// 如果结束标签与开头标签不匹配，直接抛错。其实有容错的
        }else{
            // 遇到style 标签，执行添加css 规则的操作
            if(top.tagName==="style"){
                addCssRules(top.children[0].content)// 取出Css 规则；写一个addCssRules 的方法添加这些规则；
                                                    // linke标签涉及多个html 文件先不考虑
            }
            layout(top)
            stack.pop()
        }
        currentTextNode = null
    }else if(token.type ==="text"){// 
        if(currentTextNode===null){
            currentTextNode={
                type:"text",
                content:""
            }
            top.children.push(currentTextNode)// 标签里面会自带 text 内容
        }
        currentTextNode.content+=token.content
    }
}


function data(c){
    if (c==='<')
        return  tagOpen
    else if(c === EOF){
        emit({type:"EOF"})
        return
    }
    else{
        emit({
            type:'text',
            content:c
        })
        return data
    }
}
function tagOpen(c){
    if(c === '/'){
        return endTagOpen
    }
    else if(c.match(/^[a-zA-z]$/)){
        currentToken = {
            type:"startTag",
            tagName:""
        }
        return tagName(c)
    }
    else{ 
        return }
}
function endTagOpen(c){
    if(c.match(/^[a-zA-Z]$/)){
        currentToken = {
            type:"endTag",
            tagName:""
        }
        return tagName(c)
    }
    else if(c==='>'){// 不会存在
    }
    else if (c===EOF){// 不应该存在

    }
    else{
        return
    }
}
function tagName(c){
    if(c.match(/^[\t\n\f ]$/)){// tab 符；换行符；禁止符 和 空格空格不能省略
        return beforeAttributeName
    }
    else if(c==='/'){
        return selfClosingStartTag
    }
    else if(c.match(/^[a-zA-Z]$/)){
        currentToken.tagName+=c
        return tagName
    }
    else if (c==='>'){
        emit(currentToken)
        return data
    }
    else { return tagName}
}
function beforeAttributeName(c){// 这里暂时不对它进行处理
    if(c.match(/^[\t\n\f ]$/))
        return beforeAttributeName
    else if(c==='/'||c==='>'||c===EOF){
        return afterAttributeName(c)
    }
        
    else if (c==='=')
        return beforeAttributeName
    else {
        currentAttribute = {
            name:"",
            value:""
        }
        return attributeName(c)
    }
}
function attributeName(c){
    if(c.match(/^[\t\n\f ]$/)||c==="/"||c===">"||c===EOF){
        return afterAttributeName(c)
    }else if(c==="="){
        return beforeAttributeValue
    }else if(c ==='\u0000'){

    }else if(c==="\""||c===""||c==="<"){

    }else {
        currentAttribute.name+=c;
        return attributeName
    }
}

function beforeAttributeValue(c){
    if(c.match(/^[\t\n\f ]$/)||c==='/'||c==='>'||c==EOF){
        return beforeAttributeValue
    }else if(c==="\""){
        return doubleQuotedAttributeValue
    }else if(c==="\'") return singleQuotedAttributeValue
    else if(c===">"){

    }else {
        return UnquotedAttributeValue
    }
}
function doubleQuotedAttributeValue(c){
    if(c=="\""){
        currentToken[currentAttribute.name]=currentAttribute.value
        return afterQuotedAttributeValue
    }else if(c==='\u0000'){}
    else if(c===EOF){}
    else {
        currentAttribute.value +=c
        return doubleQuotedAttributeValue
    }
}

function singleQuotedAttributeValue(c){
    if(c=="\'"){
        currentToken[currentAttribute.name]=currentAttribute.value
        return afterQuotedAttributeValue
    }else if(c==='\u0000'){}
    else if(c===EOF){}
    else {
        currentAttribute.value +=c
        // return doubleQuotedAttributeValue// 这里有问题吧 为什么不是single呢
        return singleQuotedAttributeValue
    }

}
function afterQuotedAttributeValue(c){
    if(c.match(/^[\t\n\f]$/)){
        return beforeAttributeName
    }else if(c=== "/"){
        // currentToken[currentAttribute.name] = currentAttribute.value
        // emit(currentToken)
        return selfClosingStartTag
    }else if(c==">"){
        currentToken[currentAttribute.name] = currentAttribute.value
        emit(currentToken)
        return data
    }else if(c===EOF){

    }else{
        currentAttribute.value +=c
        return doubleQuotedAttributeValue
    }
}
function UnquotedAttributeValue(c){
    if(c.match(/^[\t\n\f ]$/)){
        currentToken[currentAttribute.name] = currentAttribute.name
        return beforeAttributeName
    }else if(c=="/"){
        currentToken[currentAttribute.name] = currentAttribute.value
        // emit(currentAttribute)
        return selfClosingStartTag
    }else if(c===">"){
        currentToken[currentAttribute.name] = currentAttribute.value
        emit(currentAttribute)
        return data
    }else if(c=="\u0000"){
        
    }else if(c=="\""||c==="'"||c=="<"||c=="="||c=="`"){

    }else if(c===EOF){

    }else {
        currentAttribute.value +=c
        return UnquotedAttributeValue
    }
}

function afterAttributeName(c){
    if(c.match(/^[\t\n\f ]$/)){
        return afterAttributeName
    }else if(c=="/"){
        return selfClosingStartTag
    }else if(c==="="){
        return beforeAttributeValue
    }else if(c===">"){
        currentToken[currentAttribute.name] = currentAttribute.value
        emit(currentToken)
        return data
    }else if(c===EOF){

    }else {
        currentToken[currentAttribute.name] = currentAttribute.value
        emit(currentToken)
        currentAttribute = {
            name:"",
            value: "",
        }
        return attributeName(c)
    }
}


function selfClosingStartTag(c){
    if(c=='>'){
        currentToken[currentAttribute.name] = currentAttribute.value
        
        currentToken.isSelfClosing = true

        emit(currentToken)
        return data
    }else if(c === 'EOF'){}
    else {}
}

module.exports.parseHTML = function parseHTML(html){
    // console.log(html)
    let state = data
    for(let c of html){
        state = state(c)
    }
    state = state(EOF);// 创建一个symbol； 利用symbol 唯一性创建
    // console.log(stack[0])
    return stack[0]
}