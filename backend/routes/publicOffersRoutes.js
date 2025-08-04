// routes/publicOffersRoutes.js
import express from 'express';
import {
    getPublicOfferById,
    getPublicOffers,
    getPublicOffersFilters,
    getPublicOffersStats,
    searchPublicOffers
} from '../controllers/publicOffersController.js';

const router = express.Router();

// Route pour récupérer toutes les offres publiques avec filtres et pagination
router.get('/', getPublicOffers);

// Route pour récupérer les filtres disponibles
router.get('/filters', getPublicOffersFilters);

// Route pour la recherche avec suggestions
router.get('/search', searchPublicOffers);

// Route pour récupérer les statistiques publiques
router.get('/stats', getPublicOffersStats);

// Route pour récupérer une offre spécifique par ID
router.get('/:id', getPublicOfferById);

export default router;

