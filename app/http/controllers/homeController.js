const Menu = require('../../models/menu')


function homeController(){
  return {
      index(req,res) {
        Menu.find().then(function(Burgers){

          // console.log(Burgers)
          

         return res.render('home',{Burgers : Burgers})
        })
      }
  }

}

module.exports = homeController