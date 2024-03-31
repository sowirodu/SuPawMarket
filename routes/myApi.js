// myApi.js - My API route module

const express = require("express");
const UserController = require("../controllers/UserController");
const router = express.Router();
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
var app = express();
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

router.get("/", function (req, res) {
    res.render("pages/home"); // This will render views/pages/home.ejs
  });
 
 // Product page route
 router.get("/products", function (req, res) {
  res.render("pages/products"); // This will render views/pages/products.ejs
});

//cart page route
router.get("/cart", function (req, res) {
  res.render("pages/cart"); // This will render views/pages/cart.ejs
});

//checkout page route
router.get("/checkout", function (req, res) {
  res.render("pages/checkout"); // This will render views/pages/checkout.ejs
});

//login page route
router.get("/login", function (req, res) {
  res.render("pages/login"); // This will render views/pages/login.ejs
});

//create page route
router.get("/create", function (req, res) {
  res.render("pages/createaccount"); // This will render views/pages/login.ejs
});


router.post("/validate",urlencodedParser, async function(req, res) {
  //console.log(req);
    let check = await UserController.validate(req.body);
    console.log(check);
    if(check === true) {
      res.render("pages/home");
    }
    else {
      res.send("Wrong username or password");
    }
  
})

router.post("/create",urlencodedParser, async function(req, res) {
  //console.log(req);
    let check = await UserController.createUser(req.body);
    console.log(check);
    if(check === true) {
      res.render("pages/home");
    }
    else {
      res.send("Username already in use");
    }
  
})


module.exports = router;
