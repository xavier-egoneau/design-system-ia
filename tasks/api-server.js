import express from 'express';
import path from 'path';
import fs from 'fs-extra';
import { paths } from './paths.js';
import {
  TwingEnvironment,
  TwingLoaderFilesystem
} from 'twing';

const app = express();
const PORT = 3001;

// Configuration Twing
const loader = new TwingLoaderFilesystem([
  paths.twingRoot,
  process.cwd()
]);

loader.addPath(path.join(paths.twingRoot, 'atoms'),     'atoms');
loader.addPath(path.join(paths.twingRoot, 'molecules'), 'molecules');
loader.addPath(path.join(paths.twingRoot, 'organisms'), 'organisms');

const env = new TwingEnvironment(loader);

// Middleware
app.use(express.json());
app.use(express.static(paths.build));

app.get('/debug/files/:category', (req, res) => {
  const { category } = req.params;
  const { globSync } = require('glob');
  
  try {
    const files = globSync(`${paths.build}/${category}/**/*.html`);
    const renderFiles = globSync(`${paths.build}/${category}/render/*.html`);
    
    res.json({
      category,
      mainFiles: files.map(f => path.basename(f)),
      renderFiles: renderFiles.map(f => path.basename(f)),
      paths: {
        build: paths.build,
        fullPaths: files
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Middleware pour log des 404
app.use((req, res, next) => {
  const originalSend = res.send;
  res.send = function(data) {
    if (res.statusCode === 404) {
      console.log(`🔍 404 Debug: ${req.method} ${req.url}`);
      console.log(`   Looking for file: ${path.join(paths.build, req.url)}`);
      console.log(`   File exists: ${fse.existsSync(path.join(paths.build, req.url))}`);
    }
    originalSend.call(this, data);
  };
  next();
});

console.log(`🔍 Debug endpoints added: /debug/files/:category`);

// CORS pour le développement
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Fonction pour formater le HTML
function formatHtml(html) {
  return html
    .replace(/></g, '>\n<')
    .replace(/^\s+/gm, '')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map((line, index, arr) => {
      // Simple indentation basée sur les balises
      let indent = '';
      let openTags = 0;
      
      // Compter les balises ouvrantes avant cette ligne
      for (let i = 0; i < index; i++) {
        const prevLine = arr[i];
        const openMatches = prevLine.match(/<[^/][^>]*[^/]>/g) || [];
        const closeMatches = prevLine.match(/<\/[^>]+>/g) || [];  // ✅ Correction ici
        openTags += openMatches.length - closeMatches.length;
      }
      
      // Ajuster pour les balises fermantes
      if (line.startsWith('</')) {
        openTags--;
      }
      
      // Créer l'indentation
      for (let i = 0; i < Math.max(0, openTags); i++) {
        indent += '  ';
      }
      
      return indent + line;
    })
    .join('\n');
}

// ... reste du fichier avec toutes les corrections des template literals

// Endpoint pour le rendu de composants
app.post('/api/render-component', async (req, res) => {
  try {
    const { template, props } = req.body;
    
    if (!template) {
      return res.status(400).json({ error: 'Template path is required' });
    }
    
    // Nettoyer les props (enlever les valeurs vides)
    const cleanProps = {};
    Object.entries(props || {}).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        cleanProps[key] = value;
      }
    });
    
    console.log(`🎨 Rendering ${template} with props:`, cleanProps);
    
    // Rendre le template avec Twing
    const html = await env.render(template, cleanProps);
    
    // Formater le HTML avec indentation
    const formattedHtml = formatHtml(html);
    
    res.json({
      html: html,
      code: formattedHtml
    });
  } catch (error) {
    console.error('❌ Render error:', error.message);
    res.status(500).json({ 
      error: 'Render error', 
      message: error.message,
      details: error.stack 
    });
  }
});

// Endpoint pour lister tous les composants disponibles
app.get('/api/components', async (req, res) => {
  try {
    const { globSync } = await import('glob');
    
    const components = [];
    
    ['atoms', 'molecules', 'organisms'].forEach(category => {
      // 🔄 CHANGEMENT : Nouveau chemin
      const dirs = globSync(`src/app/${category}/*/`, { nodir: false });
      
      dirs.forEach(dir => {
        const compName = path.basename(dir.replace(/[/\\]$/, ''));
        const metaPath = path.join(dir, `${compName}.comp.json`);
        
        try {
          const content = fs.readFileSync(metaPath, 'utf8');
          const metadata = JSON.parse(content);
          
          components.push({
            name: compName,
            category,
            path: `@${category}/${compName}/${compName}.twig`,
            ...metadata
          });
        } catch (e) {
          // Ignorer les composants sans métadonnées
        }
      });
    });

    res.json(components);
  } catch (error) {
    console.error('❌ Components listing error:', error);
    res.status(500).json({ error: 'Failed to list components' });
  }
});

// Endpoint pour obtenir les métadonnées d'un composant spécifique
app.get('/api/component/:category/:name', async (req, res) => {
  try {
    const { category, name } = req.params;
    
    // 🔄 CHANGEMENT : Nouveau chemin
    const metaPath = path.join('src/app', category, name, `${name}.comp.json`);
    const content = fs.readFileSync(metaPath, 'utf8');
    const metadata = JSON.parse(content);
    
    res.json({
      name,
      category,
      path: `@${category}/${name}/${name}.twig`,
      ...metadata
    });
  } catch (error) {
    console.error('❌ Component metadata error:', error);
    res.status(404).json({ error: 'Component not found' });
  }
});

// ⭐ Nouveaux endpoints pour l'import automatique

// Endpoint pour créer automatiquement les fichiers depuis un artifact
app.post('/api/create-file', async (req, res) => {
  try {
    const { path: filePath, content, language } = req.body;
    
    if (!filePath || !content) {
      return res.status(400).json({ 
        error: 'Path and content are required' 
      });
    }
    
    // Sécurité : vérifier que le chemin est dans les dossiers autorisés
    const allowedPaths = ['src/', 'tokens/'];
    const isAllowed = allowedPaths.some(allowed => filePath.startsWith(allowed));
    
    if (!isAllowed) {
      return res.status(403).json({ 
        error: 'Path not allowed. Only src/ and tokens/ directories are permitted.' 
      });
    }
    
    // Résoudre le chemin complet
    const fullPath = path.resolve(process.cwd(), filePath);
    
    // Vérifier qu'on ne sort pas du projet (sécurité)
    if (!fullPath.startsWith(process.cwd())) {
      return res.status(403).json({ 
        error: 'Invalid path' 
      });
    }
    
    console.log(`📁 Creating file: ${filePath}`);
    
    // Créer le dossier parent si nécessaire
    await fs.ensureDir(path.dirname(fullPath));
    
    // Écrire le fichier
    await fs.writeFile(fullPath, content, 'utf8');
    
    console.log(`✅ File created: ${filePath}`);
    
    res.json({
      success: true,
      path: filePath,
      message: 'File created successfully'
    });
    
  } catch (error) {
    console.error('❌ File creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create file', 
      message: error.message 
    });
  }
});

// Endpoint pour créer plusieurs fichiers en lot (optimisé)
app.post('/api/create-batch', async (req, res) => {
  try {
    const { files } = req.body;
    
    if (!Array.isArray(files)) {
      return res.status(400).json({ 
        error: 'Files array is required' 
      });
    }
    
    console.log(`📦 Creating batch of ${files.length} files...`);
    
    const results = {
      success: [],
      errors: []
    };
    
    for (const file of files) {
      try {
        const { path: filePath, content } = file;
        
        // Même validation que pour create-file
        const allowedPaths = ['src/', 'tokens/'];
        const isAllowed = allowedPaths.some(allowed => filePath.startsWith(allowed));
        
        if (!isAllowed) {
          results.errors.push({
            path: filePath,
            error: 'Path not allowed'
          });
          continue;
        }
        
        const fullPath = path.resolve(process.cwd(), filePath);
        
        if (!fullPath.startsWith(process.cwd())) {
          results.errors.push({
            path: filePath,
            error: 'Invalid path'
          });
          continue;
        }
        
        // Créer le fichier
        await fs.ensureDir(path.dirname(fullPath));
        await fs.writeFile(fullPath, content, 'utf8');
        
        results.success.push({
          path: filePath,
          message: 'Created successfully'
        });
        
        console.log(`✅ Created: ${filePath}`);
        
      } catch (error) {
        results.errors.push({
          path: file.path,
          error: error.message
        });
        console.error(`❌ Failed to create ${file.path}:`, error.message);
      }
    }
    
    console.log(`📊 Batch complete: ${results.success.length} success, ${results.errors.length} errors`);
    
    res.json({
      success: results.success.length,
      errors: results.errors.length,
      results
    });
    
  } catch (error) {
    console.error('❌ Batch creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create batch', 
      message: error.message 
    });
  }
});

// Endpoint pour parser un artifact markdown et retourner la structure
app.post('/api/parse-artifact', async (req, res) => {
  try {
    const { markdown } = req.body;
    
    if (!markdown) {
      return res.status(400).json({ 
        error: 'Markdown content is required' 
      });
    }
    
    console.log('🔍 Parsing artifact markdown...');
    
    const files = [];
    let tokensCount = 0;
    let componentsCount = 0;
    
    // Regex pour capturer les sections de fichiers
    const filePattern = /###\s+(.+?)\n\s*```(\w+)?\n([\s\S]*?)\n\s*```/g;
    
    let match;
    while ((match = filePattern.exec(markdown)) !== null) {
      const [, path, language, content] = match;
      
      // Nettoyer le chemin
      const cleanPath = path.trim();
      
      // Détecter le type de fichier
      let type = 'other';
      if (cleanPath.includes('tokens/')) {
        type = 'token';
        tokensCount++;
      } else if (cleanPath.includes('src/')) {
        // Compter les composants uniques (basé sur le dossier)
        const componentMatch = cleanPath.match(/src\/(atoms|molecules|organisms)\/([^/]+)\//);
        if (componentMatch && cleanPath.endsWith('.comp.json')) {
          componentsCount++;
        }
        type = 'component';
      }
      
      // Détecter le langage si pas spécifié
      let detectedLanguage = language;
      if (!detectedLanguage) {
        if (cleanPath.endsWith('.scss')) detectedLanguage = 'scss';
        else if (cleanPath.endsWith('.json')) detectedLanguage = 'json';
        else if (cleanPath.endsWith('.twig')) detectedLanguage = 'twig';
        else if (cleanPath.endsWith('.js')) detectedLanguage = 'javascript';
        else detectedLanguage = 'text';
      }
      
      files.push({
        path: cleanPath,
        content: content.trim(),
        language: detectedLanguage,
        type: type
      });
    }
    
    console.log(`📊 Parsed: ${files.length} files, ${componentsCount} components, ${tokensCount} token files`);
    
    res.json({
      files,
      stats: {
        totalFiles: files.length,
        tokensCount,
        componentsCount
      }
    });
    
  } catch (error) {
    console.error('❌ Parse error:', error);
    res.status(500).json({ 
      error: 'Failed to parse artifact', 
      message: error.message 
    });
  }
});

// Endpoint pour déclencher un rebuild après import
app.post('/api/rebuild', async (req, res) => {
  try {
    console.log('🔨 Triggering rebuild...');
    
    // Utiliser child_process pour lancer gulp build
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    const { stdout, stderr } = await execAsync('npm run build');
    
    if (stderr && !stderr.includes('Warning')) {
      throw new Error(stderr);
    }
    
    console.log('✅ Rebuild completed');
    
    res.json({
      success: true,
      message: 'Rebuild completed successfully',
      output: stdout
    });
    
  } catch (error) {
    console.error('❌ Rebuild error:', error);
    res.status(500).json({ 
      error: 'Rebuild failed', 
      message: error.message 
    });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    twing: 'ready'
  });
});

// Ajouts à tasks/api-server.js pour la séparation app/projet

// Endpoint pour servir le CSS du PROJET (détection automatique)
// Fix de l'endpoint project-css dans tasks/api-server.js

// Endpoint pour servir le CSS du PROJET (version corrigée)
app.get('/api/project-css', (req, res) => {
  console.log('🎨 CSS Request received');
  
  try {
    let combinedCSS = '';
    
    // 1. CSS Framework (si compilé)
    const frameworkCSSPath = path.join(paths.build, 'css', 'framework.css');
    if (fse.existsSync(frameworkCSSPath)) {
      combinedCSS += fse.readFileSync(frameworkCSSPath, 'utf8') + '\n\n';
      console.log('✅ Framework CSS loaded');
    } else {
      console.log('⚠️  No framework CSS found');
    }
    
    // 2. CSS Projet (composants custom)
    const projectCSSPath = path.join(paths.build, 'css', 'main.css');
    if (fse.existsSync(projectCSSPath)) {
      combinedCSS += fse.readFileSync(projectCSSPath, 'utf8');
      console.log('✅ Project CSS loaded');
    } else {
      console.log('⚠️  No project CSS found');
    }
    
    // 3. Si pas de CSS du tout, essayer de charger le DSFR directement
    if (!combinedCSS.trim()) {
      const dsfrPath = path.join(paths.src, 'node_modules/@gouvfr/dsfr/dist/dsfr.min.css');
      if (fse.existsSync(dsfrPath)) {
        combinedCSS = fse.readFileSync(dsfrPath, 'utf8');
        console.log('🇫🇷 DSFR loaded directly from node_modules');
      }
    }
    
    if (combinedCSS.trim()) {
      res.type('text/css'); // 👈 IMPORTANT: Définir le bon MIME type
      res.send(combinedCSS);
      console.log(`📤 CSS sent: ${combinedCSS.length} characters`);
    } else {
      // Fallback CSS minimal
      console.log('🔄 Sending fallback CSS');
      const fallbackCSS = `
/* Fallback CSS - Aucun framework détecté */
body {
  font-family: system-ui, sans-serif;
  line-height: 1.5;
  color: #333;
  margin: 0;
}

*, *::before, *::after {
  box-sizing: border-box;
}

/* Styles DSFR basiques pour les composants */
.fr-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border: 1px solid #000091;
  border-radius: 0.25rem;
  background: #000091;
  color: white;
  text-decoration: none;
  font-family: inherit;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.fr-btn:hover {
  background: #1212ff;
}

.fr-btn--secondary {
  background: white;
  color: #000091;
}

.fr-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #666;
  border-radius: 0.25rem;
  font-family: inherit;
  font-size: 1rem;
}

.fr-alert {
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 0.25rem;
  border-left: 4px solid;
}

.fr-alert--info {
  background: #e7f3ff;
  border-left-color: #0063cb;
  color: #004085;
}

.fr-badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  background: #000091;
  color: white;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.debug-info {
  position: fixed;
  top: 10px;
  right: 10px;
  background: rgba(0,0,0,0.8);
  color: white;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  z-index: 9999;
}
      `;
      
      res.type('text/css');
      res.send(fallbackCSS);
    }
  } catch (error) {
    console.error('❌ Error serving project CSS:', error);
    res.status(500).type('text/css').send('/* Error loading CSS: ' + error.message + ' */');
  }
});

// Debug endpoint pour vérifier les chemins
app.get('/debug/css-paths', (req, res) => {
  const paths_debug = {
    build: paths.build,
    frameworkCSS: path.join(paths.build, 'css', 'framework.css'),
    projectCSS: path.join(paths.build, 'css', 'main.css'),
    dsfrDirect: path.join(paths.src, 'node_modules/@gouvfr/dsfr/dist/dsfr.min.css'),
    exists: {
      framework: fse.existsSync(path.join(paths.build, 'css', 'framework.css')),
      project: fse.existsSync(path.join(paths.build, 'css', 'main.css')),
      dsfr: fse.existsSync(path.join(paths.src, 'node_modules/@gouvfr/dsfr/dist/dsfr.min.css'))
    }
  };
  
  res.json(paths_debug);
});

console.log(`🎨 Project CSS endpoint fixed with proper MIME type`);
console.log(`🔍 Debug CSS paths: http://localhost:3001/debug/css-paths`);

// Endpoint pour servir framework et projet séparément si besoin
app.get('/css/framework.css', (req, res) => {
  const frameworkPath = path.join(paths.build, 'css', 'framework.css');
  if (fse.existsSync(frameworkPath)) {
    res.sendFile(path.resolve(frameworkPath));
  } else {
    res.status(404).send('/* Framework CSS not found */');
  }
});

app.get('/css/main.css', (req, res) => {
  const mainPath = path.join(paths.build, 'css', 'main.css');
  if (fse.existsSync(mainPath)) {
    res.sendFile(path.resolve(mainPath));
  } else {
    res.status(404).send('/* Project CSS not found */');
  }
});

console.log(`🔗 Framework/Project CSS separation ready`);
console.log(`📦 Framework auto-detection enabled`);

// Endpoint pour servir les CSS spécifiques
app.get('/css/:file', (req, res) => {
  const { file } = req.params;
  const filePath = path.join(paths.build, 'css', file);
  
  if (fse.existsSync(filePath)) {
    res.sendFile(path.resolve(filePath));
  } else {
    res.status(404).send(`CSS file ${file} not found`);
  }
});

// Endpoint pour les renders isolés
app.get('/:category/render/:component.html', (req, res) => {
  const { category, component } = req.params;
  const renderPath = path.join(paths.build, category, 'render', `${component}.html`);
  
  if (fse.existsSync(renderPath)) {
    res.sendFile(path.resolve(renderPath));
  } else {
    res.status(404).send(`
      <!DOCTYPE html>
      <html lang="fr">
      <head><title>Composant non trouvé</title></head>
      <body style="padding: 2rem; text-align: center; font-family: system-ui;">
        <h1>Composant non trouvé</h1>
        <p>Le composant <strong>${component}</strong> n'existe pas dans <strong>${category}</strong>.</p>
      </body>
      </html>
    `);
  }
});

// Endpoint pour obtenir les infos du projet
app.get('/api/project-info', (req, res) => {
  try {
    const projectPackagePath = path.join(paths.src, 'package.json');
    
    if (fse.existsSync(projectPackagePath)) {
      const projectPackage = JSON.parse(fse.readFileSync(projectPackagePath, 'utf8'));
      
      res.json({
        hasProjectPackage: true,
        name: projectPackage.name || 'Projet sans nom',
        version: projectPackage.version || '0.0.0',
        frameworks: Object.keys({
          ...projectPackage.dependencies,
          ...projectPackage.devDependencies
        }).filter(dep => {
          // Détecter les frameworks CSS courants
          return ['@gouvfr/dsfr', 'bootstrap', 'bulma', 'foundation-sites', 'tailwindcss', 'materialize-css'].includes(dep);
        })
      });
    } else {
      res.json({
        hasProjectPackage: false,
        name: 'Projet sans package.json',
        frameworks: []
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Could not read project info' });
  }
});

console.log(`🔗 Project/App separation endpoints ready`);
console.log(`📦 Auto-detection of frameworks enabled`);

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎨 Component renderer ready`);
  console.log(`⚡ AI Import system ready`);
});

export default app;