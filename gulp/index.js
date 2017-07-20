"use strict";
const gulp         = require('gulp');
const sourcemaps   = require('gulp-sourcemaps');
const plumber      = require('gulp-plumber');
const pug          = require('gulp-pug');
const sass         = require('gulp-sass');
// const browserSync  = require('browser-sync').create();
// const reload       = browserSync.reload;
const debug        = require('gulp-debug');
// const gulpIf       = require('gulp-if');
const rename       = require('gulp-rename');
// const PATH         = require('path');
// const svgmin       = require('gulp-svgmin');
// const uglify       = require('gulp-uglify');
const hash         = require('hash-files');
// const ghash        = require('gulp-hash');
const cleanCSS     = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const webpack      = require('gulp-webpack');
const del          = require('del');
const fs           = require('fs');
const colors       = require('colors');

var webpackConf    = require('../webpack.config');
const utils     = require('./utils');


var manifest = {
	js: '',
	css: ''
};

// Copy libraries
gulp.task('lib', function(done){
	var libs = utils.getAllLibrariesFileNames(true);

	if(!libs || !libs.length) return done();

	return gulp.src(libs)
		.pipe(plumber())
		.pipe(debug({title: 'lib'}))
		.pipe(gulp.dest('build'))
});

// HTML (Pug)
gulp.task('pug', function(done){
	manifest.js = manifest.js || utils.getCustomFile('js');
	manifest.css = manifest.css || utils.getCustomFile('css');

	if(!manifest.js || !manifest.css){
		return done();
	}

	return gulp.src(['src/pug/entry.pug'])
		.pipe(plumber())
		.pipe(pug({
			locals: {
				jsLibs: utils.getLibrariesFileNamesByType('js'),
				cssLibs: utils.getLibrariesFileNamesByType('css'),
				manifest: manifest
			}
		}))
		.pipe(debug({title: 'pug'}))
		.pipe(rename('index.html'))
		.pipe(gulp.dest('build'));
});

// CSS (SCSS)
gulp.task('build:css', function(){
	var sha = hash.sync({files: ['src/scss/*.scss']}).slice(0,10);

	return gulp.src(['src/scss/entry.scss'])
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(debug({title: 'scss'}))
		.pipe(autoprefixer({browsers: ['last 2 versions'],cascade: false}))
		.pipe(cleanCSS({compatibility: 'ie8'}))
		.pipe(rename((path)=>{
			path.basename = path.basename.replace('entry', 'style.' + sha);

			manifest.css = path.basename + path.extname;
		}))
		.pipe(sourcemaps.write())
		.pipe(gulp.dest('build'))
});

gulp.task('clean:css', ()=>{
	return del(['build/style.*.css']);
});

gulp.task('css', gulp.series('clean:css', 'build:css', 'pug'));

// JS
gulp.task('build:js', function(){
	var sha = hash.sync({files: ['src/js/*.js']}).slice(0,10);

	return gulp.src(['src/js/entry.js'])
		.pipe(webpack(webpackConf))
		.pipe(rename((path)=>{
			path.basename = path.basename.replace('script', 'script.' + sha);

			if(path.extname === '.js'){
				manifest.js = path.basename + path.extname;
			}

		}))
		.pipe(debug({title: 'JS'}))
		.pipe(gulp.dest('.'))
});

gulp.task('images', function(){
	return gulp.src(['src/images/*.*'])
		.pipe(gulp.dest('build'))
});

gulp.task('clean:js', ()=>{
	return del(['build/script.*.js', 'build/script.*.js.map']);
});

gulp.task('js', gulp.series('clean:js', 'build:js', 'pug'));

// Clean
gulp.task('clean', ()=>{
	return del(['build/**/*']);
});

// Watch
gulp.task('watch', function(){
	gulp.watch(['src/pug/**/*.pug'], gulp.series('pug'));
	gulp.watch(['src/scss/**/*.scss'], gulp.series('css'));
	gulp.watch(['src/js/**/*.js'], gulp.series(['js']));
	gulp.watch(['lib.conf.json'], gulp.series(utils.resetCache, 'pug', 'lib'));
});

// Default
gulp.task('default', gulp.series('clean', 'css', 'js', 'images', 'lib', 'pug', 'watch'));


