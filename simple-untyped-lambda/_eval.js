const S = require('./utilities/sanctuary-config')
    , { match, match2 } = require('./match')
    , { Application, Abstraction, Variable } = require('./lambda-term-parser/ast')

/*****************************************************************
 *  https://www.asc.ohio-state.edu/pollard.4/type/books/pierce-tpl.pdf
 *  https://tadeuzagallo.com/blog/writing-a-lambda-calculus-interpreter-in-javascript/
 *****************************************************************
 Operational Semantics
 *****************************************************************

     1)       t1 → t1'
         —————————————————
          t1 t2 → t1' t2

    Eval LHS:
    If t1 is a term that evaluates to t1', t1 t2 will evaluate to t1' t2.
        i.e. the left-hand side of an application is evaluated first.

    2)       t2 → t2'
         —————————————————
          v1 t2 → v1 t2'

    Eval RHS:
    If t2 is a term that evaluates to t2', v1 t2 will evaluate to v1 t2'.
        Notice that the left-hand side is v1 instead of t1, that means
        that it’s a value and therefore can’t be evaluated any further.
        i.e. only when we’re done evaluating the left-hand side of the
        application we’ll start evaluating the right one.

    3)    (λx. t12) v2 → [x ↦ v2]t12

    Substitution:
    The result of application (λx. t12) v2 is the same as effectively
        replacing all occurrences of x in t12 with v2. Notice that both
        sides have to be values before evaluating an application.
 ****************************************************************/

/*
{
    "term": "(λx.(λy.yx))(λt.a)",
    "termless": "(λ.(λ. 0 1))(λ. 1)",
    "ast": "Application( Abstraction( x, Abstraction( y, Application(  Variable(y),  Variable(x) ) ) ), Abstraction( t, Application(  Variable(a),  Variable(b) ) ) )"
}
*/

// "shift" the deBruijnIndex all variables within AST by some amount
const shift = (amount, ast) => {
    return match2(ast, {
        "Application": (info, lhs, rhs, isParens, ctx) => {
            const lT = shift(amount, lhs)
            const rT = shift(amount, rhs)
            const a = Application(
                info,
                lT,
                rT,
                isParens,
                ctx
            )
            return a
        },
        "Abstraction": (info, variableName, term, isParens, ctx) => {
            const t = shift(amount, term)
            const a = Abstraction(
                info,
                variableName,
                t,
                isParens,
                ctx
            )
            return a ;
        },
        "Variable": (info, variableName, deBruijnIndex, ctx) => {
            const v = Variable(
                info,
                variableName,
                deBruijnIndex + amount,
                ctx
            )
            return v
        }

    })

}

const _substitue = (replacement, ast) => {
    return match2(ast, {
        "Application": (info, lhs, rhs, isParens, ctx) =>  {
            return Application(
                info,
                _substitue(replacement, lhs),
                _substitue(replacement, rhs),
                isParens,
                ctx
            )

        },

        "Abstraction": (info, variableName, term, isParens, ctx) => {
            return Abstraction(
                info,
                variableName,
                _substitue(replacement, term),
                isParens,
                ctx
            )
        },

        "Variable": (info, variableName, deBruijnIndex, ctx) => {
            if(deBruijnIndex === 0) {
                return replacement ;
            }
            return ast ;
        }

    })
}

// const substitue = (replacement, abstraction) => {
//     const [info, variableName, term, _] = abstraction.project ;
//     const x1 = shift(-1, term)
//     const r1 = shift(-1, replacement)
//     const x2 = _substitue(r1, x1)
//     const x3 = shift(1, x2)
//     const x4 = Abstraction.cloneWithTerm(abstraction, x3)
//     //return x4 ;
//
//     const x5 =
//         _substitue(
//             shift(1, replacement),
//             shift(-1,abstraction))
//
//     //const x4 = Abstraction.cloneWithTerm(abstraction, x3)
//     return x5 ;
// }

const substitue = (application) => {
    const a = shift(-1, application) ;
    const [info, lhs, rhs, _] = a ;
    const lhsTerm = lhs.project[2] ;
    const x4 = shift(1, _substitue(rhs, lhsTerm))

    return x4 ;
}

const isValue = (ctx, term) => {
    return match2(term, {
        "Abstraction": () => true,

        "_": () => false
    })
}

const NO_RULES_APPLY = "NoRuleApplies" ;

const _eval = (ctx, ast) => {

    return match2(ast, {

        "Abstraction": (info, variableName, term, _) => ast,

        "Application": (info, lhs, rhs, _) =>  {

            // Rule 3.
            if(isValue(ctx, lhs) && isValue(ctx, rhs))
            {
                return substitue(ast)
                const lhsTerm = lhs.project[2]
                return substitue(rhs, lhsTerm)
            }
            // Rule 2. Eval RHS
            else if(isValue(ctx, rhs))
            {
                return Application.cloneWithRhs(ast, _eval(ctx, rhs))
            }
            // Rule 1. Eval LHS
            else
            {
                return Application.cloneWithLhs(ast, _eval(ctx, lhs))
            }

        },

        "_": () => {
            if(isValue(ast))
            {
                return ast
            }
            else
            {
                throw NO_RULES_APPLY
            }
        }
    })
}

const eval = ctx => ast => {
    try
    {
        return _eval(ctx, ast)
    }
    catch(e)
    {
        if(e == NO_RULES_APPLY)
        {
            return ast
        }
        else
        {
            console.error(ast)
            throw e
        }
    }
}


module.exports = Object.freeze({eval})