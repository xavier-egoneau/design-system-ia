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

export const styles = gulp.parallel(compileFramework, compileProject);

// Compiler framework.scss (inchangé)
function compileFramework() {
  const frameworkPath = paths.frameworkScss; // src/system/framework.scss
  const outputDir = path.join(paths.build, 'css');
  
  console.log('🔧 Framework compilation...');
  
  if (!fse.existsSync(frameworkPath)) {
    console.log('📝 Création framework.scss minimal...');
    const minimalFramework = `/* Framework CSS minimal */
body {
  font-family: system-ui, sans-serif;
  margin: 0;
  background: white;
}`;
    fse.outputFileSync(frameworkPath, minimalFramework);
  }
  
  fse.ensureDirSync(outputDir);
  
  return gulp.src(frameworkPath)
    .pipe(sass.sync({ 
      includePaths: [
        paths.app,                              // src/app
        path.join(paths.app, 'node_modules'),   // src/app/node_modules  
        'node_modules'                          // node_modules racine
      ],
      quietDeps: true,
      outputStyle: 'expanded'
    }).on('error', sass.logError))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(gulp.dest('public/css'));
}

// Compiler le projet avec nouveaux chemins
function compileProject() {
  console.log('🎨 Compilation du projet...');
  
  // Paths de recherche incluant node_modules du projet
  const includePaths = [
    paths.app,                              // src/app
    path.join(paths.app, 'node_modules'),   // src/app/node_modules  
    'node_modules'                          // node_modules racine (système)
  ];
  
  return gulp.src(paths.scssEntry)  // src/main.scss
    .pipe(sass.sync({ 
      includePaths,
      quietDeps: true
    }).on('error', sass.logError))
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(gulp.dest(`${paths.build}/css`))
    .on('end', () => {
      console.log('✅ main.css généré avec dépendances projet');
    });
}