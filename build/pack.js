/*
 * @Description: Description
 * @Author: lspriv
 * @LastEditTime: 2024-02-09 10:57:27
 */
const gulp = require('gulp');
const uglify = require('gulp-uglify');
const sassGlob = require('gulp-sass-glob');
const sass = require('gulp-sass')(require('sass'));
const htmlmin = require('gulp-html-minifier-terser');
const gf = require('gulp-if');
const plumber = require('gulp-plumber');
const size = require('gulp-size');
const jsonFormat = require('gulp-json-format');
const ts = require('gulp-typescript');

const { PRJ_NAME, htmlMinConfig, jsMiniOpts, wxsMiniOpts, unPackGlobs, dependenciesGlobs } = require('./config');
const { wxss, errorLogger } = require('./handler');
const { isWxml, isSass, isCss, isWxss, isJson, isTs, isJs, isWxs, gor } = require('./utils');

const isDevelopment = process.env.NODE_ENV === 'development';

const tsProject = ts.createProject('tsconfig.json');

module.exports = () =>
  gulp
    .src(['src/**/*', ...dependenciesGlobs, ...unPackGlobs], { nodir: true })
    .pipe(plumber())
    .pipe(gf(isWxml, htmlmin(htmlMinConfig)))
    .pipe(gf(isSass, sassGlob()))
    .pipe(gf(isSass, sass.sync({ style: 'compressed' })))
    .on('error', sass.logError)
    .pipe(gf(gor(isCss, isWxss), wxss()))
    .pipe(gf(isJson, jsonFormat(2)))
    .pipe(gf(isTs, tsProject()))
    .on('error', errorLogger('typescript'))
    .pipe(gf(isJs, uglify(jsMiniOpts)))
    .pipe(gf(isWxs, uglify(wxsMiniOpts)))
    .pipe(plumber.stop())
    .pipe(size({ title: 'pack complete', showFiles: true, showTotal: true }))
    .pipe(
      gulp.dest(`${isDevelopment ? 'dev/components' : 'dist'}/${isDevelopment ? PRJ_NAME : ''}`)
      // gf(
      //   file => /\.d\.ts$/.test(file.basename),
      //   gulp.dest('types'),
      //   gulp.dest(`${isDevelopment ? 'dev/components' : 'dist'}/${isDevelopment ? PRJ_NAME : ''}`)
      // )
    );
