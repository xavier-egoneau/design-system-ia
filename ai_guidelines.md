# Guidelines - Collaboration IA avec le Design System (Version Améliorée)

## 🚨 **IMPORTANT : Format d'Artifact pour l'Import Automatique**

### Structure EXACTE requise pour l'artifact markdown

```markdown
# Mon Design System

## 🎨 Design Tokens
### tokens/_variables.scss
```scss
$color-primary: #000091;
$spacing-md: 16px;
```

## ⚛️ Atoms
### src/atoms/button-dsfr/button-dsfr.comp.json
```json
{
  "name": "ButtonDSFR",
  "type": "atom",
  "variables": {
    "variant": {
      "type": "string",
      "enum": ["primary", "secondary"],
      "default": "primary"
    }
  },
  "variants": [
    {
      "name": "Primary",
      "props": { "variant": "primary", "text": "Bouton principal" }
    }
  ]
}
```

### src/atoms/button-dsfr/button-dsfr.twig
```twig
<button class="fr-btn fr-btn--{{ variant }}">{{ text }}</button>
```

### src/atoms/button-dsfr/_button-dsfr.scss
```scss
@use '../../tokens/variables' as *;

.fr-btn {
  padding: $spacing-md;
  background: $color-primary;
}
```
```

## 🎯 **Règles CRITIQUES pour l'Import**

### 1. **Format des Sections de Fichiers**
- **OBLIGATOIRE** : Chaque fichier DOIT être dans une section `### chemin/vers/fichier.ext`
- **OBLIGATOIRE** : Suivie immédiatement par ````langage` (avec le langage spécifié)
- **OBLIGATOIRE** : Code entre les ````
- **OBLIGATOIRE** : Fermeture avec ````

### 2. **Chemins de Fichiers AUTORISÉS**
- ✅ **UNIQUEMENT** : `src/` et `tokens/`
- ❌ **INTERDIT** : chemins en dehors (public/, tasks/, etc.)
- ❌ **INTERDIT** : `src/pages/index.twig` (protection anti-écrasement)

### 3. **Convention de Nommage STRICTE**
```
src/{category}/{component-name}/{component-name}.{ext}
src/{category}/{component-name}/_{component-name}.scss
```

**Exemples corrects :**
- `src/atoms/button-dsfr/button-dsfr.comp.json`
- `src/atoms/button-dsfr/button-dsfr.twig`
- `src/atoms/button-dsfr/_button-dsfr.scss`

## Architecture des composants

### Structure des dossiers
```
src/
├── atoms/
│   └── button/
│       ├── button.twig
│       ├── _button.scss
│       └── button.comp.json
├── molecules/
│   └── form-group/
│       ├── form-group.twig
│       ├── _form-group.scss
│       └── form-group.comp.json
└── organisms/
    └── header/
        ├── header.twig
        ├── _header.scss
        └── header.comp.json
```

### Format `.comp.json` VALIDÉ

**Structure OBLIGATOIRE :**

```json
{
  "name": "NomComposant",
  "type": "atom|molecule|organism",
  "variables": {
    "propName": {
      "type": "string|boolean|array|object|number",
      "default": "valeur par défaut",
      "enum": ["optionnel", "pour", "valeurs", "limitées"]
    }
  },
  "twig": "template twig inline ou référence fichier",
  "scss": "styles scss inline ou référence fichier", 
  "tokensUsed": ["design.tokens", "utilisés"],
  "variants": [
    {
      "name": "Nom du variant",
      "props": { "propriétés": "spécifiques" }
    }
  ]
}
```

**Champs OBLIGATOIRES :**
- `name` : string
- `type` : "atom"|"molecule"|"organism"
- `variables` : object (même vide {})
- `variants` : array (même vide [])

## Communication avec l'IA

### 1. Découverte des composants
L'IA peut consulter :
- `/ai-components-catalog.json` : Catalogue complet des composants
- `/ai-guide.md` : Documentation détaillée
- Index enrichis de chaque catégorie

### 2. Utilisation des composants
```twig
{# Syntaxe standard pour inclure un composant #}
{% include "@category/component/component.twig" with {
  prop1: "value1",
  prop2: value2,
  variant: "primary"
} %}
```

### 3. **Import SCSS avec Tokens**
```scss
// ✅ CORRECT : Import des tokens
@use '../../tokens/variables' as *;

.mon-composant {
  padding: $spacing-md;
  background: $color-primary;
  border-radius: $radius;
}
```

## 🔧 **Exemples d'Artifacts VALIDES**

### Exemple 1 : Design System DSFR Complet

```markdown
# Design System DSFR

## 🎨 Design Tokens DSFR
### tokens/_variables.scss
```scss
// Couleurs DSFR
$color-blue-france: #000091;
$color-red-marianne: #e1000f;
$color-grey: #666666;

// Espacements
$spacing-xs: 4px;
$spacing-sm: 8px;
$spacing-md: 16px;
$spacing-lg: 32px;
$spacing-xl: 48px;

// Typographie
$font-size-base: 16px;
$font-size-sm: 14px;
$font-size-lg: 18px;

// Autres
$radius: 4px;
$border-width: 1px;
```

## ⚛️ Atoms DSFR

### src/atoms/button-dsfr/button-dsfr.comp.json
```json
{
  "name": "ButtonDSFR",
  "type": "atom",
  "variables": {
    "variant": {
      "type": "string",
      "enum": ["primary", "secondary", "tertiary"],
      "default": "primary"
    },
    "size": {
      "type": "string",
      "enum": ["sm", "md", "lg"],
      "default": "md"
    },
    "icon": {
      "type": "string",
      "default": ""
    },
    "disabled": {
      "type": "boolean",
      "default": false
    },
    "text": {
      "type": "string",
      "default": "Bouton"
    }
  },
  "tokensUsed": ["color.blue-france", "spacing.md", "radius"],
  "variants": [
    {
      "name": "Primary",
      "props": { "variant": "primary", "text": "Action principale" }
    },
    {
      "name": "Secondary", 
      "props": { "variant": "secondary", "text": "Action secondaire" }
    },
    {
      "name": "With Icon",
      "props": { "variant": "primary", "icon": "arrow-right", "text": "Continuer" }
    }
  ]
}
```

### src/atoms/button-dsfr/button-dsfr.twig
```twig
<button 
  class="fr-btn{% if variant == 'secondary' %} fr-btn--secondary{% elseif variant == 'tertiary' %} fr-btn--tertiary{% endif %}{% if size != 'md' %} fr-btn--{{ size }}{% endif %}"
  {% if disabled %}disabled{% endif %}
  type="button"
>
  {% if icon %}<i class="fr-icon-{{ icon }}" aria-hidden="true"></i>{% endif %}
  {{ text }}
</button>
```

### src/atoms/button-dsfr/_button-dsfr.scss
```scss
@use '../../tokens/variables' as *;

.fr-btn {
  display: inline-flex;
  align-items: center;
  gap: $spacing-sm;
  padding: $spacing-sm $spacing-md;
  border: $border-width solid $color-blue-france;
  border-radius: $radius;
  background: $color-blue-france;
  color: white;
  font-size: $font-size-base;
  font-weight: 500;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover:not(:disabled) {
    background: darken($color-blue-france, 10%);
  }

  &--secondary {
    background: white;
    color: $color-blue-france;
    
    &:hover:not(:disabled) {
      background: lighten($color-blue-france, 50%);
    }
  }

  &--tertiary {
    background: transparent;
    border-color: transparent;
    color: $color-blue-france;
    
    &:hover:not(:disabled) {
      background: lighten($color-blue-france, 50%);
    }
  }

  &--sm {
    padding: $spacing-xs $spacing-sm;
    font-size: $font-size-sm;
  }

  &--lg {
    padding: $spacing-md $spacing-lg;
    font-size: $font-size-lg;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}
```

## 🧬 Molecules DSFR

### src/molecules/alert-dsfr/alert-dsfr.comp.json
```json
{
  "name": "AlertDSFR",
  "type": "molecule",
  "variables": {
    "type": {
      "type": "string",
      "enum": ["info", "success", "warning", "error"],
      "default": "info"
    },
    "title": {
      "type": "string", 
      "default": "Information"
    },
    "message": {
      "type": "string",
      "default": "Voici un message d'information."
    },
    "closable": {
      "type": "boolean",
      "default": true
    }
  },
  "tokensUsed": ["color.blue-france", "spacing.md", "radius"],
  "variants": [
    {
      "name": "Info",
      "props": { "type": "info", "title": "Information", "message": "Ceci est une information importante." }
    },
    {
      "name": "Success",
      "props": { "type": "success", "title": "Succès", "message": "Votre action a été réalisée avec succès." }
    },
    {
      "name": "Error",
      "props": { "type": "error", "title": "Erreur", "message": "Une erreur s'est produite." }
    }
  ]
}
```

### src/molecules/alert-dsfr/alert-dsfr.twig
```twig
<div class="fr-alert fr-alert--{{ type }}">
  <div class="fr-alert__title">{{ title }}</div>
  <div class="fr-alert__message">{{ message }}</div>
  {% if closable %}
    <button class="fr-alert__close" type="button" aria-label="Fermer">
      <i class="fr-icon-close-line" aria-hidden="true"></i>
    </button>
  {% endif %}
</div>
```

### src/molecules/alert-dsfr/_alert-dsfr.scss
```scss
@use '../../tokens/variables' as *;

.fr-alert {
  position: relative;
  padding: $spacing-md;
  border-radius: $radius;
  border-left: 4px solid;

  &--info {
    background: lighten($color-blue-france, 50%);
    border-left-color: $color-blue-france;
    color: $color-blue-france;
  }

  &--success {
    background: #d4edda;
    border-left-color: #28a745;
    color: #155724;
  }

  &--warning {
    background: #fff3cd;
    border-left-color: #ffc107;
    color: #856404;
  }

  &--error {
    background: #f8d7da;
    border-left-color: $color-red-marianne;
    color: #721c24;
  }

  &__title {
    font-weight: 600;
    margin-bottom: $spacing-xs;
  }

  &__message {
    line-height: 1.5;
  }

  &__close {
    position: absolute;
    top: $spacing-sm;
    right: $spacing-sm;
    background: none;
    border: none;
    cursor: pointer;
    padding: $spacing-xs;
  }
}
```
```

## ✅ **Checklist avant Import**

### Avant de générer l'artifact :
- [ ] Chaque section de fichier commence par `### chemin/vers/fichier.ext`
- [ ] Chaque bloc de code a le bon langage (scss, json, twig)
- [ ] Tous les chemins commencent par `src/` ou `tokens/`
- [ ] Les noms de composants correspondent aux dossiers
- [ ] Chaque `.comp.json` a les 4 champs obligatoires
- [ ] Les fichiers SCSS importent les tokens avec `@use '../../tokens/variables' as *;`
- [ ] Les classes CSS suivent les conventions de nommage

### Erreurs fréquentes à éviter :
❌ Section sans `###`
❌ Blocs de code sans langage spécifié  
❌ Chemins invalides (public/, node_modules/, etc.)
❌ JSON malformé dans `.comp.json`
❌ Variables Twig non définies dans les métadonnées

## Workflow de développement

### 1. L'IA propose un composant
- Analyse le catalogue existant
- Identifie les composants réutilisables
- Propose une composition ou un nouveau composant

### 2. Création d'un nouveau composant
1. Créer le dossier `src/{category}/{component-name}/`
2. Créer les fichiers `.twig`, `._scss`, `.comp.json`
3. Le build système détecte automatiquement le nouveau composant
4. Les index sont mis à jour automatiquement

### 3. Validation
- Vérification du format JSON contre le schéma
- Test des variants dans les démos
- Validation des design tokens utilisés

## Bonnes pratiques

### Pour l'IA
1. **Toujours consulter le catalogue** avant de proposer du code
2. **Réutiliser les composants existants** quand possible
3. **Respecter les conventions de nommage** (BEM pour CSS)
4. **Utiliser les design tokens** définis dans `tokens/variables`
5. **Proposer des variants** pour les cas d'usage courants
6. **VALIDER le format artifact** avant de le proposer

### Pour les développeurs
1. **Maintenir les `.comp.json`** à jour
2. **Documenter les nouvelles variables** avec types et défauts
3. **Tester tous les variants** définis
4. **Utiliser les design tokens** plutôt que des valeurs hardcodées

## Migration des composants existants

### Étape 1 : Convertir `button.json` vers `button.comp.json`
```json
{
  "name": "Button",
  "type": "atom",
  "variables": {
    "variant": {
      "type": "string",
      "enum": ["primary", "secondary"],
      "default": "primary"
    }
  },
  "variants": [
    { "name": "Primary", "props": { "variant": "primary" } },
    { "name": "Secondary", "props": { "variant": "secondary" } }
  ],
  "tokensUsed": ["color.primary", "spacing.md"]
}
```

### Étape 2 : Enrichir les métadonnées
- Ajouter les `variables` avec types précis
- Documenter les `tokensUsed`
- Créer des variants pour tous les cas d'usage

## Exemple d'interaction IA

**Développeur :** "Créé-moi une page de contact avec un formulaire"

**IA consulte le catalogue et répond :**
```twig
{# Page de contact utilisant les composants existants #}
{% include "@organisms/header/header.twig" %}

<main style="padding: 2rem;">
  <h1>Contactez-nous</h1>
  
  <form>
    {% include "@molecules/form-group/form-group.twig" with {
      label: "Nom",
      id: "name",
      name: "name",
      placeholder: "Votre nom complet"
    } %}
    
    {% include "@molecules/form-group/form-group.twig" with {
      label: "Email",
      id: "email", 
      name: "email",
      type: "email",
      placeholder: "votre@email.com"
    } %}
    
    {% include "@atoms/button/button.twig" with {
      variant: "primary"
    } %}
  </form>
</main>
```