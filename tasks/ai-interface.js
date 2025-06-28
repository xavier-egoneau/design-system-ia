// tasks/ai-interface.js
import { paths } from './paths.js';
import fse from 'fs-extra';
import path from 'path';

/** Génère l'interface AI à la racine */
export function generateAIInterface(done) {
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Design System - Interface IA</title>
  <link rel="stylesheet" href="/css/main.css">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      color: #212529;
    }
    
    .hero {
      background: linear-gradient(135deg, rgba(102, 126, 234, 0.9), rgba(118, 75, 162, 0.9));
      color: white;
      padding: 4rem 2rem;
      text-align: center;
    }
    
    .hero h1 {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 1rem;
      text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }
    
    .hero p {
      font-size: 1.25rem;
      opacity: 0.9;
      max-width: 600px;
      margin: 0 auto;
      line-height: 1.6;
    }
    
    .container {
      max-width: 1400px;
      margin: 0 auto;
      padding: 0 2rem;
    }
    
    .main-content {
      margin: -2rem auto 0;
      position: relative;
      z-index: 10;
    }
    
    .card-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
      margin-bottom: 3rem;
    }
    
    @media (max-width: 1024px) {
      .card-grid {
        grid-template-columns: 1fr;
      }
    }
    
    .main-card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      overflow: hidden;
      transition: transform 0.3s ease;
    }
    
    .main-card:hover {
      transform: translateY(-5px);
    }
    
    .card-header {
      background: linear-gradient(135deg, #000091, #1212ff);
      color: white;
      padding: 2rem;
      position: relative;
      overflow: hidden;
    }
    
    .card-header::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 100%;
      height: 200%;
      background: linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent);
      transform: rotate(45deg);
      animation: shine 3s ease-in-out infinite;
    }
    
    @keyframes shine {
      0%, 100% { transform: translateX(-100%) rotate(45deg); }
      50% { transform: translateX(100%) rotate(45deg); }
    }
    
    .card-header h2 {
      font-size: 1.5rem;
      margin-bottom: 0.5rem;
      position: relative;
      z-index: 2;
    }
    
    .card-header p {
      opacity: 0.9;
      position: relative;
      z-index: 2;
    }
    
    .card-content {
      padding: 2rem;
    }
    
    .import-section {
      grid-column: 1 / -1;
    }
    
    .form-group {
      margin-bottom: 1.5rem;
    }
    
    .form-label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: #495057;
    }
    
    .form-control {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #e9ecef;
      border-radius: 8px;
      font-size: 0.9rem;
      transition: all 0.3s ease;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
    }
    
    .form-control:focus {
      outline: none;
      border-color: #000091;
      box-shadow: 0 0 0 3px rgba(0, 0, 145, 0.1);
    }
    
    textarea.form-control {
      min-height: 200px;
      resize: vertical;
      line-height: 1.5;
    }
    
    .btn-group {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }
    
    .btn {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      font-size: 0.9rem;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .btn-primary {
      background: linear-gradient(135deg, #000091, #1212ff);
      color: white;
    }
    
    .btn-primary:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(0, 0, 145, 0.3);
    }
    
    .btn-secondary {
      background: #6c757d;
      color: white;
    }
    
    .btn-secondary:hover:not(:disabled) {
      background: #5a6268;
      transform: translateY(-2px);
    }
    
    .btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
      box-shadow: none !important;
    }
    
    .status-panel {
      margin-top: 1.5rem;
      padding: 1.5rem;
      border-radius: 8px;
      border-left: 4px solid;
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 0.85rem;
      line-height: 1.6;
      max-height: 300px;
      overflow-y: auto;
      display: none;
    }
    
    .status-panel.info {
      background: rgba(0, 123, 255, 0.1);
      border-left-color: #007bff;
      color: #004085;
    }
    
    .status-panel.success {
      background: rgba(40, 167, 69, 0.1);
      border-left-color: #28a745;
      color: #155724;
    }
    
    .status-panel.error {
      background: rgba(220, 53, 69, 0.1);
      border-left-color: #dc3545;
      color: #721c24;
    }
    
    .status-panel.warning {
      background: rgba(255, 193, 7, 0.1);
      border-left-color: #ffc107;
      color: #856404;
    }
    
    .progress-bar {
      width: 100%;
      height: 6px;
      background: #e9ecef;
      border-radius: 3px;
      overflow: hidden;
      margin: 1rem 0;
      display: none;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #000091, #1212ff);
      border-radius: 3px;
      transition: width 0.3s ease;
      width: 0%;
      position: relative;
    }
    
    .progress-fill::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(45deg, transparent 35%, rgba(255,255,255,0.3) 50%, transparent 65%);
      animation: progress-shine 1.5s ease-in-out infinite;
    }
    
    @keyframes progress-shine {
      0% { transform: translateX(-100%); }
      100% { transform: translateX(100%); }
    }
    
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 1rem;
      margin: 1.5rem 0;
    }
    
    .stat-card {
      background: linear-gradient(135deg, #f8f9fa, #e9ecef);
      padding: 1.5rem;
      border-radius: 12px;
      text-align: center;
      border: 1px solid #dee2e6;
      transition: transform 0.2s ease;
    }
    
    .stat-card:hover {
      transform: scale(1.05);
    }
    
    .stat-number {
      font-size: 2rem;
      font-weight: 700;
      color: #000091;
      margin-bottom: 0.25rem;
      display: block;
    }
    
    .stat-label {
      font-size: 0.85rem;
      color: #6c757d;
      font-weight: 500;
    }
    
    .navigation-links {
      list-style: none;
      padding: 0;
    }
    
    .navigation-links li {
      margin-bottom: 0.75rem;
    }
    
    .navigation-links a {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem;
      border-radius: 8px;
      text-decoration: none;
      color: #495057;
      transition: all 0.3s ease;
      background: #f8f9fa;
    }
    
    .navigation-links a:hover {
      background: #e9ecef;
      color: #000091;
      transform: translateX(5px);
    }
    
    .file-list {
      margin-top: 1rem;
      max-height: 250px;
      overflow-y: auto;
    }
    
    .file-item {
      display: flex;
      align-items: center;
      padding: 0.75rem;
      margin-bottom: 0.5rem;
      background: #f8f9fa;
      border-radius: 6px;
      font-size: 0.85rem;
      border-left: 3px solid transparent;
      transition: all 0.3s ease;
    }
    
    .file-item.created {
      background: #d4edda;
      border-left-color: #28a745;
    }
    
    .file-item.error {
      background: #f8d7da;
      border-left-color: #dc3545;
    }
    
    .file-icon {
      margin-right: 0.75rem;
      font-size: 1.1rem;
    }
    
    .example-text {
      background: #f8f9fa;
      padding: 1rem;
      border-radius: 8px;
      border-left: 3px solid #000091;
      font-size: 0.9rem;
      line-height: 1.5;
      color: #495057;
    }
    
    .loading {
      display: inline-block;
      width: 20px;
      height: 20px;
      border: 2px solid #f3f3f3;
      border-top: 2px solid #000091;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="hero">
    <div class="container">
      <h1>🤖 Design System AI</h1>
      <p>Créez des composants complets en collant simplement un artifact généré par l'IA. Plus besoin de coder fichier par fichier !</p>
    </div>
  </div>
  
  <div class="container">
    <div class="main-content">
      <div class="card-grid">
        
        <!-- Section Import Automatique -->
        <div class="main-card import-section">
          <div class="card-header">
            <h2>⚡ Import Automatique</h2>
            <p>Collez votre artifact markdown et créez automatiquement tous les composants</p>
          </div>
          
          <div class="card-content">
            <div class="form-group">
              <label class="form-label" for="artifact-input">
                Artifact Markdown (généré par l'IA)
              </label>
              <textarea 
                id="artifact-input" 
                class="form-control" 
                placeholder="Collez ici votre artifact markdown complet...

Exemple attendu :
# Mini Design System DSFR

## 🎨 Design Tokens DSFR
### tokens/_variables.scss
\`\`\`scss
$color-blue-france: #000091;
// ... autres tokens
\`\`\`

## ⚛️ Atoms
### src/atoms/button-dsfr/button-dsfr.comp.json
\`\`\`json
{
  &quot;name&quot;: &quot;ButtonDSFR&quot;,
  // ... métadonnées
}
\`\`\`

### src/atoms/button-dsfr/button-dsfr.twig
\`\`\`twig
&lt;button class=&quot;fr-btn&quot;&gt;{{ text }}&lt;/button&gt;
\`\`\`

// ... autres composants"
              ></textarea>
            </div>
            
            <div class="btn-group">
              <button id="parse-btn" class="btn btn-primary">
                🔍 Analyser l'Artifact
              </button>
              <button id="import-btn" class="btn btn-primary" disabled>
                ⚡ Importer Automatiquement
              </button>
              <button id="rebuild-btn" class="btn btn-secondary" disabled>
                🔨 Rebuilder
              </button>
              <button id="clear-btn" class="btn btn-secondary">
                🗑️ Effacer
              </button>
            </div>
            
            <div class="progress-bar" id="progress-bar">
              <div class="progress-fill" id="progress-fill"></div>
            </div>
            
            <div id="status-panel" class="status-panel"></div>
            
            <div id="results-section" style="display: none;">
              <div class="stats">
                <div class="stat-card">
                  <span class="stat-number" id="tokens-count">0</span>
                  <div class="stat-label">Fichiers tokens</div>
                </div>
                <div class="stat-card">
                  <span class="stat-number" id="components-count">0</span>
                  <div class="stat-label">Composants</div>
                </div>
                <div class="stat-card">
                  <span class="stat-number" id="files-count">0</span>
                  <div class="stat-label">Fichiers totaux</div>
                </div>
                <div class="stat-card">
                  <span class="stat-number" id="success-count">0</span>
                  <div class="stat-label">Créés</div>
                </div>
              </div>
              
              <div class="file-list" id="file-list"></div>
            </div>
            
            <div class="example-text">
              💡 <strong>Comment ça marche :</strong><br>
              1. Demandez à Claude de générer un design system complet<br>
              2. Copiez l'artifact markdown dans la zone ci-dessus<br>
              3. Cliquez "Analyser" puis "Importer" - tous les fichiers sont créés automatiquement !
            </div>
          </div>
        </div>
        
        <!-- Section Navigation -->
        <div class="main-card">
          <div class="card-header">
            <h2>📚 Design System</h2>
            <p>Explorez les composants existants</p>
          </div>
          
          <div class="card-content">
            <ul class="navigation-links">
              <li>
                <a href="/atoms/index.html">
                  <span>⚛️</span>
                  <div>
                    <strong>Atoms</strong><br>
                    <small>Composants de base</small>
                  </div>
                </a>
              </li>
              <li>
                <a href="/molecules/index.html">
                  <span>🧬</span>
                  <div>
                    <strong>Molecules</strong><br>
                    <small>Combinaisons d'atoms</small>
                  </div>
                </a>
              </li>
              <li>
                <a href="/organisms/index.html">
                  <span>🦠</span>
                  <div>
                    <strong>Organisms</strong><br>
                    <small>Sections complexes</small>
                  </div>
                </a>
              </li>
              <li>
                <a href="/pages/index.html">
                  <span>📄</span>
                  <div>
                    <strong>Pages</strong><br>
                    <small>Templates de votre projet</small>
                  </div>
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <!-- Section Documentation -->
        <div class="main-card">
          <div class="card-header">
            <h2>🤖 Documentation IA</h2>
            <p>Ressources pour l'intelligence artificielle</p>
          </div>
          
          <div class="card-content">
            <ul class="navigation-links">
              <li>
                <a href="/ai-guide.md">
                  <span>📖</span>
                  <div>
                    <strong>Guide d'utilisation</strong><br>
                    <small>Instructions pour l'IA</small>
                  </div>
                </a>
              </li>
              <li>
                <a href="/ai-components-catalog.json">
                  <span>🗃️</span>
                  <div>
                    <strong>Catalogue JSON</strong><br>
                    <small>Métadonnées machine</small>
                  </div>
                </a>
              </li>
            </ul>
            
            <div class="example-text">
              Ces fichiers permettent à l'IA de comprendre votre design system et de générer des composants cohérents.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    class EnhancedArtifactImporter {
      constructor() {
        this.parsedData = null;
        this.initEventListeners();
      }
      
      initEventListeners() {
        document.getElementById('parse-btn').addEventListener('click', () => this.parseArtifact());
        document.getElementById('import-btn').addEventListener('click', () => this.importComponents());
        document.getElementById('rebuild-btn').addEventListener('click', () => this.rebuildSystem());
        document.getElementById('clear-btn').addEventListener('click', () => this.clear());
      }
      
      showStatus(message, type = 'info') {
        const panel = document.getElementById('status-panel');
        panel.className = \`status-panel \${type}\`;
        panel.innerHTML = message;
        panel.style.display = 'block';
      }
      
      updateProgress(percent) {
        const bar = document.getElementById('progress-bar');
        const fill = document.getElementById('progress-fill');
        bar.style.display = 'block';
        fill.style.width = \`\${percent}%\`;
        
        if (percent >= 100) {
          setTimeout(() => {
            bar.style.display = 'none';
          }, 2000);
        }
      }
      
      async parseArtifact() {
        const input = document.getElementById('artifact-input').value.trim();
        const parseBtn = document.getElementById('parse-btn');
        
        if (!input) {
          this.showStatus('❌ Veuillez coller un artifact markdown', 'error');
          return;
        }
        
        parseBtn.disabled = true;
        parseBtn.innerHTML = '<span class="loading"></span> Analyse...';
        
        try {
          this.showStatus('🔍 Analyse de l\\'artifact en cours...', 'info');
          
          const response = await fetch('/api/parse-artifact', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ markdown: input })
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erreur lors de l\\'analyse');
          }
          
          const result = await response.json();
          
          if (result.files.length === 0) {
            this.showStatus('❌ Aucun fichier détecté dans l\\'artifact. Vérifiez le format.', 'error');
            return;
          }
          
          this.parsedData = result;
          this.displayResults();
          
          document.getElementById('import-btn').disabled = false;
          this.showStatus(\`✅ Artifact analysé avec succès !<br>📊 \${result.files.length} fichiers détectés, \${result.stats.componentsCount} composants, \${result.stats.tokensCount} fichiers de tokens\`, 'success');
          
        } catch (error) {
          this.showStatus(\`❌ Erreur lors de l'analyse :<br>\${error.message}\`, 'error');
          console.error(error);
        } finally {
          parseBtn.disabled = false;
          parseBtn.innerHTML = '🔍 Analyser l\\'Artifact';
        }
      }
      
      displayResults() {
        const { files, stats } = this.parsedData;
        
        // Mise à jour des statistiques
        document.getElementById('tokens-count').textContent = stats.tokensCount;
        document.getElementById('components-count').textContent = stats.componentsCount;
        document.getElementById('files-count').textContent = stats.totalFiles;
        document.getElementById('success-count').textContent = '0';
        
        // Affichage de la liste des fichiers
        const fileList = document.getElementById('file-list');
        fileList.innerHTML = '';
        
        files.forEach((file, index) => {
          const item = document.createElement('div');
          item.className = 'file-item';
          item.id = \`file-\${index}\`;
          
          const icon = this.getFileIcon(file.type);
          item.innerHTML = \`
            <span class="file-icon">\${icon}</span>
            <span style="flex: 1;">\${file.path}</span>
            <span style="font-size: 0.75rem; color: #6c757d;">\${file.language}</span>
          \`;
          
          fileList.appendChild(item);
        });
        
        document.getElementById('results-section').style.display = 'block';
      }
      
      getFileIcon(type) {
        const icons = {
          'token': '🎨',
          'component': '⚛️',
          'other': '📄'
        };
        return icons[type] || icons.other;
      }
      
      async importComponents() {
        if (!this.parsedData) {
          this.showStatus('❌ Aucun artifact analysé', 'error');
          return;
        }
        
        const { files } = this.parsedData;
        const importBtn = document.getElementById('import-btn');
        
        importBtn.disabled = true;
        importBtn.innerHTML = '<span class="loading"></span> Import...';
        
        this.showStatus('⚡ Import en cours...', 'info');
        this.updateProgress(0);
        
        let successCount = 0;
        
        try {
          // Utiliser l'API batch pour plus d'efficacité
          const response = await fetch('/api/create-batch', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ files })
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erreur lors de l\\'import');
          }
          
          const result = await response.json();
          successCount = result.success;
          
          // Marquer les fichiers comme créés
          result.results.success.forEach(success => {
            const fileIndex = files.findIndex(f => f.path === success.path);
            if (fileIndex >= 0) {
              const fileItem = document.getElementById(\`file-\${fileIndex}\`);
              if (fileItem) {
                fileItem.classList.add('created');
              }
            }
          });
          
          // Marquer les fichiers en erreur
          result.results.errors.forEach(error => {
            const fileIndex = files.findIndex(f => f.path === error.path);
            if (fileIndex >= 0) {
              const fileItem = document.getElementById(\`file-\${fileIndex}\`);
              if (fileItem) {
                fileItem.classList.add('error');
              }
            }
          });
          
          // Mise à jour du compteur
          document.getElementById('success-count').textContent = successCount;
          this.updateProgress(100);
          
          if (result.errors === 0) {
            this.showStatus(\`🎉 Import terminé avec succès !<br>📁 \${successCount} fichiers créés<br><br>💡 Vous pouvez maintenant rebuilder le système pour voir vos composants.\`, 'success');
            document.getElementById('rebuild-btn').disabled = false;
          } else {
            this.showStatus(\`⚠️ Import terminé avec \${result.errors} erreurs<br>✅ \${successCount} fichiers créés avec succès<br>❌ \${result.errors} erreurs\`, 'warning');
            document.getElementById('rebuild-btn').disabled = false;
          }
          
        } catch (error) {
          this.showStatus(\`❌ Erreur durant l'import :<br>\${error.message}\`, 'error');
        } finally {
          importBtn.disabled = false;
          importBtn.innerHTML = '⚡ Importer Automatiquement';
        }
      }
      
      async rebuildSystem() {
        const rebuildBtn = document.getElementById('rebuild-btn');
        
        rebuildBtn.disabled = true;
        rebuildBtn.innerHTML = '<span class="loading"></span> Rebuild...';
        
        try {
          this.showStatus('🔨 Rebuild du système en cours...', 'info');
          
          const response = await fetch('/api/rebuild', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            }
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || 'Erreur lors du rebuild');
          }
          
          const result = await response.json();
          
          this.showStatus(\`🎉 Rebuild terminé avec succès !<br><br>🌐 Votre design system est maintenant disponible :<br>• <a href="/atoms/index.html" target="_blank">Atoms</a><br>• <a href="/molecules/index.html" target="_blank">Molecules</a><br>• <a href="/organisms/index.html" target="_blank">Organisms</a><br>• <a href="/pages/index.html" target="_blank">Pages du projet</a>\`, 'success');
          
        } catch (error) {
          this.showStatus(\`❌ Erreur durant le rebuild :<br>\${error.message}\`, 'error');
        } finally {
          rebuildBtn.disabled = false;
          rebuildBtn.innerHTML = '🔨 Rebuilder';
        }
      }
      
      clear() {
        document.getElementById('artifact-input').value = '';
        document.getElementById('status-panel').style.display = 'none';
        document.getElementById('progress-bar').style.display = 'none';
        document.getElementById('results-section').style.display = 'none';
        document.getElementById('import-btn').disabled = true;
        document.getElementById('rebuild-btn').disabled = true;
        this.parsedData = null;
      }
    }
    
    // Initialisation
    new EnhancedArtifactImporter();
  </script>
</body>
</html>`;

  fse.outputFileSync(path.join(paths.build, 'index.html'), html);
  console.log('✅ AI Interface generated at root');
  
  done();
}