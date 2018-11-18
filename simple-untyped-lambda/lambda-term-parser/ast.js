const getInstance = (self, constructor) =>
    (self instanceof constructor) ?
        self :
        Object.create(constructor.prototype) ;

const checkIndex = (variableName, ctx) => {
    const i = ctx.indexOf(variableName)
    if(i < 0){
        ctx.push(variableName)
    }
    return ctx
}

const Variable = function(info, variableName, deBruijnIndex, ctx){
    const self = getInstance(this, Variable)

    self['project'] = [info, variableName, deBruijnIndex]

    self['setDeBruijnIndex'] = (ctx) =>
    {
        ctx= checkIndex(variableName, ctx)

        return Variable(
            info,
            variableName,
            ctx.indexOf(variableName),
            ctx) ;
    }

    return Object.freeze(self)
}

const Abstraction = function(info, variableName, term, isParens, ctx){
    const self = getInstance(this, Abstraction)

    self['project'] = [info, variableName, term, isParens, ctx]

    self['setDeBruijnIndex'] = (ctx) => {
        const ctxCopy = [variableName].concat(ctx)
        return Abstraction(
            info,
            variableName,
            term.setDeBruijnIndex(ctxCopy),
            isParens,
            ctxCopy) ;
    }

    return Object.freeze(self)
}

Abstraction.cloneWithTerm = (abstraction, term) =>
    Abstraction(
        abstraction.project[0],
        abstraction.project[1],
        term,
        abstraction.project[3],
        abstraction.project[4],
    )


const Application = function(info, lhs, rhs, isParens, ctx){

    const self = getInstance(this, Application)

    self['project'] = [info, lhs, rhs, isParens, ctx]

    self['setDeBruijnIndex'] = (ctx) =>
        Application(
            info,
            lhs.setDeBruijnIndex(ctx),
            rhs.setDeBruijnIndex(ctx),
            isParens,
            ctx
        ) ;

    return Object.freeze(self)
}

Application.cloneWithLhs = (application, lhs) =>
    Application(
        application.project[0],
        lhs,
        application.project[2],
        application.project[3],
        application.project[4],
    )

Application.cloneWithRhs = (application, rhs) =>
    Application(
        application.project[0],
        application.project[1],
        rhs,
        application.project[3],
        application.project[4],
    )


const reduceTerms = function(info, terms){
    const initialLhs = terms.shift()
    const initialRhs = terms.shift()
    const initialApp = Application(info, initialLhs, initialRhs, false)

    const appAll = terms.reduce(
        (lhs, rhs) => Application(info, lhs, rhs, false),
        initialApp
    )

    return appAll ;
}

const setParens = function(x){
    if(x instanceof Application){
        const y = x.project
        return Application(y[0], y[1], y[2], true)
    }
    else if(x instanceof Abstraction){
        const y = x.project
        return Abstraction(y[0], y[1], y[2], true)
    }
    else{
        return x
    }
}

module.exports = Object.freeze({
    Variable,
    Abstraction,
    Application,
    reduceTerms,
    setParens
})