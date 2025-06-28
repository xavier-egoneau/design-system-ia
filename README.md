# Design System avec Interface IA

Un design system moderne avec support pour l'import automatique de composants générés par l'intelligence artificielle.

## 🚀 Fonctionnalités

### ✨ **Nouveauté : Import IA Automatique**
- **Interface web intuitive** pour importer des composants en masse
- **Parser intelligent** d'artifacts markdown générés par l'IA
- **Création automatique** de tous les fichiers (tokens, composants, styles)
- **Feedback temps réel** avec progress bar et validation
- **Rebuild automatique** du design system

### 🎨 **Design System Classique**
- Architecture atomique (Atoms → Molecules → Organisms → Pages)
- Templates Twig avec namespaces
- Compilation Sass avec design tokens
- Playground interactif pour chaque composant
- Documentation auto-générée

## 📁 Structure du projet

```
├── src/
│   ├── atoms/           # Composants de base
│   ├── molecules/       # Combinaisons d'atoms
│   ├── organisms/       # Sections complexes
│   ├── pages/           # Templates de votre projet
│   ├── tokens/          # Design tokens (variables Sass)
│   └── main.scss        # Point d'entrée Sass
├── tasks/               # Tâches Gulp
├── public/              # Build généré
│   ├── index.html       # 🌟 Interface IA (auto-générée)
│   ├── atoms/           # Démos des atoms
│   ├── molecules/       # Démos des molecules
│   ├── organisms/       # Démos des organisms
│   ├── pages/           # Pages compilées
│   ├── css/main.css     # CSS compilé
│   ├── ai-guide.md      # 🤖 Guide pour l'IA
│   └── ai-components-catalog.json  # 🤖 Catalogue machine
└── gulpfile.js
```

## 🛠️ Installation

```bash
# Cloner et installer
git clone <repo>
cd design-system
npm install

# Développement avec interface IA
npm run dev

# Build de production
npm run build
```

## 🤖 **Utilisation de l'Interface IA**

### 1. **Accéder à l'interface**
```bash
npm run dev
# Aller sur http://localhost:3000
```

### 2. **Générer des composants avec l'IA**
Demandez à votre IA préférée :

> "Génère un design system DSFR complet avec tokens, atoms (button, input, badge), molecules (alert, card) et un organism (header). Format : artifact markdown structuré avec sections ### pour chaque fichier."

### 3. **Importer automatiquement**
1. **Copiez** l'artifact markdown généré
2. **Collez** dans la zone de texte de l'interface
3. **Cliquez "Analyser"** - validation de la structure
4. **Cliquez "Importer"** - création automatique des fichiers
5. **Cliquez "Rebuilder"** - compilation du design system

### 4. **Résultat**
- ✅ Tous les fichiers créés automatiquement
- ✅ Design system compilé et disponible
- ✅ Playground interactif pour chaque composant
- ✅ Navigation entre tous les éléments

## 📝 Format des Composants

### Structure d'un composant
```
src/atoms/button/
├── button.comp.json    # 🌟 Métadonnées (nouveau format)
├── button.twig         # Template
└── _button.scss        # Styles
```

### Format `.comp.json` (nouveau)
```json
{
  "name": "Button",
  "type": "atom",
  "variables": {
    "variant": {
      "type": "string",
      "enum": ["primary", "secondary"],
      "default": "primary"
    },
    "disabled": {
      "type": "boolean",
      "default": false
    }
  },
  "twig": "button.twig",
  "scss": "_button.scss",
  "tokensUsed": ["color.primary", "spacing.md"],
  "variants": [
    {
      "name": "Primary",
      "props": { "variant": "primary", "text": "Bouton principal" }
    },
    {
      "name": "Disabled",
      "props": { "variant": "primary", "disabled": true, "text": "Indisponible" }
    }
  ]
}
```

### Template Twig avec namespaces
```twig
{# Utilisation d'un composant #}
{% include "@atoms/button/button.twig" with {
  variant: "primary",
  text: "Mon bouton"
} %}

{# Dans une molecule #}
{% include "@molecules/form-group/form-group.twig" with {
  label: "Email",
  type: "email"
} %}
```

## 🎨 Design Tokens

### Variables Sass centralisées
```scss
// tokens/_variables.scss
$color-primary: #005eff;
$color-secondary: #888888;
$spacing-md: 16px;
$font-size-base: 16px;
$radius: 6px;
```

### Utilisation dans les composants
```scss
// atoms/button/_button.scss
@use '../../tokens/variables' as *;

.btn {
  padding: $spacing-md;
  background: $color-primary;
  border-radius: $radius;
  font-size: $font-size-base;
}
```

## 🔧 Développement

### Commands NPM
```bash
npm run dev        # Développement avec interface IA
npm run build      # Build de production
npm run clean      # Nettoyer le build
npm run api        # API seule (port 3001)
```

### URLs de développement
- **Interface IA** : http://localhost:3000
- **API** : http://localhost:3001
- **Atoms** : http://localhost:3000/atoms/
- **Molecules** : http://localhost:3000/molecules/
- **Organisms** : http://localhost:3000/organisms/
- **Pages** : http://localhost:3000/pages/

### Watcher automatique
Le système surveille automatiquement :
- ✅ **Fichiers Sass** → recompilation CSS
- ✅ **Templates Twig** → regeneration démos
- ✅ **Métadonnées .comp.json** → mise à jour playground
- ✅ **Nouveaux composants** → ajout automatique

## 🔒 Sécurité et Protection

### Protection anti-écrasement
- ✅ **`src/pages/index.twig` ignoré** lors de la génération
- ✅ **Validation des chemins** d'import (seuls `src/` et `tokens/` autorisés)
- ✅ **Protection path traversal** dans l'API
- ✅ **Séparation pages projet / index auto-générés**

### API Endpoints sécurisés
```javascript
POST /api/parse-artifact     # Parser un artifact markdown
POST /api/create-batch       # Créer plusieurs fichiers
POST /api/rebuild           # Rebuilder le système
GET  /api/components        # Lister les composants
```

## 🤖 Collaboration IA

### Fichiers générés pour l'IA
- **`/ai-guide.md`** - Guide d'utilisation des composants
- **`/ai-components-catalog.json`** - Catalogue machine avec métadonnées
- **Index enrichis** avec documentation JSON intégrée

### Workflow IA optimisé
1. **L'IA consulte** le catalogue existant
2. **L'IA génère** des composants cohérents utilisant les mêmes tokens
3. **L'IA propose** des artifacts structurés prêts à importer
4. **Vous importez** en 3 clics via l'interface web

### Format d'artifact attendu
```markdown
# Mon Design System

## 🎨 Design Tokens
### tokens/_variables.scss
```scss
$color-primary: #000091;
$spacing-md: 16px;
```

## ⚛️ Atoms
### src/atoms/button/button.comp.json
```json
{
  "name": "Button",
  "type": "atom",
  "variables": { ... }
}
```

### src/atoms/button/button.twig
```twig
<button class="btn">{{ text }}</button>
```

### src/atoms/button/_button.scss
```scss
.btn { ... }
```
```

## 🚀 Évolutions récentes

### v0.2.0 - Interface IA
- ✅ Interface web pour import automatique
- ✅ Parser d'artifacts markdown
- ✅ API de création de fichiers en lot
- ✅ Rebuild automatique
- ✅ Protection anti-écrasement

### v0.1.0 - Base
- ✅ Architecture atomique
- ✅ Compilation Sass avec tokens
- ✅ Templates Twig avec namespaces
- ✅ Playground interactif
- ✅ Documentation auto-générée

## 🎯 Cas d'usage

### 1. **Développeur solo**
- Créez rapidement un design system complet
- Importez des composants générés par l'IA
- Playground pour tester les variants

### 2. **Équipe design/dev**
- Base commune avec tokens centralisés
- Composants réutilisables et documentés
- Workflow IA pour accélérer la création

### 3. **Prototypage rapide**
- Génération de composants en masse via IA
- Test immédiat dans le playground
- Export vers autres projets

## 🔧 Personnalisation

### Ajouter des catégories
```javascript
// Dans tasks/indexes.js et gulpfile.js
export const templatesIndex = catIndex('templates');
```

### Étendre le format .comp.json
```json
{
  "accessibility": {
    "ariaLabel": "string",
    "keyboardNavigation": true
  },
  "documentation": {
    "designNotes": "Utiliser pour les actions principales",
    "codeExamples": ["<button>...</button>"]
  }
}
```

### Personnaliser l'interface IA
- Modifier `tasks/indexes.js` → fonction `generateAIInterface()`
- Styles dans la section `<style>` intégrée
- JavaScript dans `public/js/ai-interface.js`

## 📊 Métriques et Debug

### Logs de développement
```bash
🔍 Parsing artifact markdown...
📦 Creating batch of 15 files...
✅ Created: src/atoms/button/button.comp.json
🔨 Triggering rebuild...
✅ AI Interface generated at root
```

### Validation automatique
- ✅ **Format JSON** des métadonnées
- ✅ **Cohérence** des tokens utilisés
- ✅ **Structure** des fichiers
- ✅ **Namespaces** Twig corrects

---

## 🆘 Support

### Problèmes courants

**Import IA ne fonctionne pas**
- Vérifiez que l'API est démarrée (port 3001)
- Format markdown doit avoir des sections `###` pour chaque fichier
- Chemins doivent commencer par `src/` ou `tokens/`

**Composants non détectés**
- Vérifiez la présence du fichier `.comp.json`
- Format JSON doit être valide
- Relancez `npm run build`

**Erreurs de compilation**
- Vérifiez les imports Sass `@use '../../tokens/variables'`
- Namespaces Twig corrects (`@atoms/`, `@molecules/`, etc.)

### Debug
```bash
# Logs détaillés
npm run dev:verbose

# Test API seule
npm run api

# Validation composants
npm run test:components
```

---

**Le design system avec interface IA est maintenant prêt ! 🎉**

Passez de "20 fichiers à coder" à "3 clics pour importer" grâce à la collaboration IA intégrée.