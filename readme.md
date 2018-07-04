# Example usage

```
import chainProcess from 'chainprocess';

// # Standard output is the input for the next chain item
chainProcess('git rev-parse --abbrev-ref HEAD')
// # You can include your own logic to process inputs
    .chain( branch => {
        console.log(`Current branch:${branch}`);
        if (branch !== 'release') {
// # Returning a function will break the chain
            return ()=> console.error('Must be on the release branch!')
        }
    })
    .chain('git add . -A')
// # Continue execution on success return code
    .chain(`git commit -m "Automated commit."`)
    .chain(`git push origin release:master --force`)
// # Can pass output to the next step
    .chain(()=> 'output is the input for the next chain item.')
// # Can pass promise as the next step
    .chain( input => new Promise(resolve => setTimeout(resolve, input.length )))
// # Chain is executed on calling the `run()` function on it
    .run()
// # Processing the erronous exit
    .catch(console.error);
```