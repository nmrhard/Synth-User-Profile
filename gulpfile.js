"use strict";

const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const less = require("gulp-less");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const server = require("browser-sync").create();
const csso = require("gulp-csso");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const del = require("del");
const htmlmin = require("gulp-htmlmin");
const uglify = require("gulp-uglify");
const pipeline = require("readable-stream").pipeline;

const css = () => {
  return gulp.src("source/less/style.less")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(less())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("style.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("source/css"))
    .pipe(server.stream());
}

exports.css = css;

const images = () => {
  return gulp.src("source/img/**/*.{png,jpg,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.jpegtran({progressive: true}),
      imagemin.svgo({
        plugins: [
            {cleanupIDs: false}
        ]
      })
    ]))
    .pipe(gulp.dest("source/img"));
}

exports.images = images;

const webpconvert = () => {
  return gulp.src("source/img/**/*.{png,jpg}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("source/img"));
}

exports.webpconvert = webpconvert;

const clean = () => {
  return del("build");
}

exports.clean = clean;

const htmlminify = () => {
  return gulp.src("source/*.html")
  .pipe(htmlmin({collapseWhitespace: true}))
  .pipe(gulp.dest("build"))
}

exports.htmlminify = htmlminify;

const jsclean = () => {
  return del("source/**/*.min.js");
}

exports.jsclean = jsclean;

const jsminify = () => {
  return pipeline(
        gulp.src("source/js/**/*.js"),
        uglify(),
        rename({extname: ".min.js"}),
        gulp.dest("source/js")
  );
}

exports.jsminify = jsminify;

const jscompress = () => {
  gulp.series(jsclean, jsminify)
}

exports.jscompress = jscompress;

const copy = () => {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source/js/**/*.min.js",
    "source/css/**",
    "source/*.ico"
  ], {
    base: "source"
  })
  .pipe(gulp.dest("build"));
}

exports.copy = copy;

const serverinit = () => {
  server.init({
    server: "source/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("source/less/**/*.less", gulp.series("css"));
  gulp.watch("source/img/*.svg").on("change", server.reload);
  gulp.watch("source/*.html").on("change", server.reload);
}

exports.serverinit = serverinit;

const build = (done) => {
  gulp.series(clean, jscompress, copy, css, htmlminify);
  done();
}

exports.build = build;

exports.start = gulp.series(build, serverinit);
