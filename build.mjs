#!/usr/bin/env node
import esbuild from 'esbuild';
import glslify from 'glslify';
import * as fs from 'node:fs';
import { dirname } from 'node:path';
import * as util from 'node:util';

const context = await esbuild.context({
  entryPoints: ['src/index.tsx'],
  bundle: true,
  outfile: 'build/index.js',
  //sourcemap: 'inline',
  minify: true,
  logLevel: "info",
  plugins: [
    glslPlugin({
      minify: true,
      useGlslify: true,
    })
  ]
});

await context.watch();


function glslPlugin({
  minify = true,
  useGlslify = true,
  fileTypes = ['frag', 'vert', 'wgsl', 'vs', 'fs', 'glsl']
}) {
  const readFile = util.promisify(fs.readFile);
  const filter = new RegExp(`\.(?:${fileTypes.join('|')})$`);

  return {
    name: 'glsl',
    setup: (build) => {
      build.onLoad({ filter }, async (args) => {
        let source = await readFile(args.path, 'utf8');

        if (useGlslify) {
          source = glslify.compile(source, { basedir: dirname(args.path) });
        }

        return {
          loader: 'text',
          contents: minify ? minifyShader(source) : source
        };
      });
    }
  };
}

function minifyShader(text) {
  let forceNewline = false;
  const lines = text.replace(
    /\\(?:\r\n|\n\r|\n|\r)|\/\*.*?\*\/|\/\/(?:\\(?:\r\n|\n\r|\n|\r)|[^\n\r])*/g,
    ''
  ).split(/\n+/);

  return lines.reduce((result, line) => {
    line = line.trim().replace(/\s{2,}|\t/, ' ');

    if (line.charAt(0) === '#') {
      if (forceNewline) {
        result.push('\n');
      }

      result.push(line, '\n');

      forceNewline = false;
    } else {
      result.push(
        line.replace(
          /\s*({|}|=|\*|,|\+|\/|>|<|&|\||\[|\]|\(|\)|-|!|;)\s*/g, '$1'
        )
      );

      forceNewline = true;
    }

    return result;
  }, []).join('').replace(/\n+/g, '\n');
}
