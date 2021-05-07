const path = require('path');

module.exports = {
    entry: {
        background: './src/js/background',
        // content: './src/js/content',
        // devTools: './src/js/devTools',
        options: './src/js/options',
        popup: './src/js/popup'
    },
    output: {
        filename: './[name].js'
    },
    resolve: {
        modules: [path.join(__dirname, 'src'), 'node_modules']
    },
    module: {
        rules: [{
            test: /\.js$/,
            use: [{
                loader: 'babel-loader',
            }],
            include: path.resolve(__dirname, '../src/js')
        }]
    }
};