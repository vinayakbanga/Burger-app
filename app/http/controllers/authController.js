const User = require('../../models/user')
const bcrypt= require('bcrypt')
const passport = require('passport')

function authController(){
      const _getRedirectUrl = (req)=> {
        return req.user.role === 'admin' ?'/admin/orders' :'/customer/orders'
      }

    return {
        login(req,res) {
            res.render('auth/login')
        },
        postLogin(req, res, next) {
            const { email, password }   = req.body
           // Validate request 
            if(!email || !password) {
                req.flash('error', 'All fields are required')
                return res.redirect('/login')
            }
            passport.authenticate('local', (err, user, info) => {
                if(err) {
                    req.flash('error', info.message )
                    return next(err)
                }
                if(!user) {
                    req.flash('error', info.message )
                    return res.redirect('/login')
                }
                req.logIn(user, (err) => {
                    if(err) {
                        req.flash('error', info.message ) 
                        return next(err)
                    }



                    return res.redirect(_getRedirectUrl(req))
                })
            })(req, res, next)
        },

        register(req,res) {
            res.render('auth/register')
        },
        async postRegister(req,res){
            const { name,email,password } =req.body
             
            //validate req
            if(!name || !email ||!password){
                  req.flash('error','All Fields are required')
                   req.flash('name',name)
                   req.flash('email',email)
                return res.redirect('/register')

            }

            //check if email exists
            User.exists({email:email},(err,result)=>{
                if(result){
                    req.flash('error','Email already taken')
                   req.flash('name',name)
                   req.flash('email',email)
                   return res.redirect('/register')
                }

            })

            //hash password 
            const hashedPassword = await bcrypt.hash(password,10)


            //create a user

            const user =new User({
                name:name,
                email:email,
                password:hashedPassword
            })
            user.save().then((user)=>{
             //  login


             return res.redirect('/')

            }).catch(err => {
                req.flash('error','Something went wrong')
                return res.redirect('/register')
                   

            })

            // console.log(req.body);
        },

        logout(req,res){
            req.logout()
            return res.redirect('/login')

        }
    }
  
  }
  
  module.exports = authController