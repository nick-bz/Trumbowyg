// jshint node:true
'use strict';

const sass = require('gulp-sass')(require('sass'));
var gulp = require('gulp'),
    del = require('del'),
    vinylPaths = require('vinyl-paths'),
    $ = require('gulp-load-plugins')();
const concat = require('gulp-concat');

var paths = {
    scripts: ['src/trumbowyg.js'],
    langs: ['src/langs/**.js', '!src/langs/en.js'],
    plugins: ['plugins/*/**.js', '!plugins/*/gulpfile.js'],
    icons: ['src/ui/icons/**.svg', 'plugins/*/ui/icons/**.svg'],
    mainStyle: 'src/ui/sass/trumbowyg.scss',
    styles: {
        sass: 'src/ui/sass'
    }
};

var pkg = require('./package.json');
var banner = ['/**',
    ' * <%= pkg.title %> v<%= pkg.version %> - <%= pkg.description %>',
    ' * <%= description %>',
    ' * ------------------------',
    ' * @link <%= pkg.homepage %>',
    ' * @license <%= pkg.license %>',
    ' * @author <%= pkg.author.name %>',
    ' *         Twitter : @AlexandreDemode',
    ' *         Website : <%= pkg.author.url.replace("http://", "") %>',
    ' */',
    '\n'].join('\n');
var bannerLight = ['/** <%= pkg.title %> v<%= pkg.version %> - <%= pkg.description %>',
    ' - <%= pkg.homepage.replace("http://", "") %>',
    ' - License <%= pkg.license %>',
    ' - Author : <%= pkg.author.name %>',
    ' / <%= pkg.author.url.replace("http://", "") %>',
    ' */',
    '\n'].join('');


gulp.task('clean', async () => {
    return gulp.src('dist/*')
        .pipe(vinylPaths(del));
});

gulp.task('test-scripts', async () => {
    return gulp.src(paths.scripts)
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'));
});
gulp.task('scripts', gulp.series('test-scripts', async () => {
    return gulp.src(paths.scripts)
        .pipe($.header(banner, {pkg: pkg, description: 'Trumbowyg core file'}))
        .pipe($.newer('dist/trumbowyg.js'))
        .pipe($.concat('trumbowyg.js', {newLine: '\r\n\r\n'}))
        .pipe(gulp.dest('dist/'))
        .pipe($.size({title: 'trumbowyg.js'}))
        .pipe($.rename({suffix: '.min'}))
        .pipe($.uglify())
        .pipe($.header(bannerLight, {pkg: pkg}))
        .pipe(gulp.dest('dist/'))
        .pipe($.size({title: 'trumbowyg.min.js'}));
}));

gulp.task('test-langs', async () => {
    return gulp.src(paths.langs)
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'));
});
gulp.task('test-plugins', async () => {
    return gulp.src(paths.plugins)
        .pipe($.jshint())
        .pipe($.jshint.reporter('jshint-stylish'));
});

gulp.task('plugins', gulp.series('test-plugins', async () => {
    return gulp.src(paths.plugins)
        .pipe(gulp.dest('dist/plugins/'))
        .pipe($.rename({suffix: '.min'}))
        .pipe($.uglify())
        .pipe(gulp.dest('dist/plugins/'));
}));

gulp.task('langs', gulp.series('test-langs', async () => {
    return gulp.src(paths.langs)
        .pipe($.rename({suffix: '.min'}))
        .pipe($.uglify({
            //preserveComments: 'all'
        }))
        .pipe(gulp.dest('dist/langs/'));
}));

gulp.task('test', gulp.series('test-scripts', 'test-langs', 'test-plugins', async (done) => {
    //done();
}));

gulp.task('icons', function () {
    return gulp.src(paths.icons)
        .pipe($.rename({prefix: 'trumbowyg-'}))
        .pipe($.svgmin())
        .pipe($.svgstore({ inlineSvg: true }))
        .pipe(gulp.dest('dist/ui/'));
});

gulp.task('styles', async () => {
    return gulp.src(paths.styles.sass)
        .pipe(sass.sync().on('error', sass.logError)) // scss to css
        // .pipe(sass({
        //     sass: paths.styles.sass
        // }))
        .pipe(concat(paths.mainStyle))
        .pipe($.autoprefixer(['last 1 version', '> 1%', 'ff >= 20', 'ie >= 9', 'opera >= 12', 'Android >= 2.2'], {cascade: true}))
        .pipe($.header(banner, {pkg: pkg, description: 'Default stylesheet for Trumbowyg editor'}))
        .pipe(gulp.dest('dist/ui/'))
        .pipe($.size({title: 'trumbowyg.css'}))
        .pipe($.rename({suffix: '.min'}))
        .pipe($.minifyCss())
        .pipe($.header(bannerLight, {pkg: pkg}))
        .pipe(gulp.dest('dist/ui/'))
        .pipe($.size({title: 'trumbowyg.min.css'}));
});

gulp.task('sass-dist', gulp.series('styles', async () => {
    return gulp.src('src/ui/sass/**/*.scss')
        .pipe($.header(banner, {pkg: pkg, description: 'Default stylesheet for Trumbowyg editor'}))
        .pipe(gulp.dest('dist/ui/sass'));
}));


gulp.task('watch', async (done) => {
    //done();
    gulp.watch(paths.icons, ['icons']);
    gulp.watch(paths.scripts, ['scripts']);
    gulp.watch(paths.langs, ['langs']);
    gulp.watch(paths.plugins, ['plugins']);
    gulp.watch(paths.mainStyle, ['styles']);

    gulp.watch(['dist/**', 'dist/*/**'], function (file) {
        $.livereload.changed(file);
    });

    $.livereload.listen();
});

gulp.task('build', gulp.series('scripts', 'langs', 'plugins', 'sass-dist', 'icons', async (done) => {
    //done();
}));

gulp.task('default', gulp.series('build', 'watch', async (done) => {
    //done();
}));
