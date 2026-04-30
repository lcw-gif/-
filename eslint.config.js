import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';
import ts from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';

export default [
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsParser,
    },
    plugins: {
      "@typescript-eslint": ts,
    },
  },
  {
    ignores: ['dist/**/*']
  },
  ...firebaseRulesPlugin.configs['flat/recommended']
]
