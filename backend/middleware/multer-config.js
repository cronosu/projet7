const multer = require('multer');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
     if (!extension) {
        return callback(new Error('Format de fichier non pris en charge'), null);
      } 
    const path = name + Date.now() + '.' + extension;
    callback(null, path)
  }
});

const upload = multer({ storage: storage }).single('image');

module.exports = (req, res, next) => {
  upload(req, res, (err) =>{
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  }); 
};
