#! /usr/bin/env node

// mkobj media --h --b "sm, md, lg"
// create an object with name "media",
// include a helpers file, include sm, md, lg
// files and add respective includes

var fs = require('fs');
var nopt = require("nopt");
var Stream = require("stream").Stream;
var path = require("path");
var mkdirp = require('mkdirp');

// ----------------------------------------------------------------
// Setup Variables
// ----------------------------------------------------------------
var CONFIG = {
    EXT: 'scss',
    PREFIX: '_',
    URI: 'assets/styles/modules/'
};

var knownOpts = {
    'helpers': Boolean,
    'breakpoints': [String, Array]
};

var shortHands = {
    'h': ['--helpers'],
    'b': ['--breakpoints']
};

var parsed = nopt(knownOpts, shortHands, process.argv);
var args = parsed.argv.remain;
var flagArgs = parsed;

console.log(parsed);

var objName = args[0];
var objPath = CONFIG.PATH + args[0];
var baseFileName = CONFIG.PREFIX + args[0] + '.' + CONFIG.EXT;

// ----------------------------------------------------------------
// Create the object Badge
// ----------------------------------------------------------------
var badge = '/* ---------------------------------------------------------------------';
badge += '\n';
badge += objName;
badge += '\n';
badge += '------------------------------------------------------------------------ */';

// ----------------------------------------------------------------
// Create the object directory
// ----------------------------------------------------------------
function createDir() {
    mkdirp(objPath, function(err) {
        console.log('dir ' + args[0] + ' was created');
        createFile();
    });
}

// ----------------------------------------------------------------
// Create the object directory
// ----------------------------------------------------------------
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

// ----------------------------------------------------------------
// Create import files
// ----------------------------------------------------------------


// createDir();












