import typescript from '@rollup/plugin-typescript';
import commonjs from 'rollup-plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import serve from 'rollup-plugin-serve';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';

export default {
  input: ['src/main.ts'],
  output: {
    file: '../www/mass-player-card.js',
    format: 'es',
  },
  plugins: [
    nodeResolve(),
    commonjs(),
    typescript(),
    json(),
    terser(),
    serve({
      contentBase: '../www',
      host: '0.0.0.0',
      port: 5001,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    }),
  ],
  onwarn(warning, warn) {
    warn(warning);
  },
};