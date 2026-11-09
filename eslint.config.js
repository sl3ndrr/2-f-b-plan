import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['dist/**', 'dist-single/**', 'coverage/**', 'docs/legacy/**', 'docs/screenshots/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
);
