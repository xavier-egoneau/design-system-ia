import fse from 'fs-extra';
import path from 'path';
import { globSync } from 'glob';

async function migrateToNewStructure() {
  console.log('🚀 Migration vers la nouvelle structure app/system...');
  
  // 1. Créer les nouveaux dossiers
  await fse.ensureDir('src/app');
  await fse.ensureDir('src/system/templates');
  await fse.ensureDir('src/system/assets');
  
  // 2. Déplacer les composants du projet
  const categories = ['atoms', 'molecules', 'organisms', 'pages'];
  for (const cat of categories) {
    if (fse.existsSync(`src/${cat}`)) {
      console.log(`📦 Déplacement ${cat}...`);
      await fse.move(`src/${cat}`, `src/app/${cat}`);
    }
  }
  
  // 3. Déplacer les tokens si ils existent
  if (fse.existsSync('src/tokens')) {
    console.log('🎨 Déplacement tokens...');
    await fse.move('src/tokens', 'src/app/tokens');
  }
  
  // 4. Garder main.scss à la racine (ne pas le déplacer)
  console.log('📌 main.scss reste à src/main.scss (point d\'entrée système)');
  
  // 5. Déplacer _generated.scss vers app/
  if (fse.existsSync('src/_generated.scss')) {
    console.log('🔧 Déplacement _generated.scss...');
    await fse.move('src/_generated.scss', 'src/app/_generated.scss');
  }
  
  // 6. Déplacer les templates système
  const systemTemplates = [
    '__wrapper-component.twig',
    '__iframe-project.twig', 
    '__wrapper-debug.twig',
    '__wrapper-interactive.twig',
    '__wrapper.twig'
  ];
  
  for (const template of systemTemplates) {
    if (fse.existsSync(`src/${template}`)) {
      console.log(`⚙️ Déplacement template système ${template}...`);
      await fse.move(`src/${template}`, `src/system/templates/${template}`);
    }
  }
  
  // 7. Déplacer package.json du projet
  if (fse.existsSync('src/package.json')) {
    console.log('📦 Déplacement package.json du projet...');
    await fse.move('src/package.json', 'src/app/package.json');
  }
  
  // 8. Déplacer node_modules du projet si ils existent
  if (fse.existsSync('src/node_modules')) {
    console.log('📚 Déplacement node_modules du projet...');
    await fse.move('src/node_modules', 'src/app/node_modules');
  }
  
  // 9. Déplacer framework.scss
  if (fse.existsSync('src/framework.scss')) {
    console.log('🎨 Déplacement framework.scss...');
    await fse.move('src/framework.scss', 'src/system/framework.scss');
  }
  
  // 10. Mettre à jour main.scss pour pointer vers app/_generated
  const mainScssContent = `// Point d'entrée système - NE PAS MODIFIER
// Ce fichier importe automatiquement tous les composants du projet

@forward 'app/_generated';
`;
  
  await fse.outputFile('src/main.scss', mainScssContent);
  console.log('📝 main.scss mis à jour pour pointer vers app/_generated.scss');
  
  console.log('✅ Migration terminée !');
  console.log('');
  console.log('📋 Actions à faire manuellement :');
  console.log('1. Mettre à jour tasks/paths.js');
  console.log('2. Mettre à jour les imports dans les tâches Gulp');
  console.log('3. Tester le build : npm run build');
  console.log('4. Vérifier que tout fonctionne : npm run dev');
}

migrateToNewStructure().catch(console.error);