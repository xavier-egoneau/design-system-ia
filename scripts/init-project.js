// scripts/init-project.js - Script d'initialisation interactif
import inquirer from 'inquirer';
import chalk from 'chalk';
import fse from 'fs-extra';
import path from 'path';
import { execSync } from 'child_process';

const frameworks = {
  bootstrap: {
    name: 'Bootstrap 5',
    package: 'bootstrap@^5.3.2',
    description: 'Framework CSS populaire avec composants prêts',
    hasJS: true,
    color: 'magenta'
  },
  dsfr: {
    name: 'DSFR (Système de Design de l\'État)',
    package: '@gouvfr/dsfr@^1.10.1',
    description: 'Design system officiel français',
    hasJS: true,
    color: 'blue'
  },
  tailwind: {
    name: 'Tailwind CSS',
    package: 'tailwindcss@^3.3.0',
    description: 'Framework utility-first (nécessite configuration)',
    hasJS: false,
    color: 'cyan'
  },
  bulma: {
    name: 'Bulma',
    package: 'bulma@^0.9.4',
    description: 'Framework CSS moderne sans JavaScript',
    hasJS: false,
    color: 'green'
  },
  foundation: {
    name: 'Foundation',
    package: 'foundation-sites@^6.7.5',
    description: 'Framework responsive professionnel',
    hasJS: true,
    color: 'yellow'
  },
  minimal: {
    name: 'CSS Minimal',
    package: null,
    description: 'Pas de framework, CSS custom seulement',
    hasJS: false,
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
  console.log(chalk.blue.bold('\n🚀 Initialisation du Design System\n'));
  
  // Vérifier les arguments de ligne de commande
  const args = process.argv.slice(2);
  const frameworkArg = args.find(arg => arg.startsWith('--framework='));
  const preselectedFramework = frameworkArg ? frameworkArg.split('=')[1] : null;
  
  // Vérifier si src/app/ existe déjà
  if (fse.existsSync('src/app') && fse.readdirSync('src/app').length > 0) {
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: chalk.yellow('Le dossier src/app/ existe déjà. Voulez-vous le réinitialiser ?'),
        default: false
      }
    ]);
    
    if (!confirm) {
      console.log(chalk.red('❌ Initialisation annulée'));
      return;
    }
    
    // Backup de l'ancien src/app/
    if (fse.existsSync('src/app')) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupDir = `src-app-backup-${timestamp}`;
      fse.moveSync('src/app', backupDir);
      console.log(chalk.yellow(`📦 Ancien src/app/ sauvegardé dans ${backupDir}`));
    }
  }
  
  // Choix du framework (ou présélectionné)
  let framework;
  if (preselectedFramework && frameworks[preselectedFramework]) {
    framework = preselectedFramework;
    const selectedFramework = frameworks[framework];
    console.log(getColoredText(`\n📦 Framework présélectionné: ${selectedFramework.name}`, selectedFramework.color));
  } else {
    const { selectedFramework } = await inquirer.prompt([
      {
        type: 'list',
        name: 'selectedFramework',
        message: 'Choisissez un framework CSS :',
        choices: Object.entries(frameworks).map(([key, config]) => ({
          name: `${config.name} - ${config.description}`,
          value: key,
          short: config.name
        }))
      }
    ]);
    framework = selectedFramework;
  }
  
  const selectedFramework = frameworks[framework];
  if (!preselectedFramework) {
    console.log(getColoredText(`\n📦 Framework choisi: ${selectedFramework.name}`, selectedFramework.color));
  }
  
  // Options additionnelles (skip si framework présélectionné)
  let options;
  if (preselectedFramework) {
    // Options par défaut pour les commandes rapides
    options = ['examples', 'install', 'homepage'];
    console.log(chalk.gray('✅ Options par défaut: composants d\'exemple + installation + page d\'accueil'));
  } else {
    const { selectedOptions } = await inquirer.prompt([
      {
        type: 'checkbox',
        name: 'selectedOptions',
        message: 'Options additionnelles :',
        choices: [
          { name: 'Créer des composants d\'exemple', value: 'examples', checked: true },
          { name: 'Installer les dépendances automatiquement', value: 'install', checked: true },
          { name: 'Créer une page d\'accueil de démo', value: 'homepage', checked: true }
        ]
      }
    ]);
    options = selectedOptions;
  }
  
  // Création de la structure
  await createProjectStructure(framework, selectedFramework, options);
  
  console.log(chalk.green.bold('\n✅ Projet initialisé avec succès !'));
  console.log(chalk.blue('\n📋 Prochaines étapes :'));
  
  if (selectedFramework.package && options.includes('install')) {
    console.log(chalk.gray('  1. Les dépendances sont en cours d\'installation...'));
  } else if (selectedFramework.package) {
    console.log(chalk.yellow('  1. cd src && npm install'));
  }
  
  console.log(chalk.gray('  2. npm run dev'));
  console.log(chalk.gray('  3. Ouvrir http://localhost:3000'));
}

async function createProjectStructure(frameworkKey, framework, options) {
  console.log(chalk.blue('\n📁 Création de la structure...'));
  
  // 1. Dossiers de base dans src/app/
  const dirs = [
    'src/app/atoms',
    'src/app/molecules', 
    'src/app/organisms',
    'src/app/pages',
    'src/app/tokens'
  ];
  
  dirs.forEach(dir => {
    fse.ensureDirSync(dir);
    console.log(chalk.gray(`   ✓ ${dir}/`));
  });
  
  // 2. Package.json du projet
  if (framework.package) {
    const packageJson = {
      name: "mon-design-system",
      version: "1.0.0",
      description: `Design system avec ${framework.name}`,
      dependencies: {
        [framework.package.split('@')[0]]: framework.package.split('@')[1]
      }
    };
    
    fse.outputFileSync('src/app/package.json', JSON.stringify(packageJson, null, 2));
    console.log(chalk.gray(`   ✓ src/app/package.json (${framework.name})`));
  }
  
  // 3. Design tokens dans src/app/
  const tokens = getTokensForFramework(frameworkKey);
  fse.outputFileSync('src/app/tokens/_variables.scss', tokens);
  console.log(chalk.gray('   ✓ src/app/tokens/_variables.scss'));
  
  // 4. Main SCSS dans src/app/
  const mainScss = `// Point d'entrée CSS du projet
@forward '../_generated';

// Styles custom du projet
body {
  margin: 0;
  font-family: system-ui, sans-serif;
}
`;
  fse.outputFileSync('src/app/main.scss', mainScss);
  console.log(chalk.gray('   ✓ src/app/main.scss'));
  
  // 5. Composants d'exemple
  if (options.includes('examples')) {
    await createExampleComponents(frameworkKey);
  }
  
  // 6. Page d'accueil
  if (options.includes('homepage')) {
    await createHomepage(frameworkKey);
  }
  
  // 7. Installation des dépendances dans src/app/
  if (framework.package && options.includes('install')) {
    console.log(chalk.blue('\n📥 Installation des dépendances...'));
    try {
      execSync('cd src/app && npm install', { stdio: 'inherit' });
      console.log(chalk.green('   ✓ Dépendances installées'));
    } catch (error) {
      console.log(chalk.yellow('   ⚠️ Erreur installation, installez manuellement avec: cd src/app && npm install'));
    }
  }
}

async function createExampleComponents(framework) {
  console.log(chalk.blue('\n🧩 Création des composants d\'exemple...'));
  
  // Button dans src/app/
  const button = getButtonForFramework(framework);
  const buttonDir = 'src/app/atoms/button';
  fse.ensureDirSync(buttonDir);
  fse.outputFileSync(`${buttonDir}/button.comp.json`, button.json);
  fse.outputFileSync(`${buttonDir}/button.twig`, button.twig);
  fse.outputFileSync(`${buttonDir}/_button.scss`, button.scss);
  console.log(chalk.gray('   ✓ Button (atom)'));
  
  // Input dans src/app/
  const input = getInputForFramework(framework);
  const inputDir = 'src/app/atoms/input';
  fse.ensureDirSync(inputDir);
  fse.outputFileSync(`${inputDir}/input.comp.json`, input.json);
  fse.outputFileSync(`${inputDir}/input.twig`, input.twig);
  fse.outputFileSync(`${inputDir}/_input.scss`, input.scss);
  console.log(chalk.gray('   ✓ Input (atom)'));
  
  // Alert dans src/app/
  const alert = getAlertForFramework(framework);
  const alertDir = 'src/app/molecules/alert';
  fse.ensureDirSync(alertDir);
  fse.outputFileSync(`${alertDir}/alert.comp.json`, alert.json);
  fse.outputFileSync(`${alertDir}/alert.twig`, alert.twig);
  fse.outputFileSync(`${alertDir}/_alert.scss`, alert.scss);
  console.log(chalk.gray('   ✓ Alert (molecule)'));
  
  // Card dans src/app/
  const card = getCardForFramework(framework);
  const cardDir = 'src/app/molecules/card';
  fse.ensureDirSync(cardDir);
  fse.outputFileSync(`${cardDir}/card.comp.json`, card.json);
  fse.outputFileSync(`${cardDir}/card.twig`, card.twig);
  fse.outputFileSync(`${cardDir}/_card.scss`, card.scss);
  console.log(chalk.gray('   ✓ Card (molecule)'));
}

async function createHomepage(framework) {
  const homepage = `{# Page d'accueil du design system #}
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Mon Design System - ${frameworks[framework].name}</title>
  <link rel="stylesheet" href="{{ cssFramework }}">
  <link rel="stylesheet" href="{{ cssProject }}">
</head>
<body>
  <div class="container mt-5">
    <header class="text-center mb-5">
      <h1>🎨 Mon Design System</h1>
      <p class="lead">Powered by ${frameworks[framework].name}</p>
    </header>
    
    <div class="row">
      <div class="col-md-6 mb-4">
        <h2>Exemples de composants</h2>
        
        {% include "@atoms/button/button.twig" with {
          variant: "primary",
          text: "Bouton principal"
        } %}
        
        {% include "@atoms/button/button.twig" with {
          variant: "secondary",
          text: "Bouton secondaire"
        } %}
        
        {% include "@molecules/alert/alert.twig" with {
          type: "info",
          message: "Voici une alerte d'information"
        } %}
      </div>
      
      <div class="col-md-6">
        <h2>Navigation</h2>
        <ul class="list-unstyled">
          <li><a href="/atoms/index.html">⚛️ Atoms</a></li>
          <li><a href="/molecules/index.html">🧬 Molecules</a></li>
          <li><a href="/organisms/index.html">🦠 Organisms</a></li>
        </ul>
      </div>
    </div>
  </div>
  
  {{ jsBody|raw }}
</body>
</html>`;
  
  fse.outputFileSync('src/app/pages/index.twig', homepage);
  console.log(chalk.gray('   ✓ src/app/pages/index.twig'));
}

// Fonctions helper pour les composants (versions simplifiées)
function getTokensForFramework(framework) {
  const tokens = {
    bootstrap: `// Bootstrap Design Tokens
$primary: #0d6efd !default;
$secondary: #6c757d !default;
$success: #198754 !default;
$info: #0dcaf0 !default;
$warning: #ffc107 !default;
$danger: #dc3545 !default;

$spacer: 1rem !default;
$border-radius: 0.375rem !default;
$font-size-base: 1rem !default;`,

    dsfr: `// DSFR Design Tokens
$color-blue-france: #000091 !default;
$color-red-marianne: #e1000f !default;
$color-green-tilleul-verveine: #b7a73f !default;
$color-green-menthe: #009081 !default;

$spacing-1: 0.25rem !default;
$spacing-2: 0.5rem !default;
$spacing-3: 0.75rem !default;
$spacing-4: 1rem !default;
$spacing-5: 1.25rem !default;

$font-size-xs: 0.75rem !default;
$font-size-sm: 0.875rem !default;
$font-size-md: 1rem !default;
$font-size-lg: 1.125rem !default;`,

    minimal: `// Design Tokens Minimaux
$color-primary: #007bff !default;
$color-secondary: #6c757d !default;
$color-success: #28a745 !default;
$color-warning: #ffc107 !default;
$color-danger: #dc3545 !default;
$color-info: #17a2b8 !default;

$spacing-xs: 0.25rem !default;
$spacing-sm: 0.5rem !default;
$spacing-md: 1rem !default;
$spacing-lg: 1.5rem !default;
$spacing-xl: 2rem !default;

$font-size-sm: 0.875rem !default;
$font-size-base: 1rem !default;
$font-size-lg: 1.125rem !default;

$border-radius: 0.375rem !default;
$border-width: 1px !default;`
  };
  
  return tokens[framework] || tokens.minimal;
}

function getButtonForFramework(framework) {
  // ... (même contenu que précédemment)
  const buttons = {
    bootstrap: {
      json: JSON.stringify({
        name: "Button",
        type: "atom",
        variables: {
          variant: { type: "string", enum: ["primary", "secondary", "success", "danger"], default: "primary" },
          size: { type: "string", enum: ["sm", "md", "lg"], default: "md" },
          text: { type: "string", default: "Button" },
          disabled: { type: "boolean", default: false }
        },
        variants: [
          { name: "Primary", props: { variant: "primary", text: "Bouton principal" } },
          { name: "Secondary", props: { variant: "secondary", text: "Bouton secondaire" } }
        ]
      }, null, 2),
      twig: `<button 
  class="btn btn-{{ variant }}{% if size != 'md' %} btn-{{ size }}{% endif %}"
  {% if disabled %}disabled{% endif %}
  type="button"
>
  {{ text }}
</button>`,
      scss: `@use '../../tokens/variables' as *;

// Bootstrap fournit déjà les styles .btn
// Ajouts custom si nécessaire
.btn {
  // Styles additionnels
}`
    },
    // ... autres frameworks
  };
  
  return buttons[framework] || buttons.minimal;
}

function getInputForFramework(framework) {
  // Composant Input adapté au framework
  return {
    json: JSON.stringify({
      name: "Input",
      type: "atom", 
      variables: {
        type: { type: "string", default: "text" },
        placeholder: { type: "string", default: "Entrez votre texte" },
        disabled: { type: "boolean", default: false }
      },
      variants: [
        { name: "Text", props: { type: "text", placeholder: "Texte" } },
        { name: "Email", props: { type: "email", placeholder: "email@exemple.com" } }
      ]
    }, null, 2),
    twig: framework === 'bootstrap' ? 
      `<input class="form-control" type="{{ type }}" placeholder="{{ placeholder }}" {% if disabled %}disabled{% endif %}>` :
      framework === 'dsfr' ?
      `<input class="fr-input" type="{{ type }}" placeholder="{{ placeholder }}" {% if disabled %}disabled{% endif %}>` :
      `<input class="input" type="{{ type }}" placeholder="{{ placeholder }}" {% if disabled %}disabled{% endif %}>`,
    scss: `@use '../../tokens/variables' as *;

// Framework fournit les styles de base
.input {
  // Styles custom si framework minimal
}`
  };
}

function getAlertForFramework(framework) {
  // Composant Alert adapté au framework
  return {
    json: JSON.stringify({
      name: "Alert",
      type: "molecule",
      variables: {
        type: { type: "string", enum: ["info", "success", "warning", "danger"], default: "info" },
        message: { type: "string", default: "Message d'alerte" }
      },
      variants: [
        { name: "Info", props: { type: "info", message: "Information importante" } },
        { name: "Success", props: { type: "success", message: "Opération réussie" } }
      ]
    }, null, 2),
    twig: framework === 'bootstrap' ? 
      `<div class="alert alert-{{ type }}" role="alert">{{ message }}</div>` :
      framework === 'dsfr' ?
      `<div class="fr-alert fr-alert--{{ type }}"><p>{{ message }}</p></div>` :
      `<div class="alert alert--{{ type }}">{{ message }}</div>`,
    scss: `@use '../../tokens/variables' as *;

// Framework fournit les styles de base`
  };
}

function getCardForFramework(framework) {
  // Composant Card adapté au framework  
  return {
    json: JSON.stringify({
      name: "Card",
      type: "molecule",
      variables: {
        title: { type: "string", default: "Titre de la carte" },
        content: { type: "string", default: "Contenu de la carte" }
      },
      variants: [
        { name: "Basic", props: { title: "Carte basique", content: "Contenu simple" } }
      ]
    }, null, 2),
    twig: framework === 'bootstrap' ? 
      `<div class="card"><div class="card-body"><h5 class="card-title">{{ title }}</h5><p class="card-text">{{ content }}</p></div></div>` :
      framework === 'dsfr' ?
      `<div class="fr-card"><div class="fr-card__body"><h4 class="fr-card__title">{{ title }}</h4><p class="fr-card__desc">{{ content }}</p></div></div>` :
      `<div class="card"><div class="card__header"><h3>{{ title }}</h3></div><div class="card__content"><p>{{ content }}</p></div></div>`,
    scss: `@use '../../tokens/variables' as *;

// Framework fournit les styles de base`
  };
}

// Lancement du script
main().catch(console.error);