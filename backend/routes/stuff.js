const express = require('express');
const router = express.Router();

const stuffCtrl = require('../controllers/stuff');

router.post('/', stuffCtrl.createSauce);

router.get('/', stuffCtrl.getAllSauces);

router.delete('/:id', stuffCtrl.deleteSauce);

module.exports = router;
