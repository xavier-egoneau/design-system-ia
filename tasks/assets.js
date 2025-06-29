// tasks/assets.js - Gestion des assets statiques
import gulp from 'gulp';
import { paths } from './paths.js';
import fse from 'fs-extra';

export function copyAssets() {
  console.log('📁 Copie des assets...');
  
  // Vérifier si le dossier assets existe
  if (!fse.existsSync('src/app/assets')) {
    console.log('⚠️  Dossier src/app/assets/ non trouvé - création...');
    createDefaultAssets();
  }
  
  return gulp.src(['src/app/assets/**/*'], { 
    encoding: false,
    allowEmpty: true 
  })
    .pipe(gulp.dest('public/assets/'))
    .on('end', () => {
      console.log('✅ Assets copiés vers public/assets/');
    });
}

// Créer des assets par défaut si le dossier n'existe pas
function createDefaultAssets() {
  // Créer la structure
  fse.ensureDirSync('src/app/assets/images');
  fse.ensureDirSync('src/app/assets/fonts');
  fse.ensureDirSync('src/app/assets/icons');
  
  // Créer un placeholder SVG pour test.png
  const placeholderSVG = `<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#dee2e6"/>
  <text x="50%" y="50%" text-anchor="middle" dy=".3em" font-family="sans-serif" font-size="16" fill="#6c757d">
    test.png - 300x200
  </text>
</svg>`;
  
  // Sauvegarder comme fichier PNG (en fait SVG pour être valide)
  fse.outputFileSync('src/app/assets/images/test.png', placeholderSVG);
  
  // Créer quelques autres placeholders
  const placeholder400x300 = placeholderSVG.replace('300', '400').replace('200', '300').replace('300x200', '400x300');
  fse.outputFileSync('src/app/assets/images/placeholder.jpg', placeholder400x300);
  
  console.log('📁 Assets par défaut créés dans src/app/assets/');
}

// Tâche pour nettoyer les assets
export function cleanAssets() {
  console.log('🧹 Nettoyage des assets...');
  
  return fse.remove('public/assets/')
    .then(() => {
      console.log('✅ Assets nettoyés');
    });
}