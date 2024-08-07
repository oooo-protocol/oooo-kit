module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'ted',
    'ted/react',
    'ted/typescript',
    './.eslintrc-auto-import.json'
  ],
  parserOptions: {
    tsconfigRootDir: __dirname,
    project: [
      './tsconfig.json',
      './tsconfig.node.json'
    ]
  }
}
