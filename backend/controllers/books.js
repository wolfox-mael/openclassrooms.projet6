const Book = require("../models/Book");
const fs = require("fs");

exports.getAllBooks = (req, res, next) => {
  Book.find()
    .then((books) => res.status(200).json(books))
    .catch((error) => res.status(400).json({ error }));
};

exports.getBestBooks = (req, res, next) => {
  Book.find()
    .then((books) => {
      books = books.filter((book) => book._id != req.params.id);

      books = books.sort((a, b) => b.averageRating - a.averageRating);
      let bestBooks = books.slice(0, 3);
      res.status(201).json(bestBooks);
    })
    .catch((error) => res.status(500).json({ error }));
};

exports.getOneBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      res.status(200).json(book);
    })
    .catch((error) => res.status(404).json({ error }));
};

exports.createBook = async (req, res, next) => {
  const bookObject = JSON.parse(req.body.book);

  delete bookObject._id;
  delete bookObject._userId;

  const book = new Book({
    ...bookObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get("host")}/images/${
      req.file.filename
    }`,
  });
  book
    .save()
    .then(() => res.status(201).json({ message: "Objet enregistré !" }))
    .catch((error) => res.status(400).json({ error }));
};

exports.rateBook = (req, res, next) => {
  const bookObject = req.body;
  delete bookObject.userId;
  delete bookObject._id;

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      const userAlrdy = book.ratings.filter(
        (userRating) => userRating == req.auth.userId
      )[0];

      let averageRating = bookObject.rating;

      for (let index = 0; index < book.ratings.length; index++) {
        const element = book.ratings[index];

        averageRating = averageRating + element.grade;
      }

      averageRating = averageRating / (book.ratings.length + 1);

      if (!userAlrdy) {
        Book.updateOne(
          { _id: req.params.id },
          {
            $push: {
              ratings: [{ userId: req.auth.userId, grade: bookObject.rating }],
            },
            averageRating: averageRating,
          }
        )
          .then(() => res.status(200).json(book))
          .catch((error) => res.status(400).json(error));
      }
    })
    .catch((error) => res.status(404).json({ error }));
};

exports.editBook = (req, res, next) => {
  const bookObject = req.file
    ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get("host")}/images/${
          req.file.filename
        }`,
      }
    : { ...req.body };
  delete bookObject._userId;

  function editBookFunction(paramsId, bookObject) {
    Book.updateOne({ _id: paramsId }, { ...bookObject, _id: paramsId })
      .then(() => res.status(200).json({ message: "Objet modifié !" }))
      .catch((error) => res.status(401).json({ error }));
  }

  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Non-autorisé" });
      } else {
        const oldImage = book.imageUrl;

        if (
          oldImage != bookObject.imageUrl &&
          bookObject.imageUrl != undefined
        ) {
          const filename = oldImage.split("/images/")[1];
          fs.unlink(`images/${filename}`, () => {
            editBookFunction(req.params.id, bookObject);
          });
        } else {
          editBookFunction(req.params.id, bookObject);
        }
      }
    })
    .catch((error) => res.status(400).json({ error }));
};

exports.deleteBook = (req, res, next) => {
  Book.findOne({ _id: req.params.id })
    .then((book) => {
      if (book.userId != req.auth.userId) {
        res.status(401).json({ message: "Non-autorisé" });
      } else {
        const filename = book.imageUrl.split("/images/")[1];
        fs.unlink(`images/${filename}`, () => {
          Book.deleteOne({ _id: req.params.id })
            .then(() => {
              res.stauts(200).json({ message: "Objet supprimé" });
            })
            .catch((error) => res.status(401).json({ error }));
        });
      }
    })
    .catch((error) => res.status(500).json({ error }));
};
