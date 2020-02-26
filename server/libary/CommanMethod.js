/*
 * v1
 * auth pankaj vashisht @sharmapankaj688@gmail.com
 * helper can used in the whole app for sending mail , push  , payment etc work.
 * function with anysc , await or without anysc awit .
 */

/**
 * first import the configration file after get the all configration
 * send mail , push , file upload etc .
 * when function cal then that file import at moment.
 */
const { config, mails, SMS } = require('../config');
const fs = require('fs');
const crypto = require('crypto');

module.exports = {
	send_mail: function(object) {
		let { nodemailer } = require('./mails');
		const Sendmails = new nodemailer(mails[mails.default]);
		Sendmails.to(object.to).subject(object.subject).html(object.template, object.data).send();
	},
	mailgun: function() {},
	upload_pic_with_await: function(file, folder_name = 'uploads/', unlink = null) {
		try {
			if (!file) {
				return false; // if not getting the image
			} else {
				if (unlink) {
					//
				}

				let upload_path = appRoot + '/public/' + folder_name;
				let image = file;
				let image_array = image.mimetype.split('/');
				let extension = image_array[image_array.length - 1];
				var timestamp = parseInt(new Date().getTime());
				image.mv(upload_path + '/' + timestamp + '.' + extension, function(err) {
					if (err) {
						// eslint-disable-next-line no-console
						console.log(err);
					} else {
						// eslint-disable-next-line no-console
						console.log('file_uploaded');
					}
				});
				return timestamp + '.' + extension;
			}
		} catch (err) {
			throw { code: 415, message: err };
		}
	},
	send_push: function(data) {
		const FCM = require('fcm-node');
		const serverKey = config.GOOGLE_KEY; //put your server key here
		const fcm = new FCM(serverKey);
		const message = {
			to: data.token,
			collapse_key: 'your_collapse_key',

			notification: {
				title: config.App_name,
				body: data.message
			},

			data: data.body
		};
		console.log(message);
		try {
			fcm.send(message, function(err, response) {
        if (err) {
          console.log(err);
					return false;
        } else {
          console.log(response);
					return response;
				}
			});
		} catch (err) {
			throw err;
		}
	},
	send_push_apn: function() {},
	paypal: async function() {},
	stripe: async function() {},
	brain_tree: async function() {},
	sendSMS: (data) => {
		const twilio = require('twilio');
		const { accountSid, authToken, sendNumber } = SMS[SMS.default];
		const client = new twilio(accountSid, authToken);
		client.messages
			.create({
				body: data.message,
				to: '+' + data.to, // Text this number
				from: sendNumber // From a valid Twilio number
			})
			.then((message) => console.log(message.sid))
			.catch((err) => {
				console.log(err);
			});
	},
	error: function(res, err) {
		try {
			let code = typeof err === 'object' ? (err.hasOwnProperty('code') ? err.code : 500) : 403;
			let message = typeof err === 'object' ? (err.hasOwnProperty('message') ? err.message : err) : err;
			res.status(code).json({
				success: false,
				error_message: message,
				code: code,
				data: []
			});
		} catch (error) {
			res.status(500).json(error);
		}
	},
	success: function(res, data) {
		res.json({
			success: true,
			message: data.message,
			code: 200,
			data: data.data
		});
	},
	loadModel: function(file_name = null) {
		try {
			if (fs.existsSync(config.root_path + 'model/' + file_name + '.js')) {
				let models = require('../model/' + file_name);
				return new models();
			} else {
				let message =
					'Model ' +
					file_name +
					' Not Found on the server.Please create the ' +
					file_name +
					' in model folder.';
				throw { code: 404, message };
			}
		} catch (err) {
			throw err;
		}
	},

	createToken() {
		let key = 'abc' + new Date().getTime();
		return crypto.createHash('sha1').update(key).digest('hex');
	},
	addUrl(data, key, folder = 'uploads') {
		if (data.length === 0) {
			return [];
		}
		data.forEach((element, keys) => {
			if (!Array.isArray(key)) {
				if (data[keys][key].length > 0) {
					data[keys][key] = appURL + folder + '/' + data[keys][key];
				}
			} else {
				for (const names of key) {
					if (data[keys][names].length > 0) {
						data[keys][names] = appURL + folder + '/' + data[keys][names];
					}
				}
			}
		});
		return data;
	},
	createHash(key, hash = 'sha1') {
		return crypto.createHash(hash).update(key).digest('hex');
	},
	UserToken: function(id, req) {
		const clientIp = req.connection.remoteAddress;
		const { isMobile, isDesktop, browser, version, os, platform, source } = req.useragent;
		let token = id + clientIp + isMobile + isDesktop + os + version + platform + source + browser;
		return this.createHash(token);
	},
	ImageUrl(name, folder = 'uploads') {
		const ip = 'localhost';
		return 'http://' + ip + '/' + folder + '/' + name;
	},
	randomNumber() {
		return Math.floor(1000 + Math.random() * 9000);
	},
	get currentTime() {
		return Math.round(new Date().getTime() / 1000, 0);
	}
};
