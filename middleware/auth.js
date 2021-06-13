const jwt  = require('jsonwebtoken');
const User = require('../model/User');

const auth  = async (req, res, next ) =>{
    const res_error_data = {
        status: "Unauthurize",
        data: {
            user_name: "unknown",
            token: "unauthurize"
        }
    }
    try{
        const header = req.header('Authorization').replace('Bearer ', '');

        const decoded = await jwt.verify(header, process.env.SECRETKEY);
        if(!decoded){
            return res.status(400).send(res_error_data)
        }
        
        // find user using user email
        const user = await User.findOne({
            where: {
                user_email: decoded.data.user_email,
                id: decoded.data.user_id
            }
        });
        
        if(!user){
            return res.status(400).send(res_error_data)
        }
        req.user = user
        next();
    }catch(e){
        return res.status(400).send(res_error_data)
    }
}

module.exports = auth;
