const gulp = require('gulp');
const clean = require('gulp-clean')
const sourceFiles = [
    "index.js*",
    "src/**.js*",
    "**/*.d.ts",
    "!**/node_modules/**",
    "!dist/**/*"
];

gulp.task("default", function () {
    return gulp.src(sourceFiles, {base: './'})
        .pipe(clean())
        .pipe(gulp.dest("dist/"));
});