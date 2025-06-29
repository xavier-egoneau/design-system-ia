import path from 'path';

export const paths = {
  // Projet utilisateur
  app: 'src/app',
  appPages: 'src/app/pages/**/*.twig',
  appComponents: ['src/app/atoms/*/*.twig', 'src/app/molecules/*/*.twig', 'src/app/organisms/*/*.twig'],
  appScssAll: ['src/app/**/*.scss', '!src/app/_generated.scss'],
  appTokens: 'src/app/tokens',
  appGenFile: 'src/app/_generated.scss',
  appJsonAll: 'src/app/**/*.json',
  
  // 🆕 ASSETS - Nouveau
  appAssets: 'src/app/assets/**/*',
  assetsImages: 'src/app/assets/images/**/*',
  assetsFonts: 'src/app/assets/fonts/**/*',
  assetsIcons: 'src/app/assets/icons/**/*',
  
  // Points d'entrée système (à la racine de src)
  scssEntry: 'src/main.scss',              // Point d'entrée Gulp
  
  // Système design system
  system: 'src/system',
  systemTemplates: 'src/system/templates',
  systemAssets: 'src/system/assets',
  frameworkScss: 'src/system/framework.scss',
  
  // Build
  build: 'public',
  buildAssets: 'public/assets',  // 🆕 ASSETS BUILD
  
  // Twing root (pour les namespaces)
  twingRoot: path.resolve('src/app')
};