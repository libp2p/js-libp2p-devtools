import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: [
    'src/app.tsx'
  ],
  bundle: true,
  outfile: 'dist/app.js',
  format: 'esm',
  loader: {
    '.png': 'dataurl',
    '.svg': 'dataurl'
  }
})
