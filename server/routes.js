const express = require('express')
const path = require('path')
const router = express.Router()

router.get('/', (req, res) =>{
    res.sendFile(path.join(__dirname, '..', '/client/index.html'));
});

router.get('/scene', (req, res) =>{
    console.log(req.params);
    res.sendFile(path.join(__dirname, '..', '/client/scene.html'));
});

module.exports = router