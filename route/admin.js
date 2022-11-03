const Router = require('express').Router;
const router = Router();
const adminHelper = require('../controller/adminhelper');
const authMiddleware = require('../middleware/adminauthMiddleware');
const productHelper = require('../controller/producthelper');

// router.use((req,res,next)=>{
//     req.app.set('layout','adminlayout');
//     next();
// })

router.get('/admin',authMiddleware.checkAuthadmin,adminHelper.admin_getlogin);
router.post('/admin',adminHelper.admin_dologin);
router.get('/adminhome',authMiddleware.checkAdmin,adminHelper.admin_home);
router.get('/addadmin',authMiddleware.checkAdmin,adminHelper.add_admin);
router.post('/addadmin',authMiddleware.checkAdmin,adminHelper.admin_signup);
router.get('/adminlogout',adminHelper.admin_logout);
router.get('/userlist',authMiddleware.checkAdmin,adminHelper.view_users);
router.get('/blockuser/:id',adminHelper.block_user);
router.get('/unblockuser/:id',adminHelper.unblock_user);
router.get('/productlist',authMiddleware.checkAdmin,productHelper.getProductlist);
router.get('/addproduct',authMiddleware.checkAdmin,adminHelper.get_product_page);
router.post('/addproduct',authMiddleware.checkAdmin,adminHelper.add_product);
router.get('/editproduct/:id',authMiddleware.checkAdmin,adminHelper.edit_product);
router.post('/editproduct/:id',authMiddleware.checkAdmin,adminHelper.update_product);
router.get('/deleteproduct/:id',authMiddleware.checkAdmin,adminHelper.delete_product);
router.get('/orderhistory',authMiddleware.checkAdmin,adminHelper.order_history);
router.post('/changeorderstatus/:id',authMiddleware.checkAdmin,adminHelper.order_status_change);
router.post('/sortorders',authMiddleware.checkAdmin,adminHelper.sort_order);

//coupon
router.get('/coupon',authMiddleware.checkAdmin,adminHelper.get_all_coupon)
router.get('/addcoupon',authMiddleware.checkAdmin,adminHelper.coupon_page);
router.post('/addcoupon',authMiddleware.checkAdmin,adminHelper.add_coupon);
router.get('/editcoupon/:id',authMiddleware.checkAdmin,adminHelper.edit_coupon);
router.post('/editcoupon/:id',authMiddleware.checkAdmin,adminHelper.update_coupon);
router.get('/deletecoupon/:id',authMiddleware.checkAdmin,adminHelper.delete_coupon);
router.post('/searchcoupon',authMiddleware.checkAdmin,adminHelper.search_coupon)




module.exports = router;