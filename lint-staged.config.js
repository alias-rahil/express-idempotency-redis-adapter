const config = {
	'*': () => ['npm run build:dry', 'npm run lint:fix'],
};

// eslint-disable-next-line unicorn/prefer-module
module.exports = config;
