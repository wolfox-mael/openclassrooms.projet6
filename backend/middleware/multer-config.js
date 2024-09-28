const multer = require("multer");
const SharpMulter = require("sharp-multer");

function newFileName(oldName, options) {
    let fileName;

    if (oldName.includes(".jpg") || oldName.includes(".jpeg") || oldName.includes(".png")) {
      if (oldName.includes(".jpg") || oldName.includes(".png")) {
        fileName = oldName.slice(0, oldName.length - 4)
      } else {
        fileName = oldName.slice(0, oldName.length - 5)
      }
    }

    fileName = fileName + Date.now() + ".webp";
    return fileName
}

const storage = SharpMulter({
  destination: (req, file, callback) => {
    callback(null, "images");
  },
  imageOptions: {
    fileFormat: "webp",
    resize: { width: 350, height: 570, resizeMode: "cover", withoutEnlargement: true },
  },
  filename: newFileName,
});

module.exports = multer({ storage }).single("image");