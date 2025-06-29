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
    server: { baseDir: paths.build },
    open: false,
    notify: false,
    port: 3000
  });

  console.log('🌐 Design System running on:');
  console.log('   Frontend: http://localhost:3000');
  console.log('   API:      http://localhost:3001');

  // 🔄 CHANGEMENT : Nouveaux chemins de surveillance
  gulp.watch(paths.appScssAll,
    gulp.series(sassIndex, styles, bs.reload));

  gulp.watch(paths.appJsonAll,
    gulp.series(sassIndex, atomsDemo, moleculesDemo, organismsDemo, buildIndexes, bs.reload));

  gulp.watch(['src/app/**/*.comp.json'],
    gulp.series(atomsDemo, moleculesDemo, organismsDemo, buildIndexes, bs.reload));

  gulp.watch(paths.appPages,
    gulp.series(templates, buildIndexes, bs.reload));

  gulp.watch(paths.appComponents,
    gulp.series(atomsDemo, moleculesDemo, organismsDemo, buildIndexes, bs.reload));
}