const express = require("express");
const {
  createTournament,
  updateTournament,
  deleteTournament,
  getTournaments,
  getTournamentById,
  getTournamentsByGame,
  finishTournament,
} = require("../controllers/tournamentController");
const { protect, admin } = require("../middleware/authMiddleware");
const router = express.Router();

router
  .route("/")
  .get(protect, getTournaments)
  .post(protect, admin, createTournament);

router
  .route("/:id")
  .get(protect, getTournamentById)
  .put(protect, admin, updateTournament)
  .delete(protect, admin, deleteTournament);

router.route("/game/:gameId").get(protect, getTournamentsByGame);
router.route("/:id/finish").put(protect, admin, finishTournament);
module.exports = router;
