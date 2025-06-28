import express from 'express';
import path from 'path';
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
        const openMatches = prevLine.match(/<[^\/][^>]*[^\/]>/g) || [];
        const closeMatches = prevLine.match(/<\/[^>]+>/g) || [];
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
    const fse = await import('fs-extra');
    
    const components = [];
    
    ['atoms', 'molecules', 'organisms'].forEach(category => {
      const dirs = globSync(`src/${category}/*/`, { nodir: false });
      
      dirs.forEach(dir => {
        const compName = path.basename(dir.replace(/[/\\]$/, ''));
        const metaPath = path.join(dir, `${compName}.comp.json`);
        
        try {
          const content = fse.readFileSync(metaPath, 'utf8');
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
    const fse = await import('fs-extra');
    
    const metaPath = path.join(paths.src, category, name, `${name}.comp.json`);
    const content = fse.readFileSync(metaPath, 'utf8');
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
});

export default app;