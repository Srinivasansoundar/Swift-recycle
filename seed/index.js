const mongoose=require("mongoose")
const Admin=require("../modal/admin")
mongoose.connect('mongodb://localhost:27017/waste')
    .then(() => {
        console.log("CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO ERROR!!!!")
        console.log(err)
    })

const seedDB=async()=>{
    const name='Henry';
    const pwd='tom';
    const admin=new Admin({username:name});
    const fi=await Admin.register(admin,pwd);
}
seedDB().then(()=>{
    mongoose.connection.close()
})