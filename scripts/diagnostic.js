// scripts/diagnostic.js - Identifier les conflits gulp
import fse from 'fs-extra';
import { globSync } from 'glob';

console.log('🔍 Diagnostic des conflits gulp...\n');

// Vérifier tous les fichiers JS du projet
const jsFiles = globSync('**/*.js', { 
  ignore: ['node_modules/**', 'public/**', 'scripts/diagnostic.js'] 
});

console.log(`📁 Fichiers JS à analyser: ${jsFiles.length}\n`);

let conflicts = [];
let gulpImports = [];

for (const file of jsFiles) {
  try {
    const content = fse.readFileSync(file, 'utf8');
    
    // Chercher les imports de gulp
    const gulpImportMatches = content.match(/import\s+.*gulp.*from/g);
    if (gulpImportMatches) {
      gulpImports.push({
        file,
        imports: gulpImportMatches
      });
    }
    
    // Chercher les déclarations de gulp
    const gulpDeclarations = content.match(/(?:const|let|var)\s+gulp\s*=/g);
    if (gulpDeclarations) {
      conflicts.push({
        file,
        type: 'declaration',
        matches: gulpDeclarations
      });
    }
    
    // Chercher les exports de gulp
    const gulpExports = content.match(/export\s+.*gulp/g);
    if (gulpExports) {
      conflicts.push({
        file,
        type: 'export',
        matches: gulpExports
      });
    }
    
  } catch (e) {
    console.warn(`⚠️ Erreur lecture ${file}: ${e.message}`);
  }
}

// Rapport
console.log('📊 RÉSULTATS:\n');

console.log('🔍 Imports de gulp détectés:');
if (gulpImports.length === 0) {
  console.log('   Aucun import gulp trouvé\n');
} else {
  gulpImports.forEach(item => {
    console.log(`   📄 ${item.file}:`);
    item.imports.forEach(imp => console.log(`      ${imp}`));
    console.log('');
  });
}

console.log('⚠️ Conflits potentiels:');
if (conflicts.length === 0) {
  console.log('   Aucun conflit détecté\n');
} else {
  conflicts.forEach(conflict => {
    console.log(`   ❌ ${conflict.file} (${conflict.type}):`);
    conflict.matches.forEach(match => console.log(`      ${match}`));
    console.log('');
  });
}

// Vérifier la structure des tasks
console.log('📁 Structure tasks/:');
const taskFiles = globSync('tasks/*.js');
taskFiles.forEach(file => {
  const size = fse.statSync(file).size;
  console.log(`   📄 ${file} (${size} bytes)`);
});

console.log('\n💡 RECOMMANDATIONS:');

if (conflicts.length > 0) {
  console.log('   1. ❌ Conflits détectés - vérifiez les fichiers listés');
  console.log('   2. 🔧 Supprimez les déclarations multiples de gulp');
} else if (gulpImports.length > 1) {
  console.log('   1. ⚠️ Imports multiples détectés');
  console.log('   2. 🔧 Vérifiez que chaque fichier n\'importe gulp qu\'une fois');
} else {
  console.log('   1. ✅ Aucun conflit évident détecté');
  console.log('   2. 🔧 Le problème peut venir d\'une dépendance ou cache');
  console.log('   3. 🔄 Essayez: rm -rf node_modules package-lock.json && npm install');
}

console.log('\n🧪 TEST RECOMMANDÉ:');
console.log('   npx gulp detectFramework');
console.log('   (devrait fonctionner avec le gulpfile minimal)');