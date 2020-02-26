const ApiController = require('./ApiController');
const app = require('../../../libary/CommanMethod');
const Db = require('../../../libary/sqlBulider');
const ApiError = require('../../Exceptions/ApiError');
const { lang } = require('../../../config');
const DB = new Db();

class ChatController extends ApiController {
  async sendMessage(Request) {
    const required = {
      friend_id: Request.body.friend_id,
      user_id: Request.body.user_id,
      message_type: Request.body.message_type, // 1-> text 2-> media
      message: Request.body.message,
    };
    const request_data = await super.vaildation(required, {});
    const user_info = await DB.find('users', 'first', {
			conditions: {
				'users.id': request_data.friend_id
			},
			fields: [
				'id',
				'first_name',
				'last_name',
				'status',
				'email',
				'phone',
				'about_us',
        'profile',
        'user_type'
			],
		});
		if (!user_info) throw new ApiError(lang[Request.lang].userNotFound, 404);
    let query =
      'select * from threads where (user_id = ' +
      request_data.user_id +
      ' and friend_id = ' +
      request_data.friend_id;
    query +=
      ' ) or (user_id = ' +
      request_data.friend_id +
      ' and friend_id = ' +
      request_data.user_id +
      ') limit 1';

    let threads = await DB.first(query);
    if (threads.length > 0) {
      request_data.thread_id = threads[0].id;
    } else {
      request_data.thread_id = await DB.save('threads', request_data);
    }
    request_data.sender_id = request_data.user_id;
    request_data.receiver_id = request_data.friend_id;
    request_data.id = await DB.save('chats', request_data);
    let object = {
      id: request_data.thread_id,
      last_chat_id: request_data.id,
    };
    DB.save('threads', object);
    request_data.notification_code = 8;
    if (user_info.profile.length > 0) {
		  user_info.profile = appURL + 'uploads/' + user_info.profile;
		}
    request_data.user_info = user_info;
    request_data.text = request_data.message;
    setTimeout(() => {
      delete request_data.message_type;
      const pushObject = {
        message: request_data.message,
        notification_code: 8,
        body: request_data
      };
       super.sendPush(pushObject,request_data.friend_id);
     }, 100);
     
    return {
      message: lang[Request.lang].messageSend,
      data: request_data,
    };
  }

  async getMessage(Request) {
    const required = {
      friend_id: Request.query.friend_id,
      user_id: Request.body.user_id,
    };
    const request_data = await super.vaildation(required, {});
    const { user_id } = request_data;
    let thread =
      'select * from threads where (user_id = ' +
      request_data.user_id +
      ' and friend_id = ' +
      request_data.friend_id;
    thread +=
      ' ) or (user_id = ' +
      request_data.friend_id +
      ' and friend_id = ' +
      request_data.user_id +
      ')';
    let id = 0;
    const thread_info = await DB.first(thread);
    if (thread_info.length > 0) {
      if (thread_info[0].user_id === request_data.user_id) {
        id = thread_info[0].first_friend_deleted_id;
      } else {
        id = thread_info[0].second_friend_deleted_id;
      }
    }

    let query =
      'select chats.*, users.id as friend_id, users.profile, users.phone,users.email,users.last_name, users.first_name, users.cover_pic, users.about_us, users.user_type  from chats join users on (users.id = IF(chats.sender_id = '+user_id+',chats.receiver_id,chats.sender_id)) where ((sender_id = ' +
      request_data.user_id +
      ' and receiver_id = ' +
      request_data.friend_id;
    query +=
      ' ) or (sender_id = ' +
      request_data.friend_id +
      ' and receiver_id = ' +
      request_data.user_id +
      ')) and chats.id > ' +
      id +
      ' and (select count(id) as total from delete_chats where user_id =  ' +
				request_data.user_id +
				' and chat_id = chats.id) = 0 limit 100';

    let chats = await DB.first(query);
    return {
      message: lang[Request.lang].messages,
      data: app.addUrl(chats, ['profile', 'cover_pic']),
    };
  }

  async lastChat(Request) {
    const user_id = Request.body.user_id;
    let query =
      'select chats.*, users.id as friend_id, users.profile,users.user_type, users.phone,users.email,users.last_name, users.first_name, users.cover_pic, users.about_us ';
    query += 'from threads join chats on (chats.id = threads.last_chat_id) ';
    query +=
      'join users on (users.id = IF(user_id = ' +
      user_id +
      ', friend_id, user_id ))';
    query +=
      'where (user_id = ' +
      user_id +
      ' or  friend_id = ' +
      user_id +
      ' ) and chats.id > IF(threads.user_id = ' +
      user_id +
      ', threads.first_friend_deleted_id, threads.second_friend_deleted_id)  order by chats.id desc';
    return {
      message: lang[Request.lang].lastChat,
      data: app.addUrl(await DB.first(query), ['profile', 'cover_pic']),
    };
  }

  async deletesingleMessage(req) {
    const required = {
      user_id: req.body.user_id,
      chat_id: req.body.chat_id
    }
	  const request_data = await super.vaildation(required, {});
		await DB.save('delete_chats', request_data);
		return {
      message: lang[req.lang].chatDelete,
      data: [],
    };
	}

  async deleteChat(Request) {
    const required = {
      user_id: Request.body.user_id,
      thread_id: Request.body.thread_id,
    };
    const request_data = await super.vaildation(required, {});
    let query = 'select * from threads where id = ' + request_data.thread_id;
    let last_chats = await DB.first(query);
    if (last_chats.length > 0) {
      if (last_chats[0].user_id === request_data.user_id) {
        request_data.first_friend_deleted_id = last_chats[0].last_chat_id;
      } else {
        request_data.second_friend_deleted_id = last_chats[0].last_chat_id;
      }
      request_data.id = last_chats[0].id;
      delete request_data.user_id;
      delete request_data.thread_id;
      await DB.save('threads', request_data);
    } else {
      throw new ApiError(lang[Request.lang].threadInvaild, 404);
    }
    return {
      message: lang[Request.lang].chatDelete,
      data: [],
    };
  }
}

module.exports = ChatController;
