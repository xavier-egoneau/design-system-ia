// Structure proposée pour tasks/indexes.js
import gulp from 'gulp'; 
import { paths } from './paths.js';
import { globSync } from 'glob';
import fse from 'fs-extra';
import path from 'path';

// Import des templates modulaires
import { getAIInterfaceHTML } from './templates/ai-interface-html.js';
import { getAIInterfaceJS } from './templates/ai-interface-js.js';
import { getAIInterfaceCSS } from './templates/ai-interface-css.js';

/** Lit les métadonnées d'un composant depuis son .comp.json */
function readComponentMeta(compPath) {
  const jsonPath = path.join(compPath, path.basename(compPath) + '.comp.json');
  try {
    const content = fse.readFileSync(jsonPath, 'utf8');
    return JSON.parse(content);
  } catch (e) {
    return null;
  }
}

/** Génère un index enrichi pour une catégorie */
function catIndex(cat) {
  return function indexTask(done) {
    const dirs = globSync(`src/${cat}/*/`, { nodir: false });
    const components = dirs.map(dir => {
      const compName = path.basename(dir.replace(/[/\\]$/, ''));
      const meta = readComponentMeta(dir);
      
      return {
        name: compName,
        meta: meta,
        hasDemo: true
      };
    });

    const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>${cat}</title>
  <link rel="stylesheet" href="/css/main.css">
  <style>
    .component-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; margin: 2rem 0; }
    .component-card { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; }
    .component-meta { font-size: 0.9em; color: #666; margin-top: 0.5rem; }
    .variants { margin-top: 0.5rem; }
    .variant-tag { display: inline-block; background: #f0f0f0; padding: 0.2rem 0.5rem; margin: 0.2rem; border-radius: 4px; font-size: 0.8em; }
    .back-link { display: inline-block; margin-bottom: 1rem; padding: 0.5rem 1rem; background: #007bff; color: white; text-decoration: none; border-radius: 4px; }
    .back-link:hover { background: #0056b3; }
  </style>
</head>
<body style="padding: 2rem; font-family: sans-serif;">
  <header>
    <a href="/" class="back-link">← Retour à l'accueil</a>
    <h1>${cat.charAt(0).toUpperCase() + cat.slice(1)}</h1>
    <p>Catalogue des composants ${cat}</p>
  </header>
  
  <div class="component-grid">
    ${components.map(comp => `
      <div class="component-card">
        <h3><a href="/${cat}/${comp.name}.html">${comp.meta?.name || comp.name}</a></h3>
        ${comp.meta ? `
          <div class="component-meta">
            <div><strong>Type:</strong> ${comp.meta.type}</div>
            ${comp.meta.variables ? `<div><strong>Variables:</strong> ${Object.keys(comp.meta.variables).length}</div>` : ''}
            ${comp.meta.tokensUsed ? `<div><strong>Design tokens:</strong> ${comp.meta.tokensUsed.join(', ')}</div>` : ''}
          </div>
          ${comp.meta.variants ? `
            <div class="variants">
              <strong>Variants:</strong><br>
              ${comp.meta.variants.map(v => `<span class="variant-tag">${v.name}</span>`).join('')}
            </div>
          ` : ''}
        ` : '<div class="component-meta">Pas de métadonnées</div>'}
      </div>
    `).join('')}
  </div>
  
  <script type="application/json" id="ai-components-catalog">
${JSON.stringify(components.filter(c => c.meta).map(c => ({
  name: c.name,
  path: `@${cat}/${c.name}/${c.name}.twig`,
  ...c.meta
})), null, 2)}
  </script>
</body>
</html>`;

    fse.outputFileSync(path.join(paths.build, `${cat}/index.html`), html);
    done();
  };
}

/** Génère un catalogue global pour l'IA */
function generateAICatalog(done) {
  const allComponents = [];
  
  ['atoms', 'molecules', 'organisms'].forEach(cat => {
    const dirs = globSync(`src/${cat}/*/`, { nodir: false });
    dirs.forEach(dir => {
      const compName = path.basename(dir.replace(/[/\\]$/, ''));
      const meta = readComponentMeta(dir);
      
      if (meta) {
        allComponents.push({
          name: compName,
          category: cat,
          path: `@${cat}/${compName}/${compName}.twig`,
          include: `{% include "@${cat}/${compName}/${compName}.twig" with {...} %}`,
          ...meta
        });
      }
    });
  });

  const aiGuide = `# Design System - Guide pour l'IA

## Comment utiliser les composants

Chaque composant peut être inclus via Twig avec cette syntaxe :
${'```'}twig
{% include "@category/component/component.twig" with {
  prop1: "value1",
  prop2: "value2"
} %}
${'```'}

## Catalogue des composants disponibles

${allComponents.map(comp => `
### ${comp.name} (${comp.category})
- **Path**: \`${comp.path}\`
- **Type**: ${comp.type}
- **Include**: \`${comp.include}\`

**Variables disponibles:**
${comp.variables ? Object.entries(comp.variables).map(([key, def]) => 
  `- \`${key}\`: ${def.type}${def.default ? ` (défaut: ${JSON.stringify(def.default)})` : ''}`
).join('\n') : 'Aucune variable'}

**Variants:**
${comp.variants ? comp.variants.map(v => `- **${v.name}**: ${JSON.stringify(v.props)}`).join('\n') : 'Aucun variant'}

**Design tokens utilisés:** ${comp.tokensUsed ? comp.tokensUsed.join(', ') : 'Aucun'}
`).join('\n')}

## Guidelines d'utilisation

1. Toujours utiliser les namespaces (@atoms, @molecules, @organisms)
2. Respecter les types de variables définies dans les métadonnées
3. Utiliser les variants prédéfinis quand ils existent
4. Les composants utilisent les design tokens définis dans tokens/variables
`;

  fse.outputFileSync(path.join(paths.build, 'ai-components-catalog.json'), JSON.stringify(allComponents, null, 2));
  fse.outputFileSync(path.join(paths.build, 'ai-guide.md'), aiGuide);
  
  done();
}

/** Index pour les pages avec protection anti-écrasement */
function pagesIndex(done) {
  const pageFiles = globSync('src/pages/**/*.twig', { nodir: true })
    .filter(file => !file.endsWith('/index.twig'));
  
  const pages = pageFiles.map(file => {
    const pageName = path.basename(file, '.twig');
    const relativePath = path.relative('src/pages', file);
    
    return {
      name: pageName,
      path: relativePath,
      buildPath: `/pages/${relativePath.replace('.twig', '.html')}`
    };
  });

  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Pages du Projet</title>
  <link rel="stylesheet" href="/css/main.css">
  <style>
    .page-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem; margin: 2rem 0; }
    .page-card { border: 1px solid #ddd; border-radius: 8px; padding: 1rem; background: white; transition: transform 0.2s; }
    .page-card:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
    .back-link { display: inline-block; margin-bottom: 1rem; padding: 0.5rem 1rem; background: #007bff; color: white; text-decoration: none; border-radius: 4px; }
    .back-link:hover { background: #0056b3; }
    .warning { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; padding: 1rem; margin-bottom: 1rem; color: #856404; }
  </style>
</head>
<body style="padding: 2rem; font-family: sans-serif;">
  <header>
    <a href="/" class="back-link">← Retour à l'accueil</a>
    <h1>📄 Pages du Projet</h1>
    <p>Templates et pages de votre application</p>
    
    <div class="warning">
      <strong>⚠️ Note :</strong> Cette section affiche uniquement les pages de votre projet (src/pages/). 
      Les fichiers index.twig sont ignorés car ils sont auto-générés par le système.
    </div>
  </header>
  
  ${pages.length > 0 ? `
    <div class="page-grid">
      ${pages.map(page => `
        <div class="page-card">
          <h3><a href="${page.buildPath}">${page.name}</a></h3>
          <p style="color: #666; font-size: 0.9em; margin: 0.5rem 0 0 0;">
            ${page.path}
          </p>
        </div>
      `).join('')}
    </div>
  ` : `
    <div style="text-align: center; padding: 3rem; color: #666;">
      <p>📝 Aucune page trouvée dans src/pages/</p>
      <p><small>Créez vos templates .twig dans ce dossier pour les voir ici</small></p>
    </div>
  `}
</body>
</html>`;

  fse.outputFileSync(path.join(paths.build, 'pages/index.html'), html);
  console.log(`✅ Pages index generated (${pages.length} pages found, index.twig files ignored)`);
  
  done();
}

/** Génère l'interface AI à la racine - VERSION MODULAIRE */
function generateAIInterface(done) {
  // Import des templates depuis des fichiers séparés
  const html = getAIInterfaceHTML();
  const css = getAIInterfaceCSS();
  const js = getAIInterfaceJS();
  
  // Assemblage final
  const finalHTML = html.replace('{{CSS_PLACEHOLDER}}', css);
  
  // Écriture des fichiers
  fse.outputFileSync(path.join(paths.build, 'index.html'), finalHTML);
  
  fse.ensureDirSync(path.join(paths.build, 'js'));
  fse.outputFileSync(path.join(paths.build, 'js/ai-interface.js'), js);
  
  console.log('✅ Modular AI Interface generated');
  done();
}

export const atomsIndex = catIndex('atoms');
export const moleculesIndex = catIndex('molecules');
export const organismsIndex = catIndex('organisms');
export const pagesIdx = pagesIndex;
export const aiCatalog = generateAICatalog;
export const aiInterface = generateAIInterface;

export const buildIndexes = gulp.series(
  atomsIndex,
  moleculesIndex,
  organismsIndex,
  pagesIdx,
  aiCatalog,
  aiInterface
);