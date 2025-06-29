// scripts/reset-project.js - Script de reset du projet
import inquirer from 'inquirer';
import chalk from 'chalk';
import fse from 'fs-extra';
import { deleteAsync } from 'del';

async function main() {
  const args = process.argv.slice(2);
  const isForced = args.includes('--force');
  
  console.log(chalk.red.bold('\n🧹 Reset du Design System\n'));
  
  if (!isForced) {
    console.log(chalk.yellow('⚠️  Cette opération va supprimer :'));
    console.log(chalk.gray('   • Tout le contenu de src/app/'));
    console.log(chalk.gray('   • Tous les fichiers générés dans public/'));
    console.log(chalk.gray('   • Les backups seront conservés\n'));
    
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: 'Êtes-vous sûr de vouloir réinitialiser complètement le projet ?',
        default: false
      }
    ]);
    
    if (!confirm) {
      console.log(chalk.red('❌ Reset annulé'));
      return;
    }
  }
  
  // Options de reset
  const { resetOptions } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'resetOptions',
      message: 'Que voulez-vous réinitialiser ?',
      choices: [
        { name: 'src/app/ (votre projet)', value: 'app', checked: true },
        { name: 'public/ (fichiers générés)', value: 'build', checked: true },
        { name: 'src/framework/ (design system)', value: 'framework', checked: false }
      ]
    }
  ]);
  
  console.log(chalk.blue('\n🔄 Reset en cours...'));
  
  // Backup avant suppression
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  
  if (resetOptions.includes('app') && fse.existsSync('src/app')) {
    const backupDir = `reset-backup-app-${timestamp}`;
    fse.moveSync('src/app', backupDir);
    console.log(chalk.yellow(`📦 src/app/ sauvegardé dans ${backupDir}`));
  }
  
  if (resetOptions.includes('framework') && fse.existsSync('src/framework')) {
    const backupDir = `reset-backup-framework-${timestamp}`;
    fse.moveSync('src/framework', backupDir);
    console.log(chalk.yellow(`📦 src/framework/ sauvegardé dans ${backupDir}`));
  }
  
  // Suppressions
  if (resetOptions.includes('build')) {
    await deleteAsync(['public/**/*', '!public/.gitkeep']);
    console.log(chalk.green('✅ public/ nettoyé'));
  }
  
  if (resetOptions.includes('app')) {
    await deleteAsync(['src/app/**/*', '!src/app/.gitkeep']);
    console.log(chalk.green('✅ src/app/ nettoyé'));
  }
  
  if (resetOptions.includes('framework')) {
    await deleteAsync(['src/framework/**/*', '!src/framework/.gitkeep']);
    console.log(chalk.green('✅ src/framework/ nettoyé'));
  }
  
  console.log(chalk.green.bold('\n✅ Reset terminé !'));
  console.log(chalk.blue('\n📋 Prochaines étapes :'));
  console.log(chalk.gray('  1. npm run init:bootstrap (ou autre framework)'));
  console.log(chalk.gray('  2. npm run dev'));
  
  // Proposition d'initialisation
  if (resetOptions.includes('app')) {
    const { initNow } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'initNow',
        message: 'Voulez-vous initialiser un nouveau projet maintenant ?',
        default: true
      }
    ]);
    
    if (initNow) {
      console.log(chalk.blue('\n🚀 Lancement de l\'initialisation...'));
      
      const { execSync } = await import('child_process');
      try {
        execSync('node scripts/init-project.js', { stdio: 'inherit' });
      } catch (error) {
        console.log(chalk.yellow('\n⚠️ Lancez manuellement: npm run init'));
      }
    }
  }
}

main().catch(console.error);