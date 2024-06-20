const mongoose=require("mongoose")
const User=require("./user")
const complaintSchema=new mongoose.Schema({
    complain:String,
    bin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Bin"
    },
    userEmail:{
        type:String,
        // default:"user1@gmail.com"
   },
    Status:{
        type:String,
        enum:["Pending","Onprogress","Completed"],
        default:"Pending"

    }

})
module.exports=mongoose.model("Complain",complaintSchema)