const express = require('express');
const auth = require('../middleware/auth');
const router = express.Router();
const Note = require('../model/Note');


router.get('/', auth, async (req, res)=>{
    try{
        const note = await Note.findAll({
            where: {
                UserId: req.user.id
            }
        })
        if(!note){
            return res.status(404).send('Notes not found')
        }
        if(note.length === 0){
            return res.status(404).send({
                status: "note not found",
                data: note
            })
        }
        return res.status(201).send({
            status: "created",
            data: note
        })
    }catch(e){
        return res.status(501).send('internal server error')
    }

});

router.post('/post', auth, async (req, res)=>{
    try{
        const {text} = req.body;
        const note = await Note.create({
            note: text,
            UserId: req.user.id
        });

        if(!note){
           return res.status(400).send('cannot save note')
        }

        return res.status(201).send({
            status: "created",
            data: note
        })
    }catch(e){
        return res.status(501).send('internal server error');
    }
});

router.patch('/edit/:id', auth, async (req, res) =>{
    try{
        const {text} = req.body
        const note = await Note.update({
            note: text
        },{
            where:{
                id: req.params.id,
                UserId: req.user.id
            }
        });
        if(note[0] === 0){
            return res.status(404).send('note not found')
        }
        return res.status(201).send({
            status: 'updated'
        })
    }catch(e){
        return res.status(501).send('internal server error')
    }
});

router.delete('/delete/:id', auth, async (req, res)=>{
    try{
        const deleteNote = await Note.delete({
            where: {
                id: req.params.id,
                UserId: req.user.id
            }
        })

        if(!deleteNote){
            return res.status(404).send('note not found')
        }
        return res.status(201).send({
            status: 'delete success',
            data: deleteNote
        })
    }catch(e){
        return res.status(501).send('internal server error')
    }
})
module.exports = router;