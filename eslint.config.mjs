import eslint from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";
import lit from "eslint-plugin-lit";
import wc from 'eslint-plugin-wc';
import github from 'eslint-plugin-github';

const rootConfigFiles = [".prettierrc.js", "eslint.config.mjs"];

export default tseslint.config(
  { ignores: ["dist", "node_modules/*"] },
  // apply default config
  prettierConfig,
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  github.getFlatConfigs().browser,
  github.getFlatConfigs().recommended,
  {
    plugins: {
      lit: lit,
      wc: wc,
    },
    rules: {
      ...lit.configs.recommended.rules,
      ...wc.configs.recommended.rules,
    }
  },
  // default language/parser options
  {
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: rootConfigFiles,
        },
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
  // individual rule overrides
  {
    rules: {
      "no-console": "warn",
      "@typescript-eslint/no-unnecessary-condition": "warn",
      "@typescript-eslint/non-nullable-type-assertion-style": "off",
      "camelcase": "off",
      "eqeqeq": "off",
      "no-unused-vars": "off",
      "eslint-comments/no-use": "off",
      "github/array-foreach": "off",
      "github/no-then": "off",
      "github/no-dataset": "off",
      "i18n-text/no-en": "off",
      "import/named": "off",
      "import/extensions": "off",
    },
  },
  // disable type checking for root config files
  {
    files: rootConfigFiles,
    ...tseslint.configs.disableTypeChecked,
    languageOptions: { sourceType: "commonjs" },
    rules: {
      ...tseslint.configs.disableTypeChecked.rules,
      "@typescript-eslint/no-require-imports": "off",
    },
  }
);
