var removeFromIndex = ['/*jshint node:true*/\n',
                       'var _ = require(\'lodash\');\n',
                       'var moment = require(\'moment\');\n',
                       'var Page = require(\'astrolabe\').Page;\n'];

var removeFromExercises = ['/*jshint node:true*/\n',
                           'var _ = require(\'lodash\');\n'];

module.exports = {
    dist: {
        options: {
            banner: '<%= config.meta.banner %><%= config.meta.modules %>\n'
        },
        src: [], //src filled in by build task
        dest: '<%= config.dist %>/<%= config.fileName %>.js'
    },
    distTpls: {
        options: {
            banner: '<%= config.meta.banner %><%= config.meta.all %>\n<%= config.meta.tplmodules %>\n'
        },
        src: [], //src filled in by build task
        dest: '<%= config.dist %>/<%= config.fileNameTpl %>.js'
    },
    rxPageObjects: {
        options: {
            // Replace all third-party requires with a single one up top
            banner: removeFromIndex.join(''),
            footer: '\nexports.exercise = require(\'./exercise\');',
            process: function (src) {
                removeFromIndex.forEach(function (toRemove) {
                    // a regex is faster, but this is less work for me
                    src = src.replace(toRemove, '');
                });
                return src;
            }
        },
        src: ['src/*/*.page.js'],
        dest: 'utils/rx-page-objects/index.js'
    },
    rxPageObjectsExercises: {
        options: {
            // Replace all third-party requires with a single one up top
            banner: removeFromExercises.join(''),
            process: function (src) {
                // replace all exercise require statements from src/ directory to index.js (published version)
                src = src.replace(/require\('\.\/(.\w+\.page)'\)(?:\.js)?/g, 'require(\'./index\')');
                removeFromExercises.forEach(function (toRemove) {
                    // a regex is faster, but this is less work for me
                    src = src.replace(toRemove, '');
                });
                return src;
            }
        },
        src: ['src/*/*.exercise.js'],
        dest: 'utils/rx-page-objects/exercise.js'
    },
    tmpLess: {
        // The `less` task can't properly create a source map when multiple input
        // files are present. We concat them all into a temp file here, and it
        // can work from that instead
        src: [
            'demo/bower_components/pure/grids-min.css',
            'src/*/*.less',
            '!src/layout/responsive.less',
            '!src/styles/*.less'
        ],
        dest: '<%= config.tmpLess %>'
    },
    tmpLessResp: {
        src: [
            'demo/bower_components/pure/grids-min.css',
            'src/*/*.less',
            '!src/styles/*.less'
        ],
        dest: '<%= config.tmpLessResp %>'
    }
};
