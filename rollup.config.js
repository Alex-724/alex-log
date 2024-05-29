import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';

export default [
  {
    input: './index.ts',
    output: {
      file: 'dist/index.cjs',
      format: 'cjs'
    },
    plugins: [typescript(), commonjs(), nodeResolve(), json()]
  },
  {
    input: './index.ts',
    output: {
      file: 'dist/index.mjs',
      format: 'esm'
    },
    plugins: [typescript(), nodeResolve(), json()]
  }
];