export interface Encumbrance {
  type: 'mortgage' | 'tax_lien' | 'adverse_claim';
  creditor: string;
  amount: string;
  registrationDate: string;
}

export interface TitleRecord {
  titleNumber: string;
  location: string;
  owner: string;
  area: string;
  encumbrances: Encumbrance[];
}

export const TITLE_DATA: Record<string, TitleRecord> = {
  'TCT-89012-PM': {
    titleNumber: 'TCT-89012-PM',
    location: 'Parañaque City, Metro Manila',
    owner: 'Rodrigo Santos Villanueva',
    area: '320 sqm',
    encumbrances: [
      {
        type: 'mortgage',
        creditor: 'BPI Family Savings Bank',
        amount: '₱2,500,000.00',
        registrationDate: '2021-03-15',
      },
      {
        type: 'tax_lien',
        creditor: 'Bureau of Internal Revenue',
        amount: '₱48,200.00',
        registrationDate: '2023-08-01',
      },
    ],
  },
  'TCT-44521-MM': {
    titleNumber: 'TCT-44521-MM',
    location: 'Muntinlupa City, Metro Manila',
    owner: 'Maria Consolacion Reyes',
    area: '180 sqm',
    encumbrances: [],
  },
  'CCT-10087-QC': {
    titleNumber: 'CCT-10087-QC',
    location: 'Queon City, Metro Manila',
    owner: 'Alicia Bautista Tan',
    area: '64 sqm (condominium unit)',
    encumbrances: [
      {
        type: 'adverse_claim',
        creditor: 'Pedro Macaraeg',
        amount: '₱0',
        registrationDate: '2024-01-22',
      },
    ],
  },
  'OCT-00231-PN': {
    titleNumber: 'OCT-00231-PN',
    location: 'Pampanga Province',
    owner: 'Heirs of Eduardo Cruz',
    area: '1,200 sqm',
    encumbrances: [
      {
        type: 'mortgage',
        creditor: 'Land Bank of the Philippines',
        amount: '₱1,800,000.00',
        registrationDate: '2020-11-04',
      },
    ],
  },
  'TCT-77341-LG': {
    titleNumber: 'TCT-77341-LG',
    location: 'Laguna Province',
    owner: 'Roberto Hernandez Dela Cruz',
    area: '450 sqm',
    encumbrances: [
      {
        type: 'mortgage',
        creditor: 'Security Bank Corporation',
        amount: '₱3,200,000.00',
        registrationDate: '2019-06-10',
      },
      {
        type: 'mortgage',
        creditor: 'PNB — Philippine National Bank',
        amount: '₱950,000.00',
        registrationDate: '2022-02-28',
      },
    ],
  },
};

export function lookupTitle(titleNumber: string): TitleRecord | null {
  if (!titleNumber) return null;
  const normalizedKey = titleNumber.trim().toUpperCase();
  return TITLE_DATA[normalizedKey] || null;
}
