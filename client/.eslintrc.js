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
    "no-console": "error",
    "func-names": "off",
    "no-underscore-dangle": "off",
    "consistent-return": "off",
    "jest/expect-expect": "off",
    "security/detect-object-injection": "off",
    "@typescript-eslint/no-explicit-any": "off",
  },
  ignorePatterns: [
    "/dist/*",
    "/node_modules/*",
    "/android/*",
    "/ios/*",
    "/bin/*",
    "/scripts/*",
    "/generated/*",
  ],
};
