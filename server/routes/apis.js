const express = require('express');
const router = express.Router();
const {
  UserController,
  PostController,
  FriendController,
  JobController,
  ChatController,
} = require('../src/Controller/v1/index');
const {
  UserAuth,
  cross,
  Language,
  AuthSkip,
} = require('../src/middleware/index');
const Apiresponse = require('../libary/ApiResponse');
let user = new UserController();
const chat = new ChatController();

router.use([cross, Language, AuthSkip, UserAuth]);
router.get('/', function(req, res) {
  res.send(' APi workings ');
});

router.post('/user/:lang?', Apiresponse(user.addUser));
router.post('/user/login/:lang?', Apiresponse(user.loginUser));
router.get(
  '/user/listing/:offset([0-9]+)?/:lang?',
  Apiresponse(user.userListing),
);
router.post('/user/edit/:lang?', Apiresponse(user.updateProfile));
router.get('/user/profile/:lang?', Apiresponse(user.userProfile));
router.get('/user/picture/:offset([0-9]+)?/:lang?', Apiresponse(user.usersPic));
router.post('/user/logout/:lang?', Apiresponse(user.logout));
router.post('/soical_login', Apiresponse(user.soicalLogin));
router.post('/user/verifiy/:lang?', Apiresponse(user.verifyOtp));
router.post('/forgot_password/:lang?', Apiresponse(user.forgotPassword));
router.post('/user/change_password/:lang?', Apiresponse(user.changePassword));
router.get('/app_info/:lang?', Apiresponse(user.appInfo));
router.post('/posts/like/:lang?', Apiresponse(PostController.likePost));
router.post('/posts/dislike/:lang?', Apiresponse(PostController.likePost));
router.post('/posts/share/:lang?', Apiresponse(PostController.share));
router.post('/posts/report/:lang?', Apiresponse(PostController.reportPost));
router.post('/request/send/:lang?', Apiresponse(FriendController.sendRequest));
router.get('/business/category/:lang?', Apiresponse(user.bussinessCatgeory));
router.get('/ads/:offset([0-9]+)?/:lang?', Apiresponse(PostController.getAds));
router.delete(
  '/request/reject/:lang?',
  Apiresponse(FriendController.rejectRequest),
);
router.delete('/friend/:lang?', Apiresponse(FriendController.unFriend));
router.post(
  '/request/accept/:lang?',
  Apiresponse(FriendController.acceptRequest),
);
router.get(
  '/request/:offset([0-9]+)?/:lang?',
  Apiresponse(FriendController.friendRequestList),
);
router.get(
  '/friends/:offset([0-9]+)?/:lang?',
  Apiresponse(FriendController.friends),
);
router.get(
  '/notifications/:offset([0-9]+)?/:lang?',
  Apiresponse(PostController.notifications),
);
router.get('/category/job/:lang?', Apiresponse(JobController.jobCategory));
router.get('/chat/last/:lang?', Apiresponse(chat.lastChat));
router.get(
  '/posts/details/:post_id([0-9]+)/:lang?',
  Apiresponse(PostController.postDetails),
);
router
  .route('/posts/:offset([0-9]+)?/:lang?')
  .get(Apiresponse(PostController.getPosts))
  .post(Apiresponse(PostController.addPost))
  .put(Apiresponse(PostController.addPost))
  .delete(Apiresponse(PostController.deletePost));
router
  .route('/jobs/:offset([0-9]+)?/:lang?')
  .get(Apiresponse(JobController.allJobs))
  .post(Apiresponse(JobController.addJob))
  .put(Apiresponse(JobController.addJob))
  .delete(Apiresponse(JobController.deleteJob));
router
  .route('/posts/comment/:post_id([0-9]+)?/:offset([0-9]+)?/:lang?')
  .get(Apiresponse(PostController.getComments))
  .post(Apiresponse(PostController.comment))
  .delete(Apiresponse(PostController.deleteComment));
router
  .route('/favourite/:offset([0-9]+)?/:lang?')
  .get(Apiresponse(PostController.getFavPosts))
  .post(Apiresponse(PostController.favPost))
  .delete(Apiresponse(PostController.favPost));
router
  .route('/favourite/users/:offset([0-9]+)?/:lang?')
  .get(Apiresponse(user.favUsers))
  .post(Apiresponse(user.doFavUser))
  .delete(Apiresponse(user.doFavUser));
router
  .route('/favourite/job/:offset([0-9]+)?/:lang?')
  .get(Apiresponse(JobController.favJobs))
  .post(Apiresponse(JobController.dofav))
  .delete(Apiresponse(JobController.dofav));
router
  .route('/chat/:lang?')
  .get(Apiresponse(chat.getMessage))
  .post(Apiresponse(chat.sendMessage))
  .delete(Apiresponse(chat.deleteChat));
router.get(
  '/last_chat/:lang?',
  Apiresponse(chat.lastChat),
);
router.delete('/delete-message/:lang?', Apiresponse(chat.deletesingleMessage));

module.exports = router;
