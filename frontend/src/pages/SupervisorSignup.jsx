"use client"

import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import { toast } from "react-toastify"

const SuperviseurSignup = () => {
  const [searchParams] = useSearchParams()
  const emailFromInvite = searchParams.get('email')
  const entrepriseId = searchParams.get('entreprise_id')

  const [formData, setFormData] = useState({
    entreprise_id: entrepriseId || '',
    email: emailFromInvite || '',
    password: '',
    confirmPassword: '',
    nom: '',
    prenom: '',
    telephone: '',
    poste: 'Superviseur PFE',
    role_interne: 'Encadreur',
    status: 'approved'
  })

  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.email) newErrors.email = "L'email est requis"
    else if (!/^\S+@\S+\.\S+$/.test(formData.email)) newErrors.email = "Email invalide"
    if (!formData.password) newErrors.password = "Le mot de passe est requis"
    else if (formData.password.length < 8) newErrors.password = "Le mot de passe doit contenir au moins 8 caractères"
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Les mots de passe ne correspondent pas"
    if (!formData.nom) newErrors.nom = "Le nom est requis"
    if (!formData.prenom) newErrors.prenom = "Le prénom est requis"
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);

  if (!validateForm()) {
    setLoading(false);
    return;
  }

  try {
    const response = await fetch('http://localhost:4000/api/workers/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        entreprise_id: formData.entreprise_id,
        email: formData.email,
        mot_de_passe_hache: formData.password,
        nom: formData.nom,
        prenom: formData.prenom,
        telephone: formData.telephone,
        role_interne: formData.role_interne
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      if (data.error === 'DUPLICATE_EMAIL') {
        toast.error('Un compte avec cet email existe déjà');
      } else {
        throw new Error(data.message || "Échec de l'inscription");
      }
      return;
    }

    toast.success(`Compte ${formData.role_interne.toLowerCase()} créé avec succès! Redirection...`);
    setTimeout(() => window.location.href = '/login', 2000);
  } catch (err) {
    console.error('Erreur d\'inscription:', err);
    toast.error(err.message || "Une erreur est survenue");
  } finally {
    setLoading(false);
  }
}

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-blue-50 via-slate-50 to-blue-50">
      <div className="bg-white rounded-3xl shadow-xl p-8 md:p-10 border border-slate-100 w-full max-w-md">
        <h2 className="text-2xl font-bold text-slate-800 mb-2">Inscription Superviseur</h2>
        <p className="text-slate-500 mb-6">Complétez votre inscription</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Champ Email (lecture seule si invitation) */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.email ? 'border-red-500' : 'border-slate-200'}`}
              readOnly={!!emailFromInvite}
              required
            />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>

          {/* Champ Mot de passe */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Mot de passe *</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.password ? 'border-red-500' : 'border-slate-200'}`}
              required
            />
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
          </div>

          {/* Champ Confirmation mot de passe */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Confirmer mot de passe *</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.confirmPassword ? 'border-red-500' : 'border-slate-200'}`}
              required
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
          </div>

          {/* Champ Prénom */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Prénom *</label>
            <input
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.prenom ? 'border-red-500' : 'border-slate-200'}`}
              required
            />
            {errors.prenom && <p className="mt-1 text-sm text-red-500">{errors.prenom}</p>}
          </div>

          {/* Champ Nom */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nom *</label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-lg border ${errors.nom ? 'border-red-500' : 'border-slate-200'}`}
              required
            />
            {errors.nom && <p className="mt-1 text-sm text-red-500">{errors.nom}</p>}
          </div>

          {/* Champ Téléphone */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Téléphone</label>
            <input
              type="tel"
              name="telephone"
              value={formData.telephone}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-lg border border-slate-200"
            />
          </div>

          {/* Champ caché pour entreprise_id */}
          <input type="hidden" name="entreprise_id" value={formData.entreprise_id} />
          <input type="hidden" name="poste" value={formData.poste} />
          <input type="hidden" name="role_interne" value={formData.role_interne} />
          <input type="hidden" name="status" value={formData.status} />

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            disabled={loading}
          >
            {loading ? 'Création en cours...' : 'Créer compte superviseur'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-slate-500 text-sm">
            Vous avez déjà un compte?{' '}
            <a href="/login" className="text-blue-600 hover:underline">Connectez-vous ici</a>
          </p>
        </div>
      </div>
    </div>
  )
}

export default SuperviseurSignup