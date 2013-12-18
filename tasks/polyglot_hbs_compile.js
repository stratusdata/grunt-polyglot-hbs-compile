/*
 * grunt-polyglot-hbs-compile
 * https://github.com/jjavery/bearded-adventure
 *
 * Copyright (c) 2013 Jason Swartout
 * Licensed under the none license.
 */

'use strict';

module.exports = function(grunt) {
  var compiler = require('../../polyglot-hbs-compile');
  var path = require('path');

  // Please see the Grunt documentation for more information regarding task
  // creation: http://gruntjs.com/creating-tasks

  grunt.registerMultiTask('polyglot_hbs_compile', 'Pre-compile handlebars and polyglot templates', function() {
    // Merge task-specific and/or target-specific options with these defaults.
    var options = this.options({
      wrap: false,
      aggressive: false
    });

    var locales = this.data.locales;
    var phraseMapSrc = this.data.phraseMapSrc;

    var localeMap = {};
    
    locales.forEach(function(locale) {
      var phraseFilepath = path.join(phraseMapSrc, locale) + '.json';
      var phraseMap = grunt.file.readJSON(phraseFilepath);

      localeMap[locale] = phraseMap;
    });

    this.files.forEach(function(file) {
      file.src.filter(function(filepath) {
          if (!grunt.file.exists(filepath)) {
            grunt.log.warn('Source template "' + filepath + '" not found.');
            return false;
          } else {
            return true;
          }

        }).forEach(function(filepath) {
          var template = grunt.file.read(filepath);

          locales.forEach(function(locale) {

            var partialName = path.basename(filepath);
            partialName = partialName.substring(0, partialName.lastIndexOf('.'));
            var output = compiler.compile(locale, partialName, template, { phraseMap: localeMap[locale] });

            var outputDir = path.join(file.dest, locale);
            grunt.file.mkdir(outputDir);

            var outputFile = path.join(outputDir, partialName + '.js');

            grunt.file.write(outputFile, output);

            grunt.log.writeln('File "' + outputFile + '" generated.');
          });

      });

      return;
    });
  });

};
