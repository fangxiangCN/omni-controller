module.exports = {
  root: true,
  overrides: [
    {
      files: ['src/**/*.{ts,tsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              '@omni/*-runtime',
              '@omni/*-runtime/*',
              '@omni/web-runtime',
              '@omni/web-runtime/*',
            ],
          },
        ],
      },
    },
  ],
}
