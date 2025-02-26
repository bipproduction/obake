import {AES, enc} from 'crypto-js'

const c = AES.encrypt("ini data string", "makuro")
console.log(c.toString())

console.log(AES.decrypt(c.toString(), "makuro").toString(enc.Utf8))