module.exports = {
  presets: ['@babel/preset-env', '@babel/preset-typescript'],
  plugins: [
    [
      '@babel/plugin-syntax-import-attributes',
      { deprecatedAssertSyntax: true }
    ],
    '@babel/plugin-transform-modules-commonjs'
  ]
};
