const basePaths = {
  src: 'dev/',
  dest: 'prod/',
};
const paths = {
  images: {
    src: basePaths.src + 'images/',
    dest: basePaths.dest + 'images/'
  },
  templates: {
    src: basePaths.src + 'templates/'
  },
  twig: {
    src: basePaths.src,
    dest: basePaths.dest
  },
  scripts: {
    src: basePaths.src + 'scripts/',
    dest: basePaths.dest + 'scripts/'
  },
  css: {
    src: basePaths.src + 'scss/',
    dest: basePaths.dest + 'css/'
  }
};
const globs = {
  "scripts": ['dev/**/*.js'],
  "styles": ['dev/scss/**/*.scss'],
  "images": ['dev/images/**/*'],
  "vendor": ['dev/vendor/**/*'],
  "twig": ['dev/**/*.twig'],
}

// Load Gulp
const gulp = require('gulp');

// BroswerSync
const browserSync = require('browser-sync').create();
const reload = browserSync.reload;

// Twig stuff
const twig = require('gulp-twig');
const data = require('gulp-data');
const fs = require('fs');
const path = require('path');


// SASS compiling
const postcss = require('gulp-postcss');
const sass = require('gulp-sass');
const sourcemaps = require('gulp-sourcemaps');

// JS concatenation and minification
const concat = require('gulp-concat');
const minify = require('gulp-minify');


// Starts a webserver and opens a window that will update dynamically as you save your work
gulp.task('browser-sync', function() {
  browserSync.init({
    server: {
      baseDir: "prod/"
    }
  });
});
gulp.task('serve', function() {
  browserSync({
    server: {
      baseDir: 'app'
    }
  });
});

// Compiles the Twig templates
gulp.task('twig', function () {
    'use strict';
    return gulp.src('dev/templates/*.twig')
        .pipe(twig())
        .pipe(gulp.dest('prod/'));
});

// Adds the data from the JSON files into the Twig templates as they're being compiled
gulp.task('twig-json', function () {
    'use strict';
    return gulp.src('dev/templates/*.twig')
        .pipe(data(function(file) {
          return JSON.parse(fs.readFileSync('dev/templates/' + path.basename(file.path) + '.json'));
        }))

        .pipe(twig())
        .pipe(gulp.dest('prod/'));
});

//PostCSS process and SASS compilation
gulp.task('css', function() {
  var postcss = require('gulp-postcss');
  var autoprefixer = require('autoprefixer');

  return gulp.src(['dev/scss/**/*.scss'])
    .pipe(sass({
      errLogToConsole: true
    }))
    // PostCSS tasks after Sass compilation
    .pipe(sourcemaps.init())
    .pipe(postcss([
      autoprefixer({
        browsers: ['> 5%', 'last 2 versions', 'ie > 9']
      }) // Autoprefixes CSS properties for various browsers
      // any other PostCSS plugins to be run can be added in here
    ]))
    .pipe(sourcemaps.write('.'))
  .pipe(gulp.dest(paths.css.dest))
  .pipe(browserSync.stream());
});

//Copy scripts to appropriate folder, this would be used for scripts you write yourself and just copies them straight over from the dev folder to the docs folder
// gulp.task('scripts', function() {
//   gulp.src('./dev/scripts/*.js')
//     .pipe(gulp.dest('./scripts/'));
// });


//Copy vendor packages to appropriate folder, this would be used for 3rd party plugins like bootstrap and just copies them straight over from the dev folder to the docs folder
gulp.task('vendor', function() {
  gulp.src('./dev/vendor/**/*.*')
    .pipe(gulp.dest('vendor/'));
});

// Concatenate JS files into a single file and minify
gulp.task('concat', function() {
  return gulp.src('./dev/scripts/*.js')
    .pipe(concat('scripts.js'))
    .pipe(minify())
    .pipe(gulp.dest('prod/scripts'));
});

//Copy images to appropriate folder, this just copies them straight over from the dev folder to the docs folder
gulp.task('images', function() {
  gulp.src(globs.images)
    .pipe(gulp.dest('prod/images/'));
});

// Watch task, this watches the different folders and when there's a change, it triggers the appropriate function. The bottom one triggers the page refresh in your browser
gulp.task('watch', ['browser-sync'], function() {
  // gulp.watch(globs.scripts, ['scripts']);
  gulp.watch(globs.styles, ['css']);
  gulp.watch(globs.scripts, ['concat']);
  gulp.watch(globs.twig, ['twig-json']);
  gulp.watch(globs.vendor, ['vendor']);
  gulp.watch(globs.images, ['images']);
  gulp.watch('./**/*.html').on('change', browserSync.reload);
});


gulp.task('default', ['build', 'watch']);
gulp.task('build', ['twig-json', 'css', 'concat', 'vendor','images']);
