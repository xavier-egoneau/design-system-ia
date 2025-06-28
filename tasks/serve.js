import gulp        from 'gulp';
import browserSync from 'browser-sync';
import { paths }   from './paths.js';

import { sassIndex }      from './sass-index.js';
import { styles }         from './styles.js';
import { templates }      from './templates.js';
import { atomsDemo, moleculesDemo, organismsDemo } from './demos.js';
import { buildIndexes }   from './indexes.js';

const bs = browserSync.create();

/** Serveur simple sans proxy */
export function serve() {
  bs.init({ 
    server: {
      baseDir: paths.build
    },
    open: false,
    notify: false,
    port: 3000
  });

  console.log('🌐 Design System running on:');
  console.log('   Frontend: http://localhost:3000');
  console.log('   API:      http://localhost:3001');
  console.log('');
  console.log('💡 Note: Les appels API se font directement vers localhost:3001');

  // SCSS
  gulp.watch(paths.scssAll,
    gulp.series(sassIndex, styles, bs.reload));

  // JSON (ajout / suppression de composants)
  gulp.watch(paths.jsonAll,
    gulp.series(sassIndex, atomsDemo, moleculesDemo, organismsDemo, buildIndexes, bs.reload));

  // Métadonnées des composants (.comp.json)
  gulp.watch(['src/**/*.comp.json'],
    gulp.series(atomsDemo, moleculesDemo, organismsDemo, buildIndexes, bs.reload));

  // Pages Twig
  gulp.watch(paths.twigPages,
    gulp.series(templates, buildIndexes, bs.reload));

  // Snippets Twig
  gulp.watch(paths.twigSnips,
    gulp.series(atomsDemo, moleculesDemo, organismsDemo, buildIndexes, bs.reload));
}