const Router = require('express').Router;
const router = Router();
const adminHelper = require('../controller/adminhelper');
const authMiddleware = require('../middleware/authMiddleware');


router.get('/admin',adminHelper.admin_login);




module.exports = router;