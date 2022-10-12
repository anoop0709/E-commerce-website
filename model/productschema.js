const mongoose = require('mongoose');





const productSchema = new mongoose.Schema({
    productname:{
        type:String,
        required:true,
    },
    productdescription:{
        type:String,
        required:true
    },
    brand:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true,
    },
    qty:{
        type:Number,
        required:true
    },
    image:{
        type:Array,
        required:true
    },
    productcategory:{
        type:Object,
       required:true
}
})

const Product = mongoose.model('product',productSchema);

module.exports = Product;