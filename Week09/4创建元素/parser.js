let currentToken = null

function emit(token){
    console.log(token)
}

const EOF = Symbol("EOF")// EOF: End Of File

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