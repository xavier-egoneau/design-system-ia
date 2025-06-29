// gulpfile.js - Version corrigée avec séparation claire
import gulp from 'gulp';
import { clean }          from './tasks/clean.js';
import { sassIndex }      from './tasks/sass-index.js';
import { styles }         from './tasks/styles.js';
import { templates }      from './tasks/templates.js'; // ✅ Pages réelles
import { demos }          from './tasks/demos.js';     // ✅ Composants seulement
import { buildIndexes }   from './tasks/indexes.js';
import { serve }          from './tasks/serve.js';

// ✅ Build séquentiel avec séparation claire
export const build = gulp.series(
  clean,
  sassIndex,
  gulp.parallel(
    styles,        // CSS framework + projet
    templates,     // ✅ Pages Twig → HTML réel
    demos          // ✅ Composants → Playground + iframe
  ),
  buildIndexes     // Index + interface IA
);

export default gulp.series(build, serve);