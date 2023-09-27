import * as esbuild from 'esbuild';
import * as process from 'process';

const validModes = ['serve', 'build-dev', 'build-prod']

if (process.argv.length < 3 || !validModes.includes(process.argv[2])) {
  console.error('usage: node build.mjs <serve | build-dev | build-prod>');
  process.exit(1);
}

const mode = process.argv[2];

const ctx = await esbuild.context({
  // base bundler config
  entryPoints: ['src/index.html', 'src/index.tsx'],
  bundle: true,
  outdir: 'dist',
  logLevel: 'info',
  loader: {'.html': 'copy'},

  // environment-specific transformations
  minify: mode === 'build-prod',
  sourcemap: mode !== 'build-prod',

  // global defines, replaced during transformation
  define: {
    'DEBUG': 'true',
    'ENVIRONMENT': 'dev'
  }
});

if (mode === 'serve') {
  await ctx.watch();
  await ctx.serve({ port: 1234 });
} else {
  await ctx.rebuild();
}
