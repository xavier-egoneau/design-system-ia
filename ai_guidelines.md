# Guidelines - Collaboration IA avec le Design System

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

### Format `.comp.json` standardisé

Chaque composant DOIT avoir un fichier `.comp.json` contenant :

```json
{
  "name": "NomComposant",
  "type": "atom|molecule|organism",
  "variables": {
    "propName": {
      "type": "string|boolean|array|object",
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

### 3. Création de nouvelles pages
L'IA peut composer des pages en combinant les composants existants :

```twig
{# Exemple de page complète #}
{% include "@organisms/header/header.twig" with {
  logo: "/assets/logo.svg",
  nav: [
    { "href": "/", "label": "Accueil" },
    { "href": "/about", "label": "À propos" }
  ]
} %}

<main>
  {% include "@molecules/form-group/form-group.twig" with {
    label: "Votre email",
    type: "email",
    placeholder: "nom@exemple.com"
  } %}
  
  {% include "@atoms/button/button.twig" with {
    variant: "primary"
  } %}
</main>
```

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

L'IA peut ainsi créer du code cohérent en utilisant uniquement les composants validés et documentés du design system.