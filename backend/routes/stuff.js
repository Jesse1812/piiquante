const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const stuffCtrl = require('../controllers/stuff');

router.post('/', auth, multer, stuffCtrl.createSauce);

router.get('/', auth, stuffCtrl.getAllSauces);

router.delete('/:id', auth, stuffCtrl.deleteSauce);

module.exports = router;
