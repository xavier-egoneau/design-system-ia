import { paths } from './paths.js';
import { globSync } from 'glob';
import fse from 'fs-extra';
import path from 'path';

export async function sassIndex() {
  // Rechercher uniquement dans src/app/
  const files = globSync('src/app/**/_*.scss', { nodir: true })
    .filter(f => !f.endsWith('_generated.scss'))
    .filter(f => !f.includes('node_modules'));

  console.log(`📝 Sass index: ${files.length} fichiers détectés dans src/app/`);

  const lines = files.map(f => {
    let rel = path.relative(paths.app, f).replace(/\\/g, '/')
                .replace(/\.scss$/, '').replace(/\/_/, '/');
    if (rel.startsWith('_')) rel = rel.slice(1);
    return `@use '${rel}';`;
  });
  
  const content = '// 🚨 AUTO-GENERATED – DO NOT EDIT\n' + lines.join('\n') + '\n';

  if (content !== fse.readFileSync(paths.appGenFile, 'utf8', ()=>''))
    await fse.outputFile(paths.appGenFile, content);
}