const Router = require('express')
const router = Router();
const userhelper = require('../controller/userhelper');
const authMiddleware = require('../middleware/authMiddleware')



router.get('*',authMiddleware.checkUser);
router.get('/',userhelper.homePage);
router.get('/signup',userhelper.getsignUp)
router.post('/signup',userhelper.dosignup);
router.post('/sendnotification',userhelper.sendOtp);
router.post('/verify-otp',userhelper.otpVerification);
router.get('/login',userhelper.getlogin);
router.post('/login',userhelper.doLogin);
router.get('/logout',userhelper.getlogout);
router.get('/useraccount',userhelper.userAccount);





module.exports = router;