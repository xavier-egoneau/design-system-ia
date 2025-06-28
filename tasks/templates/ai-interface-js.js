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