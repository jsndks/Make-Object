#! /usr/bin/env node

var MODULE = (function () {
    // mkobj media --h --b "sm, md, lg"
    // create an object with name "media",
    // include a helpers file, include sm, md, lg
    // files and add respective includes

    var fs = require('fs');
    var nopt = require("nopt");
    var Stream = require("stream").Stream;
    var path = require("path");
    var mkdirp = require('mkdirp');

    /**
     * A utility for creating files in an opinionated directory structure
     *
     * @class makeObject
     * @constructor
     **/
    function makeObject() {
        this._init();
    }

    var proto = makeObject.prototype;

    /**
     * Initializes the Component.
     *
     * @method init
     * @returns {makeObject}
     * @private
     */
    proto._init = function() {
        console.log('init');

        return this;
    }

    // ----------------------------------------------------------------
    // Setup Variables
    // ----------------------------------------------------------------
    var CONFIG = {
        EXT: 'scss',
        PREFIX: '_',
        BASE_URI: 'assets/styles/',
        DIR_OBJECTS: 'objects'
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
    var objPath = CONFIG.BASE_URI + CONFIG.DIR_OBJECTS + args[0];
    var baseFileName = CONFIG.PREFIX + args[0] + '.' + CONFIG.EXT;
    var objectEndpoint = objPath + baseFileName;

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
        fs.writeFile(objectEndpoint, badge);
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

    var importString = '';

    // ----------------------------------------------------------------
    // Create import files
    // ----------------------------------------------------------------
    // for each hbs in objects
        // var importString += '@import' + ' ("' $filepath '")';
    // endforeach
    // fs.writeFile(objPath + '/' + baseFileName, importString);
    function generateImports() {
        processDir(CONFIG.BASE_URI + CONFIG.DIR_OBJECTS, function(arg1, dir) {
            processFile(dir, writeToImportFile(err, filename));
        });

        setTimeout(function() {
            console.log(importString);
        }, 1000);
    }

    // ----------------------------------------------------------------
    // Utility for preforming an action on each file
    // ----------------------------------------------------------------
    function processFile(dir, action) {
        // Assert that it's a function
        if (typeof action !== "function") {
            action = function (error, file) { };
        }

        // Read the directory
        fs.readdir(dir, function (err, list) {
            // Return the error if something went wrong
            if (err) {
              return action(err);
            }

            // For every file in the list
            list.forEach(function (file) {
                // Full path of that file
                var path = dir + "/" + file;

                // Get the file's stats
                fs.stat(path, function (err, stat) {
                    // console.log(stat);
                    // If the file is a directory
                    if (stat && stat.isDirectory()) {
                        // Dive into the directory
                        processFile(path, action);
                    } else {
                        // Call the action
                        action(null, path);
                    }
                });
            });
        });
    }

    // ----------------------------------------------------------------
    // Utility for preforming an action on each dir
    // ----------------------------------------------------------------
    function processDir(dir, action) {
        // Assert that it's a function
        if (typeof action !== "function") {
            action = function (error, file) { };
        }

        // Read the directory
        fs.readdir(dir, function (err, list) {
            // Return the error if something went wrong
            if (err) {
              return action(err);
            }

            // For every file in the list
            list.forEach(function (file) {
                // Full path of that file
                var path = dir + "/" + file;

                // Get the file's stats
                fs.stat(path, function (err, stat) {
                    // console.log(stat);
                    // If the file is a directory
                    if (stat && stat.isDirectory()) {
                        // Dive into the directory
                        action(null, path);
                    }
                });
            });
        });
    }

    // ----------------------------------------------------------------
    //
    // ----------------------------------------------------------------
    function writeToImportFile(err, fileName) {
        importString += '@import' + ' ("' + fileName + '");';
        importString += '\n';
    }

    // ----------------------------------------------------------------
    // Kick-off functions
    // ----------------------------------------------------------------
    // createDir();

    // generateImports();

    return new makeObject;
}());