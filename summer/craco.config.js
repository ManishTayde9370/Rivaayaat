module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Find the source-map-loader rule and exclude react-datepicker
      const oneOfRule = webpackConfig.module.rules.find(rule => Array.isArray(rule.oneOf)).oneOf;
      oneOfRule.forEach(rule => {
        if (
          rule.enforce === 'pre' &&
          rule.use &&
          rule.use.some(u => u.loader && u.loader.includes('source-map-loader'))
        ) {
          rule.exclude = [
            ...(rule.exclude || []),
            /react-datepicker/
          ];
        }
      });
      return webpackConfig;
    }
  }
}; 