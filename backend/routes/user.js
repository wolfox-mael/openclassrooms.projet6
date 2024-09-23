const express = require('express');
const router = express.Router();
const userCrtl = require('../controllers/user');

console.log('Je suis là');


router.post('/signup', userCrtl.signup);
router.post('/login', userCrtl.login);
router.post('/', userCrtl.test);

module.exports = router;