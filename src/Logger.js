const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const templater = require('@amjs/templater');

/**
 * Utility class to log information into a file and/or console.
 * @namespace   amjs
 * @class       amjs.Logger
 * @requires    amjs.Templater
 */
module.exports = class AmjsLogger {
    /**
     * @constructor
     * @param   {Object}    config  Logger configuration.
     */
    constructor(config = {}) {
        this.date = config.date || new Date().toISOString();
        this.destFolder = config.destFolder || path.resolve(__dirname, '..', '.tmp');
        this.logFile = config.logFile || path.join(this.destFolder, `${this.date}.log`);
        this.name = config.name || '@amjs/logger';
        this.template = config.template || '{{date}} {{name}} [{{level}}] {{message}}';
        this.trace = !!config.console;
        this.stack = config.stack || false;

        if (!fs.existsSync(this.destFolder)) {
            fs.mkdirSync(this.destFolder);
        }

        if (!fs.existsSync(this.logFile)) {
            fs.writeFileSync(this.logFile, '', 'utf-8');
        }
    }

    /**
     * Writes a message into logFile
     * @param   {String}    content To write
     * @param   {Boolean}   append  Whether to append or not information
     * @private
     */
    _write(content = '', append = false) {
        if (append) {
            content = `${fs.readFileSync(this.logFile, 'utf-8').toString()}\n${content}`;
        }

        fs.writeFileSync(this.logFile, content, 'utf-8');
    }

    /**
     * Adds a message to stack trace
     * @param   {String}    message To stack
     * @private
     */
    _stack(message = '') {
        if (!Array.isArray(this.stack)) {
            this.stack = [];
        }

        this.stack.push(message);
    }

    /**
     * Replaces level traces with color map for console output
     * @param   {String}    message To map
     * @return  {String}    Mesage with coloured level traces
     * @private
     */
    _consoleColor(message = '') {
        return message.replace(/(LOG|ERROR|DEBUG|WARNING|INFO)/g, match => {
            let value;
            switch (match) {
                case 'ERROR':
                    value = chalk.bold.red(match);
                    break;
                case 'DEBUG':
                    value = chalk.blue(match);
                    break;
                case 'WARNING':
                    value = chalk.yellow(match);
                    break;
                case 'LOG':
                case 'INFO':
                default:
                    value = match;
            }

            return value;
        });
    }

    /**
     * Prints a message into console and logFile output
     * @param   {String}    message To log
     * @private
     */
    _print(message = '') {
        if (this.trace) {
            console.log(this._consoleColor(message));
        }

        if (this.stack) {
            this._stack(message);
        } else {
            this._write(message, true);
        }
    }

    /**
     * Returns full-filled log record template with full-filled message trace.
     * @param   {String}    message To log
     * @param   {Object}    context To apply into message & record template
     * @return  {String}    Ful-filled log record
     * @private
     */
    _fillTemplate(message = '', context = {}) {
        context = Object.assign({}, this, context);
        message = templater(message, context);

        return templater(this.template, Object.assign(context, { message, date: new Date().toISOString() }));
    }

    /**
     * Dumps all stacked messages into logFile
     */
    dump() {
        if (Array.isArray(this.stack) && this.stack.length) {
            this._write(this.stack.join('\n'), false);
        }
    }

    /**
     * Records a LOG message
     * @param   {String}    message To log
     * @param   {Object}    context To apply into message
     */
    log(message = '', context = {}) {
        this._print(this._fillTemplate(message, Object.assign({}, context, { level: 'LOG' })));
    }

    /**
     * Records an ERROR message
     * @param   {String}    message To log
     * @param   {Object}    context To apply into message
     */
    error(message = '', context = {}) {
        this._print(this._fillTemplate(message, Object.assign({}, context, { level: 'ERROR' })));
    }

    /**
     * Records a DEBUG message
     * @param   {String}    message To log
     * @param   {Object}    context To apply into message
     */
    debug(message = '', context = {}) {
        this._print(this._fillTemplate(message, Object.assign({}, context, { level: 'DEBUG' })));
    }

    /**
     * Records a WARNING message
     * @param   {String}    message To log
     * @param   {Object}    context To apply into message
     */
    warn(message = '', context = {}) {
        this._print(this._fillTemplate(message, Object.assign({}, context, { level: 'WARNING' })));
    }

    /**
     * Records an INFO message
     * @param   {String}    message To log
     * @param   {Object}    context To apply into message
     */
    info(message = '', context = {}) {
        this._print(this._fillTemplate(message, Object.assign({}, context, { level: 'INFO' })));
    }
};
