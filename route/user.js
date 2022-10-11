const Router = require('express')
const router = Router();
const userhelper = require('../controller/userhelper');
const { checkAuth } = require('../middleware/userauthMiddleware');
const authMiddleware = require('../middleware/userauthMiddleware')




router.get('/',authMiddleware.checkUser,userhelper.homePage,authMiddleware.checkAuth);
router.get('/signup',authMiddleware.checkAuth,authMiddleware.checkUser,userhelper.getsignUp)
router.post('/signup',userhelper.dosignup);
router.post('/sendnotification',userhelper.sendOtp);
router.post('/verify-otp',userhelper.otpVerification);
router.get('/login',authMiddleware.checkAuth,authMiddleware.checkUser,userhelper.getlogin);
router.post('/login',userhelper.doLogin);
router.get('/logout',userhelper.getlogout);
router.get('/useraccount',userhelper.userAccount);





module.exports = router;