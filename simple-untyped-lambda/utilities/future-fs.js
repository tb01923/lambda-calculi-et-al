const fs = require('fs')
    , F = require('fluture')
    , S = require('./sanctuary-config')

// :: String -> String -> ((e,r) -> x) -> undefined
const readFile = S.curry3(fs.readFile)

// :: String -> ((e,r) -> undefined) -> undefined
const readUtf8File = fileName => readFile(fileName, 'UTF-8')

// :: String -> Future e String
const readUtf8FileFuture = S.pipe([
    readUtf8File,               //=> ((e,r) -> undefined) -> undefined
    F.node                      //=> Future e String
])

/*
1- unary
2- const F = readUtf8FileFuture (../../package.json)
    expect(F.isFuture).to.be.true
3- fork it -- spy e and s
 */

module.exports = Object.freeze({
    readUtf8FileFuture
})