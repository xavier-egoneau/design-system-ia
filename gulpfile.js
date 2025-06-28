import gulp from 'gulp';
import { clean }          from './tasks/clean.js';
import { sassIndex }      from './tasks/sass-index.js';
import { styles }         from './tasks/styles.js';
import { templates }      from './tasks/templates.js';
import { demos } from './tasks/demos.js';
import { buildIndexes }   from './tasks/indexes.js';
import { serve }          from './tasks/serve.js';

export const build = gulp.series(
  clean,
  sassIndex,
  gulp.parallel(styles, templates, demos),
  buildIndexes  // ✅ Inclut maintenant l'interface IA automatiquement
);

export default gulp.series(build, serve);