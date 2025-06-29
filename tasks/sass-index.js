// tasks/sass-index.js - Version corrigée pour src/app/
import { globSync } from 'glob';
import fse from 'fs-extra';
import path from 'path';

export async function sassIndex() {
  // Chercher les fichiers SCSS dans src/app/ d'abord, puis src/
  const searchPaths = [
    'src/app/**/_*.scss',
    'src/**/_*.scss'
  ];
  
  let files = [];
  
  for (const searchPath of searchPaths) {
    const foundFiles = globSync(searchPath, { nodir: true })
      .filter(f => !f.endsWith('_generated.scss'))
      .filter(f => !f.includes('node_modules'))
      .filter(f => !f.includes('framework.scss'));
    
    files = files.concat(foundFiles);
  }
  
  // Supprimer les doublons
  files = [...new Set(files)];
  
  console.log(`📝 Sass index: ${files.length} fichiers détectés`);
  
  // Déterminer où créer le fichier _generated.scss
  let generatedPath = 'src/app/_generated.scss';
  let basePath = 'src/app';
  
  // Si pas de fichiers dans src/app/, utiliser src/
  const appFiles = files.filter(f => f.startsWith('src/app/'));
  if (appFiles.length === 0 && files.length > 0) {
    generatedPath = 'src/_generated.scss';
    basePath = 'src';
    console.log('📝 Aucun fichier SCSS dans src/app/, utilisation de src/');
  }
  
  // Générer le contenu
  let content = '// 🚨 AUTO-GENERATED – DO NOT EDIT\n';
  
  if (files.length === 0) {
    content += '// Aucun fichier SCSS détecté dans le projet\n';
    console.log('📝 Aucun fichier SCSS trouvé, création d\'un index minimal');
  } else {
    const lines = files.map(f => {
      // Calculer le chemin relatif depuis le fichier _generated.scss
      let relativePath = path.relative(basePath, f).replace(/\\/g, '/');
      
      // Supprimer l'extension .scss et le préfixe _
      relativePath = relativePath.replace(/\.scss$/, '').replace(/\/_/, '/');
      if (relativePath.startsWith('_')) {
        relativePath = relativePath.slice(1);
      }
      
      return `@use '${relativePath}';`;
    });
    
    content += lines.join('\n') + '\n';
    console.log(`📝 Génération des imports pour ${files.length} fichiers`);
  }
  
  // S'assurer que le dossier existe
  fse.ensureDirSync(path.dirname(generatedPath));
  
  // Vérifier si le contenu a changé avant d'écrire
  let shouldWrite = true;
  if (fse.existsSync(generatedPath)) {
    const existingContent = fse.readFileSync(generatedPath, 'utf8');
    shouldWrite = existingContent !== content;
  }
  
  if (shouldWrite) {
    await fse.outputFile(generatedPath, content);
    console.log(`✅ Index Sass mis à jour: ${generatedPath}`);
  } else {
    console.log(`✅ Index Sass déjà à jour: ${generatedPath}`);
  }
}