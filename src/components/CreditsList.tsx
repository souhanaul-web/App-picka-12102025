import React, { useState, useEffect } from 'react';
import { CreditCard, Filter, Calendar, CheckCircle, XCircle, Clock, TrendingUp, AlertCircle, DollarSign, Users } from 'lucide-react';

const CreditsList = () => {
  const [credits, setCredits] = useState([
    // Données de démonstration
    { id: 1, numero_contrat: 'AUT-2025-001', assure: 'Ahmed Ben Salem', branche: 'Auto', prime: 1200, montant_credit: 800, paiement: 400, solde: 800, date_paiement_prevue: '2025-10-17', statut: 'Non payé', date_paiement_effectif: null, cree_par: 'Mohamed', created_at: '2025-10-01' },
    { id: 2, numero_contrat: 'VIE-2025-045', assure: 'Fatma Gharbi', branche: 'Vie', prime: 2500, montant_credit: 2000, paiement: 500, solde: 2000, date_paiement_prevue: '2025-10-16', statut: 'Non payé', date_paiement_effectif: null, cree_par: 'Salma', created_at: '2025-09-15' },
    { id: 3, numero_contrat: 'SAN-2025-078', assure: 'Karim Zouari', branche: 'Santé', prime: 800, montant_credit: 600, paiement: 200, solde: 600, date_paiement_prevue: '2025-09-20', statut: 'En retard', date_paiement_effectif: null, cree_par: 'Mohamed', created_at: '2025-09-01' },
    { id: 4, numero_contrat: 'AUT-2025-089', assure: 'Leila Mansour', branche: 'Auto', prime: 1500, montant_credit: 1000, paiement: 1000, solde: 0, date_paiement_prevue: '2025-09-25', statut: 'Payé', date_paiement_effectif: '2025-09-24', cree_par: 'Salma', created_at: '2025-09-10' },
    { id: 5, numero_contrat: 'IRDS-2025-012', assure: 'Hichem Trabelsi', branche: 'IRDS', prime: 3000, montant_credit: 2500, paiement: 500, solde: 2500, date_paiement_prevue: '2025-11-10', statut: 'Non payé', date_paiement_effectif: null, cree_par: 'Mohamed', created_at: '2025-10-05' },
  ]);
  
  const [filteredCredits, setFilteredCredits] = useState([]);
  const [filters, setFilters] = useState({
    statut: 'all',
    branche: 'all',
    createdBy: 'all',
    mois: 'all'
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [activeStatFilter, setActiveStatFilter] = useState(null);

  useEffect(() => {
    // Définir le mois actuel par défaut
    const currentMonth = new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
    setSelectedMonth(currentMonth);
  }, []);

  useEffect(() => {
    setFilteredCredits(credits);
  }, [credits]);

  useEffect(() => {
    applyFilters();
  }, [filters, credits, selectedMonth, activeStatFilter]);

  const applyFilters = () => {
    let filtered = credits.filter(credit => {
      const creditMonth = new Date(credit.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      
      return (
        (filters.statut === 'all' || credit.statut === filters.statut) &&
        (filters.branche === 'all' || credit.branche === filters.branche) &&
        (filters.createdBy === 'all' || credit.cree_par === filters.createdBy) &&
        (selectedMonth === 'all' || creditMonth === selectedMonth)
      );
    });

    // Appliquer le filtre de statistique active
    if (activeStatFilter) {
      const today = new Date();
      const twoDaysFromNow = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
      
      switch (activeStatFilter) {
        case 'payes':
          filtered = filtered.filter(c => c.statut === 'Payé');
          break;
        case 'nonPayes':
          filtered = filtered.filter(c => c.statut === 'Non payé');
          break;
        case 'enRetard':
          filtered = filtered.filter(c => {
            if (!c.date_paiement_prevue || c.statut === 'Payé') return false;
            const dateEcheance = new Date(c.date_paiement_prevue);
            return dateEcheance < today;
          });
          break;
        case 'echeance2jours':
          filtered = filtered.filter(c => {
            if (!c.date_paiement_prevue || c.statut === 'Payé') return false;
            const dateEcheance = new Date(c.date_paiement_prevue);
            return dateEcheance >= today && dateEcheance <= twoDaysFromNow;
          });
          break;
      }
    }
    
    setFilteredCredits(filtered);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleStatClick = (statType) => {
    if (activeStatFilter === statType) {
      // Si on clique sur la même stat, on désactive le filtre
      setActiveStatFilter(null);
    } else {
      setActiveStatFilter(statType);
    }
  };

  const handleStatusUpdate = (id, newStatus) => {
    const datePaiement = newStatus === 'Payé' ? new Date().toISOString().split('T')[0] : null;
    
    setCredits(prevCredits =>
      prevCredits.map(credit =>
        credit.id === id
          ? {
              ...credit,
              statut: newStatus,
              date_paiement_effectif: datePaiement,
              paiement: newStatus === 'Payé' ? credit.prime : credit.paiement,
              solde: newStatus === 'Payé' ? 0 : credit.solde
            }
          : credit
      )
    );
  };

  const getStatusIcon = (statut) => {
    switch (statut) {
      case 'Payé':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'En retard':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-orange-500" />;
    }
  };

  const getStatusColor = (statut) => {
    switch (statut) {
      case 'Payé':
        return 'bg-green-100 text-green-800';
      case 'En retard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-orange-100 text-orange-800';
    }
  };

  const calculateAdvancedStats = () => {
    const today = new Date();
    const twoDaysFromNow = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000);
    
    const totalCredits = filteredCredits.length;
    const totalMontantCredits = filteredCredits.reduce((sum, credit) => sum + credit.montant_credit, 0);
    const montantPaye = filteredCredits.filter(c => c.statut === 'Payé').reduce((sum, credit) => sum + credit.paiement, 0);
    const montantNonPaye = filteredCredits.filter(c => c.statut !== 'Payé').reduce((sum, credit) => sum + credit.solde, 0);
    
    const payes = filteredCredits.filter(c => c.statut === 'Payé').length;
    const nonPayes = filteredCredits.filter(c => c.statut === 'Non payé').length;
    const enRetard = filteredCredits.filter(c => c.statut === 'En retard').length;
    
    const echeancesDans2Jours = filteredCredits.filter(c => {
      if (!c.date_paiement_prevue || c.statut === 'Payé') return false;
      const dateEcheance = new Date(c.date_paiement_prevue);
      return dateEcheance >= today && dateEcheance <= twoDaysFromNow;
    }).length;
    
    const retardsActuels = filteredCredits.filter(c => {
      if (!c.date_paiement_prevue || c.statut === 'Payé') return false;
      const dateEcheance = new Date(c.date_paiement_prevue);
      return dateEcheance < today;
    }).length;

    const tauxRecouvrement = totalMontantCredits > 0 ? (montantPaye / totalMontantCredits * 100).toFixed(1) : 0;

    return { 
      totalCredits, 
      totalMontantCredits, 
      montantPaye, 
      montantNonPaye, 
      payes, 
      nonPayes, 
      enRetard,
      echeancesDans2Jours,
      retardsActuels,
      tauxRecouvrement
    };
  };

  const getAvailableMonths = () => {
    const months = credits.map(credit => 
      new Date(credit.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    );
    return ['all', ...new Set(months)];
  };

  const groupCreditsByMonth = () => {
    const grouped = {};
    filteredCredits.forEach(credit => {
      const month = new Date(credit.created_at).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      if (!grouped[month]) {
        grouped[month] = [];
      }
      grouped[month].push(credit);
    });
    return grouped;
  };

  const stats = calculateAdvancedStats();
  const uniqueUsers = [...new Set(credits.map(c => c.cree_par))];
  const availableMonths = getAvailableMonths();
  const creditsByMonth = groupCreditsByMonth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <span className="ml-2">Chargement des crédits...</span>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-3 mb-6">
          <CreditCard className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">Gestion des Crédits</h2>
        </div>

        {/* Statistiques Principales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-600">Total Crédits</p>
                <p className="text-2xl font-bold text-blue-900">{stats.totalCredits}</p>
              </div>
              <CreditCard className="w-8 h-8 text-blue-600 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-4 border border-purple-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-600">Montant Total Crédits</p>
                <p className="text-2xl font-bold text-purple-900">{stats.totalMontantCredits.toLocaleString()} DT</p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-600 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-4 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-600">Montant Payé</p>
                <p className="text-2xl font-bold text-green-900">{stats.montantPaye.toLocaleString()} DT</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-lg p-4 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-600">Montant Non Payé</p>
                <p className="text-2xl font-bold text-red-900">{stats.montantNonPaye.toLocaleString()} DT</p>
              </div>
              <XCircle className="w-8 h-8 text-red-600 opacity-50" />
            </div>
          </div>
        </div>

        {/* Statistiques Détaillées */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div 
            onClick={() => handleStatClick('payes')}
            className={`bg-green-50 rounded-lg p-3 border-2 transition-all cursor-pointer hover:shadow-md ${
              activeStatFilter === 'payes' ? 'border-green-500 shadow-lg' : 'border-green-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <div>
                <p className="text-xs font-medium text-green-600">Payés</p>
                <p className="text-lg font-bold text-green-900">{stats.payes}</p>
              </div>
            </div>
            {activeStatFilter === 'payes' && (
              <p className="text-xs text-green-600 mt-1">✓ Filtré</p>
            )}
          </div>

          <div 
            onClick={() => handleStatClick('nonPayes')}
            className={`bg-orange-50 rounded-lg p-3 border-2 transition-all cursor-pointer hover:shadow-md ${
              activeStatFilter === 'nonPayes' ? 'border-orange-500 shadow-lg' : 'border-orange-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <div>
                <p className="text-xs font-medium text-orange-600">Non Payés</p>
                <p className="text-lg font-bold text-orange-900">{stats.nonPayes}</p>
              </div>
            </div>
            {activeStatFilter === 'nonPayes' && (
              <p className="text-xs text-orange-600 mt-1">✓ Filtré</p>
            )}
          </div>

          <div 
            onClick={() => handleStatClick('enRetard')}
            className={`bg-red-50 rounded-lg p-3 border-2 transition-all cursor-pointer hover:shadow-md ${
              activeStatFilter === 'enRetard' ? 'border-red-500 shadow-lg' : 'border-red-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div>
                <p className="text-xs font-medium text-red-600">En Retard</p>
                <p className="text-lg font-bold text-red-900">{stats.retardsActuels}</p>
              </div>
            </div>
            {activeStatFilter === 'enRetard' && (
              <p className="text-xs text-red-600 mt-1">✓ Filtré</p>
            )}
          </div>

          <div 
            onClick={() => handleStatClick('echeance2jours')}
            className={`bg-yellow-50 rounded-lg p-3 border-2 transition-all cursor-pointer hover:shadow-md ${
              activeStatFilter === 'echeance2jours' ? 'border-yellow-500 shadow-lg' : 'border-yellow-200'
            }`}
          >
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-yellow-600" />
              <div>
                <p className="text-xs font-medium text-yellow-600">Échéance 2j</p>
                <p className="text-lg font-bold text-yellow-900">{stats.echeancesDans2Jours}</p>
              </div>
            </div>
            {activeStatFilter === 'echeance2jours' && (
              <p className="text-xs text-yellow-600 mt-1">✓ Filtré</p>
            )}
          </div>

          <div className="bg-indigo-50 rounded-lg p-3 border border-indigo-200">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-indigo-600" />
              <div>
                <p className="text-xs font-medium text-indigo-600">Taux Recouvrement</p>
                <p className="text-lg font-bold text-indigo-900">{stats.tauxRecouvrement}%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-600" />
              <h3 className="text-lg font-semibold text-gray-900">Filtres</h3>
            </div>
            {activeStatFilter && (
              <button
                onClick={() => setActiveStatFilter(null)}
                className="px-3 py-1 bg-red-100 text-red-700 text-sm rounded-lg hover:bg-red-200 transition-colors"
              >
                ✕ Réinitialiser filtre statistique
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les mois</option>
              {availableMonths.filter(m => m !== 'all').map(month => (
                <option key={month} value={month}>{month}</option>
              ))}
            </select>

            <select
              name="statut"
              value={filters.statut}
              onChange={handleFilterChange}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les statuts</option>
              <option value="Non payé">Non payé</option>
              <option value="Payé">Payé</option>
              <option value="En retard">En retard</option>
            </select>

            <select
              name="branche"
              value={filters.branche}
              onChange={handleFilterChange}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Toutes les branches</option>
              <option value="Auto">Auto</option>
              <option value="Vie">Vie</option>
              <option value="Santé">Santé</option>
              <option value="IRDS">IRDS</option>
            </select>

            <select
              name="createdBy"
              value={filters.createdBy}
              onChange={handleFilterChange}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tous les utilisateurs</option>
              {uniqueUsers.map(user => (
                <option key={user} value={user}>{user}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Liste des crédits groupés par mois */}
        {selectedMonth === 'all' ? (
          Object.keys(creditsByMonth).sort((a, b) => new Date(b) - new Date(a)).map(month => (
            <div key={month} className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                {month.charAt(0).toUpperCase() + month.slice(1)}
                <span className="ml-2 text-sm font-normal text-gray-600">
                  ({creditsByMonth[month].length} crédit{creditsByMonth[month].length > 1 ? 's' : ''})
                </span>
              </h3>
              <div className="overflow-x-auto rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Contrat</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assuré</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branche</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prime</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Crédit</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payé</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solde</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Prévue</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Créé par</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {creditsByMonth[month].map((credit) => (
                      <tr key={credit.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{credit.numero_contrat}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{credit.assure}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{credit.branche}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{credit.prime.toLocaleString()} DT</td>
                        <td className="px-4 py-3 text-sm font-semibold text-blue-600">{credit.montant_credit.toLocaleString()} DT</td>
                        <td className="px-4 py-3 text-sm text-green-600">{credit.paiement.toLocaleString()} DT</td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`font-semibold ${credit.solde > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {credit.solde.toLocaleString()} DT
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {credit.date_paiement_prevue ? new Date(credit.date_paiement_prevue).toLocaleDateString('fr-FR') : '-'}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(credit.statut)}
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(credit.statut)}`}>
                              {credit.statut}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">{credit.cree_par}</td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            {credit.statut !== 'Payé' && (
                              <button
                                onClick={() => handleStatusUpdate(credit.id, 'Payé')}
                                className="text-green-600 hover:text-green-900 transition-colors"
                                title="Marquer comme payé"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            {credit.statut === 'Non payé' && (
                              <button
                                onClick={() => handleStatusUpdate(credit.id, 'En retard')}
                                className="text-red-600 hover:text-red-900 transition-colors"
                                title="Marquer en retard"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        ) : (
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Contrat</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assuré</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branche</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Prime</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Crédit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Payé</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Solde</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date Prévue</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Créé par</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredCredits.map((credit) => (
                  <tr key={credit.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900">{credit.numero_contrat}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{credit.assure}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{credit.branche}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">{credit.prime.toLocaleString()} DT</td>
                    <td className="px-4 py-3 text-sm font-semibold text-blue-600">{credit.montant_credit.toLocaleString()} DT</td>
                    <td className="px-4 py-3 text-sm text-green-600">{credit.paiement.toLocaleString()} DT</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`font-semibold ${credit.solde > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {credit.solde.toLocaleString()} DT
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {credit.date_paiement_prevue ? new Date(credit.date_paiement_prevue).toLocaleDateString('fr-FR') : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(credit.statut)}
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(credit.statut)}`}>
                          {credit.statut}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">{credit.cree_par}</td>
                    <td className="px-4 py-3">
                      <div className="flex space-x-2">
                        {credit.statut !== 'Payé' && (
                          <button
                            onClick={() => handleStatusUpdate(credit.id, 'Payé')}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Marquer comme payé"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {credit.statut === 'Non payé' && (
                          <button
                            onClick={() => handleStatusUpdate(credit.id, 'En retard')}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Marquer en retard"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {filteredCredits.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg">Aucun crédit trouvé avec les filtres sélectionnés</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreditsList;