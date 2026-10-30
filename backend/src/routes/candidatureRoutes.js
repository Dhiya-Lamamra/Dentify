const express = require('express');
const router = express.Router();
const {
  Candidature,
  ProfessionnelDentaire,
  CliniqueDentaire,
  Offre,
  Message,
  User
} = require('../models');
const protect = require('../middlewares/authMiddleware');

// ✅ POST : Créer une candidature (réservé aux professionnels)
router.post('/', protect, async (req, res) => {
  try {
    const utilisateurId = req.user.id_utilisateur;

    // Vérifie que c'est bien un professionnel
    const professionnel = await ProfessionnelDentaire.findOne({
      where: { id_utilisateur: utilisateurId }
    });

    if (!professionnel) {
      return res.status(403).json({ message: 'Seuls les professionnels peuvent postuler.' });
    }

    const { id_offre, message_personnalise } = req.body;
    if (!id_offre) {
      return res.status(400).json({ message: "L'identifiant de l'offre est requis." });
    }

    // L'offre doit exister et être active
    const offre = await Offre.findByPk(id_offre, {
      include: [{ model: CliniqueDentaire }]
    });
    if (!offre) {
      return res.status(404).json({ message: 'Offre introuvable.' });
    }
    if (offre.statut !== 'active') {
      return res.status(400).json({ message: "Cette offre n'accepte plus de candidatures." });
    }

    // Pas de double candidature sur la même offre
    const dejaPostule = await Candidature.findOne({
      where: { id_offre, id_professionnel: professionnel.id_professionnel }
    });
    if (dejaPostule) {
      return res.status(409).json({ message: 'Vous avez déjà postulé à cette offre.' });
    }

    const nouvelleCandidature = await Candidature.create({
      id_offre,
      id_professionnel: professionnel.id_professionnel,
      date_candidature: new Date(),
      message_personnalise,
      statut: 'en_attente',
      est_confirmee: 'N'
    });

    // Envoyer un message initial à la clinique si un contenu est fourni
    const id_destinataire = offre.CliniqueDentaire?.id_utilisateur;
    if (message_personnalise && id_destinataire) {
      await Message.create({
        id_expediteur: utilisateurId,
        id_destinataire,
        contenu: message_personnalise,
        type_message: 'candidature',
        id_offre
      });
    }

    res.status(201).json(nouvelleCandidature);
  } catch (error) {
    console.error('❌ Erreur lors de la création de la candidature :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ GET : Mes candidatures (professionnel connecté), avec l'offre liée
router.get('/mes-candidatures', protect, async (req, res) => {
  try {
    const professionnel = await ProfessionnelDentaire.findOne({
      where: { id_utilisateur: req.user.id_utilisateur }
    });
    if (!professionnel) {
      return res.status(403).json({ message: 'Réservé aux professionnels.' });
    }

    const candidatures = await Candidature.findAll({
      where: { id_professionnel: professionnel.id_professionnel },
      include: [{ model: Offre }],
      order: [['date_candidature', 'DESC']]
    });
    res.json(candidatures);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ GET : Candidats d'une offre (réservé à la clinique propriétaire)
router.get('/offre/:id', protect, async (req, res) => {
  try {
    const clinique = await CliniqueDentaire.findOne({
      where: { id_utilisateur: req.user.id_utilisateur }
    });
    const offre = await Offre.findByPk(req.params.id);

    if (!offre) {
      return res.status(404).json({ message: 'Offre introuvable.' });
    }
    if (!clinique || offre.id_clinique !== clinique.id_clinique) {
      return res.status(403).json({ message: "Cette offre n'appartient pas à votre clinique." });
    }

    const candidatures = await Candidature.findAll({
      where: { id_offre: offre.id_offre },
      include: [{
        model: ProfessionnelDentaire,
        include: [{ model: User, attributes: ['id_utilisateur', 'nom', 'prenom', 'courriel', 'ville'] }]
      }],
      order: [['date_candidature', 'ASC']]
    });
    res.json(candidatures);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des candidats :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

// ✅ GET : Candidatures d'un professionnel (le professionnel lui-même seulement)
router.get('/professionnel/:id', protect, async (req, res) => {
  try {
    const professionnel = await ProfessionnelDentaire.findOne({
      where: { id_utilisateur: req.user.id_utilisateur }
    });
    if (!professionnel || String(professionnel.id_professionnel) !== String(req.params.id)) {
      return res.status(403).json({ message: 'Accès refusé.' });
    }

    const candidatures = await Candidature.findAll({
      where: { id_professionnel: req.params.id }
    });
    res.status(200).json(candidatures);
  } catch (error) {
    console.error('❌ Erreur lors de la récupération :', error);
    res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
