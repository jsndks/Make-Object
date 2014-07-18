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
    var Handlebars = require('handlebars');
    var Promise = require('promise');

    // ----------------------------------------------------------------
    // Setup Variables
    // ----------------------------------------------------------------
    var CONFIG = {
        EXT: 'scss',
        PREFIX: '_',
        BASE_URI: 'assets/styles/',
        DIR_OBJECTS: 'objects/',
        TEMPLATE: 'objectTemplate.hbs'
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
        this._createChildren()
            ._createDir();

        return this;
    }

    /**
     * templates out the base object
     *
     * @method _templateObject
     * @public
     */
    proto._getBadge = function(objectName) {
        var templatePromise = new Promise(function(resolve, reject) {
            fs.readFile(CONFIG.TEMPLATE, 'utf8', function(err, res) {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        });

        return templatePromise.done(this._templateFile.bind(this, objectName));

        // templatePromise.done(function(source) {
        //     var template = Handlebars.compile(source);
        //     var data = { "title": objectName };
        //     console.log(template(data));
        // });
    };

    /**
     * Templates out a file
     *
     * @method _templateFile
     * @public
     */
    proto._templateFile = function(objectName, source) {
        var template = Handlebars.compile(source);
        var data = { "title": objectName };
        return template(data);
    };

    /**
     * Create any child objects or references
     * Should only be run on initialization of the view.
     *
     * @method _createChildren
     * @returns {makeObject}
     * @private
     */
    proto._createChildren = function() {
        this.objectProps = {
            name: args[0],
            path: CONFIG.BASE_URI + CONFIG.DIR_OBJECTS + args[0],
            fileName: CONFIG.PREFIX + args[0] + '.' + CONFIG.EXT
        };

        return this;
    };

    // ----------------------------------------------------------------
    // Create the object directory
    // ----------------------------------------------------------------
    proto._createDir = function() {
        var self = this;
        mkdirp(this.objectProps.path, function(err) {
            console.log('dir ' + args[0] + ' was created');
            self._createFile();
        });
    };

    // ----------------------------------------------------------------
    // Create the object directory
    // ----------------------------------------------------------------
    proto._createFile = function() {
        console.log(this._getBadge(this.objectProps.name));

        // fs.writeFile(this.objectProps.path + this.objectProps.filename, this._getBadge(this.objectProps.name));
        // if (flagArgs.responsive) {
        //     var breakpoints = flagArgs.responsive.split(',');
        //     var i = 0;
        //     var l = breakpoints.length;
        //     for (; i < l; i++) {
        //         var fileName = objPath + '/' + '_' + args[0] + '_' + breakpoints[i] + '.' + STYLE_EXT;
        //         var fileName = fileName.replace(/ /g,'');
        //         fs.writeFile(fileName, badge);
        //     }
        // }
    }

    // ----------------------------------------------------------------
    // Create import files
    // ----------------------------------------------------------------
    // for each hbs in objects
        // var importString += '@import' + ' ("' $filepath '")';
    // endforeach
    // fs.writeFile(objPath + '/' + baseFileName, importString);
    proto.generateImports = function() {
        processDir(CONFIG.BASE_URI + CONFIG.DIR_OBJECTS, function(arg1, dir) {
            processFile(dir, writeToImportFile(err, filename));
        });

        setTimeout(function() {
            console.log(importString);
        }, 1000);
    };

    // ----------------------------------------------------------------
    // Utility for preforming an action on each file
    // ----------------------------------------------------------------
    proto.processFile = function(dir, action) {
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
    };

    // ----------------------------------------------------------------
    // Utility for preforming an action on each dir
    // ----------------------------------------------------------------
    proto.processDir = function(dir, action) {
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
    };

    // ----------------------------------------------------------------
    //
    // ----------------------------------------------------------------
    proto.writeToImportFile = function(err, fileName) {
        importString += '@import' + ' ("' + fileName + '");';
        importString += '\n';
    };

    // ----------------------------------------------------------------
    // Kick-off functions
    // ----------------------------------------------------------------
    // createDir();

    // generateImports();

    return new makeObject;
}());