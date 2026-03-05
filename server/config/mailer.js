const nodemailer=require('nodemailer')
const dotenv=require('dotenv')

dotenv.config()
const transporter=nodemailer.createTransport({
    service:'gmail',
    'auth':{
        user:process.env.USER,
        pass:process.env.PASS
    }
})

module.exports=transporter
