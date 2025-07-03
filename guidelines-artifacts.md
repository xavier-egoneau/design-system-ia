# Guidelines - Structure CRITIQUE des Artifacts (Guide IA)

## 🚨 **ERREURS FRÉQUENTES des IA (à éviter absolument)**

### ❌ **Erreur #1 : Sections malformées**
```markdown
<!-- INCORRECT -->
## Atoms
### button.comp.json
```

✅ **CORRECT** : 
```markdown
## ⚛️ Atoms
### src/atoms/button/button.comp.json
```

### ❌ **Erreur #2 : Blocs de code sans langage**
```markdown
<!-- INCORRECT -->
### src/atoms/button/button.comp.json
```
{
  "name": "Button"
}
```
```

✅ **CORRECT** :
```markdown
### src/atoms/button/button.comp.json
```json
{
  "name": "Button"
}
```
```

### ❌ **Erreur #3 : Chemins invalides**
```markdown
<!-- INCORRECT -->
### components/button.json  ← Chemin interdit
### public/button.css      ← Chemin interdit
### button.comp.json       ← Pas de dossier parent
```

✅ **CORRECT** :
```markdown
### src/atoms/button/button.comp.json    ← Chemin valide
### tokens/_variables.scss               ← Chemin valide
```

### ❌ **Erreur #4 : JSON malformé**
```json
<!-- INCORRECT -->
{
  "name": "Button",
  "variables": {
    "variant": "primary"  // ← Structure incorrecte
  }
}
```

✅ **CORRECT** :
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
  "variants": []
}
```

## 🎯 **RÈGLES ABSOLUES pour la Structure**

### **Règle #1 : Sections EXACTES obligatoires**
```markdown
# Mon Design System                    ← Titre obligatoire

## 🎨 Design Tokens                    ← Section obligatoire
### tokens/_variables.scss             ← Chemin exact
```scss                                ← Langage OBLIGATOIRE
$color-primary: #000091;
```                                    ← Fermeture OBLIGATOIRE

## ⚛️ Atoms                            ← Section obligatoire
### src/atoms/nom-composant/nom-composant.comp.json  ← Chemin exact
```json                               ← Langage OBLIGATOIRE
{
  "name": "NomComposant",
  "type": "atom",
  "variables": {},
  "variants": []
}
```                                   ← Fermeture OBLIGATOIRE
```

### **Règle #2 : Convention de nommage STRICTE**
```
✅ CORRECT :
src/atoms/button-primary/button-primary.comp.json
src/atoms/button-primary/button-primary.twig
src/atoms/button-primary/_button-primary.scss

❌ INCORRECT :
src/atoms/button/ButtonPrimary.comp.json  ← Casse incorrecte
src/atoms/button/button.json              ← Extension incorrecte
src/atoms/button/button.css               ← CSS au lieu de SCSS
```

### **Règle #3 : Structure JSON .comp.json OBLIGATOIRE**
```json
{
  "name": "NomExact",           // ← OBLIGATOIRE : string
  "type": "atom",               // ← OBLIGATOIRE : atom|molecule|organism
  "variables": {                // ← OBLIGATOIRE : object (même vide {})
    "propName": {
      "type": "string",         // ← Type obligatoire
      "default": "value",       // ← Valeur par défaut
      "enum": ["opt1", "opt2"]  // ← Optionnel pour choix limités
    }
  },
  "variants": [                 // ← OBLIGATOIRE : array (même vide [])
    {
      "name": "VariantName",    // ← Nom du variant
      "props": { "prop": "val" } // ← Props du variant
    }
  ]
}
```

## 📋 **CHECKLIST de Validation Artifact**

Avant de générer l'artifact, l'IA DOIT vérifier :

### ✅ **Structure générale**
- [ ] Titre `# Mon Design System` présent
- [ ] Section `## 🎨 Design Tokens` présente
- [ ] Au moins une section `## ⚛️ Atoms` ou `## 🧬 Molecules`

### ✅ **Chaque fichier**
- [ ] Commence par `### chemin/vers/fichier.ext`
- [ ] A un bloc ````langage` spécifié
- [ ] Le code est entre ````
- [ ] Se termine par ````

### ✅ **Chemins valides uniquement**
- [ ] Tous les chemins commencent par `src/` ou `tokens/`
- [ ] Aucun chemin `public/`, `components/`, `lib/`, etc.
- [ ] Structure `src/{category}/{nom-composant}/`

### ✅ **Fichiers .comp.json**
- [ ] Champ `name` présent (string)
- [ ] Champ `type` présent (atom|molecule|organism)
- [ ] Champ `variables` présent (object)
- [ ] Champ `variants` présent (array)
- [ ] JSON valide (pas de virgules en trop, etc.)

### ✅ **Cohérence**
- [ ] Nom du composant = nom du dossier
- [ ] Type cohérent avec la catégorie (atom dans atoms/)
- [ ] Variables utilisées dans le template Twig

## 💡 **EXEMPLES PARFAITS à suivre**

### **Artifact minimal valide :**
```markdown
# Design System Test

## 🎨 Design Tokens
### tokens/_variables.scss
```scss
$primary: #0d6efd;
```

## ⚛️ Atoms
### src/atoms/button-test/button-test.comp.json
```json
{
  "name": "ButtonTest",
  "type": "atom",
  "variables": {
    "text": {
      "type": "string",
      "default": "Button"
    }
  },
  "variants": [
    {
      "name": "Default",
      "props": { "text": "Click me" }
    }
  ]
}
```

### src/atoms/button-test/button-test.twig
```twig
<button class="btn">{{ text }}</button>
```

### src/atoms/button-test/_button-test.scss
```scss
@use '../../tokens/variables' as *;

.btn {
  background: $primary;
  color: white;
  padding: 0.5rem 1rem;
}
```
```

## 🚨 **Messages d'erreur typiques et solutions**

### **"Aucun fichier détecté"**
→ Vérifiez les sections `###` et les blocs ````

### **"Chemin non autorisé"**
→ Utilisez uniquement `src/` et `tokens/`

### **"JSON invalide"**
→ Vérifiez la structure obligatoire avec name, type, variables, variants

### **"Erreur lors de l'import"**
→ Vérifiez que chaque bloc de code a son langage spécifié

## 🎯 **Prompt parfait pour l'IA**

```
Génère-moi un design system [Framework] avec [X] atoms et [Y] molecules.

IMPORTANT : Respecte EXACTEMENT cette structure :
- UN artifact markdown complet
- Sections ### avec chemins src/ uniquement  
- Blocs ```langage spécifiés
- JSON .comp.json avec name, type, variables, variants obligatoires
- Imports SCSS avec @use '../../tokens/variables' as *;

Format de test : copie l'exemple parfait ci-dessus et adapte-le.
```

## ✅ **Validation finale**

L'artifact est correct si :
1. ✅ L'analyse dit "X fichiers détectés, Y composants"
2. ✅ L'import dit "X fichiers créés avec succès"
3. ✅ Aucune erreur dans les logs de build

**Si une de ces étapes échoue, l'artifact est malformé.**