import gulp        from 'gulp';
import browserSync from 'browser-sync';
import { paths }   from './paths.js';

import { sassIndex }      from './sass-index.js';
import { styles }         from './styles.js';
import { templates }      from './templates.js';
import { atomsDemo, moleculesDemo, organismsDemo } from './demos.js';
import { buildIndexes }   from './indexes.js';
import { copyAssets }     from './assets.js';  // 🆕 Import assets

const bs = browserSync.create();

/** Serveur avec surveillance assets */
export function serve() {
  bs.init({ 
    server: { baseDir: paths.build },
    open: false,
    notify: false,
    port: 3000
  });

  console.log('🌐 Design System running on:');
  console.log('   Frontend: http://localhost:3000');
  console.log('   API:      http://localhost:3001');

  // Watchers existants
  gulp.watch(paths.appScssAll,
    gulp.series(sassIndex, styles, bs.reload));

  gulp.watch(paths.appJsonAll,
    gulp.series(sassIndex, atomsDemo, moleculesDemo, organismsDemo, buildIndexes, bs.reload));

  gulp.watch(['src/app/**/*.comp.json'],
    gulp.series(atomsDemo, moleculesDemo, organismsDemo, buildIndexes, bs.reload));

  gulp.watch(paths.appPages,
    gulp.series(templates, buildIndexes, bs.reload));
  
    gulp.watch('src/app/pages/**/*.twig',
  gulp.series(templates, buildIndexes, bs.reload));

  gulp.watch(paths.appComponents,
    gulp.series(atomsDemo, moleculesDemo, organismsDemo, buildIndexes, bs.reload));

  // 🆕 NOUVEAU : Watcher pour les assets
  gulp.watch(paths.appAssets, 
    gulp.series(copyAssets, bs.reload));

  console.log('👀 Surveillance active :');
  console.log('   📄 SCSS: src/app/**/*.scss');
  console.log('   🧩 Components: src/app/**/*.{twig,comp.json}');
  console.log('   📄 Pages: src/app/pages/**/*.twig');
  console.log('   🎨 Assets: src/app/assets/**/*');  // 🆕 Log
}