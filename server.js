require('dotenv').config()
const express = require('express')
const app = express()
const ejs = require('ejs')
const path = require('path')
const mongoose = require('mongoose');
const expressLayout = require('express-ejs-layouts')
const PORT = process.env.PORT || 3300
const session =require('express-session')
const flash =require('express-flash')
const MongoDbStore = require('connect-mongo')
const passport= require('passport')
const Emitter = require('events')
// const Connect = require('')
// Assets 
app.use(express.static('public'))
app.use(express.json())
app.use(express.urlencoded({extended:false}))



// Database connection
mongoose.connect(process.env.MONGO_URL);
mongoose.connection
    .once('open', function () {
      console.log('MongoDB running');
    })
    .on('error', function (err) {
      console.log(err);
    });




    //Event Emiiter
       const eventEmitter = new Emitter()
      app.set('eventEmitter',eventEmitter);

    //sessionn config

    app.use(session({
        secret: process.env.COOKIE_SECRET,
        resave: false,
        store:MongoDbStore.create({
            mongoUrl:process.env.MONGO_URL
        }),
        
        saveUninitialized: false,
        cookie: { maxAge: 1000 * 60 * 60 * 24 } // 24 hour
        // cookie: { maxAge: 1000 * 15 }

    }))
        //passport config
        const passportInit = require('./app/config/passport')
const { Server } = require('http')
        passportInit(passport);
        
        app.use(passport.initialize())
        app.use(passport.session())
    

    app.use(flash())

//Global middleware
app.use((req,res,next)=>{
    res.locals.session = req.session
    res.locals.user=req.user
    next()

})

// set Template engine
app.use(expressLayout)
app.set('views', path.join(__dirname, '/resources/views'))
app.set('view engine', 'ejs')

require('./routes/web')(app)
app.use((req, res) => {
    res.status(404).render('errors/404')
})




const server= app.listen(PORT , () => {
    console.log(`Listening on port ${PORT}`)
})


//socket
const io = require('socket.io')(server)

io.on('connection',(socket)=>{
    //join 
    socket.on('join',(roomName)=>{
        // console.log(roomName);
        socket.join(roomName)
    })
})


eventEmitter.on('orderUpdated',(data)=>{
    io.to(`order_${data.id}`).emit('orderUpdated',data)
})

eventEmitter.on('orderPlaced',(data)=>{
    io.to('adminRoom').emit('orderPlaced',data)
})