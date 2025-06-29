// tasks/templates.js - Version corrigée qui compile vraiment les pages
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

/* ─── Compile les pages RÉELLEMENT en HTML ─────────────────────────────── */
export function templates() {
  console.log('📄 Compilation des pages Twig vers HTML...');
  
  return gulp.src(paths.twigPages, { base: paths.src })
    .pipe(twing(env, {}, { outputExt: '.html' }))
    .pipe(gulp.dest(paths.build)) // public/ directement
    .on('end', () => {
      console.log('✅ Pages compilées en HTML dans public/pages/');
    });
}