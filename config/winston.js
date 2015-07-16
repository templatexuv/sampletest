'use strict';

/**
 * Winston is a multi-transport async logging library
 */
var build = require('./build');

/**
 * Custom Logging Levels
 * Colors for different logging levels
 */

var winstonLogsConfig = {
    levels : {
        'debug' : 0,
        'info' : 1,
        'warn' : 2,
        'error' : 3,
        'trans' : 4
    },
    colors : {
        'debug' : 'blue',
        'info' : 'cyan',
        'warn' : 'yellow',
        'error' : 'red',
        'trans' : 'green'
    },
    logTypes: ['file', 'console'],
    currentLogLevel: build.Environment[build.Type].CurrentLogLevel,
    defaultLogType: 'console',
    currentLogType: build.Environment[build.Type].CurrentLogType
};

/**
 * winston configuration for logging 
 */
var winstonConfig = {
    'level' : winstonLogsConfig.currentLogLevel,
    'levels' : winstonLogsConfig.levels
};

/**
 * Console format
 */
var winstonTransports = {
    'Console' : {
        'timestamp' : true,
        'level' : winstonLogsConfig.currentLogLevel,
        'levels' : winstonLogsConfig.levels,
        'handleExceptions' : true,
        'colorize' : true
    },
    'File' : {
        'timestamp' : true,
        'handleExceptions' : true,
        'filename' : './logs/videocrm.log',
        'json' : false,
        'levels' : winstonLogsConfig.levels,
        'level' : winstonLogsConfig.currentLogLevel
    }
};

exports.winstonLogsConfig = winstonLogsConfig;
exports.winstonConfig = winstonConfig;
exports.winstonTransports = winstonTransports;