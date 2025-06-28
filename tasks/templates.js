import gulp from 'gulp';
import path from 'path';
import twing from 'gulp-twing';
import { paths } from './paths.js';
import {
  TwingEnvironment,
  TwingLoaderFilesystem
} from 'twing';

/* ─── Loader & namespaces ─────────────────────────────────────────────── */
const loader = new TwingLoaderFilesystem([
  paths.twingRoot,   // …/src
  process.cwd()      // racine du projet
]);

loader.addPath(path.join(paths.twingRoot, 'atoms'),     'atoms');
loader.addPath(path.join(paths.twingRoot, 'molecules'), 'molecules');
loader.addPath(path.join(paths.twingRoot, 'organisms'), 'organisms');

const env = new TwingEnvironment(loader);

/* ─── Compile les pages de src/pages/ → public/pages/ ─────────────────── */
export function templates() {
  return gulp.src(paths.twigPages, { base: paths.src })
    .pipe(twing(env, {}, { outputExt: '.html' }))
    .pipe(gulp.dest(path.join(paths.build, 'pages')));
}
