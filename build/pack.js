/*
 * @Description: Description
 * @Author: lishen
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

const isDevelopment = process.env.NODE_ENV === 'development';

const tsProject = ts.createProject('tsconfig.json');

module.exports = () =>
  gulp
    .src(['src/**/*', ...dependenciesGlobs, ...unPackGlobs], { nodir: true })
    .pipe(plumber())
    .pipe(gf(file => file.extname === '.wxml', htmlmin(htmlMinConfig)))
    .pipe(gf(file => file.extname === '.scss' || file.extname === '.sass', sassGlob()))
    .pipe(gf(file => file.extname === '.scss' || file.extname === '.sass', sass({ outputStyle: 'compressed' })))
    .on('error', sass.logError)
    .pipe(gf(file => file.extname === '.css' || file.extname === '.wxss', wxss()))
    .pipe(gf(file => file.extname === '.json', jsonFormat(2)))
    .pipe(gf(file => file.extname === '.ts', tsProject()))
    .on('error', errorLogger('typescript'))
    .pipe(gf(file => file.extname === '.js', uglify(jsMiniOpts)))
    .pipe(gf(file => file.extname === '.wxs', uglify(wxsMiniOpts)))
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
