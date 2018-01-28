const express = require('express');
const router = express.Router();
router.post('/',(req,res,next)=>{
    console.info("FEEDBACK:", req.body.type, req.body.content);
    next();
});

module.exports = router;