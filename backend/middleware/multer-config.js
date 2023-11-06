const multer = require('multer');
const sharp = require('sharp');
const path = "";
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
    callback(null, path);
  }
});

const upload = multer({ storage: storage }).single('image');

module.exports = (req, res, next) => {
  upload(req, res, function (err) {
    
    next();
  });
};
