import tseslint from 'typescript-eslint';
export default tseslint.config({ ignores: ['node_modules/**', 'dist/**', 'test-results/**', '.local/**'] }, ...tseslint.configs.recommended);
