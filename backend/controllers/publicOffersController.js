// controllers/publicOffersController.js
import OffreStageEmploi from '../models/OffreStageEmploi.js';

// Fonction pour récupérer les offres publiques avec filtres et recherche
export const getPublicOffers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      search = '',
      categorie = '',
      type_offre = '',
      localisation = '',
      hasRemuneration = '',
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Construction de la requête de base
    const query = {
      isPublished: true,
      statut: 'active',
      date_limite_candidature: { $gte: new Date() } // Offres non expirées
    };

    // Filtre par recherche textuelle
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { titre: searchRegex },
        { description: searchRegex },
        { competences_requises: { $in: [searchRegex] } },
        { localisation: searchRegex }
      ];
    }

    // Filtre par catégorie
    if (categorie && categorie.trim()) {
      query.categorie = categorie.trim();
    }

    // Filtre par type d'offre
    if (type_offre && type_offre.trim()) {
      query.type_offre = type_offre.trim();
    }

    // Filtre par localisation
    if (localisation && localisation.trim()) {
      const localisationRegex = new RegExp(localisation.trim(), 'i');
      query.localisation = localisationRegex;
    }

    // Filtre par rémunération
    if (hasRemuneration !== '') {
      query.hasRemuneration = hasRemuneration === 'true';
    }

    // Configuration de la pagination
    const pageNumber = Math.max(1, parseInt(page));
    const limitNumber = Math.min(50, Math.max(1, parseInt(limit))); // Limite max de 50
    const skip = (pageNumber - 1) * limitNumber;

    // Configuration du tri
    const sortOptions = {};
    const validSortFields = ['createdAt', 'titre', 'date_limite_candidature', 'categorie', 'type_offre'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    const sortDirection = sortOrder === 'asc' ? 1 : -1;
    sortOptions[sortField] = sortDirection;

    // Exécution de la requête avec population des données de l'entreprise
    const [offers, totalCount] = await Promise.all([
      OffreStageEmploi.find(query)
        .populate('entreprise_id', 'nom logo secteur ville pays email_contact')
        .select('-test.questions.correctAnswer -test.security') // Exclure les données sensibles
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNumber)
        .lean(),
      OffreStageEmploi.countDocuments(query)
    ]);

    // Calcul des métadonnées de pagination
    const totalPages = Math.ceil(totalCount / limitNumber);
    const hasNextPage = pageNumber < totalPages;
    const hasPrevPage = pageNumber > 1;

    // Formatage des données de réponse
    const formattedOffers = offers.map(offer => ({
      _id: offer._id,
      titre: offer.titre,
      description: offer.description,
      categorie: offer.categorie,
      type_offre: offer.type_offre,
      duree: offer.duree,
      localisation: offer.localisation,
      competences_requises: offer.competences_requises,
      date_limite_candidature: offer.date_limite_candidature,
      nombre_postes: offer.nombre_postes,
      remuneration: offer.remuneration,
      hasRemuneration: offer.hasRemuneration,
      requiresTest: offer.requiresTest,
      publicTestEnabled: offer.publicTestEnabled,
      publicTestLink: offer.publicTestLink,
      createdAt: offer.createdAt,
      publishedAt: offer.publishedAt,
      entreprise: {
        nom: offer.entreprise_id?.nom,
        logo: offer.entreprise_id?.logo,
        secteur: offer.entreprise_id?.secteur,
        ville: offer.entreprise_id?.ville,
        pays: offer.entreprise_id?.pays
      }
    }));

    res.status(200).json({
      success: true,
      data: {
        offers: formattedOffers,
        pagination: {
          currentPage: pageNumber,
          totalPages,
          totalCount,
          hasNextPage,
          hasPrevPage,
          limit: limitNumber
        },
        filters: {
          search,
          categorie,
          type_offre,
          localisation,
          hasRemuneration,
          sortBy: sortField,
          sortOrder
        }
      }
    });

  } catch (error) {
    console.error('[getPublicOffers] Erreur lors de la récupération des offres publiques:', error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des offres"
    });
  }
};

// Fonction pour récupérer les filtres disponibles
export const getPublicOffersFilters = async (req, res) => {
  try {
    // Récupération des valeurs uniques pour les filtres
    const [categories, typeOffres, localisations] = await Promise.all([
      OffreStageEmploi.distinct('categorie', {
        isPublished: true,
        statut: 'active',
        date_limite_candidature: { $gte: new Date() }
      }),
      OffreStageEmploi.distinct('type_offre', {
        isPublished: true,
        statut: 'active',
        date_limite_candidature: { $gte: new Date() }
      }),
      OffreStageEmploi.distinct('localisation', {
        isPublished: true,
        statut: 'active',
        date_limite_candidature: { $gte: new Date() },
        localisation: { $ne: null, $ne: '' }
      })
    ]);

    // Comptage des offres par catégorie
    const categoriesWithCount = await Promise.all(
      categories.map(async (cat) => {
        const count = await OffreStageEmploi.countDocuments({
          isPublished: true,
          statut: 'active',
          date_limite_candidature: { $gte: new Date() },
          categorie: cat
        });
        return { value: cat, label: cat, count };
      })
    );

    // Comptage des offres par type
    const typeOffresWithCount = await Promise.all(
      typeOffres.map(async (type) => {
        const count = await OffreStageEmploi.countDocuments({
          isPublished: true,
          statut: 'active',
          date_limite_candidature: { $gte: new Date() },
          type_offre: type
        });
        return { value: type, label: type, count };
      })
    );

    // Comptage des offres avec/sans rémunération
    const [withRemuneration, withoutRemuneration] = await Promise.all([
      OffreStageEmploi.countDocuments({
        isPublished: true,
        statut: 'active',
        date_limite_candidature: { $gte: new Date() },
        hasRemuneration: true
      }),
      OffreStageEmploi.countDocuments({
        isPublished: true,
        statut: 'active',
        date_limite_candidature: { $gte: new Date() },
        hasRemuneration: false
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        categories: categoriesWithCount.sort((a, b) => b.count - a.count),
        typeOffres: typeOffresWithCount.sort((a, b) => b.count - a.count),
        localisations: localisations.filter(loc => loc && loc.trim()).sort(),
        remuneration: [
          { value: 'true', label: 'Avec rémunération', count: withRemuneration },
          { value: 'false', label: 'Sans rémunération', count: withoutRemuneration }
        ]
      }
    });

  } catch (error) {
    console.error('[getPublicOffersFilters] Erreur lors de la récupération des filtres:', error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des filtres"
    });
  }
};

// Fonction pour récupérer une offre publique spécifique
export const getPublicOfferById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "ID d'offre invalide"
      });
    }

    const offer = await OffreStageEmploi.findOne({
      _id: id,
      isPublished: true,
      statut: 'active',
      date_limite_candidature: { $gte: new Date() }
    })
    .populate('entreprise_id', 'nom logo secteur ville pays email_contact description')
    .select('-test.questions.correctAnswer -test.security') // Exclure les données sensibles
    .lean();

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offre non trouvée ou non disponible"
      });
    }

    // Formatage des données de réponse
    const formattedOffer = {
      _id: offer._id,
      titre: offer.titre,
      description: offer.description,
      categorie: offer.categorie,
      type_offre: offer.type_offre,
      duree: offer.duree,
      localisation: offer.localisation,
      competences_requises: offer.competences_requises,
      date_limite_candidature: offer.date_limite_candidature,
      nombre_postes: offer.nombre_postes,
      remuneration: offer.remuneration,
      hasRemuneration: offer.hasRemuneration,
      requiresTest: offer.requiresTest,
      publicTestEnabled: offer.publicTestEnabled,
      publicTestLink: offer.publicTestLink,
      createdAt: offer.createdAt,
      publishedAt: offer.publishedAt,
      entreprise: {
        nom: offer.entreprise_id?.nom,
        logo: offer.entreprise_id?.logo,
        secteur: offer.entreprise_id?.secteur,
        ville: offer.entreprise_id?.ville,
        pays: offer.entreprise_id?.pays,
        email_contact: offer.entreprise_id?.email_contact,
        description: offer.entreprise_id?.description
      },
      // Informations de test (sans les réponses correctes)
      test: offer.test ? {
        testName: offer.test.testName,
        description: offer.test.description,
        testDuration: offer.test.testDuration,
        passingScore: offer.test.passingScore,
        maxAttempts: offer.test.maxAttempts,
        instructions: offer.test.instructions,
        questionCount: offer.test.questions?.length || 0
      } : null
    };

    res.status(200).json({
      success: true,
      data: formattedOffer
    });

  } catch (error) {
    console.error('[getPublicOfferById] Erreur lors de la récupération de l\'offre:', error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération de l'offre"
    });
  }
};

// Fonction pour récupérer les statistiques publiques
export const getPublicOffersStats = async (req, res) => {
  try {
    const baseQuery = {
      isPublished: true,
      statut: 'active',
      date_limite_candidature: { $gte: new Date() }
    };

    const [
      totalOffers,
      offersByCategory,
      offersByType,
      offersWithTest,
      offersWithRemuneration
    ] = await Promise.all([
      OffreStageEmploi.countDocuments(baseQuery),
      OffreStageEmploi.aggregate([
        { $match: baseQuery },
        { $group: { _id: '$categorie', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      OffreStageEmploi.aggregate([
        { $match: baseQuery },
        { $group: { _id: '$type_offre', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      OffreStageEmploi.countDocuments({ ...baseQuery, requiresTest: true }),
      OffreStageEmploi.countDocuments({ ...baseQuery, hasRemuneration: true })
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalOffers,
        offersByCategory: offersByCategory.map(item => ({
          category: item._id,
          count: item.count
        })),
        offersByType: offersByType.map(item => ({
          type: item._id,
          count: item.count
        })),
        offersWithTest,
        offersWithRemuneration,
        percentageWithTest: totalOffers > 0 ? Math.round((offersWithTest / totalOffers) * 100) : 0,
        percentageWithRemuneration: totalOffers > 0 ? Math.round((offersWithRemuneration / totalOffers) * 100) : 0
      }
    });

  } catch (error) {
    console.error('[getPublicOffersStats] Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la récupération des statistiques"
    });
  }
};

// Fonction pour rechercher des offres avec suggestions
export const searchPublicOffers = async (req, res) => {
  try {
    const { q = '', limit = 5 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(200).json({
        success: true,
        data: {
          suggestions: [],
          offers: []
        }
      });
    }

    const searchTerm = q.trim();
    const searchRegex = new RegExp(searchTerm, 'i');
    const limitNumber = Math.min(10, Math.max(1, parseInt(limit)));

    const baseQuery = {
      isPublished: true,
      statut: 'active',
      date_limite_candidature: { $gte: new Date() }
    };

    // Recherche d'offres correspondantes
    const offers = await OffreStageEmploi.find({
      ...baseQuery,
      $or: [
        { titre: searchRegex },
        { description: searchRegex },
        { competences_requises: { $in: [searchRegex] } },
        { localisation: searchRegex }
      ]
    })
    .populate('entreprise_id', 'nom logo')
    .select('titre categorie type_offre localisation entreprise_id')
    .limit(limitNumber)
    .lean();

    // Génération de suggestions basées sur les titres et compétences
    const [titleSuggestions, skillSuggestions, locationSuggestions] = await Promise.all([
      OffreStageEmploi.distinct('titre', {
        ...baseQuery,
        titre: searchRegex
      }),
      OffreStageEmploi.aggregate([
        { $match: baseQuery },
        { $unwind: '$competences_requises' },
        { $match: { competences_requises: searchRegex } },
        { $group: { _id: '$competences_requises' } },
        { $limit: 5 }
      ]),
      OffreStageEmploi.distinct('localisation', {
        ...baseQuery,
        localisation: searchRegex
      })
    ]);

    const suggestions = [
      ...titleSuggestions.slice(0, 3),
      ...skillSuggestions.map(s => s._id).slice(0, 3),
      ...locationSuggestions.slice(0, 2)
    ].filter((suggestion, index, self) => 
      suggestion && 
      suggestion.trim() && 
      self.indexOf(suggestion) === index
    ).slice(0, 5);

    res.status(200).json({
      success: true,
      data: {
        suggestions,
        offers: offers.map(offer => ({
          _id: offer._id,
          titre: offer.titre,
          categorie: offer.categorie,
          type_offre: offer.type_offre,
          localisation: offer.localisation,
          entreprise: {
            nom: offer.entreprise_id?.nom,
            logo: offer.entreprise_id?.logo
          }
        }))
      }
    });

  } catch (error) {
    console.error('[searchPublicOffers] Erreur lors de la recherche:', error);
    res.status(500).json({
      success: false,
      message: "Erreur serveur lors de la recherche"
    });
  }
};

