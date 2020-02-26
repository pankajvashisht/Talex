const ApiController = require('./ApiController');
const app = require('../../../libary/CommanMethod');
const Db = require('../../../libary/sqlBulider');
const ApiError = require('../../Exceptions/ApiError');
const { lang, Constants } = require('../../../config');
const DB = new Db();

class UserController extends ApiController {
	constructor() {
		super();
		this.addUser = this.addUser.bind(this);
		this.loginUser = this.loginUser.bind(this);
	}

	async addUser(req) {
		let required = {
			first_name: req.body.first_name,
			email: req.body.email,
			phone: req.body.phone,
			phone_code: req.body.phone_code,
			password: req.body.password,
			device_id: req.body.device_id,
			user_type: req.body.user_type,
			checkexist: 1
		};
		let non_required = {
			device_type: req.body.device_type,
			device_token: req.body.device_token,
			last_name: req.body.last_name,
			location: req.body.location,
			state: req.body.state,
			age: req.body.age,
			sex: req.body.sex,
			marital_status: req.body.marital_status,
			speck_romanina: req.body.speck_romanina,
			zip: req.body.zip,
			website: req.body.website,
			business_hours: req.body.business_hours,
			description: req.body.description,
			category: req.body.category,
			city: req.body.city,
			authorization_key: app.createToken(),
			otp: 1111 //app.randomNumber(),
		};

		let request_data = await super.vaildation(required, non_required);
		if (req.files && req.files.profile) {
			request_data.profile = await app.upload_pic_with_await(req.files.profile);
		}
		if (req.files && req.files.cover_pic) {
			request_data.cover_pic = await app.upload_pic_with_await(req.files.cover_pic);
		}
		const user_id = await DB.save('users', request_data);
		request_data.lang = req.lang;
		setTimeout(() => {
			this.saveAuth(request_data, user_id);
			this.mails(request_data);
			if (req.files && req.files.profile) {
				DB.save('users_pictures', {
					user_id: user_id,
					pictures: request_data.profile,
					type: 1
				});
			}
			if(req.files && req.files.cover_pic){
				DB.save('users_pictures', {
					user_id,
					pictures: request_data.cover_pic,
					type: 2
				});
			}
		}, 100);
		return {
			message: lang[req.lang].signup,
			data: {
				authorization_key: request_data.authorization_key
			}
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
			soical_type: req.body.soical_type
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
			fields: [ 'id' ]
		});
		if (soical_id) {
			request_data.id = soical_id.id;
		}
		let id = await DB.save('users', request_data);
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

	async bussinessCatgeory(Request) {
		return {
			message: lang[Request.lang].bussinessCatgeory,
			data: await DB.find('business_categories', 'all')
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
			fields: [ 'id', 'email', 'first_name', 'last_name' ]
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
				first_name: user_info.first_name,
				last_name: user_info.last_name,
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
			fields: [ 'id', 'password', 'status', 'email' ]
		});
		if (login_details) {
			if (request_data.password !== login_details.password) throw new ApiError(lang[req.lang].wrongLogin);
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
	async usersPic(Request) {
		const user_id = Request.query.user_id || Request.body.user_id;
		let offset = Request.params.offset || 1;
		const limit = Request.query.limit || 10;
		if (user_id === undefined) throw new ApiError('user_id is required', 422);
		offset = (offset - 1) * limit;
		const condition = {
			conditions: {
				user_id
			},
			limit: [ offset, limit ],
			orderBy: [ 'id desc' ]
		};
		const allpic = await DB.find('users_pictures', 'all', condition);
		return {
			message: lang[Request.lang].allPics,
			data: {
				pagination: await super.Paginations('users_pictures', condition, offset, limit),
				result: app.addUrl(allpic, 'pictures')
			}
		};
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
		const user_type = JSON.parse(Request.query.user_type) || 1;
		const user_id = Request.body.user_id || 0;
		let offset = Request.params.offset || 1;
		const limit = Request.query.limit || 10;
		const search = Request.query.search || '';
		const filter = Request.query.filter || false;
		const category_id = Request.query.category_id || 0;
		offset = (offset - 1) * limit;
		const condition = {
			conditions: {
				user_type: user_type,
				status: 1,
				NotEqual: {
					id: user_id
				}
			},
			fields: [
				'users.id',
				'first_name',
				'last_name',
				'status',
				'email',
				'phone',
				'cover_pic',
				'about_us',
				'profile',
				'state',
				'age',
				'sex',
				'marital_status',
				'speck_romanina',
				'zip',
				'website',
				'business_hours',
				'description',
				'category',
				'location',
				'phone_code',
				'user_type',
				'city',
				`0 as is_friend`,
				`0 as i_request`,
				`0 as is_request`,
				`0 as is_fav`
			],
			limit: [ offset, limit ],
			orderBy: [ 'users.first_name asc' ]
		};
		if (search) {
			condition.conditions['like'] = {
				first_name: search,
				last_name: search
			};
		}
		if (JSON.parse(filter)) {
			const searchParameter = user_type === 2 ? Constants.BussinessSearch : Constants.UserSearch;
			searchParameter.forEach((value) => {
				if (Request.query.hasOwnProperty(value)) {
					if (Request.query[value]) { 
						condition.conditions[value] = Request.query[value];
					}
				}
			});
		}
		if (JSON.parse(category_id) !== 0 && user_type === 2) {
			condition.conditions['FIND_IN_SET'] = [ category_id, 'category' ];
		}

		if (user_id !== 0 && user_type === 1) {
			condition.fields.push(
				`(select count(id) from friends where user_id=${user_id} and friend_id=users.id and is_request=0) as is_friend`
			);
			condition.fields.push(
				`(select count(id) from friends where user_id=${user_id} and friend_id=users.id and is_request=1) as i_request`
			);
			condition.fields.push(
				`(select count(id) from friends where friend_id=${user_id} and user_id=users.id and is_request=1) as is_request`
			);
			condition.fields.push(
				`(select count(id) from favorites_users where user_id=${user_id} and friend_id=users.id) as is_fav`
			);
		} else if (user_id !== 0 && user_type === 2) {
			condition.fields.push(
				`(select count(id) from favorites_users where user_id=${user_id} and friend_id=users.id) as is_fav`
			);
			condition.fields.push('location');
		}
		const user_info = await DB.find('users', 'all', condition);
		const message = user_type === 1 ? lang[Request.lang].userList : lang[Request.lang].businessListing;
		return {
			message,
			data: {
				pagination: await super.Paginations('users', condition, offset, limit),
				result: app.addUrl(user_info, [ 'profile', 'cover_pic' ])
			}
		};
	}
	async userProfile(Request) {
		const user_id = Request.query.user_id || Request.body.userInfo.id;
		const loginId = Request.body.user_id;
		const user_info = await super.userDetails(user_id);
		if (user_info.profile.length > 0) {
			user_info.profile = appURL + 'uploads/' + user_info.profile;
		}
		if (user_info.cover_pic.length > 0) {
			user_info.cover_pic = appURL + 'uploads/' + user_info.cover_pic;
		}
		user_info.is_friend = 0;
		user_info.i_request = 0;
		user_info.is_request = 0;
		user_info.is_fav = 0;
		if (user_id !== loginId) {
			const is_friend = await DB.first(
				`select count(id) as total from friends where user_id=${loginId} and friend_id=${user_id} and is_request=0`
			);
			const i_request = await DB.first(
				`select count(id) as total from friends where user_id=${loginId} and friend_id=${user_id} and is_request=1`
			);
			const is_request = await DB.first(
				`select count(id) as total from friends where friend_id=${loginId} and user_id=${user_id} and is_request=1`
			);
			const is_fav = await DB.first(
				`select count(id) as total from favorites_users where user_id=${loginId} and friend_id=${user_id}`
			);
			user_info.is_friend = is_friend[0].total;
			user_info.i_request = i_request[0].total;
			user_info.is_request = is_request[0].total;
			user_info.is_fav = is_fav[0].total;
		}
		const firendQuery = `select users.id,first_name,about_us, last_name, email, profile, cover_pic,state,user_type,
      age,
      sex,
      marital_status,
      speck_romanina,
      zip,
      website,
      business_hours,
      description,
      phone_code,
      category
    from friends join users on (friends.friend_id = users.id) where is_request = 0 and user_id = ${user_id} order by friends.id desc limit 3`;
		const friends = app.addUrl(await DB.first(firendQuery), [ 'profile', 'cover_pic' ]);
		const total_friend = await DB.first(
			`select count(friends.id) as total from friends join users on (friends.friend_id = users.id) where is_request = 0 and user_id = ${user_id} order by friends.id desc`
		);
		const users_pictures = app.addUrl(
			await DB.first(`select * from users_pictures where user_id = ${user_id} order by id desc limit 10`),
			'pictures'
		);
		const posts = app.addUrl(
			await DB.first(
				`select *,(select count(id) from favorites_posts where post_id = posts.id and user_id = ${user_id}) as is_fav, (select count(id) from post_likes where post_id = posts.id and user_id = ${user_id}) as is_like from posts where user_id = ${user_id} order by id desc limit 10`
			),
			'media'
		);
		return {
			message: lang[Request.lang].userProfile,
			data: {
				user_info,
				friends,
				total_friend: total_friend[0].total,
				users_pictures,
				posts
			}
		};
	}
	async doFavUser(Request) {
		const required = {
			user_id: Request.body.user_id,
			friend_id: Request.body.friend_id
		};
		const requestData = await super.vaildation(required, {});
		const postDetails = await DB.find('users', 'all', {
			conditions: {
				id: requestData.friend_id
			}
		});
		if (postDetails.length === 0) throw new ApiError(lang[Request.lang].userNotFound, 404);
		const likeDateils = await DB.find('favorites_users', 'all', {
			conditions: {
				user_id: requestData.user_id,
				friend_id: requestData.friend_id
			}
		});
		let message = '';
		if (likeDateils.length > 0) {
			await DB.first(`delete from favorites_users where id = ${likeDateils[0].id}`);
			message = lang[Request.lang].userUnfav;
		} else {
			await DB.save('favorites_users', requestData);
			message = lang[Request.lang].userFav;
		}
		return {
			message,
			data: []
		};
	}
	async favUsers(Request) {
		const { user_id } = Request.body;
		let offset = Request.params.offset || 1;
		const limit = Request.query.limit || 10;
		const user_type = Request.query.user_type || 1;
		const search = Request.query.search || '';
		offset = (offset - 1) * limit;
		const filter = Request.query.filter || false;
		const condition = {
			conditions: {
				user_id,
				user_type
			},
			join: [ 'users on users.id = favorites_users.friend_id' ],
			fields: [
				'users.id',
				'first_name',
				'last_name',
				'status',
				'email',
				'phone',
				'cover_pic',
				'about_us',
				'profile',
				'state',
				'age',
				'sex',
				'marital_status',
				'speck_romanina',
				'zip',
				'website',
				'business_hours',
				'description',
				'category',
				'location',
				'phone_code',
				'city',
				'user_type',
				`(select count(id) from friends where user_id=${user_id} and friend_id=users.id and is_request=0) as is_friend`,
				`(select count(id) from friends where user_id=${user_id} and friend_id=users.id and is_request=1) as i_request`,
				`(select count(id) from friends where friend_id=${user_id} and user_id=users.id and is_request=1) as is_request`,
				`(select count(id) from favorites_users where user_id=${user_id} and friend_id=users.id) as is_fav`
			],
			limit: [ offset, limit ],
			orderBy: [ 'users.first_name desc' ]
		};
		if (search) {
			condition.conditions['like'] = {
				first_name: search,
				last_name: search,
			};
		}
		if (JSON.parse(filter)) {
			const searchParameter =  Constants.UserSearch;
			searchParameter.forEach((value) => {
				if (Request.query.hasOwnProperty(value)) {
					if (Request.query[value]) { 
						condition.conditions[value] = Request.query[value];
					}
				}
			});
		}
		const user_info = await DB.find('favorites_users', 'all', condition);
		return {
			message: lang[Request.lang].friendList,
			data: {
				pagination: await super.Paginations('favorites_users', condition, offset, limit),
				result: app.addUrl(user_info, [ 'profile', 'cover_pic' ])
			}
		};
	}
	async updateProfile(req) {
		const required = {
			id: req.body.user_id
		};
		const non_required = {
			first_name: req.body.first_name,
			last_name: req.body.last_name,
			about_us: req.body.about_us,
			state: req.body.state,
			age: req.body.age,
			sex: req.body.sex,
			marital_status: req.body.marital_status,
			speck_romanina: req.body.speck_romanina,
			zip: req.body.zip,
			website: req.body.website,
			business_hours: req.body.business_hours,
			description: req.body.description,
			category: req.body.category,
			location: req.body.location,
			city: req.body.city,
			phone_code: req.body.phone_code
		};
		const request_data = await super.vaildation(required, non_required);
		if (req.files && req.files.profile) {
			request_data.profile = await app.upload_pic_with_await(req.files.profile);
			DB.save('users_pictures', {
				user_id: request_data.id,
				pictures: request_data.profile,
				type: 1
			});
		}
		if (req.files && req.files.cover_pic) {
			request_data.cover_pic = await app.upload_pic_with_await(req.files.cover_pic);
			DB.save('users_pictures', {
				user_id: request_data.id,
				pictures: request_data.cover_pic,
				type: 2
			});
		}
		await DB.save('users', request_data);
		const usersinfo = await super.userDetails(request_data.id);
		if (usersinfo.profile.length > 0) {
			usersinfo.profile = appURL + 'uploads/' + usersinfo.profile;
		}
		if (usersinfo.cover_pic.length > 0) {
			usersinfo.cover_pic = appURL + 'uploads/' + usersinfo.cover_pic;
		}
		return {
			message: lang[req.lang].profileUpdate,
			data: usersinfo
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
				first_name: request_data.first_name,
				last_name: request_data.last_name,
				url: appURL + 'users/verify/' + request_data.authorization_key
			}
		};
		try {
			app.sendSMS({
				to: request_data.phone_code + request_data.phone,
				message: `${request_data.otp} ${lang[request_data.lang].OTP}`
			});
			app.send_mail(mail);
			return true;
		} catch (error) {
			//
		}
	}
}

module.exports = UserController;
