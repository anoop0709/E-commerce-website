const Router = require('express')
const router = Router();
const userhelper = require('../controller/userhelper');
const { checkAuth } = require('../middleware/userauthMiddleware');
const authMiddleware = require('../middleware/userauthMiddleware');




router.get('/',authMiddleware.checkUser,userhelper.homePage,authMiddleware.checkAuth);

router.get('/signup',authMiddleware.checkAuth,authMiddleware.checkUser,userhelper.getsignUp)
router.post('/signup',userhelper.dosignup);


router.post('/sendnotification',userhelper.sendOtp);
router.post('/verify-otp',userhelper.otpVerification);


router.get('/login',authMiddleware.checkAuth,authMiddleware.checkUser,userhelper.getlogin);
router.post('/login',userhelper.doLogin);

router.get('/logout',userhelper.getlogout);

router.get('/useraccount/:id',authMiddleware.checkUser,userhelper.userAccount);

router.get('/addaddress',authMiddleware.checkUser,userhelper.add_address);
router.post('/addaddress/:id',authMiddleware.checkUser,userhelper.add_address_post);

router.get('/passwordreset',authMiddleware.checkUser,userhelper.reset_password);
router.post('/passwordreset',authMiddleware.checkUser,userhelper.reset_password_post);

router.get('/userprofileedit/:id',authMiddleware.checkUser,userhelper.edit_profile);
router.post('/userprofileedit/:id',authMiddleware.checkUser,userhelper.edit_profile_post)





module.exports = router;