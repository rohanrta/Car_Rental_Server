const mongoose = require('mongoose')
const connectionString = process.env.dbConnectionString

mongoose.connect(connectionString).then(res=>{
    console.log("mongoDB atlas connected successfully with carRental server");
    
}).catch(err=>{
    console.log("MongoDB Atlas Connection failed ");
    console.log(err);
})