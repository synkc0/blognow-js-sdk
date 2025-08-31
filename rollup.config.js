import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/index.ts',
  output: {
    file: 'dist/umd/index.js',
    format: 'umd',
    name: 'BlogNowSDK',
    sourcemap: true,
    globals: {
      'node-fetch': 'fetch'
    }
  },
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false
    }),
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
  external: []
};