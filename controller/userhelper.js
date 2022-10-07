const User = require('../model/userschema');


const handleErrors = (err)=>{

    let Error = {fname:'',lname:'',email:'',password:'',phone:''};
    //console.log(err.message,err.code);
    
    
    if(err.code === 11000){
        error.email = 'This email is already registered';
        return Error;
    }

    if(err.message.includes('users validation failed')){
       

      Object.values(err.errors).forEach(error => {
         console.log(error.properties.path);
          Error[error.properties.path] = error.properties.message;

      }); 
   

    }
    console.log(Error);
    return Error;
}

module.exports = {
    
    homePage:(req,res)=>{
        res.render('./user/index')
    },
    getsignUp:(req,res)=>{
        res.render('./user/signup')

    },
    getlogin:(req,res)=>{
        res.render('./user/login')

    },
    dosignup: async (req,res)=>{
        console.log(req.body);
        const {fname,lname,email,password,phone} = req.body;
        console.log(fname);

        try{
            console.log(45678);
            const user = await User.create({fname,lname,email,password,phone});
            res.json(user);
            
        }catch(err){
            console.log(000);
            const errors = handleErrors(err);
            console.log(errors);
             res.json(errors);
        }
    },
}