const Router = require('express')
const router = Router();
const userhelper = require('../controller/userhelper');
const authMiddleware = require('../middleware/authMiddleware')

//const client = require('twilio')(process.env.account_SID,process.env.authToken);

router.get('*',authMiddleware.checkUser)
router.get('/',userhelper.homePage);
router.get('/signup',userhelper.getsignUp)
router.post('/signup',userhelper.dosignup);
router.get('/login',userhelper.getlogin);
router.post('/login',userhelper.doLogin);
router.get('/logout',userhelper.getlogout);





module.exports = router;