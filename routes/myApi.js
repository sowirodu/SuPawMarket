// myApi.js - My API route module

const express = require("express");
const UserController = require("../controllers/UserController");
const router = express.Router();
const AdminController = require("../controllers/AdminController");
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

router.get("/", function (req, res) {
    const sessionData = req.session;
    res.render("pages/home"); // This will render views/pages/home.ejs
  });

  // About page route
  //router.get("/about", function (req, res) {
  //  res.render("pages/about"); // This will render views/pages/about.ejs
 // });
 
 // Product page rroute
 router.get("/products", function (req, res) {
  res.render("pages/products"); // This will render views/pages/products.ejs
});

//ACCOUNT ROUTES
router.get("/login", function (req, res) {
  res.render("pages/login"); // This will render views/pages/login.ejs
});

router.get("/create", function (req, res) {
  res.render("pages/createaccount"); // This will render views/pages/login.ejs
});

router.post("/validate",urlencodedParser, async function(req, res) {
  // console.log(req);
  // console.log(req.body);

    let check = await UserController.validate(req.body);
    //console.log("check: " + check);
    if(check === true) {
      //console.log(req.body.username)
      req.session.isLoggedIn = true;
      req.session.username = req.body.username;
      req.session.isAdmin = await UserController.checkIsAdmin(req.body.username);
      req.session.userID = await UserController.getUserID(req.body.username);
      //console.log(req.session.userID)
      res.render("pages/home");
    }
    else {
      res.send("Wrong username or password");
    }
  
})

router.post("/create",urlencodedParser, async function(req, res) {
  //console.log(req);
    let check = await UserController.createUser(req.body);
    //console.log(check);
    if(check === true) {
      //console.log(req.body.username)
      req.session.isLoggedIn = true;
      req.session.username = req.body.username;
      req.session.isAdmin = false;
      req.session.userID = await UserController.getUserID(req.body.username);
      res.render("pages/home");
    }
    else {
      res.send("Username already in use");
    }
  
})


//ADMIN ROUTES
router.get("/admin", function(req,res) {
  if(req.session.isLoggedIn === true && req.session.isAdmin === 1) {
    res.render("pages/adminDash");
  }
  else res.send("Admin Account Required")
})

router.get("/addProduct", function(req,res) {
  if(req.session.isLoggedIn === true && req.session.isAdmin === 1) {
    res.render("pages/addProduct");
  }
  else res.send("Admin Account Required")
})

router.post("/validateProduct", urlencodedParser, async function(req,res) {
  console.log(req.body);
  if(req.session.isLoggedIn === true && req.session.isAdmin === 1) {
    await AdminController.addProduct(req.body);
    res.send("Product Added");
  }
  else res.send("Admin Account Required")
})

router.get("/editProducts", function(req,res) {
  if(req.session.isLoggedIn === true && req.session.isAdmin === 1) {
    res.render("pages/editProducts");
  }
  else res.send("Admin Account Required")
})


module.exports = router;
