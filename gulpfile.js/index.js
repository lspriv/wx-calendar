const gulp = require('gulp')
const clean = require('./clean')
const pack = require('./pack')

gulp.task('clean', clean)
gulp.task('pack', pack)
gulp.task('watch', () => {
    gulp.watch(['src/**/*'], { events: ['add', 'addDir', 'change', 'unlink', 'unlinkDir', 'error'] }, gulp.series('clean', 'pack'))
})

exports.build = gulp.series('clean', 'pack')
exports.dev = gulp.series('clean', 'pack', 'watch')