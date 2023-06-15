module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: false,
        targets: {
          browsers: ['> 1%', 'last 2 versions', 'not dead'],
        },
        'corejs':'3',
        'useBuiltIns':'usage'
      },
    ],
  ],
};
