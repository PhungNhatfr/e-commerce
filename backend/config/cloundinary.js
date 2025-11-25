import { v2 as cloundinary } from "cloudinary"

const connectCloundinary = async () => {

    cloundinary.config({
        cloud_name: process.env.CLOUNDINARY_NAME,
        api_key: process.env.CLOUNDINARY_API_KEY,
        api_secret: process.env.CLOUNDINARY_SECRET_KEY
    })

}

export default connectCloundinary;