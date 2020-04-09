const crypto = require('crypto');
const Db = require('../../../libary/sqlBulider');
const ApiError = require('../../Exceptions/ApiError');
const { lang } = require('../../../config');
const App = require('../../../libary/CommanMethod');
const DB = new Db();

class ApiController {
	async vaildation(required, non_required) {
		try {
			let message = '';
			let empty = [];
			let table_name = required.hasOwnProperty('table_name')
				? required.table_name
				: 'users';
			for (let key in required) {
				if (required.hasOwnProperty(key)) {
					if (required[key] === undefined || required[key] === '') {
						empty.push(key);
					}
				}
			}

			if (empty.length !== 0) {
				message = empty.toString();
				if (empty.length > 1) {
					message += ' ' + lang[_Lang].fieldsRequired;
				} else {
					message += ' ' + lang[_Lang].fieldsRequired;
				}
				throw new ApiError(message, 400);
			}

			if (required.hasOwnProperty('checkexist') && required.checkexist === 1) {
				if (required.hasOwnProperty('email')) {
					if (
						await this.checkingAvailability('email', required.email, table_name)
					) {
						throw new ApiError(lang[_Lang].emailRegister);
					}
				}
				if (required.hasOwnProperty('phone')) {
					if (
						await this.checkingAvailability('phone', required.phone, table_name)
					) {
						throw new ApiError(lang[_Lang].emailRegister);
					}
				}
				if (required.hasOwnProperty('username')) {
					if (
						await this.checkingAvailability(
							'username',
							required.username,
							table_name
						)
					) {
						throw new ApiError('username already exits');
					}
				}
			}

			let final_data = Object.assign(required, non_required);

			if (final_data.hasOwnProperty('password')) {
				final_data.password = crypto
					.createHash('sha1')
					.update(final_data.password)
					.digest('hex');
			}

			if (final_data.hasOwnProperty('old_password')) {
				final_data.old_password = crypto
					.createHash('sha1')
					.update(final_data.old_password)
					.digest('hex');
			}
			if (final_data.hasOwnProperty('new_password')) {
				final_data.new_password = crypto
					.createHash('sha1')
					.update(final_data.new_password)
					.digest('hex');
			}

			for (let data in final_data) {
				if (final_data[data] === undefined) {
					delete final_data[data];
				} else {
					if (typeof final_data[data] == 'string') {
						final_data[data] = final_data[data].trim();
					}
				}
			}
			return final_data;
		} catch (err) {
			throw err;
		}
	}

	async checkingAvailability(key, value, table_name) {
		let query =
			'select * from ' +
			table_name +
			' where `' +
			key +
			"` = '" +
			value +
			"' limit 1";
		let data = await DB.first(query);
		if (data.length) {
			return true;
		} else {
			return false;
		}
	}
	async Paginations(table, condition, page, limit) {
		delete condition.limit;
		delete condition.orderBy;
		const totalRecord = await DB.find(table, 'count', condition);
		let totalPage = Math.round(totalRecord[0].totalRecord / limit, 0);
		if (totalPage === 0) {
			totalPage = 1;
		}
		return {
			currentPage: Math.round(page / limit, 0) + 1,
			totalPage,
			totalRecord: totalRecord[0].totalRecord,
			limit,
		};
	}

	async sendPush(pushObject, user_id) {
		const User = await DB.find('user_auths', 'all', {
			conditions: {
				user_id,
			},
		});
		setTimeout(() => {
			User.forEach((value) => {
				if (value.device_token) {
					pushObject['token'] = value.device_token;
					App.send_push(pushObject);
				}
			});
		}, 100);
	}

	async userDetails(id) {
		const UserDetails = await DB.find('users', 'first', {
			conditions: {
				id: id,
			},
			fields: [
				'id',
				'username',
				'name',
				'status',
				'email',
				'phone',
				'cover_pic',
				'about_us',
				'profile',
				'is_private',
				'verfiy_badge',
			],
		});
		if (UserDetails.profile.length > 0) {
			UserDetails.profile = appURL + 'uploads/' + UserDetails.profile;
		}
		if (UserDetails.cover_pic.length > 0) {
			UserDetails.cover_pic = appURL + 'uploads/' + UserDetails.cover_pic;
		}
		return UserDetails;
	}
}

module.exports = ApiController;
