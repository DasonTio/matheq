// src/utils/solvers.js
import { compile } from "mathjs";

const MAX_ITER_SAFETY = 1000;

// Helper to evaluate function string
const evaluateFunction = (fnString, vars) => {
    try {
        const compiledFn = compile(fnString);
        return compiledFn.evaluate(vars);
    } catch (e) {
        console.error("Error evaluating function:", e);
        return null;
    }
};

export const fixedPointIterationMethod = (
    gFnString,
    x0,
    tolerance,
    maxIterations,
) => {
    const iterations = [];
    let x = x0;
    const effectiveMaxIter = Math.min(maxIterations, MAX_ITER_SAFETY);

    for (let i = 0; i < effectiveMaxIter; i++) {
        const gx = evaluateFunction(gFnString, { x: x });
        if (gx === null) {
            return {
                root: null,
                iterations,
                message: `Error evaluating g(x) at iteration ${i + 1}.`,
                error: true,
            };
        }
        // Check for divergence or non-convergence (can be tricky to define universally)
        if (Math.abs(gx) > 1e10 || isNaN(gx) || !isFinite(gx)) {
            return {
                root: null,
                iterations,
                message: `Iteration is diverging or resulted in an invalid number at iteration ${i + 1}.`,
                error: true,
            };
        }


        const error = Math.abs(gx - x);
        iterations.push({
            iteration: i + 1,
            xi: x,
            gxi: gx,
            error: error,
        });

        if (error < tolerance) {
            return { root: gx, iterations, message: "Solution found." };
        }
        x = gx;
    }
    return {
        root: x,
        iterations,
        message: "Max iterations reached. Solution may not be accurate.",
    };
};
