'use strict';
const gulp         = require('gulp');
const sourcemaps   = require('gulp-sourcemaps');
const plumber      = require('gulp-plumber');
const pug          = require('gulp-pug');
const scss         = require('gulp-sass');
// const browserSync  = require('browser-sync').create();
// const reload       = browserSync.reload;
const debug        = require('gulp-debug');
// const gulpIf       = require('gulp-if');
// const rename       = require('gulp-rename');
// const PATH         = require('path');
// const svgmin       = require('gulp-svgmin');
// const uglify       = require('gulp-uglify');
const cleanCSS     = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const webpack      = require('gulp-webpack');
const fs           = require('fs');

var webpackConf    = require('../webpack.config');
const libUtils     = require('./lib-utils');


gulp.task('lib', function(){
	var libs = libUtils.getAllLibrariesFileNames(true);

	return gulp.src(libs)
		.pipe(plumber())
		.pipe(debug({title: 'lib'}))
		.pipe(gulp.dest('build'))
});

gulp.task('pug', function(){
	return gulp.src(['src/pug/index.pug'])
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(pug({
			locals: {
				jsLibs: libUtils.getLibrariesFileNamesByType('js'),
				cssLibs: libUtils.getLibrariesFileNamesByType('css')
			}
		}))
		.pipe(debug({title: 'pug'}))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('build'));
});

gulp.task('scss', function(){
	return gulp.src(['src/scss/style.scss'])
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(scss())
		.pipe(debug({title: 'scss'}))
		.pipe(sourcemaps.write())
		.pipe(autoprefixer({browsers: ['last 2 versions'],cascade: false}))
		.pipe(cleanCSS({compatibility: 'ie8'}))
		.pipe(gulp.dest('build'))
});

gulp.task('js', function(){
	return gulp.src(['src/js/script.js'])
		.pipe(webpack(webpackConf))
		.pipe(gulp.dest('.'));
});

gulp.task('images', function(){
	return gulp.src(['src/images/*.*'])
		.pipe(gulp.dest('build'))
});

gulp.task('watch', function(){
	gulp.watch(['src/pug/**/*.pug'], gulp.series('pug'));
	gulp.watch(['src/scss/**/*.scss'], gulp.series('scss'));
	gulp.watch(['src/js/**/*.js'], gulp.series('js'));
	gulp.watch(['lib.conf.json'], gulp.series(libUtils.resetCache, 'pug', 'lib'));
});


gulp.task('default', gulp.series('pug', 'scss', 'js', 'images', 'lib', 'watch'));