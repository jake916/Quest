const cloudinary = require('cloudinary').v2;
const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
require("dotenv").config();


cloudinary.config({
    cloud_name: 'dwjggqtlo',
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})
const url = cloudinary.url('cld-sample-5',{
    transformation: [
        {
            quality: 'auto'
        },
        {
            fetch_format: 'auto'
        }
    ]
})
module.exports = cloudinary;