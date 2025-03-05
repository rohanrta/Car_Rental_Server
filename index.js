require('dotenv').config()
const express = require('express')
const cors = require('cors')
const router =  require('./routes/router')
const carRentalServer = express()
require('./database/dbConnection')
carRentalServer.use(cors())
carRentalServer.use(express.json())
carRentalServer.use(router)
carRentalServer.use('/uploads',express.static('./uploads'))

const PORT = 3000 || process.env.PORT

carRentalServer.listen(PORT,()=>{
    console.log('Car Rental Server has Initiated successfully and waiting for the client request');
})
