const Player = require("../models/Player");
const User = require("../models/User");
const Tournament = require("../models/Tournament");
// Récupérer la liste des joueurs
exports.getPlayers = async (req, res) => {
  try {
    const players = await Player.find();
    res.json(players);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des joueurs" });
  }
};

// Récupérer un joueur par son ID
exports.getPlayerById = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ message: "Joueur non trouvé" });
    }
    res.json(player);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération du joueur" });
  }
};

// Ajouter un joueur
exports.addPlayer = async (req, res) => {
  const { username } = req.body;

  try {
    // Vérifier si un joueur avec le même username existe déjà (insensible à la casse)
    const existingPlayer = await Player.findOne({
      username: { $regex: new RegExp(`^${username}$`, "i") },
    });
    if (existingPlayer) {
      return res.status(400).json({ message: "Le joueur existe déjà" });
    }

    const player = new Player({ username });
    await player.save();
    res.status(201).json(player);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la création du joueur" });
  }
};

// Supprimer un joueur
exports.deletePlayer = async (req, res) => {
  try {
    const player = await Player.findById(req.params.id);
    if (!player) {
      return res.status(404).json({ message: "Joueur non trouvé" });
    }
    await Player.deleteOne({ _id: req.params.id });
    res.json({ message: "Joueur supprimé" });
  } catch (error) {
    console.error("Erreur lors de la suppression du joueur:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression du joueur" });
  }
};

exports.searchPlayers = async (req, res) => {
  try {
    const { search } = req.query;

    const players = await Player.find({
      username: { $regex: search, $options: "i" },
    });

    res.status(200).json(players);
  } catch (error) {
    console.error("Erreur lors de la recherche des joueurs:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la recherche des joueurs", error });
  }
};

// Endpoint pour synchroniser les joueurs avec les utilisateurs
exports.synchronizePlayers = async (req, res) => {
  try {
    const users = await User.find();
    const players = await Player.find();

    for (const player of players) {
      const normalizedUsername = player.username.toLowerCase();
      const user = users.find(
        (user) => user.username.toLowerCase() === normalizedUsername
      );

      if (user) {
        player.discordId = user.discordId;
        player.userId = user._id;
        await player.save();
      }
    }

    res.status(200).json({ message: "Synchronisation réussie" });
  } catch (error) {
    console.error("Erreur lors de la synchronisation:", error);
    res.status(500).json({ message: "Erreur lors de la synchronisation" });
  }
};

// Endpoint pour mettre à jour le nom d'utilisateur d'un joueur
exports.updatePlayerUsername = async (req, res) => {
  const { id, username } = req.body;

  try {
    const player = await Player.findById(id);
    if (!player) {
      return res.status(404).json({ message: "Joueur non trouvé" });
    }

    player.username = username;
    await player.save();

    res.status(200).json(player);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du nom d'utilisateur:", error);
    res
      .status(500)
      .json({ message: "Erreur lors de la mise à jour du nom d'utilisateur" });
  }
};

// Endpoint pour récupérer le classement des joueurs
exports.getPlayerRankings = async (req, res) => {
  try {
    const players = await Player.find();

    const tournaments = await Tournament.find().populate("teams.players");

    const playerRankings = players.map((player) => {
      const playerTournaments = tournaments.filter((tournament) =>
        tournament.teams.some((team) =>
          team.players.some((p) => p._id.equals(player._id))
        )
      );

      const totalPoints = playerTournaments.reduce((sum, tournament) => {
        const playerTeam = tournament.teams.find((team) =>
          team.players.some((p) => p._id.equals(player._id))
        );
        const points = playerTeam ? playerTeam.score : 0; // Assurez-vous d'utiliser la bonne propriété
        return sum + points;
      }, 0);

      const totalVictories = playerTournaments.filter(
        (tournament) =>
          tournament.winningTeam &&
          tournament.winningTeam.players.some((p) => p._id.equals(player._id))
      ).length;

      return {
        playerId: player._id,
        username: player.username,
        totalPoints,
        totalTournaments: playerTournaments.length,
        totalVictories,
      };
    });

    // Trier les joueurs par points décroissants
    playerRankings.sort((a, b) => b.totalPoints - a.totalPoints);

    res.status(200).json(playerRankings);
  } catch (error) {
    console.error(
      "Erreur lors de la récupération du classement des joueurs:",
      error
    );
    res.status(500).json({
      message: "Erreur lors de la récupération du classement des joueurs",
      error,
    });
  }
};

// Endpoint pour récupérer le classement des joueurs par jeu
exports.getPlayerRankingsByGame = async (req, res) => {
  const { gameId } = req.params;
  try {
    const players = await Player.find();
    const tournaments = await Tournament.find({ game: gameId }).populate(
      "teams.players"
    );

    const playerRankings = players.map((player) => {
      const playerTournaments = tournaments.filter((tournament) =>
        tournament.teams.some((team) =>
          team.players.some((p) => p._id.equals(player._id))
        )
      );

      const totalPoints = playerTournaments.reduce((sum, tournament) => {
        const playerTeam = tournament.teams.find((team) =>
          team.players.some((p) => p._id.equals(player._id))
        );
        const points = playerTeam ? playerTeam.score : 0;
        return sum + points;
      }, 0);

      const totalVictories = playerTournaments.filter(
        (tournament) =>
          tournament.winningTeam &&
          tournament.winningTeam.players.some((p) => p._id.equals(player._id))
      ).length;

      return {
        playerId: player._id,
        username: player.username,
        totalPoints,
        totalTournaments: playerTournaments.length,
        totalVictories,
      };
    });

    playerRankings.sort((a, b) => b.totalPoints - a.totalPoints);

    res.status(200).json(playerRankings);
  } catch (error) {
    res.status(500).json({
      message:
        "Erreur lors de la récupération du classement des joueurs par jeu",
      error,
    });
  }
};
