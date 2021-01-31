const EOF = Symbol("EOF")// EOF: End Of File

function data(c){
    if (c==='<')
        return  tagOpen
    else if(c === EOF)
        return
    else return data
}
function tagOpen(c){
    if(c === '/'){
        return endTagOpen
    }
    else if(c.match(/^[a-zA-z]$/))
        return tagName(c)
    else return 
}
function endTagOpen(c){
    if(c.match(/^[a-zA-Z]$/))
        return tagName(c)
    else if(c==='>'){

    }
    else if (c===EOF){

    }
    else{

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
        return tagName
    }
    else if (c==='>'){
        return data
    }
    else { return tagName}
}
function beforeAttributeName(c){// 这里暂时不对它进行处理
    if(c.match(/^[\t\n\f ]$/))
        return beforeAttributeName
    else if(c==='>')
        return data
    else if (c==='=')
        return beforeAttributeName
    else return beforeAttributeName
}
function selfClosingStartTag(c){
    if(c=='>'){
        currentToken.isSelfClosing = true
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
}