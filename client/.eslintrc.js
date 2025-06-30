module.exports = {
  extends: [
    "expo",
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:import/recommended",
    "plugin:prettier/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
  ],
  plugins: ["@typescript-eslint", "import", "security", "prettier"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
    ecmaFeatures: { jsx: true },
    project: "./tsconfig.json",
  },
  settings: {
    "import/resolver": {
      "babel-module": {},
    },
  },
  rules: {
    "no-console": "warn",
    "func-names": "off",
    "no-underscore-dangle": "off",
    "consistent-return": "off",
    "jest/expect-expect": "off",
    "security/detect-object-injection": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-unused-vars": "warn",
  },
  ignorePatterns: [
    "/dist/*",
    "/node_modules/*",
    "/android/*",
    "/ios/*",
    "/bin/*",
    "/scripts/*",
    "/generated/*",
    "metro.config.js",
    "babel.config.js",
    "app.config.js",
  ],
  "prettier/prettier": [
    "error",
    {
      endOfLine: "auto",
    },
  ],
};
