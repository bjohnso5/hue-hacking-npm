const gulp = require("gulp");
const clean = require("gulp-clean");
const sourceFiles = [
  "index.js*",
  "index.*.json",
  "src/**.js*",
  "**/*.d.ts",
  "!**/node_modules/**",
  "!dist/**/*",
];

function cleanUp() {
  return gulp
    .src(sourceFiles, { sourcemaps: true })
    .pipe(clean())
    .pipe(gulp.dest("dist/"));
}

var build = gulp.series(cleanUp);

exports.default = build;
