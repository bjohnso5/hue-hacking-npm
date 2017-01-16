const gulp = require('gulp');
const ts = require('gulp-typescript');

let tsProject = ts.createProject('tsconfig.json');

gulp.task("default", function () {
    return tsProject.src()
        .pipe(tsProject())
        .js.pipe(gulp.dest("dist"));
});