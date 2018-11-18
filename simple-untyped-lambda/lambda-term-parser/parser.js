const peg = require('pegjs')
    , S = require('../utilities/sanctuary-config')
    , {readUtf8FileFuture} = require('../utilities/future-fs')
    , {K} = require('../utilities/helpers')


// :: String -> Future e Parser
const getParserFromPath = S.pipe([
    readUtf8FileFuture,                 //=> Future e String
    S.map(peg.generate)                 //=> Future e Parser
])

const getLambdaTermParser = K(getParserFromPath('./lambda-term-parser/grammar-array.peg'))

module.exports = Object.freeze({
    getParserFromPath,
    getLambdaTermParser
})