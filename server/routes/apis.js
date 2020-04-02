const express = require('express');
const router = express.Router();
const {
	UserController,
	PostController,
	FriendController,
	ChatController
} = require('../src/Controller/v1/index');
const { UserAuth, Language, AuthSkip } = require('../src/middleware/index');
const Apiresponse = require('../libary/ApiResponse');
let user = new UserController();
const chat = new ChatController();

router.use([Language, AuthSkip, UserAuth]);
router.get('/', function(req, res) {
	res.send(' APi workings ');
});

router.post('/signup/email', Apiresponse(user.signupEmail));
router.post('/signup/phone', Apiresponse(user.signupPhone));
router.post('/user/login/', Apiresponse(user.loginUser));
router.get('/user/listing/:offset([0-9]+)?', Apiresponse(user.userListing));
router.post('/update-profile', Apiresponse(user.updateProfile));
router.get('/user/profile/', Apiresponse(user.userProfile));
router.get('/category', Apiresponse(user.Catgeory));
router.post('/logout', Apiresponse(user.logout));
router.post('/signup/soical', Apiresponse(user.soicalLogin));
router.post('/forgot_password/', Apiresponse(user.forgotPassword));
router.post('/change_password', Apiresponse(user.changePassword));
router.get('/app_info/', Apiresponse(user.appInfo));
router.post('/posts/like/', Apiresponse(PostController.likePost));
router.post('/posts/dislike/', Apiresponse(PostController.likePost));
router.post('/posts/share/', Apiresponse(PostController.share));
router.post('/posts/report/', Apiresponse(PostController.reportPost));
router.post('/follow', Apiresponse(FriendController.follow));
router.post('/Unfollow', Apiresponse(FriendController.unFollow));
router.delete(
	'/request/reject/:lang?',
	Apiresponse(FriendController.rejectRequest)
);
router.delete('/friend/', Apiresponse(FriendController.unFriend));
router.post('/request/accept/', Apiresponse(FriendController.acceptRequest));
router.get(
	'/follow/:offset([0-9]+)?/',
	Apiresponse(FriendController.friendRequestList)
);
router.get(
	'/followers/:offset([0-9]+)?/',
	Apiresponse(FriendController.friends)
);
router.get(
	'/notifications/:offset([0-9]+)?/',
	Apiresponse(PostController.notifications)
);
router.get('/chat/last/:lang?', Apiresponse(chat.lastChat));
router.get(
	'/posts/details/:post_id([0-9]+)/:lang?',
	Apiresponse(PostController.postDetails)
);
router
	.route('/posts/:offset([0-9]+)?/:lang?')
	.get(Apiresponse(PostController.getPosts))
	.post(Apiresponse(PostController.addPost))
	.put(Apiresponse(PostController.addPost))
	.delete(Apiresponse(PostController.deletePost));
router
	.route('/posts/comment/:post_id([0-9]+)?/:offset([0-9]+)?/:lang?')
	.get(Apiresponse(PostController.getComments))
	.post(Apiresponse(PostController.comment))
	.put(Apiresponse(PostController.comment))
	.delete(Apiresponse(PostController.deleteComment));

router
	.route('/chat/:lang?')
	.get(Apiresponse(chat.getMessage))
	.post(Apiresponse(chat.sendMessage))
	.delete(Apiresponse(chat.deleteChat));
router.get('/last_chat/:lang?', Apiresponse(chat.lastChat));
router.delete('/delete-message/:lang?', Apiresponse(chat.deletesingleMessage));

module.exports = router;
