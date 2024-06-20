const express = require("express");
const app = express();
const ejsMate = require("ejs-mate")
const path = require("path")
const mongoose = require("mongoose");
const methodOveride = require("method-override")
const session = require("express-session")
const passport = require("passport")
const localStrategy = require("passport-local")
const Bin = require("./modal/bin.js")
const Driver = require("./modal/driver.js");
// const bin = require("./modal/bin.js");
const Complain = require("./modal/complain.js")
const User = require("./modal/user.js")
const Admin=require("./modal/admin.js")
const Worker=require("./modal/worker.js")
mongoose.connect('mongodb://localhost:27017/waste')
    .then(() => {
        console.log("CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO ERROR!!!!")
        console.log(err)
    })
const sessionOption = { secret: "nottogoodsecret", resave: false, saveUninitialized: false }
const isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        // req.flash("error", "you must log in")
        return res.redirect("/user_login")
    }
    next()
}
const isAdmin = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        // req.flash("error", "you must log in")
        return res.redirect("/admin_login")
    }
    next()
}
const isDriver = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        // req.flash("error", "you must log in")
        return res.redirect("/driver_login")
    }
    next()
}
app.set("views")
app.set("view engine", "ejs")
app.engine("ejs", ejsMate)
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))
app.use(methodOveride("_method"))
app.use(session(sessionOption))
app.use(passport.initialize())
app.use(passport.session())
passport.use('user-local',new localStrategy({
    usernameField: 'username',
    passwordField: 'password'
}
 , User.authenticate()))
passport.use('admin-local', new localStrategy(Admin.authenticate()));
passport.use('worker-local',new localStrategy({
    usernameField: 'email',
    passwordField: 'password'
}
 , Worker.authenticate()))
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        let user = await User.findById(id);
        if (user) {
            return done(null, user);
        }

        user = await Admin.findById(id);
        if (user) {
            return done(null, user);
        }

        user = await Worker.findById(id);
        return done(null, user);
    } catch (err) {
        return done(err);
    }
});


app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
})
// home
app.get("/home", (req, res) => {
    res.render("credential/home")
})
app.get("/admin_login", (req, res) => {
    res.render("credential/adminlogin")
})
app.post("/admin_login", passport.authenticate("admin-local", { failureRedirect: "/admin_login" }), (req, res) => {
    // console.log(req.body)
    res.redirect("/admin_home")
})
app.get("/admin_logout",(req,res,err)=>{
    req.logout(function (err) {
        if (err) {
            res.send(err)
            // return next(err)
        }
        else {
            // req.flash("success", "Thank you for visiting the yelpcamp");
            res.redirect("/home");
        }
    })
})
app.get("/user_login", (req, res) => {
    res.render("credential/userlogin")
})
app.post("/user_signup", async (req, res) => {
    // res.send(req.body);
    const { txt, email, pwd } = req.body;
    const user = new User({ username: txt, email: email });
    const registeredUser = await User.register(user, pwd)
    req.login(registeredUser, (err) => {
        if (err) res.send(err);
        res.redirect("/user_home")
    })
    // console.log(registeredUser)   
})
app.post("/user_login", passport.authenticate("user-local", { failureRedirect: "/user_login" }), (req, res) => {
    // console.log(req.user)
    res.redirect("/user_home")
})
app.get("/user_logout", (req, res, next) => {
    req.logout(function (err) {
        if (err) {
            res.send(err)
            // return next(err)
        }
        else {
            // req.flash("success", "Thank you for visiting the yelpcamp");
            res.redirect("/home");
        }
    })
})
app.get("/driver_login", (req, res) => {
    res.render("credential/driverlogin")
})
app.post("/driver_login",passport.authenticate("worker-local", { failureRedirect: "/driver_login" }),(req,res)=>{
   res.redirect("/driver_home")
})
app.get("/driver_logout",(req,res)=>{
    req.logout(function (err) {
        if (err) {
            res.send(err)
            // return next(err)
        }
        else {
            // req.flash("success", "Thank you for visiting the yelpcamp");
            res.redirect("/home");
        }
    })
})

// admin routes
app.get("/admin_home",isAdmin, (req, res) => {
    // console.log(req.user)
    res.render("admin/home.ejs")
})
app.get("/create_bin",isAdmin, (req, res) => {
    res.render("admin/createbin")
})
app.post("/create_bin",isAdmin, async (req, res) => {
    // console.log(req.body)
    const info = req.body.bin;
    const bin = new Bin(info)
    await bin.save()
    res.redirect("/view_bin")

})
app.get("/view_bin",isAdmin, async (req, res) => {
    const allbin = await Bin.find();
    // console.log(allbin)
    res.render("admin/viewbin", { allbin })
})
app.get("/view_bin/update_bin/:id", async (req, res) => {
    const bin = await Bin.findById(req.params.id)
    res.render("admin/updatebin", { bin })
})
app.put("/view_bin/update_bin/:id", async (req, res) => {
    const { id } = req.params
    const bininfo = req.body.bin
    const new_bin = await Bin.findByIdAndUpdate(id, bininfo)
    await new_bin.save()
    res.redirect("/view_bin")

})
app.delete("/delete_bin/:id",isAdmin, async (req, res) => {
    const { id } = req.params;
    await Bin.findByIdAndDelete(id);
    res.redirect("/view_bin")
})
app.get("/create_driver",isAdmin, (req, res) => {
    res.render("admin/createdriver")
})
app.get("/view_driver",isAdmin, async (req, res) => {
    const alldriver = await Driver.find();
    res.render("admin/viewdriver", { alldriver })
})
app.post("/create_driver",isAdmin, async (req, res) => {
    const info = req.body.driver
    const {name,email,password}=req.body.driver
    const driver = new Driver(info);
    await driver.save()
    const worker=new Worker({username:name,email:email})
    // await worker.save()
    const registeredWorker=Worker.register(worker,password)
       
    res.redirect("/view_driver")
})
app.delete("/delete_driver/:id", async (req, res) => {
    const { id } = req.params
    const driver=await Driver.findById(id)
    const w_email=driver.email
    await Worker.deleteOne({email:w_email});
    await Driver.findByIdAndDelete(id);
    res.redirect("/view_driver")
})
app.get("/viewallcomplains",async(req,res)=>{
    const complains=await Complain.find().populate("bin")
    res.render("admin/viewallcomplains",{complains})
})
/// user route
app.get("/user_home",isLoggedIn,(req, res) => {
    // console.log("hello")
    res.render("user/home.ejs")
})
app.get("/register_complaint", isLoggedIn, async (req, res) => {
    const allbin = await Bin.find();
    // console.log(allbin)
    res.render("user/viewbin", { allbin })
})
app.get("/register_complaint/:id", async (req, res) => {
    const { id } = req.params
    const bin = await Bin.findById(id)
    res.render("user/registercom", { bin })
})
app.post("/register_complaint/:id", async (req, res) => {
    const { id } = req.params
    const {email}=req.user
    const complain = new Complain({
        complain: req.body.complain,
        userEmail:email
    })
    complain.bin = id
    complain.save()
    res.redirect("/my_complaints")
    // res.send(complain.populate("bin"))
})
app.get("/my_complaints", isLoggedIn, async (req, res) => {
    const {email}=req.user
    const complains = await Complain.find({ userEmail:email }).populate("bin")
    // console.log(complains)
    res.render("user/viewcomplain", { complains })
})
app.delete("/deletecomplain/:id", async (req, res) => {
    const { id } = req.params
    await Complain.findByIdAndDelete(id)
    res.redirect("/my_complaints")
})
// driver routes
app.get("/driver_home", (req, res) => {
    res.render("driver/home")
})
app.get("/driver_works",isDriver, async (req, res) => {
    const driverEmail = req.user.email

    const complains = await Complain.find({}).populate({
        path: 'bin',
        match: { email: driverEmail } // Filter bins by driverEmail
    })
    const complaintsForDriver = complains.filter(complain => complain.bin !== null);
    // console.log(complaintsForDriver)
    res.render("driver/works", { complaintsForDriver })

})
app.get("/driver_works/update_status/:id", async (req, res) => {
    const { id } = req.params
    const com = await Complain.findById(id)
    res.render("driver/updateStatus", { com })
})
app.put("/driver_works/update_status/:id", async (req, res) => {
    const { id } = req.params
    const { Status } = req.body
    const com = await Complain.findById(id)
    com.Status = Status
    await com.save()
    res.redirect("/driver_works")


})
app.listen("3000", () => {
    console.log("APP IS LISTENING ON PORT 3000")
})