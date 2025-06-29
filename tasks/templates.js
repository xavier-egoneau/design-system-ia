import gulp from 'gulp';
import path from 'path';
import twing from 'gulp-twing';
import { paths } from './paths.js';
import {
  TwingEnvironment,
  TwingLoaderFilesystem
} from 'twing';

const loader = new TwingLoaderFilesystem([
  paths.twingRoot,   // …/src/app
  process.cwd()
]);

loader.addPath(path.join(paths.twingRoot, 'atoms'), 'atoms');
loader.addPath(path.join(paths.twingRoot, 'molecules'), 'molecules');
loader.addPath(path.join(paths.twingRoot, 'organisms'), 'organisms');

const env = new TwingEnvironment(loader);

export function templates() {
  console.log('📄 Compilation des pages Twig vers HTML...');
  
  // 🔄 CHANGEMENT : Nouveau chemin et base
  return gulp.src(paths.appPages, { base: paths.app })
    .pipe(twing(env, {}, { outputExt: '.html' }))
    .pipe(gulp.dest(paths.build))
    .on('end', () => {
      console.log('✅ Pages compilées en HTML dans public/pages/');
    });
}