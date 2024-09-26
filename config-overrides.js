const webpack = require('webpack');

module.exports = function override(config, env) {
    // Add the new alias
    config.resolve.alias = {
        ...config.resolve.alias,
        'process': 'process/browser.js',
    };

    // Add the new plugin
    config.plugins.push(
        new webpack.ProvidePlugin({
            process: 'process/browser.js',
        }),
    );

    return config;
};