const S = require('./utilities/sanctuary-config')
    , { match2 } = require('./match')
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

// "shift" the deBruijnIndex all variables indexed over the cutoff (c) within AST by some amount (d)
const shift = (c, d, ast) => match2(ast,
    {
        "Application": (info, lhs, rhs, isParens, ctx) =>
            Application(
                info,
                shift(c, d, lhs),
                shift(c, d, rhs),
                isParens,
                ctx
            ),

        "Abstraction": (info, variableName, term, isParens, ctx) =>
            Abstraction(
                info,
                variableName,
                // increment the cutoff, and recurse into the term
                shift(c + 1, d, term),
                isParens,
                ctx
            ),

        "Variable": (info, variableName, deBruijnIndex, ctx) => {
            if(deBruijnIndex >= c) {
                return Variable(
                    info,
                    variableName,
                    deBruijnIndex + d,
                    ctx
                )
            } else {
                return ast ;
            }
        }
    })

// Substitute AST::Variable.deBruijnIndex == j
const _substitue = (c, j, replacement, ast) => match2(ast,
    {
        "Application": (info, lhs, rhs, isParens, ctx) =>  {
            return Application(
                info,
                _substitue(c, j, replacement, lhs),
                _substitue(c, j, replacement, rhs),
                isParens,
                ctx
            )

        },

        "Abstraction": (info, variableName, term, isParens, ctx) => {
            return Abstraction(
                info,
                variableName,
                // increment the cutoff, and recurse into the term
                _substitue(c + 1, j, shift(0,1,replacement), term),
                isParens,
                ctx
            )
        },

        "Variable": (info, variableName, deBruijnIndex) => {
            if(deBruijnIndex === c + j) {
                return replacement ;
            }
            return ast ;
        }

    })



const substitue = (rhs, lhsTerm) => {

    const rhsShifted = shift(0, 1, rhs)
    const lhsSubstituted = _substitue(0, 0, rhs, lhsTerm)

    // not sure why the shift back isn't needed - it is referenced in the text
    const termShiftedBack = shift(0, -1, lhsSubstituted)

    return lhsSubstituted
}

const isValue = (ctx, term) => {
    return match2(term, {
        "Abstraction": _ => true,

        "_": _ => false
    })
}

const NO_RULES_APPLY = "NoRuleApplies" ;

const _eval = (ctx, ast) => match2(ast,
    {
        "Abstraction": _ => ast,

        "Application": (info, lhs, rhs, _) =>  {

            // Rule 3.
            if(isValue(ctx, lhs) && isValue(ctx, rhs))
            {
                const lhsTerm = lhs.project[2] ;
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

        "_": _ => {
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