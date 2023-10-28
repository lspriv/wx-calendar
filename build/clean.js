const gulp = require('gulp');
const clean = require('gulp-clean');

module.exports = () =>
  gulp
    .src(['dev/components', 'dist', 'types'], {
      read: false,
      allowEmpty: true
    })
    .pipe(clean());
