// tasks/framework-detection.js - Système auto de détection des frameworks
import fse from 'fs-extra';
import path from 'path';
import { paths } from './paths.js';

/**
 * Détecte automatiquement les frameworks CSS/JS installés
 */
export class FrameworkDetector {
  constructor() {
    this.projectPackagePath = path.join('src/app', 'package.json');  // 🔄 Changé
    this.rootPackagePath = path.join(process.cwd(), 'package.json');
    this.frameworks = this.detectFrameworks();
  }

  /**
   * Détecte les frameworks installés en analysant package.json
   */
  detectFrameworks() {
    const detected = {
      css: null,
      js: null,
      meta: {}
    };

    // Chercher d'abord dans src/package.json puis dans la racine
    const packagePaths = [this.projectPackagePath, this.rootPackagePath];
    
    for (const packagePath of packagePaths) {
      if (fse.existsSync(packagePath)) {
        try {
          const packageJson = JSON.parse(fse.readFileSync(packagePath, 'utf8'));
          const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
          
          // Détection Bootstrap
          if (deps.bootstrap) {
            detected.css = 'bootstrap';
            detected.js = 'bootstrap';
            detected.meta.bootstrap = {
              version: deps.bootstrap,
              cssUrl: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css',
              jsUrl: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js',
              localCss: 'node_modules/bootstrap/dist/css/bootstrap.min.css',
              localJs: 'node_modules/bootstrap/dist/js/bootstrap.bundle.min.js',
              scssEntry: 'node_modules/bootstrap/scss/bootstrap.scss'
            };
            break;
          }
          
          // Détection DSFR
          if (deps['@gouvfr/dsfr']) {
            detected.css = 'dsfr';
            detected.js = 'dsfr';
            detected.meta.dsfr = {
              version: deps['@gouvfr/dsfr'],
              cssUrl: 'https://cdn.jsdelivr.net/npm/@gouvfr/dsfr@1.10.1/dist/dsfr.min.css',
              jsUrl: 'https://cdn.jsdelivr.net/npm/@gouvfr/dsfr@1.10.1/dist/dsfr.module.js',
              localCss: 'node_modules/@gouvfr/dsfr/dist/dsfr.min.css',
              localJs: 'node_modules/@gouvfr/dsfr/dist/dsfr.module.js',
              scssEntry: 'node_modules/@gouvfr/dsfr/dist/dsfr.scss'
            };
            break;
          }
          
          // Détection Tailwind
          if (deps.tailwindcss) {
            detected.css = 'tailwind';
            detected.meta.tailwind = {
              version: deps.tailwindcss,
              cssUrl: 'https://cdn.tailwindcss.com',
              buildRequired: true // Tailwind nécessite un build
            };
            break;
          }
          
          // Détection Bulma
          if (deps.bulma) {
            detected.css = 'bulma';
            detected.meta.bulma = {
              version: deps.bulma,
              cssUrl: 'https://cdn.jsdelivr.net/npm/bulma@0.9.4/css/bulma.min.css',
              localCss: 'node_modules/bulma/css/bulma.min.css',
              scssEntry: 'node_modules/bulma/bulma.sass'
            };
            break;
          }
          
          // Détection Foundation
          if (deps['foundation-sites']) {
            detected.css = 'foundation';
            detected.js = 'foundation';
            detected.meta.foundation = {
              version: deps['foundation-sites'],
              cssUrl: 'https://cdn.jsdelivr.net/npm/foundation-sites@6.7.5/dist/css/foundation.min.css',
              jsUrl: 'https://cdn.jsdelivr.net/npm/foundation-sites@6.7.5/dist/js/foundation.min.js',
              localCss: 'node_modules/foundation-sites/dist/css/foundation.min.css',
              localJs: 'node_modules/foundation-sites/dist/js/foundation.min.js'
            };
            break;
          }
          
        } catch (e) {
          console.warn(`⚠️ Erreur lecture ${packagePath}`);
        }
      }
    }

    console.log(`🔍 Framework détecté: ${detected.css || 'aucun'}`);
    return detected;
  }

  /**
   * Génère le CSS du framework automatiquement
   */
  generateFrameworkCSS() {
    if (!this.frameworks.css) {
      return `/* Aucun framework CSS détecté */
body {
  font-family: system-ui, -apple-system, sans-serif;
  margin: 0;
  line-height: 1.5;
}

* {
  box-sizing: border-box;
}

/* Classes utilitaires de base */
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.btn {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  border: none;
  cursor: pointer;
}

.btn:hover {
  background: #0056b3;
}
`;
    }

    const framework = this.frameworks.css;
    const meta = this.frameworks.meta[framework];

    // Vérifier si le fichier local existe dans src/app/
    const localPath = path.join('src/app', meta.localCss);  // 🔄 Changé
    
    if (fse.existsSync(localPath)) {
      console.log(`📦 Utilisation ${framework} local: ${meta.localCss}`);
      return `@import '${meta.localCss}';`;
    } else {
      console.log(`🌐 Utilisation ${framework} CDN: ${meta.cssUrl}`);
      return `@import url('${meta.cssUrl}');`;
    }
  }

getTemplateVariables() {
  const framework = this.frameworks.css;
  
  const configs = {
    bootstrap: {
      name: 'bootstrap',
      css: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/css/bootstrap.min.css',
      js: 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.7/dist/js/bootstrap.bundle.min.js'
    },
    dsfr: {
      name: 'dsfr', 
      css: 'https://cdn.jsdelivr.net/npm/@gouvfr/dsfr@1.10.1/dist/dsfr.min.css',
      js: 'https://cdn.jsdelivr.net/npm/@gouvfr/dsfr@1.10.1/dist/dsfr.module.js'
    }
  };

  return {
    framework: configs[framework] || { name: 'minimal', css: null, js: null }
  };
}

  /**
   * Génère les scripts JS du framework
   */
  generateFrameworkJS() {
    if (!this.frameworks.js) {
      return {
        head: '',
        body: '<!-- Aucun framework JS détecté -->'
      };
    }

    const framework = this.frameworks.js;
    const meta = this.frameworks.meta[framework];
    
    // Vérifier si le fichier local existe dans src/app/
    const localPath = path.join('src/app', meta.localJs);  // 🔄 Changé
    
    if (fse.existsSync(localPath)) {
      return {
        head: '',
        body: `<script src="/${meta.localJs}"></script>`
      };
    } else {
      return {
        head: '',
        body: `<script src="${meta.jsUrl}"></script>`
      };
    }
  }

  /**
   * Génère un framework.scss automatique
   */
  updateFrameworkScss() {
    const frameworkPath = path.join('src/framework', 'framework.scss');  // 🔄 Changé
    const content = this.generateFrameworkCSS();
    
    fse.outputFileSync(frameworkPath, content);
    console.log(`✅ framework.scss généré avec ${this.frameworks.css || 'CSS minimal'}`);
  }

  /**
   * Met à jour les templates avec les scripts appropriés
   */
  getTemplateAssets() {
    const js = this.generateFrameworkJS();
    
    return {
      framework: this.frameworks.css || 'minimal',
      cssFramework: '/css/framework.css',
      cssProject: '/css/main.css',
      jsHead: js.head,
      jsBody: js.body,
      meta: this.frameworks.meta
    };
  }

  /**
   * Vérifie si les dépendances sont installées
   */
  checkDependencies() {
    const missing = [];
    
    if (this.frameworks.css && this.frameworks.css !== 'minimal') {
      const framework = this.frameworks.css;
      const meta = this.frameworks.meta[framework];
      
      if (meta.localCss) {
        const localPath = path.join('src/app', meta.localCss);  // 🔄 Changé
        if (!fse.existsSync(localPath)) {
          missing.push({
            framework,
            file: meta.localCss,
            suggestion: `Installez avec: npm install ${framework}`
          });
        }
      }
    }
    
    return missing;
  }
}

/**
 * Task Gulp pour initialiser le framework
 */
export function initFramework(done) {
  const detector = new FrameworkDetector();
  
  // Mettre à jour framework.scss
  detector.updateFrameworkScss();
  
  // Vérifier les dépendances
  const missing = detector.checkDependencies();
  if (missing.length > 0) {
    console.warn('⚠️ Dépendances manquantes:');
    missing.forEach(dep => {
      console.warn(`   - ${dep.file}`);
      console.warn(`     💡 ${dep.suggestion}`);
    });
  }
  
  done();
}

// Export pour utilisation dans d'autres tâches
export const frameworkDetector = new FrameworkDetector();