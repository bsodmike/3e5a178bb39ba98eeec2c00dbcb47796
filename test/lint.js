const lint = require('mocha-eslint');

const paths = [
  './',
  '/test/**/*.js',
];

lint(paths, {});
