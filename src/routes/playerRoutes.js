const express = require("express");
const {
  getPlayers,
  addPlayer,
  deletePlayer,
  searchPlayers,
  getPlayerById,
  synchronizePlayers,
  updatePlayerUsername,
  getPlayerRankings,
  getPlayerRankingsByGame,
  getTournamentWinners,
} = require("../controllers/playerController");
const { protect, admin } = require("../middleware/authMiddleware");
const router = express.Router();

router.route("/").get(protect, getPlayers).post(protect, admin, addPlayer);
router.get("/rankings", getPlayerRankings);
router.get("/rankings/game/:gameId", getPlayerRankingsByGame);

router.route("/search").get(searchPlayers);

router.route("/:id").get(protect, getPlayerById);

router.route("/:id").delete(protect, admin, deletePlayer);
router.route("/synchronize").post(protect, admin, synchronizePlayers);
router.route("/update-username").post(protect, admin, updatePlayerUsername);

module.exports = router;
