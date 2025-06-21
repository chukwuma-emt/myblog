require ('dotenv').config();
const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override')
 
const cookieParser = require('cookie-parser')
const MongoStore = require('connect-mongo')
const session = require('express-session')

const connectDB = require('./server/config/db')
const { isActiveRoute } = require('./server/helpers/routerHelpers')


const app = express();
const PORT = process.env.PORT || 10000;


//connect to database
connectDB();

app.use(express.urlencoded({ extended: true}))
app.use(express.json())
app.use(cookieParser())
app.use(methodOverride ('_method'))

app.use(session({
   secret: 'keyboad cat',
   resave: false,
   saveUninitialized: true,
   store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    
   })
   //cookie: { maxAge: new Date( Date.now() + (3600000))}

}))

app.use(express.static('public'))
app.use('/uploads', express.static('public/uploads'))

// templating engine
app.use(expressLayout);
app.set('layout', './layouts/main')
app.set('view engine', 'ejs')


app.locals.isActiveRoute = isActiveRoute

app.use((req, res, next)=> {
    res.locals.currentRoute = req.path;
    next();
})

app.use('/', require('./server/routes/main'))
app.use('/', require('./server/routes/admin'))
app.use('/', require('./server/routes/owner'))

app.listen(PORT, ()=> {
    console.log(`App listening on port ${PORT}`);
});