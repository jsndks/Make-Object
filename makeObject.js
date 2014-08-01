#! /usr/bin/env node

var MODULE = (function () {
    // mkobj media --h --b "sm, md, lg"
    // create an object with name "media",
    // include a helpers file, include sm, md, lg
    // files and add respective includes

    // mkobj media --i "md"
    // create a breakpoint specific file
    // without recreating a base file
    // also add this entry to the appropriate
    // include

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
        'breakpoints': [String, Array],
        'individual': [String, Array]
    };

    var shortHands = {
        'h': ['--helpers'],
        'b': ['--breakpoints'],
        'i': ['--individual']
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
            ._run();

        return this;
    }

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

    /**
     * Set up promises
     *
     * @method _definePromises
     * @public
     */
    proto._definePromises = function() {
        this.readTemplatePromise = new Promise(this._readTemplate.bind(this));
        this.templateFilePromise = new Promise(this._templateFile.bind(this));
        this.createDirPromise = new Promise(this._createDir.bind(this));
        this.createFilePromise = new Promise(this._createFile.bind(this));

        return this;
    };

    /**
     * Execute the chain of commands
     *
     * @method _run
     * @public
     */
    proto._run = function() {
        var self = this;
        this.readTemplatePromise = new Promise(this._readTemplate.bind(this))
            // .done(self._templateFile('yo', src));
            .done(function(src) {
                console.log(src);
            });
    };

    /**
     * templates out the base object
     *
     * @method _readTemplate
     * @public
     */
    proto._readTemplate = function(resolve, reject) {
        console.log('_readTemplate');
        // this.badgePromise = new Promise(function(resolve, reject) {
            fs.readFile(CONFIG.TEMPLATE, 'utf8', function(err, res) {
                if (err) {
                    reject(err);
                } else {
                    resolve(res);
                }
            });
        // }).done(this._templateFile.bind(this, objectName));

        return this;
    };

    /**
     * Templates out a file
     *
     * @method _templateFile
     * @public
     */
    proto._templateFile = function(objectName, source) {
        console.log('_templateFile');
        var template = Handlebars.compile(source);
        var data = { "title": objectName };
        this.badge = template(data);
    };

    // ----------------------------------------------------------------
    // Create the object directory
    // ----------------------------------------------------------------
    proto._createDir = function(badge) {
        console.log('_createDir');
        var self = this;
        mkdirp(this.objectProps.path, function(err) {
            console.log('dir ' + self.objectProps.name + ' was created');
            self._createFile(badge);
        });

        return this;
    };

    // ----------------------------------------------------------------
    // Create the object directory
    // ----------------------------------------------------------------
    proto._createFile = function(badge) {
        console.log('_createFile');
        // console.log(this.objectProps.fileName);
        fs.writeFile(this.objectProps.path + '/' + this.objectProps.fileName, badge);
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

        return this;
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