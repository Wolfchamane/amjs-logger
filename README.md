# @amjs/logger 0.1.0

![Statements](https://img.shields.io/badge/Statements-100%25-brightgreen.svg) ![Branches](https://img.shields.io/badge/Branches-100%25-brightgreen.svg) ![Functions](https://img.shields.io/badge/Functions-100%25-brightgreen.svg) ![Lines](https://img.shields.io/badge/Lines-100%25-brightgreen.svg)

> Handles log/trace/debug information

## Installation

```bash
$ npm i @amjs/logger
```
## Usage

#### Default use

```javascript
const AmjsLogger = require('@amjs/logger');
const logger = new AmjsLogger();
logger.log('My log message is {{info}}', { info : 'logged!' }); //*
```

_*: Available methods are: 'log', 'error', 'debug', 'warn' and 'info'_

#### Stacked messages:

In this way of behaviour, messages can be stacked into a pile and through method __dump__ will be written into log file.

```javascript
const AmjsLogger = require('@amjs/logger');
const logger = new AmjsLogger({ stack : true });
logger.log('My log message');
logger.error('My error message');
logger.debug('My debug message');
logger.warn('My warning message');
logger.info('My info message');
logger.dump();
```

## Configuration

__@amjs/logger__ accepts following configuration options:

| Option | Description | Type | Default |
|:---:|:--- |:---:|:--- |
| date       | Log traces fixed date | String | Instance creation date, as ISO string |
| destFolder | Destination folder to write logFile | String | _".tmp"_ |
| logFile    | File to write | String | _".tmp/{date}.log"_ |
| name       | App that is running the logger | String | _"@amjs/logger"_ |
| template   | Log record template | String | _"{{date}} {{name}} [{{level}}] {{message}}"_ |
| trace      | Whether to log messages into console or not | Boolean | false |
| stack      | Whether to stack messages or not | Boolean | false |

By default, all paths are relative to _@amsj/logger_ installation path.

_date_ configuration property __is ony used__ for creating log file, records will have their own timestamp.
