const express = require('express');
const validator = require('validator');
const bcrypt = require('bcrypt');
const User = require('../model/User');
const router = express.Router();
const auth  = require('../middleware/auth');
const jwt  = require('jsonwebtoken');
const Note = require('../model/Note');
// user dotenv 
require('dotenv').config()
router.get('/', async (req, res)=>{
     try{
        const user = await User.findAll();
        if(!user){
            return res.status(404).send('users not found')
        }
        return res.status(201).send({
            user_name: user.user_name,
            user_email: user.user_email
        })
     }catch(e){
        return res.status(501).send('internal server error');
     }
});

router.post('/signup', async (req, res) =>{
    try{
        const { user_name, user_email, user_password } = req.body;
        const isUserEmail = validator.isEmail(user_email);
        if(!isUserEmail){
            return res.status(400).send('Invalid Email or Password');
        }
        if(user_password.length < 8){
            return res.status(400).send('Invalid Email or Password');
        }
        
        const user_from_db = await User.findAll({
            where: {
                user_email : user_email
            }
        });

        if(user_from_db.length == 1){
            return res.status(409).send('Email has already existed');
        }

        //hash password 
        const hashed_password = await bcrypt.hash(user_password, parseInt(process.env.HASHROUND));
        if(!hashed_password){
            return res.status(400).send('Password cannot hash');
        }
        
        // save to database 
        const user = await User.create({
            user_name: user_name,
            user_email: user_email,
            user_password: hashed_password
        });
        if(!user){
            return res.status(400).send('User cannot save')
        }
        return res.status(201).send({
            user_name,
            user_email
        })
    }catch(e){
        return res.status(501).send('internal server error');
    }
});

router.post('/signin', async (req ,res) =>{
    try{
        const { user_email, user_password, confirm_password } = req.body;
        if(!(user_password === confirm_password)){
           return res.status(400).send('Pasword not match')
        }
        
        // find user from db
        const user = await User.findOne({
            where:{
                user_email : user_email
            }
        });

        if(!user){
           return res.status(404).send('User not found')
        }

        // compare client password with  password from db
        const passwordIsMatch = await bcrypt.compare(user_password, user.user_password)
        
        if(!passwordIsMatch){
            return res.status(404).send('User not found')
        }

       const token  = await jwt.sign({
        exp: Math.floor(Date.now() / 1000) + (60 * 60*24*7),
        data: {
                user_email: user.user_email,
                user_id : user.id
            }
        }, process.env.SECRETKEY);

        if(!token){
            return res.status(400).send('cannot generate token');
        }

        return res.status(201).send({
            status: 'signin success',
            data: {
                user_name: user.user_name,
                token: token
            }
        })
    }catch(e){
        return res.status(501).send('internal server error')
    }
})

router.post('/signout', auth, async (req, res) =>{
    try{
       return res.status(201).send({
        status: 'signout successed',
        data: {
            user_name: req.user.user_name,
            token: "signout"
        }
    })
    }catch(e){
       return res.status(501).send('internal server error')
    }
});

router.patch('/edit', auth, async (req, res)=>{
    try{
        // compare password 
        const passwordIsMatch = await bcrypt.compare(req.body.password, req.user.user_password);
        if(!passwordIsMatch){
            return res.status(404).send('password not match!')
        }
        const {user_name, user_email}  = req.body;
        if(!user_name){
            user_name = req.user.user_name
        }
        if(!user_email){
            user_email = req.user.user_email
        }

        const user = await User.update({
            user_name,
            user_email
        },
            {
            where: {
                UserId: req.user.id
            }
        })
        if(!user){
            return res.status(404).send('user not found')
        }
        return res.status(201).send('Account updated')
    }catch(e){
        return res.status(501).send('internal server error')
    }
});

router.patch('/', auth, async (req, res)=>{
    try{
        const {new_password, confirm_password} = req.body;
        if(!(new_password === confirm_password)){
            return res.status(400).send('password not match')
        }
        const new_password_hash = await bcrypt(new_password, parseInt(process.env.HASHROUND));
        if(!new_password_hash){
            return res.status(400).send('password cannot hash');
        }
        const user = await User.update({
            user_password: new_password_hash
        }, {
            where: {
                id: req.user.id
            }
        })
    }catch(e){

    }
});

router.delete('/deleteacc', auth , async (req, res) =>{
    try{
        // compare password 
        const passwordIsMatch = await bcrypt.compare(req.body.password, req.user.user_password);
        if(!passwordIsMatch){
            return res.status(404).send('password not match!')
        }
        
        await Note.destroy({
            where: {
                UserId: req.user.id
            }
        })
  
        const user = await User.destroy({
            where: {
                user_email: req.user.user_email
            }
        })
        
        if(!user){
            return res.status(404).send('user not found')
        }
        return res.status(201).send('Account deleted')
    }catch(e){
        return res.status(501).send('internal server error')
    }
})
module.exports  = router;