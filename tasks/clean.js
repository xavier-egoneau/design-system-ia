import { deleteAsync } from 'del';
import { paths }       from './paths.js';

/** Vide complètement le dossier de build */
export const clean = () => deleteAsync([paths.build]);
