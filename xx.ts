import {parse} from 'yaml'
import fs from 'fs/promises'

const file = await fs.readFile('apa.yml', 'utf-8')
const data = parse(file)

console.log(data)