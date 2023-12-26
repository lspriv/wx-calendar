const gulp = require('gulp');
const clean = require('./build/clean');
const pack = require('./build/pack');
const watch = require('./build/watch');
const automator = require('./build/automator');
require('colors');

gulp.task('clean', clean);
gulp.task('pack', pack);
gulp.task('watch', watch);
gulp.task('automator', automator);

exports.build = gulp.series('clean', 'pack');
exports.dev = gulp.series('clean', 'pack', gulp.parallel('automator', 'watch'));
exports.test = gulp.series('clean', 'pack');
