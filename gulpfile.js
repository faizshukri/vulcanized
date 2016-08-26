var gulp = require('gulp'),
    vulcanize = require('gulp-vulcanize'),
    htmlmin = require('gulp-htmlmin'),
    minifyInline = require('gulp-minify-inline'),
    rename = require('gulp-rename'),

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

gulp.task('build', ['vulcanize', 'minify']);

gulp.task('patch', ['build'], function() { return inc('patch'); });
gulp.task('feature', ['build'], function() { return inc('minor'); });
gulp.task('release', ['build'], function() { return inc('major'); });

function inc(importance) {
    // get all the files to bump version in
    return gulp.src(['./package.json', './bower.json'])
    // bump the version number in those files
        .pipe(bump({type: importance}))
        // save it back to filesystem
        .pipe(gulp.dest('./'))
        // commit the changed version number
        .pipe(git.commit('bumps package version'))

        // read only one file to get the version number
        .pipe(filter('package.json'))
        // **tag it in the repository**
        .pipe(tag_version());
}