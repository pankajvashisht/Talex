const ApiController = require('./ApiController');
const Db = require('../../../libary/sqlBulider');
const ApiError = require('../../Exceptions/ApiError');
const app = require('../../../libary/CommanMethod');
const { lang } = require('../../../config');
let apis = new ApiController();
let DB = new Db();

module.exports = {
	addPost: async (Request) => {
		const required = {
			title: Request.body.title,
			user_id: Request.body.user_id,
			description: Request.body.description || '',
			category_id: Request.body.category_id,
			audio_name: Request.body.audio_name,
			media_type: Request.body.media_type || 0,
			locations: Request.body.locations || '',
			latitude: Request.body.latitude || 0,
			longitude: Request.body.longitude || 0,
			id: Request.body.id || 0,
			total_likes: 0,
			total_comments: 0,
			total_shares: 0,
			is_like: 0
		};
		const requestData = await apis.vaildation(required, {});
		if (requestData.id === 0) delete requestData.id;
		if (Request.files && Request.files.media) {
			requestData.media = await app.upload_pic_with_await(Request.files.media);
		}
		requestData.id = await DB.save('posts', requestData);
		if (requestData.media) {
			requestData.media = appURL + 'uploads/' + requestData.media;
		}
		return {
			message: lang[Request.lang].postCreated,
			data: requestData
		};
	},
	deletePost: async (Request) => {
		const { post_id } = Request.query;
		const checkPost = await DB.find('posts', 'first', {
			conditions: {
				id: post_id,
				user_id: Request.body.user_id
			}
		});
		if (!checkPost) {
			throw new ApiError(lang[Request.lang].wrongPost, 422);
		}
		await DB.first(`delete from posts where id = ${post_id}`);
		return {
			message: lang[Request.lang].deletePost,
			data: []
		};
	},

	likePost: async (Request) => {
		const required = {
			user_id: Request.body.user_id,
			post_id: Request.body.post_id
		};
		const requestData = await apis.vaildation(required, {});
		const postDetails = await DB.find('posts', 'all', {
			conditions: {
				id: requestData.post_id
			}
		});
		if (postDetails.length === 0) throw new ApiError(lang[Request.lang].wrongPost, 422);
		const likeDateils = await DB.find('post_likes', 'all', {
			conditions: {
				user_id: requestData.user_id,
				post_id: requestData.post_id
			}
		});
		let message = '';
		if (likeDateils.length > 0) {
			await DB.first(`delete from post_likes where id = ${likeDateils[0].id}`);
			message = lang[Request.lang].postDiLike;
			postDetails[0].total_likes -= 1;
			increareCount(postDetails[0]);
		} else {
			await DB.save('post_likes', requestData);
			message = lang[Request.lang].postLike;
			const { first_name, last_name } = Request.body.userInfo;
			postDetails[0].total_likes += 1;
			increareCount(postDetails[0]);
			saveNotification({
				friend_id: requestData.user_id,
				user_id: postDetails[0].user_id,
				post_id: requestData.post_id,
				type: 1,
				text: `${first_name} ${last_name} like your post`
			});
		}
		return {
			message,
			data: []
		};
	},
	favPost: async (Request) => {
		const required = {
			user_id: Request.body.user_id,
			post_id: Request.body.post_id
		};
		const requestData = await apis.vaildation(required, {});
		const postDetails = await DB.find('posts', 'all', {
			conditions: {
				id: requestData.post_id
			}
		});
		if (postDetails.length === 0) throw new ApiError(lang[Request.lang].wrongPost, 422);
		const likeDateils = await DB.find('favorites_posts', 'all', {
			conditions: {
				user_id: requestData.user_id,
				post_id: requestData.post_id
			}
		});
		let message = '';
		if (likeDateils.length > 0) {
			await DB.first(`delete from favorites_posts where id = ${likeDateils[0].id}`);
			message = lang[Request.lang].postUnfav;
		} else {
			await DB.save('favorites_posts', requestData);
			message = lang[Request.lang].postFav;
		}
		return {
			message,
			data: []
		};
	},
	comment: async (Request) => {
		const required = {
			user_id: Request.body.user_id,
			post_id: Request.body.post_id,
			comment: Request.body.comment,
			id: Request.body.id || 0,
			comment_id: Request.body.comment_id || 0
		};
		const requestData = await apis.vaildation(required, {});
		if (requestData.id === 0) delete requestData.id;
		const postDetails = await DB.find('posts', 'all', {
			conditions: {
				id: requestData.post_id
			}
		});
		if (postDetails.length === 0) throw new ApiError(lang[Request.lang].wrongPost, 422);
		requestData.id = await DB.save('post_comments', requestData);
		//requestData.postDetails = postDetails[0];
		requestData.userInfo = {
			profile:''
		};
		const { profile } = Request.body.userInfo;
		if (profile.length > 0) { 
			requestData.userInfo.profile = appURL + 'uploads/' + profile;
		}
		const { first_name, last_name } = Request.body.userInfo;
		postDetails[0].total_comments += 1;
		increareCount(postDetails[0]);
		saveNotification({
			friend_id: requestData.user_id,
			user_id: postDetails[0].user_id,
			post_id: requestData.post_id,
			type: 2,
			text: `${first_name} ${last_name} comment on your post`
		});
		return {
			message: lang[Request.lang].commentAdd,
			data: requestData
		};
	},
	share: async (Request) => {
		const required = {
			user_id: Request.body.user_id,
			post_id: Request.body.post_id
		};
		const requestData = await apis.vaildation(required, {});
		const postDetails = await DB.find('posts', 'all', {
			conditions: {
				id: requestData.post_id
			}
		});
		if (postDetails.length === 0) throw new ApiError(lang[Request.lang].wrongPost, 422);
		await DB.save('post_shares', requestData);
		postDetails[0].total_shares += 1;
		increareCount(postDetails[0]);
		return {
			message: lang[Request.lang].sharePost,
			data: []
		};
	},
	deleteComment: async (Request) => {
		const { comment_id } = Request.query;
		const checkPost = await DB.find('post_comments', 'first', {
			conditions: {
				id: comment_id,
				user_id: Request.body.user_id
			}
		});
		if (!checkPost) {
			throw new ApiError(lang[Request.lang].wrongPost, 422);
		}
		await DB.first(`delete from post_comments where id = ${comment_id}`);
		const post = await DB.first(`select * from posts where id = ${checkPost.post_id}`);
		post[0].total_comments -= 1;
		increareCount(post[0]);
		return {
			message: lang[Request.lang].deleteComment,
			data: []
		};
	},
	getComments: async (Request) => {
		const required = {
			user_id: Request.body.user_id,
			post_id: Request.params.post_id,
			offset: Request.params.offset || 1,
			limit: Request.query.limit || 20
		};
		const requestData = await apis.vaildation(required, {});
		const postDetails = await DB.find('posts', 'first', {
			conditions: {
				id: requestData.post_id
			}
		});
		if (!postDetails) throw new ApiError(lang[Request.lang].wrongPost, 422);
		const offset = (requestData.offset - 1) * requestData.limit;
		const condition = {
			conditions: {
				post_id: requestData.post_id
			},
			join: [ 'users on (users.id = post_comments.user_id)' ],
			fields: [
				'users.first_name',
				'users.last_name',
				'users.status',
				'users.email',
				'users.phone',
				'users.cover_pic',
				'users.about_us',
				'users.profile',
				'users.user_type',
				'post_comments.*'
			],
			limit: [ offset, requestData.limit ],
			orderBy: [ 'id desc' ]
		};
		const result = await DB.find('post_comments', 'all', condition);
		return {
			message: lang[Request.lang].commentList,
			data: {
				pagination: await apis.Paginations('post_comments', condition, offset, requestData.limit),
				result: app.addUrl(result, [ 'profile', 'cover_pic' ])
			}
		};
	},
	notifications: async (Request) => {
		const { user_id } = Request.body;
		let offset = Request.params.offset || 1;
		const limit = Request.query.limit || 10;
		const condition = {
			conditions: {
				user_id
			},
			join: [ 'users on (users.id = notifications.friend_id)' ],
			fields: [
				'users.first_name',
				'users.last_name',
				'users.status',
				'users.email',
				'users.phone',
				'users.cover_pic',
				'users.about_us',
				'users.profile',
				'users.is_private',
				'notifications.*'
			],
			limit: [ offset, limit ],
			orderBy: [ 'notifications.id desc' ]
		};
		const notification = await DB.find('notifications', 'all', condition);
		return {
			message: lang[Request.lang].NotificationListing,
			data: {
				pagination: await apis.Paginations('notifications', condition, offset, limit),
				result: app.addUrl(notification, [ 'profile', 'cover_pic' ])
			}
		};
	},
	reportPost: async (Request) => { 
		const required = {
			user_id: Request.body.user_id,
			post_id: Request.body.post_id,
			comment: Request.body.comment,
		};
		const requestData = await apis.vaildation(required, {});
		const postDetails = await DB.find('posts', 'first', {
			conditions: {
				id: requestData.post_id
			}
		});
		if (postDetails.length === 0) throw new ApiError(lang[Request.lang].wrongPost, 422);
		await DB.save('report_posts', requestData);
		return {
			message: lang[Request.lang].postCreated,
			data: []
		};
	},
	getPosts: async (Request) => {
		let offset = Request.params.offset || 1;
		const limit = Request.query.limit || 10;
		const friend_post = Request.query.friend_post && Request.body.user_id;
		const user_post = Request.body.user_id && Request.query.my_post;
		const user_id = Request.body.user_id || Request.query.user_id;
		offset = (offset - 1) * limit;
		if (Request.query.friend_post && !Request.body.user_id) {
			throw new ApiError(lang[Request.lang].needLogin, 401);
		}
		const condition = {
			join: [ 'users on (users.id = posts.user_id)' ],
			fields: [
				'users.first_name',
				'users.last_name',
				'users.status',
				'users.email',
				'users.phone',
				'users.cover_pic',
				'users.about_us',
				'users.profile',
				'users.user_type',
				'posts.*',
				'0 as is_like',
				'0 as is_fav'
			],
			limit: [ offset, limit ],
			orderBy: [ 'id desc' ]
		};
		if (user_post) {
			condition.conditions = {
				user_id: user_id
			};
		}
		if (Request.query.user_id) {
			condition.conditions = {
				user_id: Request.query.user_id
			};
		}
		if (friend_post && !user_post) {
			condition.join.push(
				` friends on (posts.user_id=friends.friend_id and friends.user_id=${Request.body
					.user_id} and friends.is_request=0)`
			);
		}
		if (Request.body.hasOwnProperty('user_id')) {
			condition.fields.push(
				`(select count(id) from post_likes where post_id = posts.id and user_id = ${Request.body
					.user_id}) as is_like`
			);
		}
		const result = await DB.find('posts', 'all', condition);
		return {
			message: lang[Request.lang].getPost,
			data: {
				pagination: await apis.Paginations('posts', condition, offset, limit),
				result: app.addUrl(result, [ 'profile', 'cover_pic', 'media' ])
			}
		};
	},
	postDetails: async (Request) => {
		const user_id = Request.body.user_id;
		const condition = {
			conditions: {
				'posts.id': Request.params.post_id
			},
			join: [ 'users on (users.id = posts.user_id)' ],
			fields: [
				'users.first_name',
				'users.last_name',
				'users.status',
				'users.email',
				'users.phone',
				'users.cover_pic',
				'users.about_us',
				'users.profile',
				'users.is_private',
				'posts.*',
				`(select count(id) from post_likes where post_id = posts.id and user_id = ${user_id}) as is_like`,
			]
		};
		const result = await DB.find('posts', 'all', condition);
		if (result.length === 0) {
			throw new ApiError(lang[Request.lang].wrongPost, 422);
		}
		return {
			message: lang[Request.lang].getPost,
			data: app.addUrl(result, [ 'profile', 'cover_pic', 'media' ])[0]
		};
	},
	
};

const saveNotification = async (notification) => {
	if (notification.user_id !== notification.friend_id) {
		DB.save('notifications', notification);
		notification.notification_code = notification.type;
    const pushObject = {
      message: notification.text,
      notification_code: notification.type,
      body: notification
    };
    apis.sendPush(pushObject, notification.user_id);
	}
};

const increareCount = async (posts) => {
	DB.save('posts', posts);
};
