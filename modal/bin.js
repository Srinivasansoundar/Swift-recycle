const mongoose=require("mongoose");
const binSchema=new mongoose.Schema({
    area:String,
    landmark:String,
    city:String,
    email:String,
    route:String,
    id:{
        type:Number
    }
})
binSchema.pre('save', async function (next) {
    if (!this.isNew) {
        return next(); // Skip if the document is not new
    }
    try {
        // Get the current max id value
        const maxIdDoc = await this.constructor.findOne({}, { id: 1 }).sort({ id: -1 });
        const maxId = maxIdDoc ? maxIdDoc.id : 0;
        // Increment the max id value and assign it to the new document
        this.id = maxId + 1;
        next();
    } catch (error) {
        next(error);
    }
});
module.exports=mongoose.model("Bin",binSchema);