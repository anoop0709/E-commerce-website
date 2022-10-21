const mongoose = require("mongoose");


const productcategorySchema = new mongoose.Schema({
    shape:{
        type:String,
        required:true
    },
    frametype:{
        type:String,
        required:true
    },
    color:{
        type:String,
        required:true
    },
    gender:{
        type:String,
        required:true
    }

});


const Productcategory = mongoose.model('productcategory',productcategorySchema);

module.exports = Productcategory;