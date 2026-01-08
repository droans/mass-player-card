import eslint from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";
// eslint-disable-next-line import/no-unresolved
import tseslint from "typescript-eslint";
import lit from "eslint-plugin-lit";
import wc from "eslint-plugin-wc";
import github from "eslint-plugin-github";
import observers from "eslint-plugin-observers";
import listeners from "eslint-plugin-listeners";
import eslintPluginUnicorn from "eslint-plugin-unicorn";

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
  eslintPluginUnicorn.configs.recommended,
  {
    plugins: {
      lit,
      wc,
      listeners,
      observers,
    },
    rules: {
      ...lit.configs.recommended.rules,
      ...wc.configs.recommended.rules,
      "listeners/no-missing-remove-event-listener": "error",
      "listeners/matching-remove-event-listener": "error",
      "listeners/no-inline-function-event-listener": "error",
      "observers/no-missing-unobserve-or-disconnect": "error",
      "observers/matching-unobserve-target": "error",
      "unicorn/prefer-set-has": "off",
    },
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
        ...globals.commonjs,
        ...globals.builtin,
      },
    },
  },
  // individual rule overrides
  {
    rules: {
      "no-console": "warn",
      "@typescript-eslint/no-unnecessary-condition": "warn",
      "@typescript-eslint/non-nullable-type-assertion-style": "off",
      camelcase: "off",
      eqeqeq: "off",
      "no-unused-vars": "off",
      "eslint-comments/no-use": "off",
      "github/array-foreach": "off",
      "github/no-then": "off",
      "github/no-dataset": "off",
      "i18n-text/no-en": "off",
      "import/named": "off",
      "import/extensions": "off",
      "import/no-named-as-default-member": "off",
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
  },
);
