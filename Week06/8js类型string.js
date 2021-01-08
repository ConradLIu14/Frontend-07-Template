function convert_int8_binary(int8){
       let res = '';
       for(let i =0;i<8;i++){
           let curr = int8%2;
           res = curr.toString() + res;
           int8 = int8>>1;
       }
       return res
    }
function UTF8_Encoding(string){
    // let buffer = new ArrayBuffer()
    // let intArray = new Int8Array(buffer);

    // const buf8 = Buffer.from(string, 'utf8');
    // const buf16 = Buffer.from(string,'utf16le');
    // console.log(buf8.toString('utf8'));
    // console.log(buf16.toString('utf16le'));
    
    
    var encoder = new TextEncoder('utf8');
    int8res = encoder.encode(string)
    console.log(int8res);
    let res = [];
    for(let i =0;i<3;i++){
        res.push(convert_int8_binary(int8res[i]));
    }
    console.log(res);
}

UTF8_Encoding('一');

// console.log(convert_int8_binary(228));
// console.log(convert_int8_binary(184));
// console.log(convert_int8_binary(128));

// a = 1;
// console.log(a.toString());
// console.log(1 .toString());
