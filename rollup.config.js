import typescript from 'rollup-plugin-typescript2';
import commonjs from 'rollup-plugin-commonjs';
import nodeResolve from '@rollup/plugin-node-resolve';
import { babel } from '@rollup/plugin-babel';
import terser from '@rollup/plugin-terser';
import json from '@rollup/plugin-json';
import image from '@rollup/plugin-image';
import gzipPlugin from 'rollup-plugin-gzip';

export default [
  {
    input: 'src/index.ts',
    output: {
      file: './dist/mass-card.js',
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
      gzipPlugin(),
    ],
    onwarn(warning, warn) {
      warn(warning);
    },
  },
];
