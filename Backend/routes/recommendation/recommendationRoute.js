const express = require("express");
const catchAsync = require("../../services/catchAsync");
const isUserAuthenticated = require("../../middlewares/isAuthenticated");
const {
  getRecommendations,
} = require("../../controller/recommendation/recommendationController");

const rtr = express.Router();

rtr.route("/recommendations").get(
  catchAsync(async (req, res, next) => {
    if (req.headers.user_auth_token || req.headers.authorization) {
      return isUserAuthenticated(req, res, () => getRecommendations(req, res));
    }
    return getRecommendations(req, res);
  }),
);

module.exports = rtr;
