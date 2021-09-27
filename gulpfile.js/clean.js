const gulp = require('gulp')
const clean = require('gulp-clean')

module.exports = function() {
    return gulp.src(process.env.NODE_ENV == 'development' ? 'dev/components' : 'dist', {
            read: false,
            allowEmpty: true
        })
        .pipe(clean())
}