var gulp = require('gulp'),
    addsrc = require('gulp-add-src'),
    vulcanize = require('gulp-vulcanize'),
    htmlmin = require('gulp-htmlmin'),
    minifyInline = require('gulp-minify-inline'),
    rename = require('gulp-rename'),
    argv = require('yargs').argv,

    git = require('gulp-git'),
    bump = require('gulp-bump'),
    filter = require('gulp-filter'),
    tag_version = require('gulp-tag-version');

gulp.task('vulcanize', function () {
    return gulp.src('vulcanized.html')
        .pipe(vulcanize({
            stripComments: true,
            inlineScripts: true,
            inlineCss: true
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('minify', ['vulcanize'], function() {
    return gulp.src('dist/vulcanized.html')
        .pipe(minifyInline())
        .pipe(htmlmin({collapseWhitespace: true}))
        .pipe(rename(function (path) {
            path.extname = ".min.html";
        }))
        .pipe(gulp.dest('dist'));
});

gulp.task('publish', ['build'], function() {

    var type = 'patch';

    if (argv.minor) {
        type = 'minor';
    } else if (argv.major) {
        type = 'major';
    }

    return gulp.src(['./package.json', './bower.json'])
        // bump the version number in those files
        .pipe(bump({type: type}))
        // save it back to filesystem
        .pipe(gulp.dest('./'))
        // add more source
        .pipe(addsrc('./dist/*'))
        // commit the changed version number
        .pipe(git.commit('bumps package version'))
        // read only one file to get the version number
        .pipe(filter('package.json'))
        // **tag it in the repository**
        .pipe(tag_version());
});

gulp.task('build', ['vulcanize', 'minify']);