import gulp        from 'gulp';
import * as dartSass from 'sass';
import gulpSass    from 'gulp-sass';
import postcss     from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import cssnano     from 'cssnano';
import { paths }   from './paths.js';

const sass = gulpSass(dartSass);

export function styles() {
  return gulp.src(paths.scssEntry)
    .pipe(sass.sync({ includePaths: [paths.src] }).on('error', sass.logError))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(gulp.dest(`${paths.build}/css`));
}
