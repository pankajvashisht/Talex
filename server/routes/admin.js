const express = require('express');
const router = express.Router();
const { adminController } = require('../src/Controller/admin/index');
const { cross, AdminAuth } = require('../src/middleware/index');
const  response  = require('../libary/Response');
const { login } = require('../src/Request/adminRequest');
let admin = new adminController();

router.use([cross, AdminAuth]);
router.get('/', function(req, res) {
  res.json(' APi workings ');
});
router.post('/login', login, admin.login);
router.get('/dashboard', response(admin.dashboard));
router.get('/bookings/:offset([0-9]+)?/:limit([0-9]+)?', response(admin.Bookings));
router.get('/posts/:offset([0-9]+)?/:limit([0-9]+)?', response(admin.Posts));
router.get('/jobs/:offset([0-9]+)?/:limit([0-9]+)?', response(admin.Jobs));
router.get('/comments/:offset([0-9]+)?/:limit([0-9]+)?', response(admin.Comments));
router.get('/business/:offset([0-9]+)?/:limit([0-9]+)?', response(admin.allBusiness));
router.get('/report-post/:offset([0-9]+)?/:limit([0-9]+)?', response(admin.BlockPoat));
router
  .route('/users/:offset([0-9]+)?/:limit([0-9]+)?')
  .get(response(admin.allUser))
  .post(response(admin.addUser))
  .put(response(admin.updateData))
  .delete(response(admin.deleteData));
router
  .route('/ads/:offset([0-9]+)?/:limit([0-9]+)?')
  .get(response(admin.Ads))
  .post(response(admin.addAd))
  .put(response(admin.updateData))
  .delete(response(admin.deleteData));
  router
  .route('/business-category/:offset([0-9]+)?/:limit([0-9]+)?')
  .get(response(admin.business_category))
  .post(response(admin.addBusinessCategory))
  .put(response(admin.updateData))
  .delete(response(admin.deleteData));
router
  .route('/job-category/:offset([0-9]+)?/:limit([0-9]+)?')
  .get(response(admin.JobCategory))
  .post(response(admin.addJob))
  .put(response(admin.updateData))
  .delete(response(admin.deleteData));      
router
  .route('/appInfo/')
  .get(response(admin.appInfo))
  .put(response(admin.updateData));

module.exports = router;
