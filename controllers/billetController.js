const express = require('express');
const router = express.Router();

const billetService = require('../services/billetService');

router.get("/boleto/:billetNumber", (req, res)=>{
    const { billetNumber } = req.params;
    const response = billetService.verifyBilletType(billetNumber);
    res.status(response.status).json(response.billetStatus);
})

module.exports = router;

