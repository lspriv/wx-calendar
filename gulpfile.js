/*
 * Copyright 2024 lspriv. All Rights Reserved.
 * Distributed under MIT license.
 * See File LICENSE for detail or copy at https://opensource.org/licenses/MIT
 * @Description: Description
 * @Author: lspriv
 * @LastEditTime: 2024-02-08 20:31:54
 */
const gulp = require('gulp');
const clean = require('./build/clean');
const pack = require('./build/pack');
const watch = require('./build/watch');
const { task } = require('./build/cli');
require('colors');

gulp.task('clean', clean);
gulp.task('pack', pack);
gulp.task('watch', watch);
gulp.task('devTools', task);

exports.build = gulp.series('clean', 'pack');
exports.dev = gulp.series('clean', 'pack', gulp.parallel('devTools', 'watch'));
exports.test = gulp.series('clean', 'pack');
