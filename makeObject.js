#! /usr/bin/env node

var STYLE_EXT = 'scss';
var MODULE_PATH = 'assets/styles/modules/';

var fs = require('fs');
var nopt = require("nopt");
var Stream = require("stream").Stream;
var path = require("path");
var mkdirp = require('mkdirp');
var knownOpts = {
    "responsive": [String]
};
var parsed = nopt(knownOpts, process.argv);
var args = parsed.argv.remain;
var flagArgs = parsed;

var objName = args[0];
var objPath = MODULE_PATH + args[0];
var baseFileName = '_' + args[0] + '.' + STYLE_EXT;

var badge = '/* ---------------------------------------------------------------------';
badge += '\n';
badge += objName;
badge += '\n';
badge += '------------------------------------------------------------------------ */';

function createDir() {
    mkdirp(objPath, function(err) {
        console.log('dir ' + args[0] + ' was created');
        createFile();
    });
}

function createFile() {
    fs.writeFile(objPath + '/' + baseFileName, badge);
    if (flagArgs.responsive) {
        var breakpoints = flagArgs.responsive.split(',');
        var i = 0;
        var l = breakpoints.length;
        for (; i < l; i++) {
            var fileName = objPath + '/' + '_' + args[0] + '_' + breakpoints[i] + '.' + STYLE_EXT;
            var fileName = fileName.replace(/ /g,'');
            fs.writeFile(fileName, badge);
        }
    }
}

createDir();