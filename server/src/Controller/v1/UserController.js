const ApiController = require('./ApiController');
const app = require('../../../libary/CommanMethod');
const Db = require('../../../libary/sqlBulider');
const ApiError = require('../../Exceptions/ApiError');
const { lang } = require('../../../config');
const DB = new Db();

class UserController extends ApiController {
	constructor() {
		super();
		this.signupEmail = this.signupEmail.bind(this);
		this.signupPhone = this.signupPhone.bind(this);
		this.loginUser = this.loginUser.bind(this);
		this.soicalLogin = this.soicalLogin.bind(this);
	}

	async signupEmail(req) {
		let required = {
			username: req.body.username,
			email: req.body.email,
			phone: req.body.phone,
			password: req.body.password,
			device_id: req.body.device_id,
			verfiy_badge: false,
			status: 0,
			checkexist: 1
		};
		let non_required = {
			device_type: req.body.device_type,
			device_token: req.body.device_token,
			authorization_key: app.createToken()
		};

		let request_data = await super.vaildation(required, non_required);
		if (req.files && req.files.profile) {
			request_data.profile = await app.upload_pic_with_await(req.files.profile);
		}
		if (req.files && req.files.cover_pic) {
			request_data.cover_pic = await app.upload_pic_with_await(
				req.files.cover_pic
			);
		}
		const user_id = await DB.save('users', request_data);
		request_data.lang = req.lang;
		setTimeout(() => {
			this.saveAuth(request_data, user_id);
			this.mails(request_data);
		}, 100);
		const userInfo = await super.userDetails(user_id);
		userInfo.authorization_key = request_data.authorization_key;
		return {
			message: lang[req.lang].signup,
			data: userInfo
		};
	}

	async signupPhone(req) {
		let required = {
			phone: req.body.phone,
			device_id: req.body.device_id,
			verfiy_badge: false,
			status: 1,
			checkexist: 0
		};
		let non_required = {
			device_type: req.body.device_type,
			device_token: req.body.device_token,
			authorization_key: app.createToken()
		};
		const requestData = await super.vaildation(required, non_required);
		const checkPhone = await DB.find('users', 'first', {
			conditions: {
				phone: requestData.phone
			}
		});
		if (checkPhone) requestData.id = checkPhone.id;
		const user_id = await DB.save('users', requestData);
		if (!checkPhone) {
			await DB.save('users', {
				id: user_id,
				username: `${user_id}User`
			});
		}
		setTimeout(() => {
			this.saveAuth(requestData, user_id);
		}, 100);
		const userInfo = await super.userDetails(user_id);
		userInfo.authorization_key = requestData.authorization_key;
		return {
			message: lang[req.lang].signup,
			data: userInfo
		};
	}

	async saveAuth(data, user_id) {
		const authSave = {
			authorization_key: data.authorization_key,
			device_type: data.device_type || 1,
			device_token: data.device_token || '',
			device_id: data.device_id,
			user_id: user_id
		};
		await DB.save('user_auths', authSave);
	}

	async soicalLogin(req) {
		const required = {
			social_id: req.body.social_id,
			social_token: req.body.social_token,
			soical_type: req.body.soical_type,
			device_id: req.body.device_id
		};
		const non_required = {
			device_type: req.body.device_type,
			device_token: req.body.device_token,
			name: req.body.name,
			email: req.body.email,
			status: 1,
			authorization_key: app.createToken()
		};

		let request_data = await super.vaildation(required, non_required);
		let soical_id = await DB.find('users', 'first', {
			conditions: {
				or: {
					email: request_data.email,
					social_id: request_data.social_id
				}
			},
			fields: ['id']
		});
		if (soical_id) {
			request_data.id = soical_id.id;
		}
		let id = await DB.save('users', request_data);
		setTimeout(() => {
			this.saveAuth(requestData, id);
		}, 100);
		if (!soical_id) {
			await DB.save('users', {
				id,
				username: `${id}User`
			});
		}
		return {
			message: 'User login successfully',
			data: await super.userDetails(id)
		};
	}

	async verifyOtp(req) {
		let required = {
			otp: req.body.otp
		};
		let non_required = {};
		let request_data = await super.vaildation(required, non_required);
		if (parseInt(request_data.otp) !== req.body.userInfo.otp) {
			throw new ApiError(lang[req.lang].invaildOtp);
		}
		req.body.userInfo.status = 1;
		await DB.save('users', req.body.userInfo);
		return {
			message: lang[req.lang].verifyOtp,
			data: await super.userDetails(req.body.userInfo.id)
		};
	}

	async Catgeory(Request) {
		return {
			message: lang[Request.lang].bussinessCatgeory,
			data: await DB.find('categories', 'all')
		};
	}

	async forgotPassword(req) {
		let required = {
			email: req.body.email,
			otp: app.randomNumber()
		};
		let non_required = {};
		let request_data = await super.vaildation(required, non_required);
		let user_info = await DB.find('users', 'first', {
			conditions: {
				email: request_data.email
			},
			fields: ['id', 'email', 'username', 'name']
		});
		if (!user_info) throw new ApiError(lang[req.lang].mailNotFound);
		user_info.otp = request_data.otp;
		user_info.forgot_password_hash = app.createToken();
		await DB.save('users', user_info);
		let mail = {
			to: request_data.email,
			subject: 'Forgot Password',
			template: 'forgot_password',
			data: {
				first_name: user_info.username,
				last_name: user_info.name,
				url: appURL + 'users/change_password/' + user_info.forgot_password_hash
			}
		};
		setTimeout(() => {
			app.send_mail(mail);
		}, 100);
		return {
			message: lang[req.lang].otpSend,
			data: []
		};
	}

	async loginUser(req) {
		const required = {
			email: req.body.email,
			password: req.body.password,
			device_id: req.body.device_id
		};
		const non_required = {
			device_type: req.body.device_type || 0,
			device_token: req.body.device_token || '',
			last_login: app.currentTime,
			authorization_key: app.createToken()
		};

		let request_data = await super.vaildation(required, non_required);
		let login_details = await DB.find('users', 'first', {
			conditions: {
				email: request_data.email
			},
			fields: ['id', 'password', 'status', 'email']
		});
		if (login_details) {
			if (request_data.password !== login_details.password)
				throw new ApiError(lang[req.lang].wrongLogin);
			delete login_details.password;
			const authSave = {
				device_id: request_data.device_id,
				device_type: request_data.device_type,
				device_token: request_data.device_token,
				authorization_key: request_data.authorization_key
			};
			await this.saveAuth(authSave, login_details.id);
			login_details = await super.userDetails(login_details.id);
			login_details.authorization_key = request_data.authorization_key;
			if (login_details.profile.length > 0) {
				login_details.profile = appURL + 'uploads/' + login_details.profile;
			}
			if (login_details.cover_pic.length > 0) {
				login_details.cover_pic = appURL + 'uploads/' + login_details.cover_pic;
			}
			return {
				message: lang[req.lang].LoginMessage,
				data: login_details
			};
		}
		throw new ApiError(lang[req.lang].wrongLogin);
	}

	async appInfo(req) {
		const app_info = await DB.find('app_informations', 'all');
		return {
			message: lang[req.lang].appInfo,
			data: app_info
		};
	}
	async changePassword(req) {
		const required = {
			old_password: req.body.old_password,
			new_password: req.body.new_password
		};
		const request_data = await super.vaildation(required, {});
		const loginInfo = req.body.userInfo;
		if (loginInfo.password !== request_data.old_password) {
			throw new ApiError(lang[req.lang].oldPassword);
		}
		loginInfo.password = request_data.new_password;
		await DB.save('users', loginInfo);
		return {
			message: lang[req.lang].passwordchange,
			data: []
		};
	}
	async userListing(Request) {
		const user_id = Request.body.user_id || 0;
		let offset = Request.params.offset || 1;
		const limit = Request.query.limit || 10;
		const search = Request.query.search || '';
		const page = parseInt(offset);
		offset = (offset - 1) * limit;
		const condition = {
			conditions: {
				status: 1,
				NotEqual: {
					id: user_id
				}
			},
			fields: [
				'users.id',
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
				`0 as is_follow`,
				`0 as i_request`,
				`0 as is_request`,
				`0 as i_follow`
			],
			limit: [offset, limit],
			orderBy: ['users.username asc']
		};
		if (search) {
			condition.conditions['like'] = {
				first_name: search,
				last_name: search,
				email: search
			};
		}
		if (user_id !== 0) {
			condition.fields.push(
				`(select count(id) from friends where user_id=${user_id} and friend_id=users.id and is_request=0) as i_follow`
			);
			condition.fields.push(
				`(select count(id) from friends where user_id=${user_id} and friend_id=users.id and is_request=1) as i_request`
			);
			condition.fields.push(
				`(select count(id) from friends where friend_id=${user_id} and user_id=users.id and is_request=1) as is_request`
			);
			condition.fields.push(
				`(select count(id) from friends where friend_id=${user_id} and user_id=users.id and is_request=0) as is_follow`
			);
		}
		const user_info = await DB.find('users', 'all', condition);
		const message = 'user listing';
		return {
			message,
			data: {
				pagination: await super.Paginations('users', condition, page, limit),
				result: app.addUrl(user_info, ['profile', 'cover_pic'])
			}
		};
	}
	async userProfile(Request) {
		const user_id = Request.query.user_id || Request.body.userInfo.id;
		const loginId = Request.body.user_id || 0;
		const user_info = await super.userDetails(user_id);
		const otherinfo = {
			total_following: 0,
			total_follower: 0,
			total_posts: 0
		};
		user_info.is_follow = 0;
		user_info.i_request = 0;
		user_info.is_request = 0;
		user_info.i_follow = 0;
		const total_following = await DB.first(
			`select count(id) as total from friends where user_id=${user_id}  and is_request=0`
		);
		const total_follower = await DB.first(
			`select count(id) as total from friends where friend_id=${user_id}  and is_request=0`
		);
		const total_posts = await DB.first(
			`select count(id) as total from posts where user_id=${user_id}`
		);
		if (user_id !== loginId) {
			const i_follow = await DB.first(
				`select count(id) as total from friends where user_id=${loginId} and friend_id=${user_id} and is_request=0`
			);
			const i_request = await DB.first(
				`select count(id) as total from friends where user_id=${loginId} and friend_id=${user_id} and is_request=1`
			);
			const is_request = await DB.first(
				`select count(id) as total from friends where friend_id=${loginId} and user_id=${user_id} and is_request=1`
			);
			const is_follow = await DB.first(
				`select count(id) as total from friends where friend_id=${loginId} and user_id=${user_id} and is_request=0`
			);
			user_info.i_follow = i_follow[0].total;
			user_info.i_request = i_request[0].total;
			user_info.is_request = is_request[0].total;
			user_info.is_follow = is_follow[0].total;
		}
		otherinfo.total_following = total_following[0].total;
		otherinfo.total_follower = total_follower[0].total;
		otherinfo.total_posts = total_posts[0].total;
		let posts = [];
		if (
			(user_info.is_private === 1 && user_info.i_follow === 1) ||
			user_info.is_private === 0
		) {
			posts = app.addUrl(
				await DB.first(
					`select *, (select count(id) from post_likes where post_id = posts.id and user_id = ${user_id}) as is_like from posts where user_id = ${user_id} order by id desc limit 10`
				),
				'media'
			);
		}
		return {
			message: lang[Request.lang].userProfile,
			data: {
				user_info,
				otherinfo,
				posts
			}
		};
	}
	async updateProfile(req) {
		const required = {
			id: req.body.user_id
		};
		const non_required = {
			name: req.body.name,
			username: req.body.username,
			about_us: req.body.about_us,
			is_private: req.body.is_private,
			location: req.body.location,
			latitude: req.body.latitude,
			longitude: req.body.longitude
		};
		const request_data = await super.vaildation(required, non_required);
		if (request_data.username) {
			const checkUserName = await DB.first(
				`select username from users where username= '${request_data.username}' and id != ${request_data.id} limit 1`
			);
			if (checkUserName.length > 0) {
				throw new ApiError(
					`this username already register please choice anotherone`,
					422
				);
			}
		}

		if (req.files && req.files.profile) {
			request_data.profile = await app.upload_pic_with_await(req.files.profile);
		}
		if (req.files && req.files.cover_pic) {
			request_data.cover_pic = await app.upload_pic_with_await(
				req.files.cover_pic
			);
		}
		await DB.save('users', request_data);
		return {
			message: lang[req.lang].profileUpdate,
			data: await super.userDetails(request_data.id)
		};
	}

	async logout(req) {
		const required = {
			id: req.body.user_id,
			device_id: req.body.device_id
		};
		const requestData = await super.vaildation(required, {});
		await DB.first(
			`delete from user_auths where user_id = ${requestData.id} and device_id='${requestData.device_id}'`
		);
		return {
			message: lang[req.lang].logoutUser,
			data: []
		};
	}

	mails(request_data) {
		let mail = {
			to: request_data.email,
			subject: 'User Account Verification',
			template: 'user_signup',
			data: {
				first_name: request_data.username,
				last_name: request_data.username,
				url: appURL + 'users/verify/' + request_data.authorization_key
			}
		};
		try {
			app.send_mail(mail);
			return true;
		} catch (error) {
			//
		}
	}
}

module.exports = UserController;
