const mongoose = require('mongoose');
const dbr = require("debug")("development:mongoose");
const config = require('config');

mongoose
.connect(`${config.get("MONGODB_URI")}/stowe`)
.then(function(){
    dbr("Connected")
})
.catch(function(err){
   dbr(err);
})

module.exports = mongoose.connection;