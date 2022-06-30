const mongoose = require('mongoose');


async function connection (){
    return mongoose.connect('mongodb+srv://vinayakbanga:vinayak@cluster0.zzz5h.mongodb.net/pizza?retryWrites=true&w=majority');
}

module.exports = connection