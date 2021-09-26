/** @type {import('@lume/cli/config/getUserConfig').UserConfig} */
module.exports = {
	globalName: 'LUME',
	testSpecFormat: 'jasmine', // or 'mochachai'

	// TODO If this is true, `lume test` fails on private fields syntax (Babel needs an update)
	testWithAllTSAndBabelDecoratorBuildConfigurations: false,
}
