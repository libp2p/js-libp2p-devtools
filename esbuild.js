import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: [
    'src/app.tsx'
  ],
  bundle: true,
  outfile: 'dist/app.js',
})

await esbuild.build({
  entryPoints: [
    'src/background.ts'
  ],
  bundle: true,
  outfile: 'dist/background.js',
})

await esbuild.build({
  entryPoints: [
    'src/content-script.ts'
  ],
  bundle: true,
  outfile: 'dist/content-script.js',
})
