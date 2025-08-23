import eslint from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";
import tseslint from "typescript-eslint";

const rootConfigFiles = [".prettierrc.js", "eslint.config.mjs"];

export default tseslint.config(
  { ignores: ["dist", "node_modules/*"] },
  // apply default config
  prettierConfig,
  eslint.configs.recommended,
  tseslint.configs.strictTypeChecked,
  tseslint.configs.stylisticTypeChecked,
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
      "no-unused-vars": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
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
