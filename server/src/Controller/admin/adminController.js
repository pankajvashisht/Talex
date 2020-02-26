const Db = require('../../../libary/sqlBulider');
const app = require('../../../libary/CommanMethod');
const ApiError = require('../../Exceptions/ApiError');
let DB = new Db();
const ApiController = require('./ApiController');
class adminController extends ApiController {
  constructor() {
    super();
    this.limit = 20;
    this.offset = 1;
    this.login = this.login.bind(this);
    this.allUser = this.allUser.bind(this);
  }
  async login(req, res) {
    const { body } = req;
    try {
      let login_details = await DB.find('admins', 'first', {
        conditions: {
          email: body.email,
          status: 1,
        },
      });
      if (login_details) {
        if (app.createHash(body.password) !== login_details.password)
          throw new ApiError('Wrong Email or password');
        delete login_details.password;
        let token = await app.UserToken(login_details.id, req);
        await DB.save('admins', {
          id: login_details.id,
          token: token,
        });
        login_details.token = token;
        if (login_details.profile) {
          login_details.profile = app.ImageUrl(login_details.profile);
        }
        return app.success(res, {
          message: 'User login successfully',
          data: login_details,
        });
      }
      throw new ApiError('Wrong Email or password');
    } catch (err) {
      app.error(res, err);
    }
  }
  async allUser(req) {
    let offset = req.params.offset !== undefined ? req.params.offset : 1;
    let limit = req.params.limit !== undefined ? req.params.limit : 20;
    offset = (offset - 1) * limit;
    let conditions = 'where user_type=1 ';
    if (req.query.q && req.query.q !== 'undefined') {
      const {q} = req.query;
      conditions += ` and first_name like '%${q}%' or email like '%${q}%' or phone like '%${q}%'`;
    }
    let query =
      'select * from users ' +
      conditions +
      ' order by id desc limit ' +
      offset +
      ' , ' +
      limit;
      const total =  `select count(*) as total from users ${conditions}`;
      const result={
        pagination:await super.Paginations(total,offset,limit),
        result:app.addUrl(await DB.first(query), ['profile','cover_pic'])
      };   
    return result;
  }

  async allBusiness(req) {
    let offset = req.params.offset !== undefined ? req.params.offset : 1;
    let limit = req.params.limit !== undefined ? req.params.limit : 20;
    offset = (offset - 1) * limit;
    let conditions = 'where user_type = 2';
    if (req.query.q && req.query.q !== 'undefined') {
      const {q} = req.query;
      conditions += ` and first_name like '%${q}%' or email like '%${q}%' or phone like '%${q}%'`;
    }
    let query =
      'select * from users ' +
      conditions +
      ' order by id desc limit ' +
      offset +
      ' , ' +
      limit;
    const total =  `select count(*) as total from users ${conditions}`;
    const result={
      pagination:await super.Paginations(total,offset,limit),
      result:app.addUrl(await DB.first(query), ['profile','cover_pic'])
    };  
    return result;
  }

  async addUser(Request) {
    const { body } = Request;
    delete body.profile;
    if (Request.files && Request.files.profile) {
      body.profile = await app.upload_pic_with_await(Request.files.profile);
    }
    return await DB.save('users', body);
  }

  async addAd(Request){
    const { body } = Request;
    delete body.image;
    if (Request.files && Request.files.image) {
      body.image = await app.upload_pic_with_await(Request.files.image);
    }
    return await DB.save('ads', body);
  }
  async addJob(Request){
    const { body } = Request;
    return await DB.save('job_categories', body);
  }

  async addBusinessCategory(Request) { 
     const { body } = Request;
    return await DB.save('business_categories', body);
  }

  async JobCategory(Request){
    let offset = Request.params.offset !== undefined ? Request.params.offset : 1;
    let limit = Request.params.limit !== undefined ? Request.params.limit : 20;
    offset = (offset - 1) * limit;
    let conditions = '';
    if (Request.query.q && Request.query.q !== 'undefined') {
      const {q} = Request.query;
      conditions += `where name like '%${q}%' `;
    }
    let query =`select * from job_categories ${conditions} order by id desc limit ${offset}, ${limit}`;
    const total =  `select count(*) as total from job_categories ${conditions}`;
    const result= {
      pagination: await super.Paginations(total,offset,limit),
      result: await DB.first(query)
    };  
    return result;
  }

  async business_category(Request) { 
    let offset = Request.params.offset !== undefined ? Request.params.offset : 1;
    let limit = Request.params.limit !== undefined ? Request.params.limit : 20;
    offset = (offset - 1) * limit;
    let conditions = '';
    if (Request.query.q && Request.query.q !== 'undefined') {
      const {q} = Request.query;
      conditions += `where name like '%${q}%' `;
    }
    let query =`select * from business_categories ${conditions} order by id desc limit ${offset}, ${limit}`;
    const total =  `select count(*) as total from business_categories ${conditions}`;
    const result= {
      pagination: await super.Paginations(total,offset,limit),
      result: await DB.first(query)
    };  
    return result;
  }

  async Posts(Request){
    let offset = Request.params.offset !== undefined ? Request.params.offset : 1;
    let limit = Request.params.limit !== undefined ? Request.params.limit : 20;
    offset = (offset - 1) * limit;
    let conditions = '';
    if (Request.query.q && Request.query.q !== 'undefined') {
      const {q} = Request.query;
      conditions += `where first_name like '%${q}%' or email like '%${q}%' or title like '%${q}%'`;
    }
    let query =
      'select posts.*, users.first_name,users.last_name, users.email, users.phone, users.profile from posts join users on (posts.user_id = users.id) ' +
      conditions +
      ' order by posts.id desc limit ' +
      offset +
      ' , ' +
      limit;
    const total =  `select count(*) as total from posts join users on (posts.user_id = users.id) ${conditions}`;
    const result= {
      pagination: await super.Paginations(total,offset,limit),
      result: app.addUrl(await DB.first(query), ['media','profile' ])
    };  
    return result;
  }

  async Ads(Request){
    let offset = Request.params.offset !== undefined ? Request.params.offset : 1;
    let limit = Request.params.limit !== undefined ? Request.params.limit : 20;
    offset = (offset - 1) * limit;
    let conditions = '';
    if (Request.query.q && Request.query.q !== 'undefined') {
      const {q} = Request.query;
      conditions += `where  title like '%${q}%'`;
    }
    let query =
      'select * from ads ' +
      conditions +
      ' order by id desc limit ' +
      offset +
      ' , ' +
      limit;
    const total =  `select count(*) as total from ads ${conditions}`;
    const result= {
      pagination: await super.Paginations(total,offset,limit),
      result: app.addUrl(await DB.first(query), 'image')
    };  
    return result;
  }

  async BlockPoat(Request){
    let offset = Request.params.offset  || 1;
    let limit = Request.params.limit || 20;
    offset = (offset - 1) * limit;
    let conditions = '';
    if (Request.query.q && Request.query.q !== 'undefined') {
      const {q} = Request.query;
      conditions += `where  title like '%${q}%'`;
    }
    const query = `select posts.*,report_posts.comment, users.first_name, users.last_name from report_posts join posts on (posts.id = report_posts.post_id) left join users on (report_posts.user_id = users.id)${conditions} order by id desc limit ${offset}, ${limit}`;
    const total =  `select count(*) as total from ads ${conditions}`;
    const result= {
      pagination: await super.Paginations(total,offset,limit),
      result: app.addUrl(await DB.first(query), 'media')
    };  
    return result;
  }

  async Jobs(Request){
    let offset = Request.params.offset !== undefined ? Request.params.offset : 1;
    let limit = Request.params.limit !== undefined ? Request.params.limit : 20;
    offset = (offset - 1) * limit;
    let conditions = '';
    if (Request.query.q && Request.query.q !== 'undefined') {
      const {q} = Request.query;
      conditions += `where first_name like '%${q}%' or email like '%${q}%' or title like '%${q}%'`;
    }
    let query =
      'select jobs.*, users.first_name,users.last_name, users.email, users.phone, users.profile from jobs join users on (jobs.user_id = users.id) ' +
      conditions +
      ' order by jobs.id desc limit ' +
      offset +
      ' , ' +
      limit;
    const total =  `select count(*) as total from jobs join users on (jobs.user_id = users.id) ${conditions}`;
    const result= {
      pagination: await super.Paginations(total,offset,limit),
      result: app.addUrl(await DB.first(query), ['picture','profile' ])
    };  
    return result;
  }

  async Comments(Request){
    let offset = Request.params.offset !== undefined ? Request.params.offset : 1;
    let limit = Request.params.limit !== undefined ? Request.params.limit : 20;
    offset = (offset - 1) * limit;
    let conditions = '';
    if (Request.query.q && Request.query.q !== 'undefined') {
      const {q} = Request.query;
      conditions += `where first_name like '%${q}%' or email like '%${q}%' or comment like '%${q}%'`;
    }
    let query =
      'select posts.*,post_comments.*, users.first_name,users.last_name, users.email, users.phone, users.profile from post_comments join users on (post_comments.user_id = users.id)  join posts on (post_comments.post_id = posts.id)' +
      conditions +
      ' order by post_comments.id desc limit ' +
      offset +
      ' , ' +
      limit;
    const total =  `select count(*) as total from post_comments join users on (post_comments.user_id = users.id)  join posts on (post_comments.post_id = posts.id) ${conditions}`;
    const result= {
      pagination: await super.Paginations(total,offset,limit),
      result: app.addUrl(await DB.first(query), ['media','profile' ])
    };  
    return result;
  }

  async updateData(req) {
    const { body } = req;
    if (body.id === undefined) {
      throw new ApiError('id is missing', 400);
    }
    if (req.files && req.files.url) {
      body.url = await app.upload_pic_with_await(req.files.url);
      delete req.files.url.data;
      body.metadata = JSON.stringify(req.files.url);
    }
    if (req.files && req.files.profile) {
      body.profile = await app.upload_pic_with_await(req.files.profile);
    }
    return await DB.save(body.table, body);
  }

  async deleteData(req) {
    const { body } = req;
    if (body.id === undefined) {
      throw new ApiError('id is missing', 400);
    }
    return await DB.first(
      'delete from ' + body.table + ' where id =' + body.id,
    );
  }

  async Notification(Request){
    const { message } = Request.body;
    return [{
      message: message
    }];
  }

  async dashboard() {
    const business = await DB.first(
      'select count(*) as total from users where user_type = 2',
    );
    const users = await DB.first('select count(*) as total from users where user_type = 1');
    const posts = await DB.first(
      'select count(id) as total from posts',
    );
    const jobs = await DB.first(
      'select count(id) as total from jobs',
    );
    const comments = await DB.first(
      'select count(id) as total from post_comments',
    );
    const category = await DB.first(
      'select count(id) as total from job_categories',
    );
    const ads = await DB.first(
      'select count(id) as total from ads',
    );
    return {
      total_posts:posts[0].total,
      total_users:users[0].total,
      total_jobs:jobs[0].total,
      total_business:business[0].total,
      total_comments:comments[0].total,
      total_categeiors:category[0].total,
      total_ads:ads[0].total

    };
  }

  async appInfo(){
    return await DB.first("select * from app_informations");
  }


}

module.exports = adminController;
