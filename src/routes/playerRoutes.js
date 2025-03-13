const express = require("express");
const {
  getPlayers,
  addPlayer,
  deletePlayer,
  searchPlayers,
  getPlayerById,
} = require("../controllers/playerController");
const { protect, admin } = require("../middleware/authMiddleware");
const router = express.Router();

router.route("/").get(protect, getPlayers).post(protect, admin, addPlayer);

router.route("/:id").get(protect, getPlayerById);

router.route("/:id").delete(protect, admin, deletePlayer);

router.route("/search").get(protect, searchPlayers);

module.exports = router;
