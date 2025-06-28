import gulp from 'gulp'; 
import { paths } from './paths.js';
import { globSync } from 'glob';
import fse from 'fs-extra';
import path from 'path';

/** Lit les métadonnées d'un composant depuis son .comp.json */
function readComponentMeta(compPath) {
  const jsonPath = path.join(compPath, path.basename(compPath) + '.comp.json');
  try {
    const content = fse.readFileSync(jsonPath, 'utf8');
    return JSON.parse(content);
  } catch (e) {
    return null; // composant sans métadonnées
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
        hasDemo: true // tous ont une démo générée
      };
    });

    // Template d'index enrichi
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
  </style>
</head>
<body style="padding: 2rem; font-family: sans-serif;">
  <header>
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
  
  <!-- Documentation pour l'IA -->
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

  // Génère un guide pour l'IA
  const aiGuide = `# Design System - Guide pour l'IA

## Comment utiliser les composants

Chaque composant peut être inclus via Twig avec cette syntaxe :
\`\`\`twig
{% include "@category/component/component.twig" with {
  prop1: "value1",
  prop2: "value2"
} %}
\`\`\`

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

  // Sauvegarde le catalogue pour l'IA
  fse.outputFileSync(path.join(paths.build, 'ai-components-catalog.json'), JSON.stringify(allComponents, null, 2));
  fse.outputFileSync(path.join(paths.build, 'ai-guide.md'), aiGuide);
  
  done();
}

/** index racine enrichi */
function rootIndex(done) {
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Design System</title>
  <link rel="stylesheet" href="/css/main.css">
</head>
<body style="padding: 2rem; font-family: sans-serif;">
  <header>
    <h1>Design System</h1>
    <p>Système de composants avec support IA</p>
  </header>
  
  <nav>
    <ul style="list-style: none; padding: 0;">
      <li style="margin: 1rem 0;"><a href="/pages/index.html">📄 Pages</a></li>
      <li style="margin: 1rem 0;"><a href="/atoms/index.html">⚛️ Atoms</a></li>
      <li style="margin: 1rem 0;"><a href="/molecules/index.html">🧬 Molecules</a></li>
      <li style="margin: 1rem 0;"><a href="/organisms/index.html">🦠 Organisms</a></li>
    </ul>
  </nav>
  
  <section style="margin-top: 2rem; padding: 1rem; background: #f5f5f5; border-radius: 8px;">
    <h2>Documentation IA</h2>
    <ul>
      <li><a href="/ai-guide.md">📖 Guide d'utilisation des composants</a></li>
      <li><a href="/ai-components-catalog.json">🤖 Catalogue JSON pour l'IA</a></li>
    </ul>
  </section>
</body>
</html>`;
  
  fse.outputFileSync(path.join(paths.build, 'index.html'), html);
  done();
}

export const atomsIndex = catIndex('atoms');
export const moleculesIndex = catIndex('molecules');
export const organismsIndex = catIndex('organisms');
export const pagesIndex = catIndex('pages');
export const rootIdx = rootIndex;
export const aiCatalog = generateAICatalog;

/** Regroupe toutes les tasks d'index */
export const buildIndexes = gulp.series(
  atomsIndex,
  moleculesIndex,
  organismsIndex,
  pagesIndex,
  aiCatalog,
  rootIdx
);