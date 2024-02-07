const app= require('./app');
const dotenv=require('dotenv')
const connectDatabase=require('./config/database')



dotenv.config({path:'backend/config/.env'})

connectDatabase()

const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_KEY
});
module.exports = cloudinary;


const server=app.listen(process.env.PORT,()=>console.log(`Sever is Running at port : ${process.env.PORT}`))



//unhandled rejection
process.on("unhandledRejection",(err)=>{
    console.log(`Error:${err.message}`);
    console.log('Shutting down the server duse to Unhandled Promise Rejection')
    server.close(()=>{
        process.exit(1)
    })
})