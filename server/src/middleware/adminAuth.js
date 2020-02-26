const Db = require("../../libary/sqlBulider");
const app = require("../../libary/CommanMethod");
const DB = new Db();

const AdminAuth = async (req, res, next) => {
  try {
    if(req.path === '/login'){
      return next();
    }
    if (!req.query.hasOwnProperty("token")) {
      throw { code: 400, message: "token key is required" };
    }
    let user_details = await DB.find("admins", "first", {
      conditions: {
        token: req.query.token
      }
    });
    if (user_details) {
      req.auth_info = user_details;
      next();
      return;
    }
    throw { code: 401, message: "Invaild Authorization" };
  } catch (err) {
    app.error(res, err);
  }
};

module.exports = AdminAuth;