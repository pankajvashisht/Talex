const missingRoutes = {
    'app_info':"GET",
    'forgot_password':"POST",
    'user/login':"POST",
    'user':"POST",
    'posts':"GET",
    'user/picture':"GET",
    'jobs':"GET",
    'category/job':"GET",
    'user/listing':"GET",
    'posts/comment':"GET",
    'business/category': "GET",
    'ads':"GET",
};
const AuthSkip = (Req, res, next) => {
    res.auth = true;
    const url = makeUrl(Req);
    if((!Req.headers.hasOwnProperty('authorization_key') || Req.headers.authorization_key.length === 0)
    && missingRoutes.hasOwnProperty(url)){
        if(Req.method === missingRoutes[url] || missingRoutes[url] === 'ALL'){
            res.auth = false;
        }
    }
    next();
}

const makeUrl = (Req) => {
    let url = Req.path.split("/");
    url.shift();
    if(url.indexOf(Req.lang) !== -1){
        url.pop();
    }
    if(!isNaN(url[url.length-1])){
        url.pop();
    }
    return url = url.join("/");
} 

module.exports = AuthSkip;