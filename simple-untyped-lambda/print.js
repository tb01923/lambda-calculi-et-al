const {Variable, Abstraction, Application} = require('./lambda-term-parser/ast')
    , {match} = require('./match')

const printTerm = t => {

    return match(t, {
        Variable: (info, variableName) =>
            `${variableName}`,

        Abstraction: (info, variableName, term, isParens) =>
            (isParens) ?
                `(λ${variableName}.${printTerm(term)})` :
                `λ${variableName}.${printTerm(term)}`,

        Application: (info, lhs, rhs, isParens) =>
            (isParens) ?
                `(${printTerm(lhs)}${printTerm(rhs)})` :
                `${printTerm(lhs)}${printTerm(rhs)}`
    })
}

const printTermless = t => {

    return match(t, {
        Variable: (info, variableName, deBruijnIndex) =>
            ` ${deBruijnIndex}`,

        Abstraction: (info, variableName, term, isParens) =>
            (isParens) ?
                `(λ.${printTermless(term)})` :
                `λ.${printTermless(term)}`,

        Application: (info, lhs, rhs, isParens) =>
            (isParens) ?
                `(${printTermless(lhs)}${printTermless(rhs)})` :
                `${printTermless(lhs)}${printTermless(rhs)}`
    })
}

const printTermlessWithVariableNames = t => {

    return match(t, {
        Variable: (info, variableName, deBruijnIndex) =>
            ` ${deBruijnIndex}`,

        Abstraction: (info, variableName, term, isParens) =>
            (isParens) ?
                `(λ${variableName}.${printTermlessWithVariableNames(term)})` :
                `λ${variableName}.${printTermlessWithVariableNames(term)}`,

        Application: (info, lhs, rhs, isParens) =>
            (isParens) ?
                `(${printTermlessWithVariableNames(lhs)}${printTermlessWithVariableNames(rhs)})` :
                `${printTermlessWithVariableNames(lhs)}${printTermlessWithVariableNames(rhs)}`
    })
}


const printAst = t => {

    return match(t, {
        Variable: (info, variableName, deBruijnIndex) =>
            ` Variable(${variableName}, ${deBruijnIndex})`,

        Abstraction: (info, variableName, term, _) =>
            `Abstraction( ${variableName}, ${printAst(term)} )`,

        Application: (info, lhs, rhs, _) =>
            `Application( ${printAst(lhs)}, ${printAst(rhs)} )`
    })
}

module.exports = {
    printAst,
    printTerm,
    printTermless,
    printTermlessWithVariableNames

}