// scripts/test-init.js - Script de test simplifié pour debug
import chalk from 'chalk';
import fse from 'fs-extra';

console.log(chalk.blue.bold('🧪 Test du système d\'initialisation\n'));

// Test 1: Vérifier chalk
console.log('Test 1: Couleurs chalk');
console.log(chalk.magenta('✓ Magenta'));
console.log(chalk.blue('✓ Blue'));
console.log(chalk.cyan('✓ Cyan'));
console.log(chalk.green('✓ Green'));
console.log(chalk.yellow('✓ Yellow'));
console.log(chalk.gray('✓ Gray'));

// Test 2: Arguments CLI
console.log('\nTest 2: Arguments CLI');
const args = process.argv.slice(2);
console.log('Arguments reçus:', args);

const frameworkArg = args.find(arg => arg.startsWith('--framework='));
const framework = frameworkArg ? frameworkArg.split('=')[1] : 'aucun';
console.log('Framework détecté:', framework);

// Test 3: Création de fichiers
console.log('\nTest 3: Création test');
try {
  fse.ensureDirSync('test-temp');
  fse.outputFileSync('test-temp/test.json', JSON.stringify({ test: true }, null, 2));
  console.log(chalk.green('✓ Création de fichiers OK'));
  
  // Nettoyage
  fse.removeSync('test-temp');
  console.log(chalk.green('✓ Nettoyage OK'));
} catch (error) {
  console.log(chalk.red('❌ Erreur création fichiers:', error.message));
}

// Test 4: Structure attendue
console.log('\nTest 4: Structure');
const expectedDirs = ['src/app', 'src/framework', 'public', 'scripts'];
expectedDirs.forEach(dir => {
  const exists = fse.existsSync(dir);
  const status = exists ? chalk.green('✓') : chalk.red('❌');
  console.log(`${status} ${dir}`);
});

console.log(chalk.blue.bold('\n🎯 Tests terminés!'));
console.log('Lancez avec: node scripts/test-init.js --framework=bootstrap');