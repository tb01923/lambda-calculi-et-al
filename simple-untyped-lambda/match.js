const S = require('./utilities/sanctuary-config')

const match = (x, o) => {

    const className = x.constructor.name

    if(o[className] && x['project'])
    {
        return o[className].apply(null, x['project'])
    }
    else if(o['_'])
    {
        return o['_'].apply(null, x['project'])
    }

    throw "Match case unhandled"
}


function makePermutations(length, data) {
    // https://stackoverflow.com/questions/27177026/derive-every-possible-combination-of-elements-in-array
    const current = new Array(length)
        , used = new Array(length)
        , seen = {}, result = [];

    function permute(pos) {
        if (pos == length) {                    // Do we have a complete combination?
            if (!seen[current]) {               // Check whether we've seen it before.
                seen[current] = true;           // If not, save it.
                result.push(current.slice());
            }
            return;
        }
        for (var i = 0; i < data.length; ++i) {
            if (!used[i]) {                     // Have we used this element before?
                used[i] = true;                 // If not, insert it and recurse.
                current[pos] = data[i];
                permute(pos+1);
                used[i] = false;                // Reset after the recursive call.
            }
        }
    }
    permute(0);
    return result;
}

const getTypeNamePermutations = S.pipe([
    S.reduce(a => b => a.concat(b.constructor.name), []),
    xs => xs.concat('_'),
    xs => makePermutations(xs.length - 1, xs)
])


const property = name => o => o[name]
const getValue = property('value')
const getProjection = property('project')

const invoke = (methodName, ...args) => o => o[methodName].apply(o, args)
const joinWithSpace = invoke('join', ' ')
const trim = invoke('trim')
const concatUnderscore = invoke('concat', ['_'])

const match2 = (...xs) => {

    const functionMap = xs.pop()
    const getFromFunctionMap = x => functionMap[x]
    const isInFunctionMap = x => getFromFunctionMap(x) !== undefined

    const getMatchedF = S.pipe([
        getTypeNamePermutations,
        //=> [[T1,...TN]]
        S.map(joinWithSpace),
        //=> ["T1 ...TN"]
        S.map(trim),
        //=> ["T1 ...TN"]
        concatUnderscore,
        //=> ["T1 ...TN", "_"]
        S.find(isInFunctionMap),
        //=> Maybe "T1...TN"
        S.map(getFromFunctionMap),
        //=> Maybe (...xs -> ?)
        getValue
    ])

    const getProjections = xs => xs.reduce((a,x)=>{
        const y = getProjection(x)
        return a.concat([y])
    }, [])

    const matchedF = getMatchedF(xs)
    const args = getProjections(xs)

    if(matchedF)
    {
        return matchedF.apply(null, (xs.length > 1) ? [args] : args[0])
    }

    throw "Match case unhandled"
}

const match3 = functionMap => (...xs) => {

    const getFromFunctionMap = x => functionMap[x]
    const isInFunctionMap = x => getFromFunctionMap(x) !== undefined

    // xs[1] = new (function T(){})
    // xs.push(new (function X(){}))

    const getMatchedF = S.pipe([
        getTypeNamePermutations,
        //=> [[T1,...TN]]
        S.map(joinWithSpace),
        //=> ["T1 ...TN"]
        S.map(trim),
        //=> ["T1 ...TN"]
        concatUnderscore,
        //=> ["T1 ...TN", "_"]
        S.find(isInFunctionMap),
        //=> Maybe "T1...TN"
        S.map(getFromFunctionMap),
        //=> Maybe (...xs -> ?)
        getValue
    ])

    const getProjections = xs => xs.reduce((a,x)=>{
        const y = getProjection(x)
        return a.concat([y])
    }, [])

    const matchedF = getMatchedF(xs)
    const args = getProjections(xs)

    if(matchedF)
    {
        return matchedF.apply(null, (xs.length > 1) ? [args] : args[0])
    }

    throw "Match case unhandled"
}

module.exports = Object.freeze({
    match,
    match2,
    match3
})