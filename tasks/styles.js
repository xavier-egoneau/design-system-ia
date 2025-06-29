// tasks/styles.js - Fix du chemin de destination
import gulp        from 'gulp';
import * as dartSass from 'sass';
import gulpSass    from 'gulp-sass';
import postcss     from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import cssnano     from 'cssnano';
import { paths }   from './paths.js';
import path        from 'path';
import fse         from 'fs-extra';

const sass = gulpSass(dartSass);

// Export direct des tâches parallèles
export const styles = gulp.parallel(compileFramework, compileProject);

// Compiler framework.scss avec destination fixée
function compileFramework() {
  const frameworkPath = path.join(paths.src, 'framework.scss');
  const outputDir = path.join(paths.build, 'css'); // public/css/
  
  console.log('🔧 Framework compilation:');
  console.log(`   Source: ${frameworkPath}`);
  console.log(`   Destination: ${outputDir}`);
  
  // Créer framework.scss minimal s'il n'existe pas
  if (!fse.existsSync(frameworkPath)) {
    console.log('📝 Création framework.scss minimal...');
    const minimalFramework = `/* Framework CSS minimal */
body {
  font-family: system-ui, sans-serif;
  margin: 0;
  background: white;
}

.debug-framework {
  position: fixed;
  top: 10px;
  left: 10px;
  background: rgba(0,150,0,0.9);
  color: white;
  padding: 0.5rem;
  font-size: 0.75rem;
  z-index: 9999;
  border-radius: 4px;
}

.debug-framework::before {
  content: "Framework CSS généré ✅";
}
`;
    fse.outputFileSync(frameworkPath, minimalFramework);
  }
  
  // S'assurer que le dossier de destination existe
  fse.ensureDirSync(outputDir);
  
  // ✅ Solution : utiliser gulp.src avec un glob pattern spécifique
  return gulp.src('src/framework.scss') // Chemin relatif direct
    .pipe(sass.sync({ 
      includePaths: [
        paths.src,
        'node_modules',
        '.'
      ],
      quietDeps: true,
      outputStyle: 'expanded'
    }).on('error', function(error) {
      console.error('❌ Sass error:', error.message);
      
      // Créer un CSS de fallback directement
      const fallbackCSS = `/* Framework compilation failed */
body { 
  font-family: system-ui, sans-serif;
  background: white;
}

.debug-framework {
  position: fixed;
  top: 10px;
  left: 10px;
  background: rgba(200,0,0,0.9);
  color: white;
  padding: 0.5rem;
  font-size: 0.75rem;
  z-index: 9999;
  border-radius: 4px;
}

.debug-framework::before {
  content: "Framework error ❌";
}
`;
      
      const fallbackPath = path.join(outputDir, 'framework.css');
      fse.outputFileSync(fallbackPath, fallbackCSS);
      console.log(`📁 Fallback written to: ${fallbackPath}`);
      this.emit('end');
    }))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(gulp.dest('public/css')) // ✅ Destination fixe et directe
    .on('end', function() {
      console.log('✅ framework.css généré dans public/css/');
      
      // Vérification post-génération
      setTimeout(() => {
        const expectedPath = path.join('public', 'css', 'framework.css');
        if (fse.existsSync(expectedPath)) {
          const stats = fse.statSync(expectedPath);
          console.log(`✅ Confirmé: framework.css (${stats.size} bytes)`);
        } else {
          console.log(`❌ framework.css introuvable dans public/css/`);
        }
      }, 100);
    });
}

// Compiler le projet (sans changement)
function compileProject() {
  console.log('🎨 Compilation du projet...');
  
  return gulp.src(paths.scssEntry)
    .pipe(sass.sync({ 
      includePaths: [paths.src, 'node_modules'],
      quietDeps: true
    }).on('error', sass.logError))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(gulp.dest(`${paths.build}/css`))
    .on('end', () => {
      console.log('✅ main.css généré');
    });
}