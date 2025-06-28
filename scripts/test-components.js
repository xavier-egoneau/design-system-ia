#!/usr/bin/env node
import { globSync } from 'glob';
import fse from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Schema de validation pour les composants
const componentSchema = {
  required: ['name', 'type', 'variables', 'variants'],
  properties: {
    name: { type: 'string' },
    type: { enum: ['atom', 'molecule', 'organism'] },
    variables: { type: 'object' },
    variants: { type: 'array' },
    twig: { type: 'string' },
    scss: { type: 'string' },
    tokensUsed: { type: 'array' }
  }
};

class ComponentValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.componentsFound = 0;
    this.componentsValid = 0;
  }

  log(type, component, message) {
    const logMessage = `[${type.toUpperCase()}] ${component}: ${message}`;
    
    if (type === 'error') {
      this.errors.push(logMessage);
      console.error(`❌ ${logMessage}`);
    } else if (type === 'warning') {
      this.warnings.push(logMessage);
      console.warn(`⚠️  ${logMessage}`);
    } else {
      console.log(`✅ ${logMessage}`);
    }
  }

  validateComponentStructure(componentDir) {
    const compName = path.basename(componentDir);
    const requiredFiles = [
      `${compName}.comp.json`,
      `${compName}.twig`,
      `_${compName}.scss`
    ];

    let hasAllFiles = true;

    requiredFiles.forEach(file => {
      const filePath = path.join(componentDir, file);
      if (!fse.existsSync(filePath)) {
        this.log('error', compName, `Missing required file: ${file}`);
        hasAllFiles = false;
      }
    });

    return hasAllFiles;
  }

  validateComponentMetadata(componentDir) {
    const compName = path.basename(componentDir);
    const metaPath = path.join(componentDir, `${compName}.comp.json`);

    try {
      const content = fse.readFileSync(metaPath, 'utf8');
      const metadata = JSON.parse(content);

      // Validation du schema
      componentSchema.required.forEach(prop => {
        if (!(prop in metadata)) {
          this.log('error', compName, `Missing required property: ${prop}`);
          return false;
        }
      });

      // Validation des types
      if (metadata.type && !componentSchema.properties.type.enum.includes(metadata.type)) {
        this.log('error', compName, `Invalid type: ${metadata.type}. Must be one of: ${componentSchema.properties.type.enum.join(', ')}`);
      }

      // Validation des variables
      if (metadata.variables && typeof metadata.variables === 'object') {
        Object.entries(metadata.variables).forEach(([varName, varConfig]) => {
          if (!varConfig.type) {
            this.log('warning', compName, `Variable '${varName}' missing type definition`);
          }
          
          if (varConfig.enum && !Array.isArray(varConfig.enum)) {
            this.log('error', compName, `Variable '${varName}' enum must be an array`);
          }
        });
      }

      // Validation des variants
      if (metadata.variants && Array.isArray(metadata.variants)) {
        metadata.variants.forEach((variant, index) => {
          if (!variant.name) {
            this.log('error', compName, `Variant ${index} missing name`);
          }
          
          if (!variant.props || typeof variant.props !== 'object') {
            this.log('warning', compName, `Variant '${variant.name}' missing or invalid props`);
          }
        });
      }

      // Validation des design tokens
      if (metadata.tokensUsed && !Array.isArray(metadata.tokensUsed)) {
        this.log('error', compName, 'tokensUsed must be an array');
      }

      return true;
    } catch (error) {
      this.log('error', compName, `Invalid JSON in metadata: ${error.message}`);
      return false;
    }
  }

  validateTwigTemplate(componentDir) {
    const compName = path.basename(componentDir);
    const twigPath = path.join(componentDir, `${compName}.twig`);

    try {
      const content = fse.readFileSync(twigPath, 'utf8');
      
      // Vérifications basiques du template Twig
      if (content.trim().length === 0) {
        this.log('warning', compName, 'Twig template is empty');
        return false;
      }

      // Vérifier la présence de variables utilisées
      const metaPath = path.join(componentDir, `${compName}.comp.json`);
      if (fse.existsSync(metaPath)) {
        const metadata = JSON.parse(fse.readFileSync(metaPath, 'utf8'));
        
        if (metadata.variables) {
          Object.keys(metadata.variables).forEach(varName => {
            if (!content.includes(`{{ ${varName}`) && !content.includes(`{{${varName}`)) {
              this.log('warning', compName, `Variable '${varName}' defined but not used in template`);
            }
          });
        }
      }

      // Vérifier la syntaxe des classes CSS
      const classMatches = content.match(/class=["']([^"']+)["']/g);
      if (classMatches) {
        classMatches.forEach(match => {
          const classes = match.match(/["']([^"']+)["']/)[1].split(/\s+/);
          classes.forEach(className => {
            if (!className.startsWith(compName) && !className.startsWith('a-') && !className.startsWith('m-') && !className.startsWith('o-')) {
              this.log('warning', compName, `CSS class '${className}' doesn't follow naming convention`);
            }
          });
        });
      }

      return true;
    } catch (error) {
      this.log('error', compName, `Error reading Twig template: ${error.message}`);
      return false;
    }
  }

  validateScssFile(componentDir) {
    const compName = path.basename(componentDir);
    const scssPath = path.join(componentDir, `_${compName}.scss`);

    try {
      const content = fse.readFileSync(scssPath, 'utf8');
      
      if (content.trim().length === 0) {
        this.log('warning', compName, 'SCSS file is empty');
        return false;
      }

      // Vérifier l'import des tokens
      if (!content.includes("@use") && !content.includes("@import")) {
        this.log('warning', compName, 'SCSS file should import design tokens');
      }

      // Vérifier la présence de la classe principale
      const mainClassRegex = new RegExp(`\\.${compName}\\b`);
      if (!mainClassRegex.test(content)) {
        this.log('warning', compName, `Main CSS class '.${compName}' not found in SCSS`);
      }

      return true;
    } catch (error) {
      this.log('error', compName, `Error reading SCSS file: ${error.message}`);
      return false;
    }
  }

  validateComponentConsistency(componentDir) {
    const compName = path.basename(componentDir);
    const metaPath = path.join(componentDir, `${compName}.comp.json`);
    
    if (!fse.existsSync(metaPath)) return false;

    try {
      const metadata = JSON.parse(fse.readFileSync(metaPath, 'utf8'));
      
      // Vérifier que le nom correspond au dossier
      if (metadata.name !== compName) {
        this.log('warning', compName, `Component name in metadata '${metadata.name}' doesn't match folder name '${compName}'`);
      }

      // Vérifier la cohérence avec la structure de dossiers
      const parentDir = path.basename(path.dirname(componentDir));
      const expectedType = parentDir.slice(0, -1); // atoms -> atom
      
      if (metadata.type !== expectedType) {
        this.log('warning', compName, `Component type '${metadata.type}' doesn't match folder structure '${expectedType}'`);
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  async validateAllComponents() {
    console.log('🔍 Starting component validation...\n');

    const categories = ['atoms', 'molecules', 'organisms'];
    
    for (const category of categories) {
      console.log(`📁 Validating ${category}...`);
      
      const pattern = `src/${category}/*/`;
      const dirs = globSync(pattern, { nodir: false });
      
      if (dirs.length === 0) {
        console.log(`   No components found in ${category}\n`);
        continue;
      }

      for (const dir of dirs) {
        this.componentsFound++;
        const compName = path.basename(dir.replace(/[/\\]$/, ''));
        
        console.log(`   🔎 Validating ${compName}...`);
        
        let isValid = true;
        
        // Validation de la structure des fichiers
        if (!this.validateComponentStructure(dir)) {
          isValid = false;
        }
        
        // Validation des métadonnées
        if (!this.validateComponentMetadata(dir)) {
          isValid = false;
        }
        
        // Validation du template Twig
        if (!this.validateTwigTemplate(dir)) {
          isValid = false;
        }
        
        // Validation du fichier SCSS
        if (!this.validateScssFile(dir)) {
          isValid = false;
        }
        
        // Validation de la cohérence
        if (!this.validateComponentConsistency(dir)) {
          isValid = false;
        }
        
        if (isValid) {
          this.componentsValid++;
          this.log('success', compName, 'Component is valid');
        }
      }
      
      console.log('');
    }
  }

  generateReport() {
    console.log('📊 Validation Report');
    console.log('═'.repeat(50));
    console.log(`Components found: ${this.componentsFound}`);
    console.log(`Components valid: ${this.componentsValid}`);
    console.log(`Success rate: ${this.componentsFound > 0 ? Math.round((this.componentsValid / this.componentsFound) * 100) : 0}%`);
    console.log('');
    
    if (this.errors.length > 0) {
      console.log(`❌ Errors (${this.errors.length}):`);
      this.errors.forEach(error => console.log(`   ${error}`));
      console.log('');
    }
    
    if (this.warnings.length > 0) {
      console.log(`⚠️  Warnings (${this.warnings.length}):`);
      this.warnings.forEach(warning => console.log(`   ${warning}`));
      console.log('');
    }
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('🎉 All components are valid!');
    }
    
    console.log('');
    
    // Suggestions d'amélioration
    if (this.componentsValid < this.componentsFound) {
      console.log('💡 Suggestions:');
      console.log('   • Ensure all components have .comp.json metadata files');
      console.log('   • Follow the naming conventions for CSS classes');
      console.log('   • Import design tokens in SCSS files');
      console.log('   • Define all variables used in Twig templates');
      console.log('   • Create variants for common use cases');
    }
  }

  async generateComponentIndex() {
    console.log('📝 Generating component index...');
    
    const index = {
      generated: new Date().toISOString(),
      components: [],
      stats: {
        total: this.componentsFound,
        valid: this.componentsValid,
        errors: this.errors.length,
        warnings: this.warnings.length
      }
    };

    const categories = ['atoms', 'molecules', 'organisms'];
    
    for (const category of categories) {
      const dirs = globSync(`src/${category}/*/`, { nodir: false });
      
      for (const dir of dirs) {
        const compName = path.basename(dir.replace(/[/\\]$/, ''));
        const metaPath = path.join(dir, `${compName}.comp.json`);
        
        if (fse.existsSync(metaPath)) {
          try {
            const metadata = JSON.parse(fse.readFileSync(metaPath, 'utf8'));
            
            index.components.push({
              name: compName,
              category,
              path: `@${category}/${compName}/${compName}.twig`,
              metadata
            });
          } catch (error) {
            // Ignorer les composants avec des métadonnées invalides
          }
        }
      }
    }

    // Sauvegarder l'index
    const indexPath = path.join(process.cwd(), 'component-index.json');
    fse.writeFileSync(indexPath, JSON.stringify(index, null, 2));
    
    console.log(`✅ Component index saved to: ${indexPath}`);
  }
}

// Exécution du script
async function main() {
  const validator = new ComponentValidator();
  
  try {
    await validator.validateAllComponents();
    validator.generateReport();
    await validator.generateComponentIndex();
    
    // Exit code basé sur les erreurs
    if (validator.errors.length > 0) {
      console.log('❌ Validation failed with errors');
      process.exit(1);
    } else if (validator.warnings.length > 0) {
      console.log('⚠️  Validation completed with warnings');
      process.exit(0);
    } else {
      console.log('✅ All validations passed!');
      process.exit(0);
    }
  } catch (error) {
    console.error('💥 Validation script failed:', error);
    process.exit(1);
  }
}

// Permettre l'exécution directe du script
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}