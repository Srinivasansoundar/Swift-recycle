const mongoose=require("mongoose")
const driverSchema=new mongoose.Schema({
    name:String,
    email:String,
    password:String,
    address:String,
    city:String
})
module.exports=mongoose.model("Driver",driverSchema)