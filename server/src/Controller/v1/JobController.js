const ApiController = require('./ApiController');
const Db = require('../../../libary/sqlBulider');
const ApiError = require('../../Exceptions/ApiError');
const app = require('../../../libary/CommanMethod');
const { lang, Constants } = require('../../../config');
const apis = new ApiController();
const DB = new Db();

module.exports = {
	addJob: async Request => {
		const required = {
			user_id: Request.body.user_id,
			job_category_id: Request.body.job_category_id,
			title: Request.body.title,
			salary: Request.body.salary,
			job_type: Request.body.job_type,
			business_name: Request.body.business_name,
			required_experience: Request.body.required_experience,
			required_language: Request.body.required_language,
			business_email: Request.body.business_email,
			state: Request.body.state,
			city: Request.body.city,
			id: Request.body.id || 0
		};
		const non_required = {
			zip_code: Request.body.zip_code,
			driver_license: Request.body.driver_license,
			benefits: Request.body.benefits,
			working_hour: Request.body.working_hour,
			business_phone: Request.body.business_phone,
			business_website: Request.body.business_website,
			description: Request.body.description,
			latitude: Request.body.latitude,
			locations: Request.body.locations,
			longitude: Request.body.longitude
		};
		const requestData = await apis.vaildation(required, non_required);
		requestData.contact_info = JSON.stringify(Request.body.userInfo);
		if (requestData.id === 0) delete requestData.id;
		const category = await DB.find('job_categories', 'first', {
			conditions: {
				id: requestData.job_category_id
			}
		});
		if (!category) throw new ApiError(lang[Request.lang].categoryNotFound, 404);
		if (Request.files && Request.files.picture) {
			requestData.picture = await app.upload_pic_with_await(
				Request.files.picture
			);
		}
		if (Request.files && Request.files.cover_pic) {
			requestData.cover_pic = await app.upload_pic_with_await(
				Request.files.cover_pic
			);
		}
		requestData.id = await DB.save('jobs', requestData);
		if (requestData.picture) {
			requestData.picture = appURL + 'uploads/' + requestData.picture;
		}
		if (requestData.cover_pic) {
			requestData.cover_pic = appURL + 'uploads/' + requestData.cover_pic;
		}
		return {
			message: lang[Request.lang].addJob,
			data: requestData
		};
	},
	dofav: async Request => {
		const required = {
			user_id: Request.body.user_id,
			job_id: Request.body.job_id
		};
		const requestData = await apis.vaildation(required, {});
		const postDetails = await DB.find('jobs', 'first', {
			conditions: {
				id: requestData.job_id
			}
		});
		if (!postDetails) throw new ApiError(lang[Request.lang].wrongPost, 422);
		const likeDateils = await DB.find('favorites_jobs', 'all', {
			conditions: {
				user_id: requestData.user_id,
				job_id: requestData.job_id
			}
		});
		let message = '';
		if (likeDateils.length > 0) {
			await DB.first(
				`delete from favorites_jobs where id = ${likeDateils[0].id}`
			);
			message = lang[Request.lang].jobUnfav;
		} else {
			await DB.save('favorites_jobs', requestData);
			message = lang[Request.lang].jobfav;
		}
		return {
			message,
			data: []
		};
	},
	favJobs: async Request => {
		let offset = Request.params.offset || 1;
		const limit = Request.query.limit || 10;
		const user_id = Request.body.user_id;
		offset = (offset - 1) * limit;
		const condition = {
			join: [
				`users on (users.id = jobs.user_id)`,
				`favorites_jobs on (favorites_jobs.user_id =${user_id} and favorites_jobs.job_id=jobs.id)`
			],
			fields: [
				'users.first_name',
				'users.last_name',
				'users.status',
				'users.email',
				'users.phone',
				'users.cover_pic as user_cover_pic',
				'users.about_us',
				'users.profile',
				'jobs.*',
				`(select count(id) from favorites_jobs where job_id = jobs.id and user_id = ${user_id}) as is_fav`
			],
			limit: [offset, limit],
			orderBy: ['id desc']
		};
		const result = await DB.find('jobs', 'all', condition);
		return {
			message: lang[Request.lang].getFavPost,
			data: {
				pagination: await apis.Paginations('jobs', condition, offset, limit),
				result: app.addUrl(result, [
					'profile',
					'cover_pic',
					'user_cover_pic',
					'picture'
				])
			}
		};
	},
	allJobs: async Request => {
		let offset = Request.params.offset || 1;
		const limit = Request.query.limit || 10;
		const user_id = Request.body.user_id || 0;
		const is_my = Request.query.is_my || false;
		const category_id = Request.query.category_id || 0;
		const search = Request.query.search || '';
		const filter = Request.query.filter || false;
		offset = (offset - 1) * limit;
		if (user_id === 0 && is_my)
			throw new ApiError(lang[Request.lang].needLogin, 401);
		const condition = {
			conditions: {
				'jobs.status': 1
			},
			join: [`users on (users.id = jobs.user_id)`],
			fields: [
				'users.first_name',
				'users.last_name',
				'users.status',
				'users.email',
				'users.phone',
				'users.cover_pic as user_cover_pic',
				'users.about_us',
				'users.profile',
				'jobs.*',
				`0 as is_fav`
			],
			limit: [offset, limit],
			orderBy: ['id desc']
		};
		if (search) {
			condition.conditions['like'] = {
				title: search,
				'jobs.city': search,
				'jobs.state': search
			};
		}
		if (JSON.parse(filter)) {
			const searchParameter = Constants.JobSearch;
			searchParameter.forEach(value => {
				if (Request.query.hasOwnProperty(value)) {
					if (Request.query[value]) {
						condition.conditions[value] = Request.query[value];
					}
				}
			});
		}
		if (JSON.parse(category_id) !== 0)
			condition.conditions['job_category_id'] = category_id;
		if (user_id !== 0) {
			condition.fields.push(
				`(select count(id) from favorites_jobs where job_id = jobs.id and user_id = ${user_id}) as is_fav`
			);
		}
		if (is_my) {
			condition.conditions['user_id'] = user_id;
		}
		const result = await DB.find('jobs', 'all', condition);
		return {
			message: lang[Request.lang].getJobs,
			data: {
				pagination: await apis.Paginations('jobs', condition, offset, limit),
				result: app.addUrl(result, [
					'profile',
					'cover_pic',
					'user_cover_pic',
					'picture'
				])
			}
		};
	},
	jobCategory: async Request => {
		const category = await DB.find('job_categories', 'all', {
			order: ['id desc']
		});
		return {
			message: lang[Request.lang].categoryList,
			data: category
		};
	},
	deleteJob: async Request => {
		const { job_id } = Request.body;
		const checkPost = await DB.find('jobs', 'first', {
			conditions: {
				id: job_id,
				user_id: Request.body.user_id
			}
		});
		if (!checkPost) {
			throw new ApiError(lang[Request.lang].wrongPost, 422);
		}
		await DB.first(`delete from jobs where id = ${job_id}`);
		return {
			message: lang[Request.lang].deleteJob,
			data: []
		};
	}
};
