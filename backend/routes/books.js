const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const multer = require('../middleware/multer-config')

const bookCrtl = require("../controllers/books");

router.get("/bestrating", bookCrtl.getBestBooks);
router.get("/", bookCrtl.getAllBooks);
router.get("/:id", bookCrtl.getOneBook);
router.post("/", auth, multer, bookCrtl.createBook);
router.post("/:id/rating", auth, bookCrtl.rateBook);
router.put("/:id", auth, multer, bookCrtl.editBook);
router.delete("/:id", auth, bookCrtl.deleteBook);

module.exports = router;