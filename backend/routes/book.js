const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const multer = require ('../middleware/multer-config')
const bookCtrl = require('../controllers/book');

router.get('/bestrating',bookCtrl.getbestRatingBooks);
router.get('/:id',bookCtrl.getOneBook );
router.get('/',bookCtrl.getAllBooks );


router.post('/:id/rating',auth,multer,bookCtrl.addRatingBook);
router.post('/',auth,multer,bookCtrl.createBook);


router.put('/:id',auth,multer, bookCtrl.modifyBook );

router.delete('/:id',auth,bookCtrl.deleteBook );


module.exports = router;