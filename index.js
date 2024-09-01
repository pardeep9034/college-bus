const express=require('express');
const app=express();
const path=require('path');
const ejsmate=require('ejs-mate');
const mongoose=require('mongoose');
const registeredRoute=require('./models/registeredroute');
const routes=require('./models/routes');
const User=require('./models/signup');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const secret = process.env.JWT_SECRET;


app.use(express.json());
app.use(cookieParser());
app.set('view engine','ejs');
app.use(express.urlencoded({extended:true}));
app.use(express.static(path.join(__dirname,'/public')));
app.set('views',path.join(__dirname,'/views'));
app.engine('ejs',ejsmate);

// Connect to MongoDB
main()
.then((res)=>{  
    console.log('Connected to MongoDB');
})
.catch((err)=>{
    console.log(err);
});



async function main(){
    await mongoose.connect(process.env.MONGO_URI);}
app.get('/',(req,res)=>{
    // res.send('Hello World');
    res.render('index');
});
app.get('/logout',(req,res)=>{
    res.clearCookie('token');
    
    res.redirect('/');
})

app.get('/home',(req,res)=>{
    // res.send('Hello World');
    res.redirect("/login/home");
});

app.get("/signup",(req,res)=>{
    
    res.render('signup');
});
app.post("/signup",async(req,res )=>{
    const { name, email, password, roll_no } = req.body;
    try {
        const newUser = new User({ name, email, password, roll_no });
        const savedUser = await newUser.save();

        // Generate JWT
        const token = jwt.sign({ userId: savedUser._id }, secret, { expiresIn: '1h' });

        // Store JWT in cookie
        res.cookie('token', token, { httpOnly: true });
        res.redirect("/login/home");
    } catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
   
});


// app.get("/signup/home",(req,res)=>{
//     const token = req.cookies.token;
//     if (!token) {
//         return res.redirect('/signup');
//         }
//         try {
//         const decoded = jwt.verify(token, secret);
//         req.userId = decoded.userId;
//         res.redirect('/login/home');
        
//         } catch (err) {
//         return res.redirect('/signup');
//         }

    
   
// })
app.get("/login",(req,res)=>{

    res.render("login");
})
app.post("/login", async (req, res) => {
    const { email, password } = req.body;
  
    if (email === "" || password === "") {
      return res.send("Please enter all the fields");  // Return after sending the response
    }
  
    try {
      const user = await User.findOne({ email, password });
  
      if (!user) {
        console.log(req.body);
        return res.send("Invalid Credentials");  // Return after sending the response
      }
  
      const token = jwt.sign(
        { userId: user._id, userEmail: user.email, routeId: user.route_id },
        secret,
        { expiresIn: '1h' }
      );
  
      res.cookie('token', token);
      return res.redirect("/login/home");  // Ensure the response is sent only once
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");  // Send error response and return
    }
  });
  const preventCache = (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    next();
};

  
  const verifyToken = (req, res, next) => {
    const token = req.cookies.token;
    
    if (!token) {
      return res.redirect("/login");
    }
  
    try {
      const decoded = jwt.verify(token, secret);
      req.userId = decoded.userId;
      req.userEmail = decoded.userEmail;
      req.routeId = decoded.routeId;
      next();
    } catch (err) {
      return res.redirect("/login");
    }
  };
  
  app.get("/login/home", verifyToken,preventCache, async (req, res) => {
    try {
      const user = await User.findById(req.userId);
      let route =null;
      
    if (user && user.route_id) {
      // Fetch route details if the user is registered for a route
      route = await routes.findById(user.route_id);
      console.log('Fetched route details:', route);
    } else {
      console.log('User does not have a registered route.');
    }``
      
      console.log(route);
      res.render("home", {
        
        user,
        
        route,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Internal Server Error");
    }
  });
  
app.get("/home/routes",verifyToken,preventCache, async(req,res)=>{
    const allRoutes = await routes.find({});
    res.render("routes",{allRoutes});
})
app.get("/home/profile",verifyToken,preventCache,async(req,res)=>{
    const user = await User.findById(req.userId);
    res.render("profile",{user});
}
)
app.get("/register/:id",verifyToken,preventCache,async(req,res)=>{
    const { id } = req.params;
    const loggedInUserId = req.userId; // Get the logged in user's ID
    console.log(loggedInUserId);
    const user = await User.findById(loggedInUserId);
    const foundRoute = await routes.findById(id);
res.render("register",{foundRoute,user});
    
})
app.post("/register/:id", verifyToken, async (req, res) => {
  const { route_id, stopname } = req.body; // Extract data from the form

  try {
      // Check if user is logged in and get their ID from the token
      const userId = req.userId; // This should be set by `verifyToken` middleware

      // Validate that all necessary data is available
      if (!route_id || !stopname) {
          return res.status(400).send("Route ID and Stop Name are required.");
      }

      // Check if user has already registered for this route
      const existingRegistration = await registeredRoute.findOne({
          route_id: route_id,
          user_id: userId
      });

      if (existingRegistration) {
          return res.status(400).send("You have already registered for this route.");
      }

      // Create a new registered route
      const newRegisteredRoute = new registeredRoute({
          route_id: route_id,
          user_id: userId,
          stop_name: stopname
      });

      // Save the registration
      await newRegisteredRoute.save();
      console.log(`User ${userId} registered to Route ${route_id} at Stop ${stopname}`);
      await User.findByIdAndUpdate(userId, { route_id: route_id, stop: stopname });

      // Redirect to the user's home page after successful registration
      res.redirect("/login/home");
  } catch (err) {
      console.error("Error registering route:", err);
      res.status(500).send("Internal Server Error");
  }
});

app.get("/adminlogin",(req,res)=>{
    res.render("adminlogin")

})
app.post("/adminlogin",(req,res )=>{
    // console.log("data saved")   
    res.redirect("/adminlogin/adminhome")
})
app.post("/add-route",(req,res )=>{
    const { route_name, bus_number, departure, source, destination, driver_name, driver_contact, stop_name, arrival_time } = req.body;

  // Create stops array
  const stops = stop_name.map((name, index) => ({
    stop_name: name,
    arrival_time: arrival_time[index],
  }));

  // Create a new route document
  const newRoute = new routes({
    route_name,
    bus_number,
    departure,
    source,
    destination,
    driver_name,
    driver_contact,
    stops,
  });

  // Save the route to the database
  newRoute.save()
    .then(() => {
      res.send('Route added successfully!');
    })
    .catch((err) => {
      console.error('Error adding route:', err);
      res.status(500).send('Internal Server Error');
    });
    console.log(req.body)   
    res.redirect("/adminlogin/adminhome")
})
app.get("/adminlogin/adminhome",(req,res)=>{
    res.render("adminhome")
})
app.listen(3000,()=>{
    console.log('Server is running on port 3000');
});

