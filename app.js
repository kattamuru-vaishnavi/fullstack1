const express = require('express');
const bodyParser = require('body-parser');
const admin = require('firebase-admin');
const path = require('path');
const passwordHash = require('password-hash');

const app = express();

// Set the views directory
app.set('views', path.join(__dirname, 'views'));

// Set the view engine (EJS in this case)
app.set('view engine', 'ejs');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

const serviceAccount = require('./key.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = getFirestore();

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.send('Hello World...');
});

app.get("/signup",(req,res)=> {
    res.render("signup");
})

app.get("/login",(req,res)=> {
    res.render("login");
})


app.post('/login', (req, res) => {
    // Here you would typically handle login logic and validation
    // For demonstration purposes, let's assume login was successful
  
    // Redirect to a different page after successful login
    res.redirect('/dashboard');
  });
  
  // Route to handle GET request for dashboard after successful login
  app.get('/dashboard', (req, res) => {
    // Render the dashboard view after successful login
    res.render('dashboard');
  });

  
// Signup route
app.post('/signupSubmit', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const usersData = await db.collection('users')
            .where('email', '==', email)
            .get();

        if (!usersData.empty) {
            return res.send('Hey! This account already exists...');
        }

        await db.collection('users').add({
            userName: username,
            email: email,
            password: passwordHash.generate(password)
        });

        res.sendFile(path.join(__dirname, 'public', 'login.html'));
    } catch (error) {
        console.error('Error during signup:', error);
        res.send('Something went wrong...');
    }
});

// Login route
app.post('/loginSubmit', async (req, res) => {
    const { username, password } = req.body;

    try {
        const usersData = await db.collection('users')
            .where('userName', '==', username)
            .get();

        let verified = false;
        let user = null;

        usersData.forEach((doc) => {
            if (passwordHash.verify(password, doc.data().password)) {
                verified = true;
                user = doc.data();
            }
        });

        if (verified) {
            res.render('dashboard', { username: user.userName });
        } else {
            res.send('Login failed...');
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.send('Something went wrong...');
    }
});

// Open port 2000 in web server
app.listen(2000, () => {
    console.log('server is running on port 2000');
});
