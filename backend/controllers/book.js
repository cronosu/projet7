const Book = require('../models/Book');
const fs = require('fs')

exports.createBook = (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);
  delete bookObject._userId;
  const book = new Book({
    ...bookObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  book.save()
    .then(() => { res.status(201).json({ message: 'Livre enregistré !' }) })
    .catch(error => { res.status(400).json({ error }) })
};


exports.modifyBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      const imageUrl = book.imageUrl;
      const startIndex = imageUrl.indexOf("images/"); 
      const fileName = imageUrl.substring(startIndex);
        if (req.file) {
          fs.unlink(`${fileName}`, (err) => {
            if (err) {
            return res.status(404).json({ error: "Erreur lors de la suppression du fichier" });
          }
        }); 
      } 
    })

  const bookObject = req.file ? {
    ...JSON.parse(req.body.book),
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : { ...req.body };
  delete bookObject._userId;
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Non-autorisé" })
      } else {
        Book.updateOne({ _id: req.params.id }, { ...bookObject, _id: req.params.id })
          .then(() => { res.status(200).json({ message: "Livre modifié" }) })
          .catch(error => { res.status(401).json({ error }) })
      }
    })
    .catch((error) => { res.status(400).json({ error }) })
};


exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Non-autorisé" });
      } else {
        const filename = book.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.status(200).json({ message: "Livre supprimé !" })
            }
            ).catch(error =>
              res.status(401).json({ error }));
        });
      }
    }).catch(
      error => { res.status(500).json({ error }); });
};


exports.getOneBook = (req, res, next) => {
  Book.findOne({
    _id: req.params.id
  }).then(
    (book) => {
      res.status(200).json(book);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

exports.getAllBooks = (req, res, next) => {

  Book.find().then(
    (books) => {
      res.status(200).json(books);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error
      });
    }
  );
};


exports.getbestRatingBooks = (req, res, next) => {
  Book.find()
    .sort({ averageRating: -1 })
    .limit(3)
    .then((bestRatedBooks) => {
      res.status(200).json(bestRatedBooks);
    })
    .catch((error) => {
      res.status(400).json({
        error
      });
    });
};

exports.addRatingBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then(book => {
      if (book.ratings.some(rating => rating.userId === req.params.id)) {
        return res.status(401).json({ message: 'Vote deja pris en compte' });
      };
      
      const rating = book.ratings;
      rating.push({
        userId: req.body.userId,
        grade: req.body.rating
      });

      const sumOfRatings = rating.reduce((total, rating) => total + rating.grade, 0);
      const newAverageRating = sumOfRatings / rating.length;

      book.averageRating = newAverageRating;

      book.save()
        .then(() => {
          res.status(201).json(book);
        })
        .catch(error => {
          res.status(400).json({ error: error.message });
        });
    })
    .catch(error => {
      res.status(400).json({ error: error.message });
    });
};
