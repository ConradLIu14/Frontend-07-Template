// function add(a,b){
//     return a + b;
// }
// function mul(a,b){
//     return a * b;
// }

export function add(a,b){
    return a + b;
}
export function mul(a,b){
    return a * b;
}
// module.exports = add;
module.exports.mul = mul;
module.exports.add = add;

