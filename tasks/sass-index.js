import { paths }   from './paths.js';
import { globSync } from 'glob';
import fse          from 'fs-extra';
import path         from 'path';

export async function sassIndex() {
  const files = globSync('src/**/_*.scss', { nodir: true })
    .filter(f => !f.endsWith('_generated.scss'));

  const lines = files.map(f => {
    let rel = path.relative(paths.src, f).replace(/\\/g, '/')
                .replace(/\.scss$/, '').replace(/\/_/, '/');
    if (rel.startsWith('_')) rel = rel.slice(1);
    return `@use '${rel}';`;
  });
  const content =
    '// 🚨 AUTO-GENERATED – DO NOT EDIT\n' + lines.join('\n') + '\n';

  if (content !== fse.readFileSync(paths.genFile, 'utf8', ()=>''))
    await fse.outputFile(paths.genFile, content);
}
