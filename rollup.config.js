import typescript from '@rollup/plugin-typescript';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import {compileLitTemplates} from '@lit-labs/compiler';

export default [
  {
    input: 'src/main.ts',
    output: {
      // dir: './dist',
      file: './dist/mass-player-card.js',
      format: 'es',
      inlineDynamicImports: true,
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript({
        transformers: {
          before: [compileLitTemplates()]
        }
      }),
      json(),
      terser(),
    ],
    onwarn(warning, warn) {
      warn(warning);
    },
  },
];
