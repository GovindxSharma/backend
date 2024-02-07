const express = require("express");
const app = express();
const errorMIddleware=require('./middleware/error')
const cookieParser=require('cookie-parser')
const bodyParser = require('body-parser');
const dotenv=require('dotenv')
const cors=require('cors')
// const fileupload=require('express-fileupload')



dotenv.config({path:'config/.env'})

// make json in use

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use(cookieParser())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())

// make json in use

//Routes import
const product = require("./routes/productRoute");
const user=require('./routes/userRoute');
const order=require('./routes/orderRoute')
const payment=require('./routes/paymentRoute')

app.use("/api/v1", product);
app.use("/api/v1", user);
app.use("/api/v1", order);
app.use("/api/v1", payment);


//error middleware
app.use(errorMIddleware)

module.exports = app;
