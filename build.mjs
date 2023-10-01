import * as fs from 'fs';
import * as esbuild from 'esbuild';
import postcss from 'postcss';
import * as process from 'process';
import tailwindcss from 'tailwindcss';

const validModes = ['serve', 'build-dev', 'build-prod']

if (process.argv.length < 3 || !validModes.includes(process.argv[2])) {
  console.error('usage: node build.mjs <serve | build-dev | build-prod>');
  process.exit(1);
}

const mode = process.argv[2];

const postcssPlugin = {
  name: 'postcss plugin',
  setup(build) {
    build.onLoad({ filter: /\.css$/ }, async (args) => {
      const txt = await fs.promises.readFile(args.path, 'utf8');
      const val = await postcss([ tailwindcss() ]).process(txt, { from: args.path });
      return {
        contents: val.css,
        loader: 'css'
      }
    });
  }
}

const ctx = await esbuild.context({
  // base bundler config
  entryPoints: ['src/index.html', 'src/index.tsx', 'src/style.css'],
  bundle: true,
  outdir: 'dist',
  logLevel: 'debug',
  loader: {'.html': 'copy'},
  plugins: [
    postcssPlugin
  ],

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
  process.exit(0);
}
