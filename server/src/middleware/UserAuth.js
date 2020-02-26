const Db = require('../../libary/sqlBulider');
const ApiError = require('../Exceptions/ApiError');
const app = require('../../libary/CommanMethod');
const {lang} = require('../../config');
const DB = new Db();

const UserAuth = async (Request, res, next) => {
    if(!res.auth) return next();
    try{
      if (!Request.headers.hasOwnProperty('authorization_key')) {
        throw new ApiError(lang[Request.lang].authKeyRequired,400);
      }
      let user_details = await DB.first(`select users.id, otp,password,first_name,about_us, last_name, email, profile,status,cover_pic,device_type,device_token 
      ,state,
      age,
      sex,
      marital_status,
      speck_romanina,
      zip,
      website,
      business_hours,
      description,
      category,
      city,
      location from user_auths join  users on (users.id = user_auths.user_id) where
      user_auths.authorization_key='${Request.headers.authorization_key}'`);
      
      if (user_details.length > 0) {
        Request.body.user_id = user_details[0].id;
        Request.body.userInfo = user_details[0];
        next();
        return;
      }
    throw new ApiError(lang[Request.lang].invaildAuth, 401);
  }catch(err){
    return app.error(res, err);
  }
};

module.exports = UserAuth;
