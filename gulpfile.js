const gulp = require('gulp');
const ts = require('gulp-typescript');
const path = require('path');
const clean = require('gulp-clean');
const uglify = require('gulp-uglify');

const tsProjectCJS = ts.createProject('tsconfig.cjs.json');
const tsProjectESM = ts.createProject('tsconfig.esm.json');

const paths = {
    src: 'src/**/*.ts',
    dest: 'dist',
};

// TypeScript 编译任务 (CJS)  
const compileCJS = () => {
    return tsProjectCJS.src()
        .pipe(tsProjectCJS())
        .js.pipe(gulp.dest('dist/cjs/'));
};

// TypeScript 编译任务 (ESM)  
const compileESM = () => {
    return tsProjectESM.src()
        .pipe(tsProjectESM())
        .js.pipe(gulp.dest('dist/esm/'));
};

// 压缩任务  
const minify = () => {
    return gulp.src(path.join(paths.dest, '**/*.js'))
        .pipe(terser())
        .pipe(gulp.dest(paths.dest));
};

function cleanDist() {
    return gulp.src('dist', { allowEmpty: true, read: false }) // 删除 dist 文件夹
        .pipe(clean());
}

const build = gulp.series(cleanDist, gulp.parallel(compileCJS), gulp.parallel(compileESM));

exports.default = build;