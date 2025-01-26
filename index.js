const express = require('express');
const app = express();
const path = require('path');
const PORT = 3000;
const bcrypt = require('bcrypt');
const ConnectToMongo = require('./connect');
const User = require('./login_schema');
const createUser = require('./user_schema');
const methodOverride = require('method-override');
const multer = require('multer');

//connection of mongo
ConnectToMongo();

// Middleware
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use(methodOverride('_method'));
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));


//set view engine
app.set('view engine','ejs');
app.set('views','views');
app.use(express.static('public'));

// Routes
app.get('/', (req, res) => {
    res.render('home.ejs');
});
app.get('/login', (req, res) => {
    res.render('login.ejs');
});
app.get('/signup', (req, res) => {
    res.render('signup.ejs');
});
app.get('/contact',(req,res)=>{
  res.render("contact.ejs")
})
app.get('/back', (req, res) => {
  res.render('home.ejs');
});
app.get('/createuser', (req, res) => {
  res.render('createuser.ejs');
});
app.get('/about', (req, res) => {
  res.render('about.ejs');
});
app.get('/afterlogin', async (req, res) => {
  try {
    const newInfo = await createUser.find({});

    res.render('afterlogin.ejs', { newInfo , success: null,danger : null });
  } catch (error) {
    console.error(error);
    res.status(500).send('Error fetching users');
  }
});

app.post('/signup',async(req,res)=>{
    const data = {
        name:req.body.username,
        email:req.body.email,
        password:req.body.password,
    }
    const existingUser = await User.findOne({email:data.email})
    if (existingUser) {
        res.send("User Already exists !!");
    }
    const hashedPassword = await bcrypt.hash(data.password,10)
    data.password = hashedPassword;

    await User.insertMany(data);
    return res.render('login.ejs');
})
app.post('/login', async (req, res) => {
    try {
      const check = await User.findOne({ email: req.body.email });
      if (!check) {
        return res.send('User is not found !!');
      }
      const isPasswordcheck = await bcrypt.compare(req.body.password, check.password);
      if (isPasswordcheck) {
        const newInfo = await createUser.find({});  
       return res.render('afterlogin.ejs', { newInfo , success: null,danger:null});
      } else {
        return res.send('Wrong password');
      }
    } catch (error) {
      console.error(error);
      return res.status(500).send('Error during login');
    }
  });
 
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, 'public/uploads'));  
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  

const upload = multer({ storage });

app.post('/user', upload.single('profilePicture'), async (req, res) => {
  try {
    const { name, email, roll, profilePictureUrl } = req.body;

    // Check if a file was uploaded
    let profilePicture = '';
    if (req.file) {
   profilePicture = `/uploads/${req.file.filename}`;
      console.log('File uploaded to:', profilePicture);   
    } else if (profilePictureUrl) {
      profilePicture = profilePictureUrl;
    }
    

    const newUser = new createUser({
      name,
      email,
      roll,
      profilePicture,
    });

    await newUser.save();
    const newInfo = await createUser.find({});
    const successMessage = 'User created successfully!';

    return res.render('afterlogin.ejs', { newInfo, success: successMessage, danger: null });
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error creating user');
  }
});
app.get('/viewUser/:id',async(req,res)=>{
   const userId = req.params.id;

   const user = await createUser.findById(userId);
   if (!user) {
    return res.status(404).send('User not found');
  }
  res.render('viewuser', {user});
})

  //update user route
  app.get('/updateUser/:id', async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await createUser.findById(userId);
  
      if (!user) return res.status(404).send('User not found');
  
      const profilePictureType = user.profilePicture.startsWith('/uploads/')
        ? 'file'
        : 'url';
  
      res.render('updateuser.ejs', {
        user,
        profilePicture: user.profilePicture,
        profilePictureType,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send('Error fetching user details for update');
    }
  });
  
  app.post('/updateUser/:id', upload.single('profilePicture'), async (req, res) => {
    try {
      const { name, email, roll, profilePictureUrl } = req.body;
      const userId = req.params.id;
  
      const user = await createUser.findById(userId);
      if (!user) return res.status(404).send('User not found');
  
      // Determine the new profile picture
      let profilePicture = user.profilePicture;
      if (req.file) {
        profilePicture = `/uploads/${req.file.filename}`;
      } else if (profilePictureUrl) {
        profilePicture = profilePictureUrl;
      }
  
      // Update user
      user.name = name;
      user.email = email;
      user.roll = roll;
      user.profilePicture = profilePicture;
      await user.save();

      const newInfo = await createUser.find({})
      const successMessage= "user update successfully!!";
  
      return res.render('afterlogin.ejs',{newInfo,success:successMessage,danger:null});
    } catch (error) {
      console.error(error);
      res.status(500).send('Error updating user');
    }
  });
  app.delete('/deleteUser/:id', async (req, res) => {
    try {
      const userId = req.params.id;
      await createUser.findByIdAndDelete(userId);
  
      const newInfo = await createUser.find({});
      const dangerMessage = 'User deleted successfully!';
  
      return res.render('afterlogin.ejs', { newInfo, success: null, danger: dangerMessage });
    } catch (error) {
      console.error(error);
      return res.status(500).send('Error deleting user');
    }
  });
  

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on PORT:${PORT}`);
});