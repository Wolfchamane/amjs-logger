const { equal }     = require('assert');
const AmjsLogger    = require('../../src/Logger');
const fs            = require('fs');
const path          = require('path');

/**
 * Teardown function
 * @param   {String}    logFile To remove
 */
const afterEach = (logFile = '') =>
{
    fs.unlinkSync(logFile);
};

/**
 * Setup function
 * @return {String} Log files folder
 */
const beforeEach = () =>
{
    const folder = path.resolve(__dirname, '..', '..', '.tmp');
    if (fs.existsSync(folder))
    {
        fs.readdirSync(folder)
            .filter(item => !!item)
            .forEach(item => afterEach(path.join(folder, item)));
        fs.rmdirSync(folder);
    }

    return folder;
};

(function ()
{
    const expectedDestFolder = beforeEach();

    const sut = new AmjsLogger();
    equal(
        sut.destFolder === expectedDestFolder,
        true,
        `@amjs/logger > constructor > destFolder is ${expectedDestFolder}`);

    const expectedLogFile = new RegExp(`${expectedDestFolder}/[\\d-]+T[\\d:]+.\\d{3}Z.log`);
    equal(
        expectedLogFile.test(sut.logFile) === true,
        true,
        `@amjs/logger > constructor > logFile matches ${expectedLogFile}`);

    equal(
        fs.existsSync(sut.destFolder) === true,
        true,
        '@amjs/logger > constructor > creates destination folder');

    equal(
        fs.existsSync(sut.logFile) === true,
        true,
        '@amjs/logger > constructor > creates log file');

    afterEach(sut.logFile);
})();

(function ()
{
    beforeEach();
    const destFolder = path.resolve(__dirname, '..', '..', '.tmp');
    const logFile = path.join(destFolder, 'test.log');
    fs.mkdirSync(destFolder);
    fs.writeFileSync(logFile, '', 'utf-8');

    const sut = new AmjsLogger({ destFolder, logFile });

    afterEach(sut.logFile);
})();

(function ()
{
    beforeEach();
    const sut = new AmjsLogger();
    sut.log('simple log sentence');

    let content = fs.readFileSync(sut.logFile, 'utf-8').toString();
    equal(
        content.lastIndexOf('simple log sentence') !== -1,
        true,
        '@amjs/logger > log > logs a simple log sentence');

    sut.log('complex {{item}} sentence', { item : 'ERROR' });
    content = fs.readFileSync(sut.logFile, 'utf-8').toString();
    equal(
        content.lastIndexOf('complex ERROR sentence') !== -1,
        true,
        '@amjs/logger > log > logs a complex sentence');

    afterEach(sut.logFile);
})();

(function ()
{
    [
        'log',
        'error',
        'debug',
        'warn',
        'info'
    ].forEach(
        method =>
        {
            beforeEach();
            const sut = new AmjsLogger();
            sut[method]();
            equal(
                fs.readFileSync(sut.logFile).toString()
                    .lastIndexOf(method.toUpperCase()) !== -1,
                true,
                `@amjs/logger > error > logs a/an ${method} trace`
            );
            afterEach(sut.logFile);
        }
    );

})();

(function ()
{
    beforeEach();
    const sut = new AmjsLogger();
    sut._write();
    equal(
        fs.readFileSync(sut.logFile, 'utf-8').toString()
            .trim().length === 0,
        true,
        '@amjs/logger > _write > By default writes nothing into log file'
    );
    afterEach(sut.logFile);
})();

(function ()
{
    beforeEach();
    const sut = new AmjsLogger({ stack : true });
    sut._stack();
    equal(
        Array.isArray(sut.stack),
        true,
        '@amjs/logger > _stack > converts stack property into array'
    );
    sut._stack('message');
    equal(
        sut.stack.length === 2,
        true,
        '@amjs/logger > _stack > adds message to stack array'
    );
    afterEach(sut.logFile);
})();

(function ()
{
    [
        'LOG',
        'INFO',
        'DEBUG',
        'ERROR',
        'WARNING'
    ].forEach(
        level =>
        {
            beforeEach();
            const sut = new AmjsLogger();
            const message = sut._consoleColor(level);
            equal(/[[\w]+/.test(message), true, `@amjs/logger > _consoleColor > changes the color of word ${level}`);
            afterEach(sut.logFile);
        }
    );

    beforeEach();
    const sut = new AmjsLogger();
    const message = sut._consoleColor();
    equal(message === '', true, '@amjs/logger > _consoleColor > does nothing w/ empty messages');
    afterEach(sut.logFile);
})();

(function ()
{
    beforeEach();
    const sut = new AmjsLogger();
    let stubConsoleColor = false;
    let stubStack = false;
    let stubWrite = false;
    sut._consoleColor = () => stubConsoleColor = true;
    sut._stack = () => stubStack = true;
    sut._write = () => stubWrite = true;
    sut.trace = true;
    sut._print();
    equal(stubConsoleColor, true, '@amjs/logger > _print > calls _consoleColor if trace is set to true');
    sut.trace = false;
    sut.stack = true;
    sut._print();
    equal(stubStack, true, '@amjs/logger > _print > calls _stack if stack is enabled');
    sut.stack = false;
    sut._print();
    equal(stubWrite, true, '@amjs/logger > _print > by default calls _write');
    afterEach(sut.logFile);
})();

(function ()
{
    beforeEach();
    const sut = new AmjsLogger();
    const result = sut._fillTemplate();
    const expectedPattern = /[\d-]+T[\d:]+.\d{3}Z @amjs\/logger \[\].+/;
    equal(
        expectedPattern.test(result),
        true,
        '@amjs/logger > _fillTemplate > returns default template string');
    afterEach(sut.logFile);
})();

(function ()
{
    beforeEach();
    const sut = new AmjsLogger({ stack : true });
    let stubWriteMessage = '';
    let stubAppendMessage = false;
    let stubWrite = false;
    sut._write = (message = '', append = false) =>
    {
        stubWrite = true;
        stubWriteMessage = message;
        stubAppendMessage = append;
    };
    sut.dump();
    equal(
        stubWrite === false,
        true,
        '@amjs/logger > dump > by default, event configured as stack, does nothing'
    );
    sut._stack('Line one');
    sut._stack('Line two');
    sut.dump();
    equal(
        stubWrite === true,
        true,
        '@amjs/logger > dump > calls _write'
    );
    equal(
        stubWriteMessage.lastIndexOf('\n') !== -1,
        true,
        '@amjs/logger > dump > writes all messages joined with \\n'
    );
    equal(
        stubAppendMessage === false,
        true,
        '@amjs/logger > dump > writes all messages w/out appending them'
    );
    afterEach(sut.logFile);
})();
