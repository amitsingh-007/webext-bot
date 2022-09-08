module.exports = {
  env: {
    node: true,
    commonjs: true,
    es2021: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:import/recommended",
    "plugin:node/recommended",
  ],
  parserOptions: {
    ecmaVersion: 12,
  },
  rules: {
    indent: ["error", 2],
    "linebreak-style": [
      "error",
      process.platform === "win32" ? "windows" : "unix",
    ],
    quotes: ["error", "double"],
    semi: ["error", "always"],
  },
  settings: {
    "import/resolver": "node",
  },
};
