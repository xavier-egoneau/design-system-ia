// gulpfile.js - Version avec gestion des assets
import gulp from 'gulp';
import path from 'path';
import fse from 'fs-extra';
import { clean } from './tasks/clean.js';
import { sassIndex } from './tasks/sass-index.js';
import { buildIndexes } from './tasks/indexes.js';
import { serve } from './tasks/serve.js';
import { initFramework } from './tasks/framework-detection.js';
import { copyAssets } from './tasks/assets.js';  // 🆕 Import assets

// Import des tâches existantes
import { styles } from './tasks/styles.js';
import { templates } from './tasks/templates.js';
import { demos } from './tasks/demos.js';

// ✅ Build avec gestion des assets
export const build = gulp.series(
  initFramework,    // 🌟 Détection et configuration automatique du framework
  clean,
  sassIndex,
  gulp.parallel(
    styles,         // Compile framework.css + main.css automatiquement
    templates,      // Pages avec assets framework intégrés
    demos,          // Composants avec iframe + framework
    copyAssets      // 🆕 Copie des assets
  ),
  buildIndexes     // Index + interface IA
);

// ✅ Dev avec assets surveillés
export const dev = gulp.series(build, serve);

// ✅ Tâches de maintenance avec assets
export const maintenance = {
  // Nettoyage des assets non utilisés
  cleanAssets: async function cleanUnusedAssets() {
    const { deleteAsync } = await import('del');
    console.log('🧹 Nettoyage des assets non utilisés...');
    
    await deleteAsync([
      'public/assets/**/.DS_Store',
      'public/assets/**/Thumbs.db',
      'public/css/*.map'
    ]);
    
    console.log('✅ Assets nettoyés');
  },
  
  // Validation des composants
  validateComponents: async function validateComponents() {
    const { globSync } = await import('glob');
    
    console.log('🔍 Validation des composants...');
    
    const compFiles = globSync('src/app/**/*.comp.json');
    let errors = 0;
    
    for (const file of compFiles) {
      try {
        const content = fse.readFileSync(file, 'utf8');
        const comp = JSON.parse(content);
        
        // Validation des champs obligatoires
        const required = ['name', 'type', 'variables', 'variants'];
        const missing = required.filter(field => !(field in comp));
        
        if (missing.length > 0) {
          console.error(`❌ ${file}: champs manquants: ${missing.join(', ')}`);
          errors++;
        }
        
        // Validation du type
        if (comp.type && !['atom', 'molecule', 'organism'].includes(comp.type)) {
          console.error(`❌ ${file}: type invalide: ${comp.type}`);
          errors++;
        }
        
        // Vérification des fichiers associés
        const dir = path.dirname(file);
        const name = path.basename(dir);
        const twigFile = path.join(dir, `${name}.twig`);
        const scssFile = path.join(dir, `_${name}.scss`);
        
        if (!fse.existsSync(twigFile)) {
          console.error(`❌ ${file}: fichier Twig manquant: ${twigFile}`);
          errors++;
        }
        
        if (!fse.existsSync(scssFile)) {
          console.warn(`⚠️  ${file}: fichier SCSS manquant: ${scssFile}`);
        }
        
      } catch (error) {
        console.error(`❌ ${file}: JSON invalide: ${error.message}`);
        errors++;
      }
    }
    
    if (errors === 0) {
      console.log(`✅ Tous les composants sont valides (${compFiles.length} vérifiés)`);
    } else {
      console.error(`❌ ${errors} erreurs trouvées dans les composants`);
      process.exit(1);
    }
  },
  
  // Génération d'un rapport du design system
  generateReport: async function generateReport() {
    const { globSync } = await import('glob');
    
    console.log('📊 Génération du rapport...');
    
    const stats = {
      components: { atoms: 0, molecules: 0, organisms: 0 },
      totalVariants: 0,
      tokensFiles: 0,
      pagesFiles: 0,
      assetsFiles: 0,  // 🆕 Assets stats
      framework: 'inconnu'
    };
    
    // Compter les composants
    ['atoms', 'molecules', 'organisms'].forEach(category => {
      const files = globSync(`src/app/${category}/*/*.comp.json`);
      stats.components[category] = files.length;
      
      files.forEach(file => {
        try {
          const content = fse.readFileSync(file, 'utf8');
          const comp = JSON.parse(content);
          stats.totalVariants += (comp.variants || []).length;
        } catch (e) {
          // Ignorer les erreurs
        }
      });
    });
    
    // Compter les autres éléments
    stats.tokensFiles = globSync('src/app/tokens/**/*.scss').length;
    stats.pagesFiles = globSync('src/app/pages/**/*.twig').length;
    stats.assetsFiles = globSync('src/app/assets/**/*').length;  // 🆕 Assets count
    
    // Détecter le framework
    try {
      const { frameworkDetector } = await import('./tasks/framework-detection.js');
      stats.framework = frameworkDetector.frameworks.css || 'minimal';
    } catch (e) {
      stats.framework = 'inconnu';
    }
    
    // Générer le rapport
    const report = `# Rapport du Design System

## 📊 Statistiques

- **Framework**: ${stats.framework.toUpperCase()}
- **Composants totaux**: ${Object.values(stats.components).reduce((a, b) => a + b, 0)}
  - Atoms: ${stats.components.atoms}
  - Molecules: ${stats.components.molecules} 
  - Organisms: ${stats.components.organisms}
- **Variants totaux**: ${stats.totalVariants}
- **Fichiers de tokens**: ${stats.tokensFiles}
- **Pages**: ${stats.pagesFiles}
- **Assets**: ${stats.assetsFiles}

## 🗂️ Structure détaillée

### Atoms
${globSync('src/app/atoms/*/').map(dir => `- ${path.basename(dir)}`).join('\n')}

### Molecules  
${globSync('src/app/molecules/*/').map(dir => `- ${path.basename(dir)}`).join('\n')}

### Organisms
${globSync('src/app/organisms/*/').map(dir => `- ${path.basename(dir)}`).join('\n')}

### Assets
${globSync('src/app/assets/**/*').slice(0, 10).map(file => `- ${path.relative('src/app', file)}`).join('\n')}
${stats.assetsFiles > 10 ? `... et ${stats.assetsFiles - 10} autres fichiers` : ''}

---
*Généré le ${new Date().toLocaleString('fr-FR')}*
`;
    
    fse.outputFileSync('design-system-report.md', report);
    console.log('✅ Rapport généré: design-system-report.md');
  }
};

// ✅ Tâche pour installer les dépendances du framework
export const installFramework = async function installFramework() {
  const { frameworkDetector } = await import('./tasks/framework-detection.js');
  const { execSync } = await import('child_process');
  
  const framework = frameworkDetector.frameworks.css;
  
  if (!framework || framework === 'minimal') {
    console.log('ℹ️  Aucun framework détecté, rien à installer');
    return;
  }
  
  const missing = frameworkDetector.checkDependencies();
  
  if (missing.length === 0) {
    console.log(`✅ ${framework} est déjà installé`);
    return;
  }
  
  console.log(`📥 Installation de ${framework}...`);
  
  try {
    // Créer package.json si nécessaire dans src/app/
    const srcPackagePath = 'src/app/package.json';
    if (!fse.existsSync(srcPackagePath)) {
      const packageJson = {
        name: "design-system-project",
        version: "1.0.0",
        dependencies: {}
      };
      fse.outputFileSync(srcPackagePath, JSON.stringify(packageJson, null, 2));
    }
    
    // Installer selon le framework
    const installCommands = {
      bootstrap: 'npm install bootstrap@^5.3.2',
      dsfr: 'npm install @gouvfr/dsfr@^1.10.1',
      tailwind: 'npm install tailwindcss@^3.3.0',
      bulma: 'npm install bulma@^0.9.4',
      foundation: 'npm install foundation-sites@^6.7.5'
    };
    
    const command = installCommands[framework];
    if (command) {
      execSync(`cd src/app && ${command}`, { stdio: 'inherit' });
      console.log(`✅ ${framework} installé avec succès`);
    }
    
  } catch (error) {
    console.error(`❌ Erreur installation ${framework}:`, error.message);
    console.log(`💡 Installez manuellement: cd src/app && npm install`);
  }
};

// ✅ Exports principaux
export default dev;

// ✅ Exports des tâches individuelles pour usage avancé
export { 
  clean, 
  sassIndex, 
  styles, 
  templates, 
  demos, 
  buildIndexes, 
  serve,
  initFramework,
  copyAssets  // 🆕 Export assets
};

// ✅ Log de démarrage avec framework détecté
console.log('🎨 Design System avec détection automatique des frameworks');

// Détecter le framework au démarrage
import('./tasks/framework-detection.js').then(({ frameworkDetector }) => {
  const framework = frameworkDetector.frameworks.css || 'minimal';
  console.log(`📦 Framework détecté: ${framework.toUpperCase()}`);
  
  if (framework !== 'minimal') {
    const missing = frameworkDetector.checkDependencies();
    if (missing.length > 0) {
      console.log('⚠️  Dépendances manquantes détectées.');
      console.log('💡 Lancez `npm run install:framework` pour les installer automatiquement.');
    }
  }
}).catch(() => {
  // Ignore les erreurs de détection au démarrage
});