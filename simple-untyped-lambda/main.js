const F = require('fluture')
    , S = require('./utilities/sanctuary-config')
    , { getLambdaTermParser } = require('./lambda-term-parser/parser')
    , { forkConsoleExit } = require('./utilities/helpers')
    , { eval } = require('./eval')
    , { printAst, printTerm, printTermless, printTermlessWithVariableNames } = require('./print')

// :: Parser -> String -> [Object]
const parseStringIntoAST = s => p => {
    try{
        return p.parse(s)
    }
    catch(e){
        console.error(e)
    }
}

const convertToOutput = original => t => {
    return {
        "original": original,
        "term": printTerm(t),
        "termIdx": printTermlessWithVariableNames(t),
        "termless": printTermless(t),
        "abstractTree": printAst(t)
    }
}

const setDeBruijnIndex = term => term.setDeBruijnIndex([])

const main = () => {
    //const lambda = 'λl.λm.λn.λo.lmno' ;
    //const lambda = 'λx.λx.λy.λx.xxyx' ;


    //const lambda = 'λx.x' ;



    //const lambda = '(λx.x)' ;
    //const lambda = '(λx.x)(λy.y)' ;
    //const lambda = '(λx.(λy.yx))(λt.a)' ;
    //const lambda = '(λx.(λy.(λz.x)y))(λt.a)' ;

    const lambda = "abcd"

    // :: String -> undefined
    const run = S.pipe([
        getLambdaTermParser,
        S.map(parseStringIntoAST(lambda)),
        S.map(setDeBruijnIndex),
        //S.map(eval([])),
        S.map(convertToOutput(lambda)),
        forkConsoleExit
    ])

    run(null)
}

main()