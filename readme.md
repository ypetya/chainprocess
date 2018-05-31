# Example usage

```
import chainProcess from 'chainprocess';

chainProcess('git rev-parse --abbrev-ref HEAD')
    .chain( branch => {
        console.log(`Current branch:${branch}`);
        if (branch !== 'release') {
            return ()=> console.error('Must be on the release branch!')
        }
    })
    .chain('git add . -A')
    .chain(`git commit -m "Automated commit."`)
    .chain(`git push origin release:master --force`)
    .run()
    .catch(console.error);
```