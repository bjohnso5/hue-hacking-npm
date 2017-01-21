const gulp = require('gulp');
const copy = require('gulp-copy');
const sourceFiles = [
    "index.js*",
    "src/**.js",
    "src/**.js*"
];

gulp.task("default", function () {
    return gulp.src(sourceFiles, {
        base: './'
    }).pipe(gulp.dest("dist/"));
});