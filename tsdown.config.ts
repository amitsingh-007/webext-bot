import { defineConfig } from 'tsdown';

export default defineConfig({
  entry: { index: 'src/app.ts' }, // -> dist/index.js
  format: 'esm',
  platform: 'node',
  target: 'es2022',
  minify: true,
  sourcemap: true,
  outDir: 'dist',
  clean: true,
  dts: false,
  deps: { alwaysBundle: [/.*/] }, // inline every npm dep; node:* stays external
  outputOptions: { entryFileNames: '[name].js' },
});
