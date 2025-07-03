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
    // 🔄 CHANGEMENT : Nouveau chemin
    const dirs = globSync(`src/app/${cat}/*/`, { nodir: false });
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
// Dans tasks/indexes.js - fonction generateAICatalog()
/** Génère un catalogue global pour l'IA avec guidelines améliorées */
/** Génère un catalogue global pour l'IA avec guidelines améliorées */
function generateAICatalog(done) {
  const allComponents = [];
  
  ['atoms', 'molecules', 'organisms'].forEach(cat => {
    const dirs = globSync(`src/app/${cat}/*/`, { nodir: false });
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

  // Guide amélioré avec structure critique et prompt ultra-précis
  const aiGuide = `# Design System - Guide pour l'IA

## 🚨 **STRUCTURE CRITIQUE - Format Artifact Obligatoire**

### **EXEMPLE PARFAIT à copier exactement :**

\`\`\`markdown
# Mon Design System

## 🎨 Design Tokens
### tokens/_variables.scss
\`\`\`scss
$primary: #0d6efd;
$secondary: #6c757d;
\`\`\`

## ⚛️ Atoms
### src/atoms/button-simple/button-simple.comp.json
\`\`\`json
{
  "name": "ButtonSimple",
  "type": "atom",
  "variables": {
    "text": {
      "type": "string",
      "default": "Button"
    },
    "variant": {
      "type": "string",
      "enum": ["primary", "secondary"],
      "default": "primary"
    }
  },
  "variants": [
    {
      "name": "Primary",
      "props": { "text": "Bouton principal", "variant": "primary" }
    }
  ]
}
\`\`\`

### src/atoms/button-simple/button-simple.twig
\`\`\`twig
<button class="btn btn-{{ variant }}">{{ text }}</button>
\`\`\`

### src/atoms/button-simple/_button-simple.scss
\`\`\`scss
@use '../../tokens/variables' as *;

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  
  &-primary {
    background: $primary;
    color: white;
  }
  
  &-secondary {
    background: $secondary;
    color: white;
  }
}
\`\`\`

## 🧬 Molecules
### src/molecules/card-simple/card-simple.comp.json
\`\`\`json
{
  "name": "CardSimple",
  "type": "molecule",
  "variables": {
    "title": {
      "type": "string",
      "default": "Titre"
    },
    "content": {
      "type": "string",
      "default": "Contenu de la carte"
    }
  },
  "variants": [
    {
      "name": "Basic",
      "props": { "title": "Ma carte", "content": "Description" }
    }
  ]
}
\`\`\`

### src/molecules/card-simple/card-simple.twig
\`\`\`twig
<div class="card">
  <h3>{{ title }}</h3>
  <p>{{ content }}</p>
  {% include "@atoms/button-simple/button-simple.twig" with {
    text: "En savoir plus",
    variant: "primary"
  } %}
</div>
\`\`\`

### src/molecules/card-simple/_card-simple.scss
\`\`\`scss
@use '../../tokens/variables' as *;

.card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
  background: white;
}
\`\`\`
\`\`\`

## ⚠️ **ERREURS FRÉQUENTES À ÉVITER**

### **❌ Émojis incorrects :**
- \`## 🧪 Molecules\` ← FAUX (tube à essai)
- \`## 🧬 Molecules\` ← CORRECT (ADN)

### **❌ Sections malformées :**
- \`### button.comp.json\` ← FAUX (pas de chemin)
- \`### src/atoms/button/button.comp.json\` ← CORRECT

### **❌ Blocs de code sans langage :**
- Triple backticks sans langage ← FAUX
- Triple backticks avec json/scss/twig ← CORRECT

### **❌ JSON malformé :**
- Manque "type": "atom"
- Manque "variables": {}
- Manque "variants": []

### **❌ Includes vers composants inexistants :**
- Référencer des composants non créés dans l'artifact ← FAUX
- Toujours inclure les composants créés dans l'artifact ← CORRECT

### **❌ Chemins interdits :**
- \`public/button.css\` ← INTERDIT
- \`components/button.json\` ← INTERDIT
- Seuls \`src/\` et \`tokens/\` sont autorisés

## 📋 **CHECKLIST DE VALIDATION**

Avant de fournir l'artifact, vérifiez :

### ✅ **Structure générale**
- [ ] Titre \`# Mon Design System\`
- [ ] Section \`## 🎨 Design Tokens\` présente
- [ ] Au moins une section \`## ⚛️ Atoms\`
- [ ] Émojis exacts : 🎨 ⚛️ 🧬 (pas 🧪)

### ✅ **Chaque fichier**
- [ ] Commence par \`### src/\` ou \`### tokens/\`
- [ ] Bloc avec langage spécifié (scss, json, twig)
- [ ] Code correctement indenté
- [ ] Fermeture des blocs présente

### ✅ **Fichiers .comp.json**
- [ ] \`"name"\` présent et correspond au dossier
- [ ] \`"type"\` présent (atom/molecule/organism)
- [ ] \`"variables"\` présent (object, même vide)
- [ ] \`"variants"\` présent (array, même vide)
- [ ] JSON valide (virgules correctes, guillemets fermés)

### ✅ **Cohérence**
- [ ] Tous les includes pointent vers des composants de l'artifact
- [ ] Noms de composants = noms de dossiers
- [ ] Variables définies sont utilisées dans les templates

## 🎯 **PROMPT OPTIMAL POUR L'IA**

"Génère un design system avec [X] atoms et [Y] molecules.

CRITÈRE OBLIGATOIRE : Utilise EXACTEMENT cette structure :

# Mon Design System

## 🎨 Design Tokens
### tokens/_variables.scss
[triple backticks]scss
$primary: #0d6efd;
[triple backticks]

## ⚛️ Atoms
### src/atoms/nom-composant/nom-composant.comp.json
[triple backticks]json
{
  \"name\": \"NomComposant\",
  \"type\": \"atom\",
  \"variables\": {},
  \"variants\": []
}
[triple backticks]

VÉRIFICATION : Tous les includes doivent pointer vers des composants créés dans cet artifact."

## 🔧 **MESSAGES D'ERREUR ET SOLUTIONS**

### **"Aucun fichier détecté"**
→ Vérifiez les sections ### et les blocs de code

### **"Chemin non autorisé"**
→ Utilisez uniquement src/atoms/, src/molecules/, src/organisms/, tokens/

### **"JSON invalide"**
→ Vérifiez que tous les .comp.json ont name, type, variables, variants

### **"Erreur lors de l'import"**
→ Vérifiez que chaque bloc de code spécifie son langage

### **"Template error"**
→ Vérifiez que tous les includes pointent vers des composants de l'artifact

## 📊 **Composants disponibles dans ce projet**

${allComponents.length > 0 ? 
  allComponents.map(comp => `
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
`).join('\n') : 
  'Aucun composant trouvé. Utilisez l\'import automatique pour créer vos premiers composants.'
}

## 🔧 **Utilisation des composants existants**

Syntaxe d'inclusion standard :
\`\`\`twig
{% include "@category/component/component.twig" with {
  prop1: "value1",
  prop2: "value2"
} %}
\`\`\`

## 🚀 **Workflow d'import automatique**

1. **Copiez** l'artifact markdown complet
2. **Collez** dans l'interface d'import (\`http://localhost:3000\`)
3. **Analysez** → vérification de la structure
4. **Importez** → création automatique des fichiers
5. **Rebuilder** → compilation et génération des démos

## ✅ **Validation réussie**

L'artifact est correct si l'analyse affiche :
- "X fichiers détectés, Y composants"
- Import sans erreurs
- Build sans erreurs SCSS/Twig

**En cas d'échec, référez-vous aux exemples parfaits ci-dessus.**
`;

  fse.outputFileSync(path.join(paths.build, 'ai-components-catalog.json'), JSON.stringify(allComponents, null, 2));
  fse.outputFileSync(path.join(paths.build, 'ai-guide.md'), aiGuide);
  
  done();
}

/** Index pour les pages avec protection anti-écrasement */
function pagesIndex(done) {
  // 🔄 CHANGEMENT : Nouveau chemin
  const pageFiles = globSync('src/app/pages/**/*.twig', { nodir: true })
    .filter(file => !file.endsWith('/index.twig'));
  
  const pages = pageFiles.map(file => {
    const pageName = path.basename(file, '.twig');
    // 🔄 CHANGEMENT : Nouveau calcul du chemin relatif
    const relativePath = path.relative('src/app/pages', file);
    
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