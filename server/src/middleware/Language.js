const { lang } = require('../../config');
const setLanguage = (Request, Res, next) => {
    let path = Request.path.split("/");
    let langs = path[path.length-1];
    if(!lang.hasOwnProperty(langs)){
        langs = 'en';
    }
    Request.lang = langs;
    global._Lang = langs;
    return next();
}

module.exports = setLanguage;