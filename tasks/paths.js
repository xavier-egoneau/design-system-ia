import path from 'path';

export const paths = {
  src:   'src',
  build: 'public',
  twigPages:  'src/pages/**/*.twig',
  twigSnips:  ['src/atoms/*/*.twig', 'src/molecules/*/*.twig', 'src/organisms/*/*.twig'],
  scssEntry: 'src/main.scss',
  scssFramework: 'src/framework.scss', // 👈 Nouveau
  scssAll:  ['src/**/*.scss', '!src/_generated.scss', '!src/framework.scss'], // 👈 Exclure framework
  jsonAll:  'src/**/*.json',
  genFile:  'src/_generated.scss',
  twingRoot: path.resolve('src')
};