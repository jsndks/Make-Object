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
            // ._run();

        this.testPromise = new Promise(this._testMethod.bind(this))
            .then(this._nextMethod.bind(this));

        return this;
    }

    /**
     * YUIDoc_comment
     *
     * @method _testMethod
     * @public
     */
    proto._testMethod = function(resolve, reject) {
        setTimeout(function() {
            resolve('testPromise resolved');
        }, 2000);
    };

    /**
     * YUIDoc_comment
     *
     * @method _nextMethod
     * @public
     */
    proto._nextMethod = function(message) {
        console.log(message);
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

    /**
     * Execute the chain of commands
     *
     * @method _run
     * @public
     */
    proto._run = function() {
        var self = this;

        // Create Object Badge
        this.readTemplatePromise = new Promise(this._readTemplate.bind(this))
            .then(self._templateFile.bind(this))
            .then(function(result) {
                console.log(result);
            });


    };

    /**
     * templates out the base object
     *
     * @method _readTemplate
     * @public
     */
    proto._readTemplate = function(resolve, reject) {
        fs.readFile(CONFIG.TEMPLATE, 'utf8', function(err, res) {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });

        return this;
    };

    /**
     * Templates out a file
     *
     * @method _templateFile
     * @public
     */
    proto._templateFile = function(source) {
        var template = Handlebars.compile(source);
        var data = { "title": this.objectProps.name };
        resolve(template(data));
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

    return new makeObject;
}());