import { Contract, XMLContract } from '../types';
import * as XLSX from 'xlsx';

export const saveContract = (contract: Contract): void => {
  const contracts = getContracts();
  contracts.push(contract);
  localStorage.setItem('contracts', JSON.stringify(contracts));
};

export const getContracts = (): Contract[] => {
  const contractsData = localStorage.getItem('contracts');
  return contractsData ? JSON.parse(contractsData) : [];
};

export const saveXMLContracts = (contracts: XMLContract[]): void => {
  localStorage.setItem('xmlContracts', JSON.stringify(contracts));
};

export const getXMLContracts = (): XMLContract[] => {
  const xmlData = localStorage.getItem('xmlContracts');
  return xmlData ? JSON.parse(xmlData) : [];
};

export const generateContractId = (): string => {
  return `CTR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const exportToXLSX = (contracts: Contract[], filename: string): void => {
  const headers = [
    'ID', 'Type', 'Branche', 'Numéro Contrat', 'Assuré', 'Prime (DT)',
    'Montant (DT)', 'Mode Paiement', 'Type Paiement', 'Montant Crédit (DT)',
    'Date Paiement Prévue', 'Créé par', 'Date création'
  ];

  const data = contracts.map(contract => [
    contract.id,
    contract.type || '',
    contract.branch || '',
    contract.contractNumber || '',
    contract.insuredName || '',
    contract.premiumAmount || 0,
    (contract as any).montant || contract.premiumAmount || 0,
    contract.paymentMode || '',
    contract.paymentType || '',
    contract.creditAmount || '',
    contract.paymentDate ? new Date(contract.paymentDate).toLocaleDateString('fr-FR') : '',
    contract.createdBy || '',
    new Date(contract.createdAt).toLocaleDateString('fr-FR')
  ]);

  const wsData = [headers, ...data];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  const colWidths = [
    { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 20 }, { wch: 25 },
    { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
    { wch: 18 }, { wch: 15 }, { wch: 15 }
  ];
  ws['!cols'] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Rapport');

  saveExportedDataToLocalStorage(contracts, filename);

  XLSX.writeFile(wb, filename);

  console.log(`✅ Fichier ${filename} exporté avec ${contracts.length} contrats`);
};

export const saveExportedDataToLocalStorage = (contracts: Contract[], filename: string): void => {
  try {
    const exportData = {
      filename,
      exportDate: new Date().toISOString(),
      contracts,
      totalContracts: contracts.length
    };

    const existingExports = getExportedData();
    existingExports.push(exportData);

    const maxExports = 10;
    const recentExports = existingExports.slice(-maxExports);

    localStorage.setItem('exportedReports', JSON.stringify(recentExports));
    console.log('✅ Données exportées sauvegardées dans le local storage');
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde dans le local storage:', error);
  }
};

export const getExportedData = (): any[] => {
  try {
    const data = localStorage.getItem('exportedReports');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Erreur lors de la récupération des exports:', error);
    return [];
  }
};
