module.exports = {
	globalName: 'LUME',

	// One config per global
	/** @param {import('webpack').Configuration[]} configs */
	webpackConfigs(configs) {
		const config = configs[0]
		// config.externals = [
		// 	(ctx, callback) => {
		// 		if (ctx.request.startsWith('three')) callback(null, 'THREE')
		// 		else callback()
		// 	},
		// ]
		config.mode = 'development'
	},
}
