// tasks/templates/ai-interface-html.js
export function getAIInterfaceHTML() {
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8">
  <title>Design System - Interface IA</title>
  <link rel="stylesheet" href="/css/main.css">
  <style>{{CSS_PLACEHOLDER}}</style>
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
                placeholder="Collez ici votre artifact markdown complet..."
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
            <div class="copy-action">
              <div class="copy-description">
                <strong>📖 Guide d'utilisation</strong>
                <small>Instructions complètes pour l'IA</small>
              </div>
              <button class="btn btn-copy" onclick="copyAIGuide(event)">📋 Copier</button>
            </div>
            
            <div style="margin: 1rem 0; height: 1px; background: #dee2e6;"></div>
            
            <div class="copy-action">
              <div class="copy-description">
                <strong>🗃️ Catalogue des composants</strong>
                <small>Métadonnées JSON des composants existants</small>
              </div>
              <button class="btn btn-copy" onclick="copyComponentsCatalog(event)">📋 Copier</button>
            </div>
            
            <div class="example-text">
              Ces fichiers permettent à l'IA de comprendre votre design system et de générer des composants cohérents.
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Toast pour feedback -->
  <div id="toast" class="toast"></div>

  <script src="/js/ai-interface.js"></script>
</body>
</html>`;
}

// tasks/templates/ai-interface-css.js
export function getAIInterfaceCSS() {
  return `
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
    
    .btn-copy {
      background: #17a2b8;
      color: white;
    }
    
    .btn-copy:hover:not(:disabled) {
      background: #138496;
      transform: translateY(-2px);
    }
    
    .btn-copy.copied {
      background: #28a745;
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
    
    .copy-action {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      justify-content: space-between;
      margin-bottom: 1rem;
    }
    
    .copy-description {
      flex: 1;
    }
    
    .copy-description strong {
      display: block;
      margin-bottom: 0.25rem;
    }
    
    .copy-description small {
      color: #6c757d;
    }
    
    .toast {
      position: fixed;
      top: 20px;
      right: 20px;
      background: #28a745;
      color: white;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      transform: translateX(100%);
      transition: transform 0.3s ease;
    }
    
    .toast.show {
      transform: translateX(0);
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
  `;
}

// tasks/templates/ai-interface-js.js
export function getAIInterfaceJS() {
  return `class EnhancedArtifactImporter {
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
    panel.className = 'status-panel ' + type;
    panel.innerHTML = message;
    panel.style.display = 'block';
  }
  
  updateProgress(percent) {
    const bar = document.getElementById('progress-bar');
    const fill = document.getElementById('progress-fill');
    bar.style.display = 'block';
    fill.style.width = percent + '%';
    if (percent >= 100) {
      setTimeout(() => { bar.style.display = 'none'; }, 2000);
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
      
      const response = await fetch('http://localhost:3001/api/parse-artifact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
      this.showStatus('✅ Artifact analysé avec succès !<br>📊 ' + result.files.length + ' fichiers détectés, ' + result.stats.componentsCount + ' composants, ' + result.stats.tokensCount + ' fichiers de tokens', 'success');
      
    } catch (error) {
      this.showStatus('❌ Erreur lors de l\\'analyse :<br>' + error.message, 'error');
      console.error(error);
    } finally {
      parseBtn.disabled = false;
      parseBtn.innerHTML = '🔍 Analyser l\\'Artifact';
    }
  }
  
  displayResults() {
    const files = this.parsedData.files;
    const stats = this.parsedData.stats;
    
    document.getElementById('tokens-count').textContent = stats.tokensCount;
    document.getElementById('components-count').textContent = stats.componentsCount;
    document.getElementById('files-count').textContent = stats.totalFiles;
    document.getElementById('success-count').textContent = '0';
    
    const fileList = document.getElementById('file-list');
    fileList.innerHTML = '';
    
    files.forEach((file, index) => {
      const item = document.createElement('div');
      item.className = 'file-item';
      item.id = 'file-' + index;
      
      const icon = this.getFileIcon(file.type);
      item.innerHTML = '<span class="file-icon">' + icon + '</span>' +
        '<span style="flex: 1;">' + file.path + '</span>' +
        '<span style="font-size: 0.75rem; color: #6c757d;">' + file.language + '</span>';
      
      fileList.appendChild(item);
    });
    
    document.getElementById('results-section').style.display = 'block';
  }
  
  getFileIcon(type) {
    const icons = { 'token': '🎨', 'component': '⚛️', 'other': '📄' };
    return icons[type] || icons.other;
  }
  
  async importComponents() {
    if (!this.parsedData) {
      this.showStatus('❌ Aucun artifact analysé', 'error');
      return;
    }
    
    const files = this.parsedData.files;
    const importBtn = document.getElementById('import-btn');
    
    importBtn.disabled = true;
    importBtn.innerHTML = '<span class="loading"></span> Import...';
    
    this.showStatus('⚡ Import en cours...', 'info');
    this.updateProgress(0);
    
    let successCount = 0;
    
    try {
      const response = await fetch('http://localhost:3001/api/create-batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ files })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de l\\'import');
      }
      
      const result = await response.json();
      successCount = result.success;
      
      result.results.success.forEach(success => {
        const fileIndex = files.findIndex(f => f.path === success.path);
        if (fileIndex >= 0) {
          const fileItem = document.getElementById('file-' + fileIndex);
          if (fileItem) fileItem.classList.add('created');
        }
      });
      
      result.results.errors.forEach(error => {
        const fileIndex = files.findIndex(f => f.path === error.path);
        if (fileIndex >= 0) {
          const fileItem = document.getElementById('file-' + fileIndex);
          if (fileItem) fileItem.classList.add('error');
        }
      });
      
      document.getElementById('success-count').textContent = successCount;
      this.updateProgress(100);
      
      if (result.errors === 0) {
        this.showStatus('🎉 Import terminé avec succès !<br>📁 ' + successCount + ' fichiers créés<br><br>💡 Vous pouvez maintenant rebuilder le système pour voir vos composants.', 'success');
        document.getElementById('rebuild-btn').disabled = false;
      } else {
        this.showStatus('⚠️ Import terminé avec ' + result.errors + ' erreurs<br>✅ ' + successCount + ' fichiers créés avec succès<br>❌ ' + result.errors + ' erreurs', 'warning');
        document.getElementById('rebuild-btn').disabled = false;
      }
      
    } catch (error) {
      this.showStatus('❌ Erreur durant l\\'import :<br>' + error.message, 'error');
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
      
      const response = await fetch('http://localhost:3001/api/rebuild', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors du rebuild');
      }
      
      const result = await response.json();
      
      this.showStatus('🎉 Rebuild terminé avec succès !<br><br>🌐 Votre design system est maintenant disponible :<br>• <a href="/atoms/index.html" target="_blank">Atoms</a><br>• <a href="/molecules/index.html" target="_blank">Molecules</a><br>• <a href="/organisms/index.html" target="_blank">Organisms</a><br>• <a href="/pages/index.html" target="_blank">Pages du projet</a>', 'success');
      
      setTimeout(() => { window.location.reload(); }, 3000);
      
    } catch (error) {
      this.showStatus('❌ Erreur durant le rebuild :<br>' + error.message, 'error');
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

async function copyAIGuide(event) {
  const btn = event ? event.target : null;
  
  try {
    const guide = generateAIGuideContent();
    
    await navigator.clipboard.writeText(guide);
    showToast('📖 Guide IA copié dans le presse-papier !');
    
    if (btn) {
      const originalText = btn.innerHTML;
      btn.innerHTML = '✅ Copié !';
      btn.classList.add('copied');
      
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.remove('copied');
      }, 2000);
    }
    
  } catch (error) {
    console.error('Erreur lors de la copie:', error);
    showToast('❌ Erreur lors de la copie du guide', 'error');
  }
}

async function copyComponentsCatalog(event) {
  const btn = event ? event.target : null;
  
  try {
    console.log('🔍 Tentative de récupération via /api/components...');
    
    const response = await fetch('http://localhost:3001/api/components', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Response status:', response.status, response.statusText);
    
    if (!response.ok) {
      console.warn('⚠️ API components failed, trying fallback...');
      const fallbackResponse = await fetch('/ai-components-catalog.json');
      if (fallbackResponse.ok) {
        const catalog = await fallbackResponse.text();
        await navigator.clipboard.writeText(catalog);
        showToast('🗃️ Catalogue des composants copié (fallback) !');
      } else {
        throw new Error('API et fichier statique indisponibles');
      }
    } else {
      const components = await response.json();
      console.log('✅ Components received:', components.length, 'items');
      
      const catalog = JSON.stringify(components, null, 2);
      await navigator.clipboard.writeText(catalog);
      showToast('🗃️ Catalogue des composants copié dans le presse-papier !');
    }
    
    if (btn) {
      const originalText = btn.innerHTML;
      btn.innerHTML = '✅ Copié !';
      btn.classList.add('copied');
      
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.classList.remove('copied');
      }, 2000);
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de la copie:', error);
    
    try {
      const fallbackCatalog = generateFallbackCatalog();
      await navigator.clipboard.writeText(fallbackCatalog);
      showToast('📋 Catalogue de base copié (mode dégradé)', 'warning');
      
      if (btn) {
        const originalText = btn.innerHTML;
        btn.innerHTML = '⚠️ Copié (dégradé)';
        btn.classList.add('copied');
        
        setTimeout(() => {
          btn.innerHTML = originalText;
          btn.classList.remove('copied');
        }, 2000);
      }
    } catch (clipboardError) {
      showToast('❌ Erreur lors de la copie du catalogue', 'error');
    }
  }
}

function generateFallbackCatalog() {
  const fallbackComponents = [
    {
      "name": "Input", 
      "category": "atoms",
      "path": "@atoms/input/input.twig",
      "include": "{% include \\"@atoms/input/input.twig\\" with {...} %}",
      "type": "atom",
      "variables": {
        "type": { "type": "string", "default": "text" },
        "name": { "type": "string", "default": "input" },
        "placeholder": { "type": "string", "default": "Entrez votre texte" },
        "disabled": { "type": "boolean", "default": false }
      },
      "variants": [
        { "name": "Default", "props": {} },
        { "name": "Disabled", "props": { "disabled": true } }
      ]
    },
    {
      "name": "Button",
      "category": "atoms", 
      "path": "@atoms/button/button.twig",
      "include": "{% include \\"@atoms/button/button.twig\\" with {...} %}",
      "type": "atom",
      "variables": {
        "variant": { "type": "string", "enum": ["primary", "secondary"], "default": "primary" },
        "text": { "type": "string", "default": "Button" },
        "disabled": { "type": "boolean", "default": false }
      },
      "variants": [
        { "name": "Primary", "props": { "variant": "primary", "text": "Bouton principal" } },
        { "name": "Secondary", "props": { "variant": "secondary", "text": "Bouton secondaire" } }
      ]
    }
  ];
  
  return JSON.stringify(fallbackComponents, null, 2);
}

function generateAIGuideContent() {
  return \`# Design System - Guide pour l'IA

## Comment utiliser les composants

Chaque composant peut être inclus via Twig avec cette syntaxe :
\\\`\\\`\\\`twig
{% include "@category/component/component.twig" with {
  prop1: "value1",
  prop2: "value2"
} %}
\\\`\\\`\\\`

## Composants disponibles

Utilisez l'API /api/components ou copiez le catalogue JSON pour voir tous les composants disponibles avec leurs métadonnées complètes.

## Structure des artifacts pour l'import automatique

Pour créer des composants via l'interface d'import, utilisez ce format exact :

\\\`\\\`\\\`markdown
# Mon Design System

## 🎨 Design Tokens
### tokens/_variables.scss
\\\`\\\`\\\`scss
\\$color-primary: #000091;
\\$spacing-md: 16px;
\\\`\\\`\\\`

## ⚛️ Atoms
### src/atoms/button-example/button-example.comp.json
\\\`\\\`\\\`json
{
  "name": "ButtonExample",
  "type": "atom",
  "variables": {
    "variant": {
      "type": "string",
      "enum": ["primary", "secondary"],
      "default": "primary"
    },
    "text": {
      "type": "string",
      "default": "Button"
    }
  },
  "variants": [
    {
      "name": "Primary",
      "props": { "variant": "primary", "text": "Bouton principal" }
    }
  ]
}
\\\`\\\`\\\`

### src/atoms/button-example/button-example.twig
\\\`\\\`\\\`twig
<button class="btn btn--{{ variant }}">{{ text }}</button>
\\\`\\\`\\\`

### src/atoms/button-example/_button-example.scss
\\\`\\\`\\\`scss
@use '../../tokens/variables' as *;

.btn {
  padding: \\$spacing-md;
  background: \\$color-primary;
}
\\\`\\\`\\\`
\\\`\\\`\\\`

## Guidelines importantes

1. **Toujours consulter le catalogue** avant de proposer du code
2. **Réutiliser les composants existants** quand possible  
3. **Respecter les conventions de nommage** 
4. **Utiliser les design tokens** définis dans tokens/variables
5. **Format artifacts strict** : sections ### + langages spécifiés

## Paths autorisés pour l'import

- ✅ src/atoms/
- ✅ src/molecules/  
- ✅ src/organisms/
- ✅ tokens/
- ❌ Tout autre chemin est interdit

## Champs obligatoires .comp.json

- name (string)
- type (atom|molecule|organism)
- variables (object, même vide)
- variants (array, même vide)
\`;
}

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = 'toast ' + type;
  
  if (type === 'error') {
    toast.style.background = '#dc3545';
    toast.style.color = 'white';
  } else if (type === 'warning') {
    toast.style.background = '#ffc107';
    toast.style.color = '#856404';
  } else {
    toast.style.background = '#28a745';
    toast.style.color = 'white';
  }
  
  toast.classList.add('show');
  
  const duration = type === 'warning' ? 5000 : 3000;
  setTimeout(() => {
    toast.classList.remove('show');
  }, duration);
}

window.copyAIGuide = copyAIGuide;
window.copyComponentsCatalog = copyComponentsCatalog;

new EnhancedArtifactImporter();`;
}