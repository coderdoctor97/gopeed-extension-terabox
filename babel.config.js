export default {
  presets: [
    [
      '@babel/preset-env',
      {
        // goja (Gopeed's JS engine) supports ES2017+ async/await natively; transpiling it would only bloat the bundle.
        exclude: ['transform-async-to-generator', 'transform-regenerator'],
      },
    ],
  ],
};
