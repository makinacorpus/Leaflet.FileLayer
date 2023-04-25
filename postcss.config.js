// postcss Plugin
module.exports = {
  plugins: [require('postcss-preset-env')],
};
/* module.exports = {
  plugins: [
    require('autoprefixer')({
      overrideBrowserslist: ['defaults', 'Android 4.1', 'iOS 7.1', 'Chrome>31', 'ff>31', 'ie>=8', 'last 2 versions', '>0%'],
    }),
  ],
}; */
