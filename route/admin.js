const Router = require('express').Router;
const router = Router();
const adminHelper = require('../controller/adminhelper');
const authMiddleware = require('../middleware/adminauthMiddleware');

// router.use((req,res,next)=>{
//     req.app.set('layout','adminlayout');
//     next();
// })

router.get('/admin',authMiddleware.checkAuthadmin,adminHelper.admin_getlogin);
router.post('/admin',adminHelper.admin_dologin);
router.get('/adminhome',authMiddleware.checkAdmin,adminHelper.admin_home);
router.get('/addadmin',adminHelper.add_admin);
router.post('/addadmin',adminHelper.admin_signup);
router.get('/adminlogout',adminHelper.admin_logout);




module.exports = router;