const express = require("express");
const router = express.Router();
const {
  getMainPage,
  createMainPage,
  updateMainPage,
  deleteMainPage,
} = require("../../Controllers/MainPage/MainPage.Controller");

// Route for operations on the single MainPage document
router.route("/")
  .get(getMainPage)
  .post(createMainPage)
  .put(updateMainPage)
  .delete(deleteMainPage);

module.exports = router;
