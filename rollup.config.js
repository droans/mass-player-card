import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import image from '@rollup/plugin-image';

export default [
  {
    input: 'src/main.ts',
    output: {
      file: './dist/mass-player-card.js',
      format: 'es',
    },
    plugins: [
      image(),
      nodeResolve(),
      commonjs(),
      typescript(),
      json(),
      babel({
        exclude: 'node_modules/**',
        babelHelpers: 'bundled',
      }),
      terser(),
    ],
    onwarn(warning, warn) {
      warn(warning);
    },
  },
];
