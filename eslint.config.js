import js from "@eslint/js";
import globals from "globals";
import pluginReact from "eslint-plugin-react";

export default [
  {
    ignores: ["dist/**", "node_modules/**", "public/service-worker.js"], // Ignore build output and service worker in public
  },
  js.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,jsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node, // For build scripts or service worker if linted separately
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  {
    // Apply React plugin recommendations specifically to JSX files in src
    ...pluginReact.configs.flat.recommended,
    files: ["src/**/*.{js,jsx}"], // Ensure this applies only to src files
  },
  {
    files: ["src/**/*.{js,jsx}"],
    rules: {
      "react/react-in-jsx-scope": "off", // Not needed with new JSX transform
      "react/prop-types": "off", // Turn off if not using prop-types
      "no-unused-vars": ["warn", { "argsIgnorePattern": "^_" }], // Warn for unused vars, allow underscore prefix
      // Add any other project-specific rule overrides here
    }
  }
];

