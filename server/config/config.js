require('dotenv').config();

const path = require('path');
const config = {
	App_name: process.env.APP_NAME || 'ROU',
	port: process.env.port || 4001,
	root_path: path.resolve(__dirname),
	GOOGLE_KEY:
		'AAAAYLkQhLk:APA91bFEbNv-3YOMk0DODV4s2dl2Y6SkKV6Lh49tATwutvKDTBy7bhUN0MNbX3QDmdaNwWJepmwsDBAMBg5HjsWTaf5NvA7Ti29SFMA_xvNJ-mHhrB91taMuK2c7x16TAMrn-a4D0byA'
};

module.exports = config;
