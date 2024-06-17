const CopyWebpackPlugin = require('copy-webpack-plugin')
const path = require('path')

module.exports = function override(config, env) {
	if (!config.plugins) {
		config.plugins = []
	}

	config.plugins.push(
		new CopyWebpackPlugin({
			patterns: [
				{
					from: path.resolve(__dirname, '_redirects'),
					to: path.resolve(__dirname, 'build'),
				},
			],
		})
	)

	return config
}
