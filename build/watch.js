/*
 * Copyright 2024 lspriv. All Rights Reserved.
 * Distributed under MIT license.
 * See File LICENSE for detail or copy at https://opensource.org/licenses/MIT
 * @Description: Description
 * @Author: lspriv
 * @LastEditTime: 2024-02-08 22:41:14
 */
const gulp = require('gulp');
const { cli } = require('./cli');
const { time } = require('./utils');
const { STDIO_IGNORE } = require('./config');

gulp.task('reset-fileutils', cb => {
  try {
    cli('reset-fileutils', true, STDIO_IGNORE);
    cli('open', true, STDIO_IGNORE);
  } catch (e) {
    console.log(time(), 'Warning'.yellow, e.message.grey);
    return;
  } finally {
    cb();
  }
});

module.exports = () => {
  gulp.watch(
    ['src/**/*'],
    { events: ['add', 'addDir', 'change', 'unlink', 'unlinkDir', 'error'] },
    gulp.series('clean', 'pack', 'reset-fileutils')
  );
};
