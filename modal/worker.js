const mongoose=require("mongoose")
const passportLocalMongoose=require("passport-local-mongoose")
const workerSchema=new mongoose.Schema({
    username:String,
    email:String
})
workerSchema.plugin(passportLocalMongoose,{ usernameField: 'email' })
module.exports=mongoose.model("Worker",workerSchema)