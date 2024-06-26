// myApi.js - My API route module

const express = require("express");
const UserController = require("../controllers/UserController");
const ProductController = require("../controllers/ProductController");
var app = express();
const router = express.Router();
const ReviewController = require("../controllers/ReviewController");
const AdminController = require("../controllers/AdminController");
const AddressController = require("../controllers/AddressController");


//FOR PARSING DIFFERENT OBJECTS
var bodyParser = require("body-parser");
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const multer = require('multer');


//FOR IMAGE UPLOAD
const storage = multer.diskStorage({
  destination: (req, file, cb)=>{
    //This part defines where the files need to be saved
    cb(null, 'public/product-images')
  },
  filename: (req, file, cb)=>{
    // This part sets the file name of the file
    cb(null, file.originalname)
  }
})
// Then we will set the storage 
const upload = multer({ storage: storage });


app.use(
  bodyParser.urlencoded({
    extended: true
  })
);
app.use(bodyParser.json());

router.get("/", function(req, res) {
  const sessionData = req.session;
  res.render("pages/home"); // This will render views/pages/home.ejs
});

// Product page route
router.get("/products", function(req, res) {
  res.render("pages/products"); // This will render views/pages/products.ejs
});

//cart page route
router.get("/cart", function(req, res) {
  if (req.session.isLoggedIn === true) {
  res.render("pages/cart", {userID: req.session.userID}); // This will render views/pages/cart.ejs
  } else res.redirect("/account");
});

//checkout page route
router.get("/checkout", function(req, res) {
  res.render("pages/checkout"); // This will render views/pages/checkout.ejs
});

//ACCOUNT PAGE ROUTE
router.get("/account", function (req, res) {
  if(req.session.isLoggedIn){
    res.render("pages/account", { username: req.session.username, userID: req.session.userID }); // This will render views/pages/account.ejs and pass the username as a variable
  }
  else{
    res.render("pages/login"); // This will render views/pages/login.ejs
  }
});

//account edit page route
router.get("/edit", function(req, res) {
  if(req.session.isLoggedIn){
    res.render("pages/edit", { username: req.session.username }); // This will render views/pages/account.ejs and pass the username as a variable
  }
  else{
    res.render("pages/home"); // This will render views/pages/login.ejs
  }
});

//create page route
router.get("/create", function(req, res) {
  res.render("pages/createaccount"); // This will render views/pages/createaccount.ejs
});

router.post("/validate", urlencodedParser, async function(req, res) {
  // console.log(req);
  // console.log(req.body);

  let check = await UserController.validate(req.body);
  //console.log("check: " + check);
  if (check === true) {
    //console.log(req.body.username)
    req.session.isLoggedIn = true;
    req.session.username = req.body.username;
    req.session.isAdmin = await UserController.checkIsAdmin(req.body.username);
    req.session.userID = await UserController.getUserID(req.body.username);
    //console.log(req.session.userID)
    res.render("pages/home");
  } else {
    res.redirect("/account");
  }
});

router.post("/create", urlencodedParser, async function(req, res) {
  //console.log(req);
  let check = await UserController.createUser(req.body);
  //console.log(check);
  if (check === true) {
    //console.log(req.body.username)
    req.session.isLoggedIn = true;
    req.session.username = req.body.username;
    req.session.isAdmin = false;
    req.session.userID = await UserController.getUserID(req.body.username);
    res.render("pages/home");
  } else {
    res.redirect('/create');
  }
});

//checkout page route
router.get("/checkout", function(req, res) {
  res.render("pages/checkout"); // This will render views/pages/checkout.ejs
});

//ADMIN ROUTES
router.get("/admin", function(req, res) {
  if (req.session.isLoggedIn === true && req.session.isAdmin === 1) {
    res.render("pages/adminDash");
  } else res.send("Admin Account Required");
});

router.get("/addProduct", function(req,res) { //Renders page with a form for admins to add a product
  if(req.session.isLoggedIn === true && req.session.isAdmin === 1) {
    res.render("pages/addProduct");
  } else res.send("Admin Account Required");
});

router.post("/validateProduct", upload.single("productImg"), async function(req,res) { //adds a product to the database
  //console.log(req.body);
  //console.log(req.file.originalname)
  if(req.session.isLoggedIn === true && req.session.isAdmin === 1) {
    await AdminController.addProduct(req.body, req.file.originalname);
    await AdminController.recordAdd(req.session.userID,req.body)
    res.render("pages/adminDash");
  } else res.send("Admin Account Required");
});

router.get("/editProducts", async function(req,res) {//renders table of all products and allows admins to edit products
  if(req.session.isLoggedIn === true && req.session.isAdmin === 1) { 
    res.render("pages/editProduct");
  } else res.send("Admin Account Required");
});

router.post("/updateProduct", upload.single("productImg"), async function(req, res) {
  //console.log(req);
  if (req.session.isLoggedIn === true && req.session.isAdmin === 1) {
    await AdminController.updateProduct(req.body);
    if(req.body.productImg !== "undefined") {
      await AdminController.updateProductImg(req.body,req.file.originalname);
    }
    await AdminController.recordEdit(req.session.userID,req.body);
    res.render("pages/editProduct");
  } else res.send("Admin Account Required");
});

router.get("/getProducts", async function(req, res) {
  if (req.session.isLoggedIn === true && req.session.isAdmin === 1) {
    let responseData = await AdminController.getProdInfo();
    res.json(responseData);
  }
  else res.send("Admin Account Required");
});

router.get("/getShipping", async function(req, res) {
  if (req.session.isLoggedIn === true) {
    let responseData = await AddressController.getShippingLine1(req.session.userID);
    res.json(responseData);
  }
  else res.send("Must be Logged In");
});

router.get("/line2", async function(req, res) {
  if (req.session.isLoggedIn === true) {
    let responseData = await AddressController.getShippingLine2(req.session.userID);
    res.json(responseData);
  }
  else res.send("Must be Logged In");
});

router.get("/getCity", async function(req, res) {
  if (req.session.isLoggedIn === true) {
    let responseData = await AddressController.getShippingCity(req.session.userID);
    res.json(responseData);
  }
  else res.send("Must be Logged In");
});

router.get("/getState", async function(req, res) {
  if (req.session.isLoggedIn === true) {
    let responseData = await AddressController.getShippingState(req.session.userID);
    res.json(responseData);
  }
  else res.send("Must be Logged In");
});

router.get("/getZip", async function(req, res) {
  if (req.session.isLoggedIn === true) {
    let responseData = await AddressController.getShippingZip(req.session.userID);
    res.json(responseData);
  }
  else res.send("Must be Logged In");
});

router.post("/getProductHistory", jsonParser, async function(req, res) {
  if(req.session.isLoggedIn === true && req.session.isAdmin === 1) {
    let responseData = await AdminController.getProductHistory(req.body);
    //console.log(responseData);
    res.json(responseData);
  }
  else res.send("Admin Account Required")
});

router.get("/getCategories", async function(req, res) {
  if(req.session.isLoggedIn === true && req.session.isAdmin === 1) { 
    let responseData = await AdminController.getCategoryInfo();
    res.json(responseData);
  }
  else res.send("Admin Account Required");
});

router.post("/deleteProduct", jsonParser, async function(req, res) {
  if (req.session.isLoggedIn === true && req.session.isAdmin === 1) {
    await AdminController.deleteProduct(req.body);
    await AdminController.recordRemove(req.session.userID,req.body);
  }
  else res.send("Admin Account Required")
});

router.get("/manageUsers", async function(req, res) {
  if (req.session.isLoggedIn === true && req.session.isAdmin === 1) {
    res.render("pages/manageUsers");
  } else res.send("Admin Account Required");
});

router.get("/getUsers", async function(req, res) {
  if (req.session.isLoggedIn === true && req.session.isAdmin === 1) {
    let responseData = await AdminController.getUsers();
    res.json(responseData)
  }
  else res.send("Admin Account Required");
});

router.post("/toggleAdmin", jsonParser, async function(req, res) {
  if(req.session.isLoggedIn === true && req.session.isAdmin === 1) { 
    await AdminController.toggleAdmin(req.body);
  }
  else res.send("Admin Account Required")
});
// Dog Products item page route
router.get("/dogItemProduct", function(req, res) {
  if (req.session.isLoggedIn) {
    res.render("pages/dogItemProduct"); // This will render views/pages/dogItemProduct.ejs
  } else {
    res.redirect("/account");
  }
});

// Dog Products page route
router.get("/dogSubProducts", function(req, res) {
  res.render("pages/dogSubProducts"); // This will render views/pages/dogSubProducts.ejs
});

// Product page route
router.get("/dogProducts", function(req, res) {
  res.render("pages/dogProducts"); // This will render views/pages/products.ejs
});

// Cat Products Item Routes
router.get("/catItemProduct", function(req, res) {
  res.render("pages/catItemProduct"); 
});

// Cat Products page route
router.get("/catSubProducts", function(req, res) {
  res.render("pages/catSubProducts"); 
});

// Product page route
router.get("/catProducts", function(req, res) {
  res.render("pages/catProducts"); 
});

// Cat Product item page route ^^

// Get product quantity
router.get("/product/quantity/:productId", ProductController.getQuantity);

// Get product name
router.get("/product/name/:productId", ProductController.getProductName);

router.get("/product/image/:productId", ProductController.getImage);

// Get product description
router.get("/product/description/:productId", ProductController.getDescription);

// Get product price
router.get("/product/price/:productId", ProductController.getPrice);

// Get cat
router.get("/user/category/:categoryName", UserController.productsByCat);

// Add To Cart using POST request
router.post("/addToCart", jsonParser, async function(req, res) {
  if (req.session.isLoggedIn) {
    try {
      const userID = req.session.userID;
      await UserController.addToCart(userID, req.body);

      // Respond with success message
      res
        .status(200)
        .json({ success: true, message: "Item added to cart successfully" });
    } catch (error) {
      console.error("Error adding item to cart:", error);
      res
        .status(500)
        .json({ success: false, message: "Internal Server Error" });
    }
  } 
});

router.post("/validateCheckout", async function(req, res) {
  if(req.session.isLoggedIn) {
    let info = await UserController.getCartByID(req.session.userID);
    //console.log(req.session.userID);
    await UserController.checkout(req.session.userID, info);
    res.render("pages/checkoutComplete");
  }
});

router.get("/getAddressLine1", async function(req, res) {
  let responseData = await AddressController.getShippingLine1(req.session.userID);
  //console.log(responseData);
  res.json(responseData);
});

router.get("/getAddressLine2", async function(req, res) {
  let responseData = await AddressController.getShippingLine2(req.session.userID);
  //console.log(responseData);
  res.json(responseData);
});

router.get("/getAddressCity", async function(req, res) {
  let responseData = await AddressController.getShippingCity(req.session.userID);
  //console.log(responseData);
  res.json(responseData);
});

router.get("/getAddressState", async function(req, res) {
  let responseData = await AddressController.getShippingState(req.session.userID);
  //console.log(responseData);
  res.json(responseData);
});

router.get("/getAddressZip", async function(req, res) {
  let responseData = await AddressController.getShippingZip(req.session.userID);
  //console.log(responseData);
  res.json(responseData);
});

router.post("/updateShippingAddress", urlencodedParser, async function(req, res) {
  await AddressController.setShippingAddress(req.session.userID,req.body);
  res.render("pages/account", { username: req.session.username })
});


// Route to get the user ID for a review
router.get('/reviews/user/:reviewId', ReviewController.getUserID);

// Route to get the product ID for a review
router.get('/reviews/productID/:reviewId', ReviewController.getProductID);

// Route to get the star rating for a review
router.get('/reviews/rating/:reviewId', ReviewController.getStarRating);

// Route to get the review text for a review
router.get('/reviews/text/:reviewId', ReviewController.getReviewText);

router.get('/reviews/reviewIDs/:productID', ReviewController.getReviewIds);

router.get('/user/getCart/:userID', UserController.getCart);

router.post("/removeItem", jsonParser, async function(req, res) {
  if (!req.session.isLoggedIn) {
      return res.status(403).json({ success: false, message: "Not authorized" });
  }

  try {
      const removalSuccess = await UserController.removeFromCart(req, res);
      if (removalSuccess) {
          return res.status(200).json({ success: true, message: "Item removed successfully" });
      }
  } catch (error) {
      console.error("Error removing item from cart:", error);
      return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

module.exports = router;
