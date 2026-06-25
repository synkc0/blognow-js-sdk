import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/umd/index.js',
    format: 'umd',
    name: 'BlogNowSDK',
    sourcemap: true,
    globals: {
      'node-fetch': 'fetch',
      'node-html-parser': 'nodeHtmlParser'
    }
  },
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs(),
    typescript({
      target: 'es5',
      module: 'es2015',
      declaration: false,
      declarationMap: false,
      sourceMap: true,
      exclude: ['**/*.test.ts', '**/*.spec.ts', 'tests/**/*']
    }),
    terser({
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    })
  ],
  // Keep the browser-global bundle lean: HTML parsing is for SSR/edge (ESM/CJS) builds.
  external: ['node-html-parser']
};