const cp = require('child_process');

const execute = string => new Promise((resolve, reject)=>{
    console.log(string);

    cp.exec(string, (err, stdout, stderr) => {
        if (err) {
            reject(err);
        } else {
        const out = stdout.toString().trim();
        console.log(out);
        
        const errOut = stderr && stderr.toString().trim();
        if(errOut) {
            console.error(stderr.toString().trim());
        }
        resolve(out);
        }
    });
});

const isPromise = fn => !!fn.then;

const call = (fn, input) => new Promise((resolve,reject) => {
    if(isPromise(fn)) {
        
    } else {
        const outcome = fn(input);

        if(typeof outcome === 'string') {
            console.log(`Output: ${outcome}`);
        } else if (typeof outcome === 'function') {
            reject(outcome());
            return;
        }
        resolve(outcome);
    }
});

const runChild = (goal, input) => {
    switch(typeof goal) {
        case 'string': return execute(goal);
        case 'function': return call(goal, input);
        case 'undefined': return execute(input);
        case 'object': if(isPromise(goal)) return goal;
    }
    console.error(typeof(goal));
    throw 'invalid goal!';
};

const runParent = (parent,input, goalChild) => 
    parent.run(input).then(o => runChild(goalChild, o));


const head = goal => ({
    run: input => runChild(goal, input),
    chain: child => tail(child, head(goal))
});

const tail = (goal, parent) => ({
    run: input => runParent(parent, input, goal),
    chain: child => tail(child, tail(goal, parent))
});

const chainProcess = (goal1, parent) => (
    parent ? tail(goal1,parent) : head(goal1)
);

module.exports = chainProcess;