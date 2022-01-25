const express = require('express');
const billetService = require('../services/billetService');

const router = express.Router();

router.get("/boleto/:billetNumber", (req, res)=>{
    const {billetNumber} = req.params;
    const response = billetService.verifyBilletType(billetNumber);
    res.status(response.status).json(response.billet);
})

module.exports = router;

