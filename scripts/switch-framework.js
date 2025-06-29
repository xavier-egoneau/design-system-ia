// scripts/switch-framework.js - Script pour changer de framework
import inquirer from 'inquirer';
import chalk from 'chalk';
import fse from 'fs-extra';
import { execSync } from 'child_process';

const frameworks = {
  bootstrap: {
    name: 'Bootstrap 5',
    package: 'bootstrap@^5.3.2',
    color: 'magenta'
  },
  dsfr: {
    name: 'DSFR (Système de Design de l\'État)',
    package: '@gouvfr/dsfr@^1.10.1',
    color: 'blue'
  },
  tailwind: {
    name: 'Tailwind CSS',
    package: 'tailwindcss@^3.3.0',
    color: 'cyan'
  },
  bulma: {
    name: 'Bulma',
    package: 'bulma@^0.9.4',
    color: 'green'
  },
  foundation: {
    name: 'Foundation',
    package: 'foundation-sites@^6.7.5',
    color: 'yellow'
  },
  minimal: {
    name: 'CSS Minimal',
    package: null,
    color: 'gray'
  }
};

// Fonction helper pour appliquer les couleurs de manière sécurisée
function getColoredText(text, color) {
  switch (color) {
    case 'magenta': return chalk.magenta(text);
    case 'blue': return chalk.blue(text);
    case 'cyan': return chalk.cyan(text);
    case 'green': return chalk.green(text);
    case 'yellow': return chalk.yellow(text);
    case 'gray': return chalk.gray(text);
    default: return chalk.white(text);
  }
}

async function main() {
  console.log(chalk.blue.bold('\n🔄 Changement de Framework\n'));
  
  // Détecter le framework actuel
  let currentFramework = 'inconnu';
  if (fse.existsSync('src/app/package.json')) {
    try {
      const packageJson = JSON.parse(fse.readFileSync('src/app/package.json', 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      for (const [key, config] of Object.entries(frameworks)) {
        if (config.package && deps[config.package.split('@')[0]]) {
          currentFramework = config.name;
          break;
        }
      }
    } catch (e) {
      // Ignore
    }
  }
  
  console.log(chalk.gray(`Framework actuel: ${currentFramework}`));
  
  // Choix du nouveau framework
  const { framework } = await inquirer.prompt([
    {
      type: 'list',
      name: 'framework',
      message: 'Choisissez le nouveau framework :',
      choices: Object.entries(frameworks).map(([key, config]) => ({
        name: config.name,
        value: key
      }))
    }
  ]);
  
  const selectedFramework = frameworks[framework];
  console.log(getColoredText(`\n🎯 Nouveau framework: ${selectedFramework.name}`, selectedFramework.color));
  
  // Confirmation
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Voulez-vous continuer ? (Cela va modifier package.json)',
      default: true
    }
  ]);
  
  if (!confirm) {
    console.log(chalk.red('❌ Changement annulé'));
    return;
  }
  
  // Mise à jour du package.json
  if (selectedFramework.package) {
    console.log(chalk.blue('\n📝 Mise à jour de package.json...'));
    
    // Créer ou mettre à jour package.json
    let packageJson = { name: "design-system-project", version: "1.0.0", dependencies: {} };
    
    if (fse.existsSync('src/app/package.json')) {
      packageJson = JSON.parse(fse.readFileSync('src/app/package.json', 'utf8'));
    }
    
    // Supprimer les anciens frameworks
    Object.values(frameworks).forEach(fw => {
      if (fw.package) {
        const packageName = fw.package.split('@')[0];
        delete packageJson.dependencies[packageName];
        delete packageJson.devDependencies?.[packageName];
      }
    });
    
    // Ajouter le nouveau framework
    packageJson.dependencies[selectedFramework.package.split('@')[0]] = selectedFramework.package.split('@')[1];
    
    fse.ensureDirSync('src/app');
    fse.outputFileSync('src/app/package.json', JSON.stringify(packageJson, null, 2));
    console.log(chalk.green('   ✓ package.json mis à jour'));
    
    // Installation
    const { install } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'install',
        message: 'Installer les dépendances maintenant ?',
        default: true
      }
    ]);
    
    if (install) {
      console.log(chalk.blue('\n📥 Installation...'));
      try {
        execSync('cd src/app && npm install', { stdio: 'inherit' });
        console.log(chalk.green('   ✓ Installation réussie'));
      } catch (error) {
        console.log(chalk.yellow('   ⚠️ Erreur installation, installez manuellement: cd src/app && npm install'));
      }
    }
  } else {
    console.log(chalk.gray('\n📝 Framework minimal sélectionné (aucun package à installer)'));
  }
  
  // Rebuild
  const { rebuild } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'rebuild',
      message: 'Rebuilder le design system maintenant ?',
      default: true
    }
  ]);
  
  if (rebuild) {
    console.log(chalk.blue('\n🔨 Rebuild...'));
    try {
      execSync('npm run build', { stdio: 'inherit' });
      console.log(chalk.green('   ✓ Rebuild terminé'));
    } catch (error) {
      console.log(chalk.yellow('   ⚠️ Erreur rebuild, lancez manuellement: npm run build'));
    }
  }
  
  console.log(chalk.green.bold('\n✅ Changement de framework terminé !'));
  console.log(chalk.blue('\n📋 Prochaines étapes :'));
  console.log(chalk.gray('  1. npm run dev'));
  console.log(chalk.gray('  2. Vérifier http://localhost:3000'));
  
  if (!rebuild) {
    console.log(chalk.yellow('  3. npm run build (si pas fait automatiquement)'));
  }
}

main().catch(console.error);