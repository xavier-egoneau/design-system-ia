// tasks/styles.js - Version corrigée sans conflits
import gulp from 'gulp';
import * as dartSass from 'sass';
import gulpSass from 'gulp-sass';
import postcss from 'gulp-postcss';
import autoprefixer from 'autoprefixer';
import cssnano from 'cssnano';
import { paths } from './paths.js';
import path from 'path';
import fse from 'fs-extra';

const sass = gulpSass(dartSass);

// ✅ Export UNIQUEMENT la tâche styles (pas build/dev)
export const styles = gulp.parallel(compileFramework, compileProject);

// Compiler framework.scss avec détection automatique
function compileFramework() {
  // Auto-générer framework.scss avec détection
  generateFrameworkScss();
  
  const frameworkPath = 'src/framework/framework.scss';
  const outputDir = path.join(paths.build, 'css');
  
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
    fse.ensureDirSync(path.dirname(frameworkPath));
    fse.outputFileSync(frameworkPath, minimalFramework);
  }
  
  // S'assurer que le dossier de destination existe
  fse.ensureDirSync(outputDir);
  
  return gulp.src(frameworkPath)
    .pipe(sass.sync({ 
      includePaths: [
        'src/app',
        'src/framework',
        'node_modules',
        '.'
      ],
      quietDeps: true,
      outputStyle: 'expanded'
    }).on('error', function(error) {
      console.error('❌ Sass error:', error.message);
      
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
    .pipe(gulp.dest('public/css'))
    .on('end', function() {
      console.log('✅ framework.css généré dans public/css/');
    });
}

// Compiler le projet (src/app/main.scss ou fallback)
function compileProject() {
  console.log('🎨 Compilation du projet...');
  
  let projectEntry = 'src/app/main.scss';
  if (!fse.existsSync(projectEntry)) {
    projectEntry = paths.scssEntry;
  }
  
  if (!fse.existsSync(projectEntry)) {
    console.log('📝 Création main.scss...');
    const mainScss = `// Point d'entrée CSS du projet
@forward '_generated';

// Styles custom du projet
body {
  margin: 0;
  font-family: system-ui, sans-serif;
}
`;
    fse.ensureDirSync(path.dirname(projectEntry));
    fse.outputFileSync(projectEntry, mainScss);
  }
  
  return gulp.src(projectEntry)
    .pipe(sass.sync({ 
      includePaths: [
        'src/app',
        'src/framework', 
        paths.src, 
        'node_modules'
      ],
      quietDeps: true
    }).on('error', sass.logError))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(gulp.dest(`${paths.build}/css`))
    .on('end', () => {
      console.log('✅ main.css généré');
    });
}

// Auto-générer framework.scss avec détection
function generateFrameworkScss() {
  const frameworkPath = 'src/framework/framework.scss';
  
  console.log('🔍 Détection du framework...');
  
  let frameworkCSS = detectAndGenerateFrameworkCSS();
  
  fse.ensureDirSync(path.dirname(frameworkPath));
  fse.outputFileSync(frameworkPath, frameworkCSS);
  console.log(`✅ framework.scss auto-généré`);
}

// Détection et génération automatique du CSS framework
function detectAndGenerateFrameworkCSS() {
  const packagePath = 'src/app/package.json';
  
  if (!fse.existsSync(packagePath)) {
    console.log('📝 Aucun package.json trouvé, utilisation CSS minimal');
    return generateMinimalCSS();
  }
  
  try {
    const packageJson = JSON.parse(fse.readFileSync(packagePath, 'utf8'));
    const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    // Bootstrap
    if (deps.bootstrap) {
      console.log('🎯 Framework détecté: Bootstrap');
      const localPath = 'src/app/node_modules/bootstrap/dist/css/bootstrap.min.css';
      if (fse.existsSync(localPath)) {
        return `/* Bootstrap (local) */\n@import '${localPath}';\n\n.debug-framework::before { content: "Framework: Bootstrap (local) ✅"; }`;
      } else {
        return `/* Bootstrap (CDN) */\n@import url('https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css');\n\n.debug-framework::before { content: "Framework: Bootstrap (CDN) ✅"; }`;
      }
    }
    
    // DSFR
    if (deps['@gouvfr/dsfr']) {
      console.log('🎯 Framework détecté: DSFR');
      const localPath = 'src/app/node_modules/@gouvfr/dsfr/dist/dsfr.min.css';
      if (fse.existsSync(localPath)) {
        return `/* DSFR (local) */\n@import '${localPath}';\n\n.debug-framework::before { content: "Framework: DSFR (local) ✅"; }`;
      } else {
        return `/* DSFR (CDN) */\n@import url('https://cdn.jsdelivr.net/npm/@gouvfr/dsfr@1.10.1/dist/dsfr.min.css');\n\n.debug-framework::before { content: "Framework: DSFR (CDN) ✅"; }`;
      }
    }
    
    // Autres frameworks...
    if (deps.tailwindcss) {
      console.log('🎯 Framework détecté: Tailwind');
      return `/* Tailwind CSS */\n@import url('https://cdn.tailwindcss.com');\n\n.debug-framework::before { content: "Framework: Tailwind ✅"; }`;
    }
    
    if (deps.bulma) {
      console.log('🎯 Framework détecté: Bulma');
      return `/* Bulma (CDN) */\n@import url('https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css');\n\n.debug-framework::before { content: "Framework: Bulma ✅"; }`;
    }
    
  } catch (e) {
    console.warn('⚠️ Erreur lecture package.json, utilisation CSS minimal');
  }
  
  return generateMinimalCSS();
}

function generateMinimalCSS() {
  console.log('🎯 Framework: CSS Minimal');
  return `/* Framework CSS minimal - Auto-généré */
body {
  font-family: system-ui, -apple-system, sans-serif;
  margin: 0;
  line-height: 1.5;
  color: #333;
}

*, *::before, *::after {
  box-sizing: border-box;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: all 0.2s ease;
}

.btn:hover {
  background: #0056b3;
}

.debug-framework {
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0,150,0,0.9);
  color: white;
  padding: 0.5rem;
  font-size: 0.75rem;
  z-index: 9999;
  border-radius: 4px;
}

.debug-framework::before {
  content: "Framework: Minimal ✅";
}
`;
}