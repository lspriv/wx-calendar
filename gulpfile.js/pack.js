const gulp = require('gulp')
const babel = require('gulp-babel')
const uglify = require('gulp-uglify')
const sassGlob = require('gulp-sass-glob')
const sass = require('gulp-sass')(require('sass'))
const htmlmin = require('gulp-htmlmin')
const gf = require('gulp-if')
const plumber = require('gulp-plumber')
const size = require('gulp-size')
const jsonFormat = require('gulp-json-format')
const jsonmin = require('gulp-jsonmin')
const through2 = require('through2')

const componentName = 'wx-calendar'
const htmlMinConfig = {
    caseSensitive: true,
    collapseWhitespace: process.env.NODE_ENV !== 'development',
    removeComments: true,
    keepClosingSlash: true,
    quoteCharacter: '"'
}
const minifyOptions = {
    mangle: {
        toplevel: true
    },
    output: {
        comments: /^!/
    }
}
const wxsMinifyOptions = {
    mangle: {
        toplevel: true
    },
    output: {
        comments: /^!/
    },
    compress: {
        hoist_vars: true
    }
}

const wxss = function() {
    return through2.obj(function(chuck, _, callback) {
        // 处理 bom
        if (chuck.isBuffer()) {
            const buff = chuck.contents
            if (buff[0].toString(16).toLowerCase() == 'ef' &&
                buff[1].toString(16).toLowerCase() == 'bb' &&
                buff[2].toString(16).toLowerCase() == 'bf') {
                chuck.contents = buff.slice(3)
            }
        }
        chuck.extname = '.wxss'
        this.push(chuck, 'utf-8')
        callback()
    })
}

const unPackGlobs = ['!src/style/*.scss']

module.exports = function() {
    const isDevelopment = process.env.NODE_ENV === 'development'
    const outDir = isDevelopment ? 'dev/components' : 'dist'

    return gulp.src(['src/**/*'].concat(unPackGlobs), { nodir: true })
        .pipe(plumber())
        .pipe(gf(file => file.extname === '.wxml', htmlmin(htmlMinConfig)))
        .pipe(gf(file => file.extname === '.scss', sassGlob()))
        .pipe(gf(file => file.extname === '.scss', sass({ outputStyle: 'compressed' }).on('error', sass.logError)))
        .pipe(gf(file => file.extname === '.css' || file.extname === '.wxss', wxss()))
        .pipe(gf(file => file.extname === '.json', jsonFormat(4)))
        .pipe(gf(file => file.extname === '.json', jsonmin()))
        .pipe(gf(file => file.extname === '.js' && !isDevelopment, babel()))
        .pipe(gf(file => file.extname === '.js' && !isDevelopment, uglify(minifyOptions)))
        .pipe(gf(file => file.extname === '.wxs', uglify(wxsMinifyOptions)))
        .pipe(plumber.stop())
        .pipe(size({ title: 'pack complete' }))
        .pipe(gulp.dest(`${ outDir }/${ componentName }`))
}