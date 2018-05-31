const cp = require('child_process');

const execute = string => new Promise((resolve, reject)=>{
    console.log(string);

    cp.exec(string, (err, stdout, stderr) => {
        if (err) {
            reject(err);
        }
        const out = stdout.toString().trim();
        console.log(out);
        console.error(stderr.toString().trim());
        resolve(out);
    });
});

const call = (fn, input) => new Promise((resolve,reject) => {
    const outcome = fn(input);

    if(typeof outcome === 'string') {
        console.log(`Output: ${outcome}`);
    } else if (typeof outcome === 'function') {
        reject(outcome());
        return;
    }
    resolve(outcome);
})

const runChild = (goal, input) =>
    typeof goal === 'string' ?
        execute(goal) :
        call(goal, input);

const chainProcess = (goal1, parent) => ({
    run: input => parent ?
        parent.run(input).then(o => runChild(goal1, o)) :
        runChild(goal1,input),
    chain: childGoal => chainProcess(childGoal, chainProcess(goal1, parent))
});

module.exports = chainProcess;