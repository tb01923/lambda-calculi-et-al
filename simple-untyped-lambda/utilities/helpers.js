const fst = x => x[0]
const snd = x => x[1]

const K = x => _ => x

const papply = (f, x) => f.bind(null, x)

const spreadPairCurried = f => pair =>
    f(fst(pair))(snd(pair))

const split = char => str => str.split(char)

// :: ((a -> undefined), (b -> undefined)) -> Future -> undefined
const fork = (e,s) => f => f.fork(e, s)

// :: String -> Object -> (a -> b)
const invoke = method => object => object[method].bind(object)

// head :: [a] -> a
const head = (xs) => xs[0]

// tail :: [a] -> [a]
const tail = (xs) => xs.slice(1)

// :: a -> b -> Boolean
const isEqualTo = a => b => a === b ;

// :: Number -> [a] -> Boolean
const isArrayLenghtGt = x => arr => arr.length > x ;

const logAndExit = log => o => {
    log(JSON.stringify(o, null, 4));
    process.exit(0);
}

// :: Future -> undefined
const forkConsoleExit = fork(
    logAndExit(console.error),
    logAndExit(console.log)
)

module.exports = Object.freeze({
    spreadPairCurried,
    split,
    fork,
    invoke,
    head,
    tail,
    isEqualTo,
    isArrayLenghtGt,
    forkConsoleExit,
    K
})
