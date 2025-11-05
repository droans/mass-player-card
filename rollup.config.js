import typescript from '@rollup/plugin-typescript';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';

export default [
  {
    input: 'src/main.ts',
    output: {
      file: './dist/mass-player-card.js',
      format: 'es',
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      typescript(),
      json(),
      terser(),
    ],
    onwarn(warning, warn) {
      warn(warning);
    },
  },
];
