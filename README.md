# Design System avec Détection Automatique des Frameworks

Un design system moderne qui s'adapte automatiquement au framework CSS de votre choix, avec support pour l'import automatique de composants générés par l'IA.

## 🌟 Nouveautés v0.3.0

### ✨ **Détection Automatique des Frameworks**
- **Détection intelligente** : Bootstrap, DSFR, Tailwind, Bulma, Foundation
- **Configuration zéro** : CSS et JavaScript intégrés automatiquement
- **Changement à chaud** : Switch entre frameworks sans reconfiguration

### 🚀 **Initialisation Express**
```bash
# Projet Bootstrap en 30 secondes
npm run init:bootstrap

# Projet DSFR (État français)
npm run init:dsfr

# Projet Tailwind
npm run init:tailwind

# Autres frameworks supportés
npm run init:bulma
npm run init:foundation
npm run init:minimal
```

## 🛠️ Installation et Démarrage Rapide

### Nouveau projet avec framework

```bash
# 1. Cloner et installer le design system
git clone <repo>
cd design-system
npm install

# 2. Initialiser avec votre framework préféré
npm run init:bootstrap  # ou dsfr, tailwind, etc.

# 3. Démarrer le développement
npm run dev
# Interface IA : http://localhost:3000
```

### Projet existant

```bash
# Démarrage direct (détection automatique)
npm run dev

# Changer de framework interactivement
npm run switch:framework

# Installer les dépendances du framework détecté
npm run install:framework
```

## 📦 Frameworks Supportés

| Framework | CSS | JS | Auto-Install | Description |
|-----------|-----|----|----|-------------|
| **Bootstrap 5** | ✅ | ✅ | ✅ | Framework populaire avec composants complets |
| **DSFR** | ✅ | ✅ | ✅ | Système de Design de l'État français |
| **Tailwind CSS** | ✅ | ❌ | ✅ | Framework utility-first |
| **Bulma** | ✅ | ❌ | ✅ | CSS moderne sans JavaScript |
| **Foundation** | ✅ | ✅ | ✅ | Framework professionnel responsive |
| **CSS Minimal** | ✅ | ❌ | ➖ | Styles de base sans framework |

## 🎯 Comment ça marche

### 1. **Détection Automatique**
Le système analyse `src/app/package.json` pour détecter les frameworks installés :

```javascript
// Détection Bootstrap
if (dependencies.bootstrap) → Framework: Bootstrap
// Détection DSFR  
if (dependencies['@gouvfr/dsfr']) → Framework: DSFR
// etc.
```

### 2. **Intégration Transparente**
- **CSS** : Compilation automatique avec le bon framework
- **JavaScript** : Scripts intégrés dans les pages et composants
- **Templates** : Variables framework injectées automatiquement
- **Séparation** : Framework dans `src/framework/`, projet dans `src/app/`

### 3. **Composants Adaptatifs**
Les composants s'adaptent au framework détecté :

```twig
{# src/app/atoms/button/button.twig #}

{# Bootstrap #}
<button class="btn btn-{{ variant }}">{{ text }}</button>

{# DSFR #}
<button class="fr-btn fr-btn--{{ variant }}">{{ text }}</button>

{# Minimal #}
<button class="btn btn--{{ variant }}">{{ text }}</button>
```

## 🚀 Workflow Typique

### Démarrer un nouveau projet
```bash
# 1. Choisir son framework
npm run init  # Mode interactif
# ou
npm run init:bootstrap  # Direct

# 2. Développer
npm run dev

# 3. Générer des composants avec l'IA
# → Aller sur http://localhost:3000
# → Demander à Claude de générer un design system Bootstrap
# → Coller l'artifact → Import automatique
```

### Changer de framework en cours de route
```bash
# Interactive
npm run switch:framework

# Ou manuellement
cd src/app
npm install bootstrap@^5.3.2  # Exemple pour Bootstrap
cd ../..
npm run dev  # Redétection automatique
```

## 🤖 Collaboration IA Améliorée

### Import automatique avec framework
L'IA génère des composants adaptés au framework détecté :

```markdown
# Bootstrap Design System

## 🎨 Design Tokens
### src/app/tokens/_variables.scss
```scss
$primary: #0d6efd;
$secondary: #6c757d;
```

## ⚛️ Atoms
### src/app/atoms/button-bootstrap/button-bootstrap.comp.json
```json
{
  "name": "ButtonBootstrap",
  "type": "atom", 
  "variables": {
    "variant": {"enum": ["primary", "secondary", "success"]}
  }
}
```

### src/app/atoms/button-bootstrap/button-bootstrap.twig
```twig
<button class="btn btn-{{ variant }}">{{ text }}</button>
```
```

### Prompts optimisés pour l'IA
```
"Génère un design system Bootstrap complet avec 5 atoms, 3 molecules et 1 organism. 
Utilise les classes Bootstrap natives et respecte le format artifact markdown."
```

## 🏗️ Architecture App/Framework

### **Séparation claire des responsabilités**

```
src/
├── app/           # 🎯 VOTRE PROJET
│   ├── tokens/    # Vos design tokens
│   ├── atoms/     # Vos composants
│   ├── molecules/ # Vos combinaisons
│   ├── organisms/ # Vos sections
│   ├── pages/     # Vos pages
│   └── main.scss  # Votre CSS
└── framework/     # 🏗️ DESIGN SYSTEM (ne pas modifier)
    ├── atoms/     # Composants du framework
    ├── molecules/ # Combinaisons du framework
    └── ...        # Build system
```

### **Pourquoi cette séparation ?**

✅ **Clarté** : Votre code projet séparé du framework  
✅ **Évolutivité** : Changez de framework sans impacter votre code  
✅ **Collaboration** : Équipe projet vs équipe design system  
✅ **Maintenance** : Mises à jour indépendantes  

### **Workflow de développement**

1. **Vos composants** → `src/app/atoms/ma-carte/`
2. **Framework CSS** → Détection automatique + intégration
3. **Build** → Compilation unifiée app + framework
4. **Playground** → Test de vos composants avec le framework

## 📁 Structure Auto-Générée

Selon le framework choisi, la structure s'adapte :

```
src/
├── app/                      # 🎯 Votre projet
│   ├── tokens/
│   │   └── _variables.scss   # Tokens adaptés au framework
│   ├── atoms/
│   │   ├── button/           # Classes framework natives
│   │   ├── input/            # Validation framework
│   │   └── badge/            # Styles cohérents
│   ├── molecules/
│   │   ├── alert/            # Composants framework
│   │   └── card/             # Layout adaptatif
│   ├── organisms/
│   │   └── header/           # Sections complexes
│   ├── pages/
│   │   └── index.twig        # Page avec assets framework
│   ├── main.scss             # Point d'entrée CSS projet
│   └── package.json          # Dépendances framework
├── framework/                # 🏗️ Design system (ne pas modifier)
│   ├── atoms/
│   ├── molecules/
│   ├── organisms/
│   ├── framework.scss        # CSS framework auto-généré
│   └── _generated.scss       # Index auto-généré
└── tasks/                    # 🔧 Build system
    ├── framework-detection.js
    └── ...
```

## 🔧 Configuration Avancée

### Variables d'environnement
```bash
# Forcer un framework spécifique
FRAMEWORK=bootstrap npm run dev

# Mode debug
DEBUG=true npm run dev

# Reset forcé
FORCE=true npm run reset
```

### Personnalisation des frameworks
```javascript
// tasks/framework-detection.js
export class FrameworkDetector {
  detectFrameworks() {
    // Ajouter votre framework custom
    if (deps['votre-framework']) {
      detected.css = 'custom';
      // ...configuration
    }
  }
}
```

## 📊 Commandes de Maintenance

```bash
# Validation des composants
npm run validate

# Rapport détaillé du design system  
npm run report

# Nettoyage des assets
npm run clean:assets

# Reset complet (avec confirmation)
npm run reset:force
```

## 🎨 Exemples par Framework

### Bootstrap
```bash
npm run init:bootstrap
# → Génère Button, Alert, Card avec classes Bootstrap
# → Intègre bootstrap.bundle.js automatiquement
# → Tokens : $primary, $secondary, etc.
```

### DSFR
```bash
npm run init:dsfr  
# → Génère ButtonDSFR, AlertDSFR avec classes fr-*
# → Intègre dsfr.module.js automatiquement
# → Tokens : $color-blue-france, etc.
```

### Tailwind
```bash
npm run init:tailwind
# → Génère composants avec classes utilitaires
# → Configuration tailwind.config.js
# → Build process adapté
```

## 🔍 Debug et Diagnostic

### Diagnostic du framework
```bash
npm run detect:framework
# Affiche le framework détecté et les dépendances manquantes
```

### URLs de développement
- **Interface IA** : http://localhost:3000
- **API** : http://localhost:3001  
- **Debug** : http://localhost:3001/debug/css-paths

### Logs détaillés
```bash
npm run dev:verbose
# Affiche la détection de framework, compilation CSS, etc.
```

## 🆘 Résolution de Problèmes

### Framework non détecté
```bash
# 1. Vérifier package.json
cat src/app/package.json

# 2. Installer manuellement
cd src/app && npm install bootstrap

# 3. Forcer la redétection
npm run detect:framework
```

### CSS du framework absent
```bash
# Vérifier les chemins
curl http://localhost:3001/debug/css-paths

# Reinstaller les assets
npm run install:framework
```

### Composants IA non fonctionnels
```bash
# Valider la structure
npm run validate

# Nettoyer et rebuilder
npm run clean && npm run build
```

## 🚀 Migration depuis v0.2.0

```bash
# 1. Sauvegarder l'ancien src/
cp -r src/app src-app-backup

# 2. Mettre à jour
git pull origin main
npm install

# 3. Migrer avec le framework détecté
npm run dev  # Détection automatique

# 4. Ou choisir un nouveau framework
npm run switch:framework
```

## 📈 Roadmap

- [ ] Support Ant Design
- [ ] Support Material UI  
- [ ] Templates de démarrage par domaine (e-commerce, admin, etc.)
- [ ] CLI interactif complet
- [ ] Intégration Storybook
- [ ] Export vers Figma

---

**Le design system qui s'adapte à vos choix techniques ! 🎯**