const fs = require('fs');
const path = require('path');

const thisFile = path.resolve(__dirname, 'index.js');

const filer = root =>
{
    let output = [];

    if (fs.existsSync(root))
    {
        const stats = fs.statSync(root);
        if (stats.isDirectory())
        {
            fs.readdirSync(root).forEach(
                file => output = output.concat(filer(path.join(root, file))));
        }
        else if (root !== thisFile && !/_.+\.js$/.test(root))
        {
            output.push(root);
        }
    }

    return output;
};

/* eslint-disable global-require */
filer(path.resolve(__dirname))
    .filter(item => item.endsWith('.js'))
    .forEach(item => require(item));
/* eslint-enable global-require */
