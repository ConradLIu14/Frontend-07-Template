const EOF = Symbol("EOF")// EOF: End Of File

function data(c){

}


module.exports.parseHTML = function parseHTML(html){
    // console.log(html)
    let state = data
    for(let c of html){
        state = state(c)
    }
    state = state(EOF);// 创建一个symbol； 利用symbol 唯一性创建
}