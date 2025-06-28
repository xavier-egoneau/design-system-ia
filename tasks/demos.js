import gulp from 'gulp';
import path from 'path';
import fse  from 'fs-extra';
import { globSync } from 'glob';
import { paths } from './paths.js';
import {
  TwingEnvironment,
  TwingLoaderFilesystem
} from 'twing';

/* ─── Loader partagé ──────────────────────────────────────────────────── */
const loader = new TwingLoaderFilesystem([
  paths.twingRoot,   // …/src
  process.cwd()      // racine du projet
]);

loader.addPath(path.join(paths.twingRoot, 'atoms'),     'atoms');
loader.addPath(path.join(paths.twingRoot, 'molecules'), 'molecules');
loader.addPath(path.join(paths.twingRoot, 'organisms'), 'organisms');

const env = new TwingEnvironment(loader);

/* ─── Lecture des métadonnées d'un composant ──────────────────────────── */
function readComponentMetadata(componentDir) {
  const compName = path.basename(componentDir);
  const metaPath = path.join(componentDir, `${compName}.comp.json`);
  
  try {
    const content = fse.readFileSync(metaPath, 'utf8');
    return JSON.parse(content);
  } catch (e) {
    // Fallback pour les anciens formats
    const legacyPath = path.join(componentDir, `${compName}.json`);
    try {
      const content = fse.readFileSync(legacyPath, 'utf8');
      const legacy = JSON.parse(content);
      
      // Convertir l'ancien format vers le nouveau
      return {
        name: legacy.name,
        type: legacy.category,
        variables: convertLegacyProps(legacy.props),
        variants: legacy.variants || [],
        twig: `${compName}.twig`,
        scss: `_${compName}.scss`
      };
    } catch (e2) {
      console.warn(`⚠️  No metadata found for ${compName}`);
      return null;
    }
  }
}

function convertLegacyProps(props) {
  const variables = {};
  
  if (props && typeof props === 'object') {
    Object.entries(props).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        variables[key] = {
          type: 'string',
          enum: value,
          default: value[0]
        };
      } else {
        variables[key] = {
          type: typeof value,
          default: value
        };
      }
    });
  }
  
  return variables;
}

/* ─── Copy playground JavaScript ──────────────────────────────────────── */
function copyPlaygroundAssets() {
  const jsContent = `// Component Playground JavaScript - Version améliorée
(function() {
  'use strict';
  
  let currentProps = {};
  
  document.addEventListener('DOMContentLoaded', function() {
    if (typeof window.componentConfig === 'undefined') {
      console.warn('Component config not found');
      return;
    }
    
    generateForm();
    loadDefaultVariant();
  });
  
  function generateForm() {
    const form = document.getElementById('component-form');
    if (!form) return;
    
    const variables = window.componentConfig.variables || {};
    
    Object.entries(variables).forEach(function([key, config]) {
      const formGroup = createFormControl(key, config);
      form.appendChild(formGroup);
    });
  }
  
  function createFormControl(name, config) {
    const div = document.createElement('div');
    div.className = 'form-group';
    
    const label = document.createElement('label');
    label.className = 'form-label';
    label.textContent = name + (config.type ? ' (' + config.type + ')' : '');
    label.setAttribute('for', name);
    
    let input;
    
    if (config.type === 'boolean') {
      input = document.createElement('input');
      input.type = 'checkbox';
      input.className = 'form-check-input';
      input.checked = config.default || false;
      
      const checkDiv = document.createElement('div');
      checkDiv.className = 'form-check';
      checkDiv.appendChild(input);
      checkDiv.appendChild(label);
      
      div.appendChild(checkDiv);
    } else if (config.enum) {
      input = document.createElement('select');
      input.className = 'form-control';
      
      config.enum.forEach(function(option) {
        const opt = document.createElement('option');
        opt.value = option;
        opt.textContent = option;
        opt.selected = option === config.default;
        input.appendChild(opt);
      });
      
      div.appendChild(label);
      div.appendChild(input);
    } else if (config.type === 'array') {
      input = document.createElement('textarea');
      input.className = 'form-control';
      input.rows = 3;
      input.placeholder = 'JSON array...';
      input.value = JSON.stringify(config.default || [], null, 2);
      
      div.appendChild(label);
      div.appendChild(input);
    } else {
      input = document.createElement('input');
      input.type = config.type === 'number' ? 'number' : 'text';
      input.className = 'form-control';
      input.value = config.default || '';
      input.placeholder = config.placeholder || 'Entrez ' + name + '...';
      
      div.appendChild(label);
      div.appendChild(input);
    }
    
    input.id = name;
    input.addEventListener('change', function() { updateComponent(); });
    input.addEventListener('input', function() { updateComponent(); });
    
    return div;
  }
  
  function loadDefaultVariant() {
    const variables = window.componentConfig.variables || {};
    Object.entries(variables).forEach(function([key, config]) {
      currentProps[key] = config.default;
    });
    updateComponent();
  }
  
  function updateComponent() {
    Object.entries(window.componentConfig.variables || {}).forEach(function([key, config]) {
      const input = document.getElementById(key);
      if (input) {
        if (config.type === 'boolean') {
          currentProps[key] = input.checked;
        } else if (config.type === 'array' && input.tagName === 'TEXTAREA') {
          try {
            currentProps[key] = JSON.parse(input.value);
          } catch (e) {
            currentProps[key] = config.default || [];
          }
        } else if (config.type === 'number') {
          currentProps[key] = parseFloat(input.value) || config.default || 0;
        } else {
          currentProps[key] = input.value || config.default || '';
        }
      }
    });
    
    fetch('http://localhost:3001/api/render-component', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        template: window.componentConfig.templatePath,
        props: currentProps
      })
    })
    .then(function(response) {
      if (response.ok) {
        return response.json();
      } else {
        throw new Error('API Error: ' + response.status);
      }
    })
    .then(function(data) {
      document.getElementById('component-render').innerHTML = data.html;
      updateCodeDisplay(data.code);
    })
    .catch(function(error) {
      document.getElementById('component-render').innerHTML = 
        '<div style="padding: 1rem; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; color: #856404;">' +
        '<strong>Erreur de rendu</strong><br>' +
        'Détails: ' + error.message + 
        '</div>';
    });
  }
  
  function updateCodeDisplay(html) {
    const codeDisplay = document.getElementById('code-display');
    if (!codeDisplay) return;
    
    // Formatter le HTML avec indentation simple
    const formattedHtml = html
      .replace(/></g, '>\\n<')
      .replace(/^\\s+/gm, '')
      .trim();
    
    // Échapper le HTML pour l'affichage
    const escapedHtml = formattedHtml
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    
    // Appliquer une coloration syntaxique simple
    const coloredHtml = escapedHtml
      .replace(/(&lt;[^&]*&gt;)/g, '<span class="tag">$1</span>')
      .replace(/(\\w+)=/g, '<span class="attr">$1</span>=')
      .replace(/="([^"]*)"/g, '="<span class="string">$1</span>"');
    
    codeDisplay.innerHTML = coloredHtml;
  }
  
  // Suppression de formatHtml et highlightHtmlSyntax - plus nécessaires
  
  window.switchView = function(view) {
    const previewContent = document.getElementById('preview-content');
    const codeView = document.getElementById('code-view');
    const buttons = document.querySelectorAll('.toggle-btn');
    
    buttons.forEach(function(btn) { btn.classList.remove('active'); });
    
    if (view === 'preview') {
      previewContent.style.display = 'block';
      codeView.classList.remove('active');
      buttons[0].classList.add('active');
    } else {
      previewContent.style.display = 'none';
      codeView.classList.add('active');
      buttons[1].classList.add('active');
    }
  };
  
  window.updateComponent = updateComponent;
  
})();`;

  // Créer le dossier js et copier le fichier
  fse.ensureDirSync(path.join(paths.build, 'js'));
  fse.outputFileSync(path.join(paths.build, 'js/component-playground.js'), jsContent);
}

/* ─── Génération d'une page wrapper pour chaque composant ─────────────── */
function createDemoBuilder(cat) {
  return async function buildCategoryDemos() {
    // D'abord copier les assets du playground
    copyPlaygroundAssets();
    
    const files = globSync(`src/${cat}/*/*.twig`, { nodir: true });

    for (const file of files) {
      const tplName  = path.relative(paths.src, file).replace(/\\/g, '/');
      const compName = path.basename(path.dirname(file));
      const compDir  = path.dirname(file);
      const title    = `${cat.slice(0, -1)} : ${compName}`;
      
      // Lire les métadonnées du composant
      const metadata = readComponentMetadata(compDir);
      
      if (!metadata) {
        console.warn(`⏩  skip ${tplName} (pas de métadonnées)`);
        continue;
      }

      let snippet;
      try {
        // Utiliser les props par défaut ou du premier variant
        const defaultProps = {};
        if (metadata.variables) {
          Object.entries(metadata.variables).forEach(([key, config]) => {
            defaultProps[key] = config.default;
          });
        }
        
        // Si il y a des variants, utiliser le premier
        if (metadata.variants && metadata.variants.length > 0) {
          Object.assign(defaultProps, metadata.variants[0].props || {});
        }
        
        snippet = await env.render(tplName, defaultProps);
      } catch (e) {
        console.warn(`⏩  skip ${tplName} (${e.message})`);
        continue; // ignore les dossiers incomplets
      }

      // Préparer les données pour le template
      const templateData = {
        title,
        content: snippet,
        componentName: metadata.name,
        componentType: metadata.type,
        componentCategory: cat,
        templatePath: `@${cat}/${compName}/${compName}.twig`,
        componentVariables: JSON.stringify(metadata.variables || {}),
        componentVariants: JSON.stringify(metadata.variants || [])
      };
      
      // Utiliser le template propre
      try {
        const html = await env.render('__wrapper-interactive.twig', templateData);
        
        const outPath = path.join(paths.build, `${cat}/${compName}.html`);
        fse.outputFileSync(outPath, html);
        
        console.log(`✅ Generated interactive demo for ${compName}`);
      } catch (error) {
        console.error(`❌ Error generating demo for ${compName}:`, error.message);
        
        // Fallback vers l'ancien wrapper simple
        const fallbackHtml = await env.render('__wrapper.twig', {
          title,
          content: snippet
        });
        
        const outPath = path.join(paths.build, `${cat}/${compName}.html`);
        fse.outputFileSync(outPath, fallbackHtml);
        
        console.log(`📝 Generated basic demo for ${compName} (fallback)`);
      }
    }
  };
}

export const atomsDemo      = createDemoBuilder('atoms');
export const moleculesDemo  = createDemoBuilder('molecules');
export const organismsDemo  = createDemoBuilder('organisms');

/* Agrégation pratique pour gulp.parallel(styles, templates, demos) */
export const demos = gulp.parallel(atomsDemo, moleculesDemo, organismsDemo);