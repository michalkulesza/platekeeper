- separate components like inside App.tsx, AppShell, ResumeTimersModal etx. should not be in one file
- use const instead of function
- onOpenChange={(open) => { if (!open) confirmResume(); }}> let's not do that, make a function out of that
- how are we doing on error catching? do we have boundaries?
- are we using reactQuery for caching and optimizations? if not let's implement it
- add eslint and prettier
{
  "semi": false,
  "singleQuote": true,
  "tabWidth": 2,
  "trailingComma": "es5",
  "printWidth": 80,
  "arrowParens": "always"
}

export default [
  { ignores: ['dist', 'node_modules'] },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      padding,
    },
    rules: {
      // your preferences
      'semi': ['error', 'never'],
      'padding-line-between-statements': [
        'error',
        // newline before return
        { blankLine: 'always', prev: '*', next: 'return' },
      ],
      // newline after hook declarations, before next statement
      'padding/newline-after-hooks': 'error',

      // react rules
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
]