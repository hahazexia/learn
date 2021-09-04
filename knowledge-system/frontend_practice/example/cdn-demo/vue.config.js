const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

module.exports = {
  configureWebpack: () => {
    const res = {
      plugins: [
        new BundleAnalyzerPlugin()
      ],
      externals: {
        'vue': 'Vue',
        'view-design': 'iview'
      }
    };

    return res;
  }
}