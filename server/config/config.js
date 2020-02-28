require('dotenv').config();

const path = require('path');
const config = {
	App_name: process.env.APP_NAME || 'Talex',
	port: process.env.port || 4001,
	root_path: path.resolve(__dirname),
	GOOGLE_KEY: process.env.GOOGLE_KEY
};

module.exports = config;
