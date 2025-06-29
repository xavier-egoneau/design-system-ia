// tasks/demos.js - Version complète avec assets et formulaires restaurés
import gulp from 'gulp';
import path from 'path';
import fse  from 'fs-extra';
import { globSync } from 'glob';
import { paths } from './paths.js';
import {
  TwingEnvironment,
  TwingLoaderFilesystem
} from 'twing';

const loader = new TwingLoaderFilesystem([
  paths.twingRoot,
  process.cwd()
]);

loader.addPath(path.join(paths.twingRoot, 'atoms'),     'atoms');
loader.addPath(path.join(paths.twingRoot, 'molecules'), 'molecules');
loader.addPath(path.join(paths.twingRoot, 'organisms'), 'organisms');

const env = new TwingEnvironment(loader);

/* ─── Lecture des métadonnées ──────────────────────────────────────────── */
function readComponentMetadata(componentDir) {
  const compName = path.basename(componentDir);
  const metaPath = path.join(componentDir, `${compName}.comp.json`);
  
  try {
    const content = fse.readFileSync(metaPath, 'utf8');
    return JSON.parse(content);
  } catch (e) {
    console.warn(`⚠️  No metadata found for ${compName}`);
    return null;
  }
}

/* ─── Assets pour l'APP - Version complète ──────────────────────────────── */
function ensureAppAssets() {
  const cssDir = path.join(paths.build, 'css');
  const jsDir = path.join(paths.build, 'js');
  
  // Créer les dossiers
  fse.ensureDirSync(cssDir);
  fse.ensureDirSync(jsDir);
  
  const appCSSPath = path.join(cssDir, 'app.css');
  const appJSPath = path.join(jsDir, 'app-playground.js');
  const projectJSPath = path.join(jsDir, 'project-iframe.js');
  
  // Ne recréer que si les fichiers n'existent pas ou sont vides
  if (!fse.existsSync(appCSSPath) || fse.statSync(appCSSPath).size === 0) {
    console.log('📄 Creating app.css...');
    fse.outputFileSync(appCSSPath, getAppCSS());
  }
  
  if (!fse.existsSync(appJSPath) || fse.statSync(appJSPath).size === 0) {
    console.log('📄 Creating app-playground.js...');
    fse.outputFileSync(appJSPath, getAppJS());
  }
  
  if (!fse.existsSync(projectJSPath) || fse.statSync(projectJSPath).size === 0) {
    console.log('📄 Creating project-iframe.js...');
    fse.outputFileSync(projectJSPath, getProjectJS());
  }
}

function getAppCSS() {
  return `
/* CSS APP - Interface design system playground */
.demo-container {

  margin: 0 auto;
  padding: 2rem;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
  background: #f8f9fa;
}

.demo-header {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.demo-header h1 {
  margin: 0 0 0.5rem 0;
  color: #212529;
}

.demo-header .meta {
  color: #6c757d;
  font-size: 0.9rem;
}

.demo-main {
  display: grid;
  grid-template-columns: 1fr 350px;
  gap: 2rem;
  align-items: start;
}

.demo-preview {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  overflow: hidden;
}

.component-iframe {
  width: 100%;
  border: none;
  min-height: 300px;
  background: white;
  border-radius: 4px;
}

.demo-controls {
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  padding: 1.5rem;
  position: sticky;
  top: 2rem;
}

.demo-controls h3 {
  margin: 0 0 1rem 0;
  color: #495057;
}

.demo-controls p {
  margin: 0 0 1.5rem 0;
  color: #6c757d;
  font-size: 0.9rem;
}

.form-group { 
  margin-bottom: 1.5rem; 
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
  font-size: 0.9rem;
}

.form-control {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.9rem;
  transition: border-color 0.15s ease-in-out;
  box-sizing: border-box;
  background: white;
}

.form-control:focus {
  outline: none;
  border-color: #80bdff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.form-check {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
}

.form-check input {
  margin-right: 0.5rem;
}

.back-link {
  display: inline-block;
  margin-bottom: 1rem;
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 0.9rem;
}

.back-link:hover { 
  background: #0056b3; 
  color: white;
  text-decoration: none;
}

@media (max-width: 768px) {
  .demo-main { 
    grid-template-columns: 1fr; 
  }
  .demo-controls { 
    position: static; 
  }
}

/* Debug info */
.component-info {
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #dee2e6;
  font-size: 0.85rem;
  color: #6c757d;
}
`;
}

function getAppJS() {
  return `
class ComponentPlayground {
  constructor() {
    this.iframe = null;
    this.currentProps = {};
    this.componentConfig = window.componentConfig || {};
    this.init();
  }
  
  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.iframe = document.getElementById('component-iframe');
      this.generateForm();
      this.loadDefaults();
      
      // Attendre que l'iframe soit chargée
      if (this.iframe) {
        this.iframe.addEventListener('load', () => {
          setTimeout(() => this.updateComponent(), 100);
        });
      }
      
      window.addEventListener('message', (event) => {
        if (event.data.type === 'IFRAME_READY') {
          this.updateComponent();
        }
      });
    });
  }
  
  generateForm() {
    const form = document.getElementById('component-form');
    if (!form) {
      console.warn('Form element not found');
      return;
    }
    
    const variables = this.componentConfig.variables || {};
    
    if (Object.keys(variables).length === 0) {
      form.innerHTML = '<p style="color: #6c757d; font-style: italic;">Aucune variable configurable</p>';
      return;
    }
    
    Object.entries(variables).forEach(([key, config]) => {
      const group = document.createElement('div');
      group.className = 'form-group';
      
      let input;
      
      if (config.type === 'boolean') {
        const wrapper = document.createElement('div');
        wrapper.className = 'form-check';
        
        input = document.createElement('input');
        input.type = 'checkbox';
        input.checked = config.default || false;
        
        const label = document.createElement('label');
        label.className = 'form-label';
        label.textContent = key;
        
        wrapper.appendChild(input);
        wrapper.appendChild(label);
        group.appendChild(wrapper);
      } else {
        const label = document.createElement('label');
        label.className = 'form-label';
        label.textContent = key;
        group.appendChild(label);
        
        if (config.enum) {
          input = document.createElement('select');
          input.className = 'form-control';
          
          config.enum.forEach((option) => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option;
            opt.selected = option === config.default;
            input.appendChild(opt);
          });
        } else {
          input = document.createElement('input');
          input.className = 'form-control';
          input.type = config.type === 'number' ? 'number' : 'text';
          input.value = config.default || '';
          input.placeholder = config.default || '';
        }
        
        group.appendChild(input);
      }
      
      input.id = key;
      input.addEventListener('change', () => this.updateComponent());
      input.addEventListener('input', () => this.updateComponent());
      
      form.appendChild(group);
    });
  }
  
  loadDefaults() {
    const variables = this.componentConfig.variables || {};
    Object.entries(variables).forEach(([key, config]) => {
      this.currentProps[key] = config.default;
    });
  }
  
  updateComponent() {
    // Collecter les valeurs actuelles du formulaire
    Object.entries(this.componentConfig.variables || {}).forEach(([key, config]) => {
      const input = document.getElementById(key);
      if (input) {
        if (config.type === 'boolean') {
          this.currentProps[key] = input.checked;
        } else {
          this.currentProps[key] = input.value || config.default || '';
        }
      }
    });
    
    // Envoyer les props à l'iframe
    if (this.iframe && this.iframe.contentWindow) {
      try {
        this.iframe.contentWindow.postMessage({
          type: 'UPDATE_COMPONENT',
          props: this.currentProps,
          templatePath: this.componentConfig.templatePath
        }, '*');
      } catch (e) {
        console.warn('Could not send message to iframe:', e);
      }
    }
  }
}

// Initialiser le playground
new ComponentPlayground();
`;
}

function getProjectJS() {
  return `
class IframeRenderer {
  constructor() {
    this.init();
  }
  
  init() {
    window.addEventListener('message', (event) => {
      if (event.data.type === 'UPDATE_COMPONENT') {
        this.renderComponent(event.data.props, event.data.templatePath);
      }
    });
    
    // Notifier au parent que l'iframe est prête
    this.notifyReady();
  }
  
  notifyReady() {
    try {
      window.parent.postMessage({ type: 'IFRAME_READY' }, '*');
    } catch (e) {
      console.log('Could not notify parent');
    }
  }
  
  async renderComponent(props, templatePath) {
    try {
      const response = await fetch('http://localhost:3001/api/render-component', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ template: templatePath, props })
      });
      
      if (response.ok) {
        const data = await response.json();
        const renderEl = document.getElementById('component-render');
        if (renderEl) {
          renderEl.innerHTML = data.html;
        }
      } else {
        this.showError('Erreur de rendu du composant');
      }
    } catch (error) {
      this.showError('Erreur de communication avec l\\'API: ' + error.message);
    }
  }
  
  showError(message) {
    const renderEl = document.getElementById('component-render');
    if (renderEl) {
      renderEl.innerHTML = 
        '<div style="padding: 1rem; color: #dc3545; border: 1px solid #dc3545; border-radius: 4px; background: #f8d7da;">' + 
        message + 
        '</div>';
    }
  }
}

// Initialiser seulement dans une iframe
if (window.parent !== window) {
  document.addEventListener('DOMContentLoaded', () => {
    new IframeRenderer();
  });
}
`;
}

/* ─── Builder pour COMPOSANTS avec assets garantis ──────────────────────── */
function createComponentDemoBuilder(cat) {
  return async function buildCategoryDemos() {
    if (cat === 'pages') {
      console.log(`⏩ Skipping ${cat} - handled by templates task`);
      return Promise.resolve();
    }
    
    ensureAppAssets();
    
    // 🔄 CHANGEMENT : Nouveau chemin
    const files = globSync(`src/app/${cat}/*/*.twig`, { nodir: true });
    console.log(`🔧 Building ${cat}: ${files.length} components found`);

    for (const file of files) {
      // 🔄 CHANGEMENT : Nouveau calcul du chemin relatif
      const tplName = path.relative('src/app', file).replace(/\\/g, '/');
      const compName = path.basename(path.dirname(file));
      const compDir = path.dirname(file);
      const title = `${cat.slice(0, -1)} : ${compName}`;
      
      const metadata = readComponentMetadata(compDir);
      
      if (!metadata) {
        console.warn(`⏩ skip ${tplName} (pas de métadonnées)`);
        continue;
      }

      // Rendu initial pour récupérer le HTML
      let snippet;
      try {
        const defaultProps = {};
        if (metadata.variables) {
          Object.entries(metadata.variables).forEach(([key, config]) => {
            defaultProps[key] = config.default;
          });
        }
        
        if (metadata.variants && metadata.variants.length > 0) {
          Object.assign(defaultProps, metadata.variants[0].props || {});
        }
        
        snippet = await env.render(tplName, defaultProps);
      } catch (e) {
        console.warn(`⏩ skip ${tplName} (${e.message})`);
        continue;
      }

      const templateData = {
        title,
        content: snippet,
        componentName: compName,
        componentType: metadata.type,
        componentCategory: cat,
        templatePath: `@${cat}/${compName}/${compName}.twig`,
        componentVariables: JSON.stringify(metadata.variables || {}),
        componentVariants: JSON.stringify(metadata.variants || [])
      };
      
      try {
        // 1. Interface APP avec iframe
        const appHtml = await env.render('system/templates/__wrapper-component.twig', templateData);
        const appPath = path.join(paths.build, `${cat}/${compName}.html`);
        fse.outputFileSync(appPath, appHtml);
        
        // 2. Contenu PROJET isolé  
        const projectHtml = await env.render('system/templates/__iframe-project.twig', templateData);
        const projectPath = path.join(paths.build, `${cat}/render/${compName}.html`);
        fse.ensureDirSync(path.dirname(projectPath));
        fse.outputFileSync(projectPath, projectHtml);
        
        console.log(`✅ Generated component with isolation: ${compName}`);
      } catch (error) {
        console.error(`❌ Error generating component ${compName}:`, error.message);
      }
    }
  };
}

/* ─── Builder pour PAGES séparé ────────────────────────────────────────── */
function buildPagesDemo() {
  console.log('📄 Pages demo (handled by templates task)');
  return Promise.resolve();
}

export const atomsDemo      = createComponentDemoBuilder('atoms');
export const moleculesDemo  = createComponentDemoBuilder('molecules');
export const organismsDemo  = createComponentDemoBuilder('organisms');
export const pagesDemo      = buildPagesDemo;

export const demos = gulp.parallel(atomsDemo, moleculesDemo, organismsDemo, pagesDemo);