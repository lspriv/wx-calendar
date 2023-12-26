const gulp = require('gulp');

module.exports = () => {
  gulp.watch(
    ['src/**/*'],
    { events: ['add', 'addDir', 'change', 'unlink', 'unlinkDir', 'error'] },
    gulp.series('clean', 'pack')
  );
};
