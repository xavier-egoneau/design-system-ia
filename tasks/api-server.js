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
      const dirs = globSync(`src/${category}/*/`, { nodir: false });
      
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
    
    const metaPath = path.join(paths.src, category, name, `${name}.comp.json`);
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

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`🚀 API Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🎨 Component renderer ready`);
  console.log(`⚡ AI Import system ready`);
});

export default app;