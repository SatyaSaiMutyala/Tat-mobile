/** Reference master data — TrustLab Hyderabad. */

export const BRANCHES = [
  {code: 'BE', name: 'Begumpet HQ'},
  {code: 'BH', name: 'Banjara Hills'},
  {code: 'JH', name: 'Jubilee Hills'},
  {code: 'MA', name: 'Madhapur'},
  {code: 'GC', name: 'Gachibowli'},
  {code: 'KP', name: 'Kondapur'},
  {code: 'HK', name: 'Himayatnagar'},
  {code: 'AM', name: 'Ameerpet'},
  {code: 'KU', name: 'Kukatpally'},
  {code: 'DL', name: 'Dilsukhnagar'},
  {code: 'LB', name: 'LB Nagar'},
  {code: 'MH', name: 'Malakpet'},
  {code: 'SR', name: 'Secunderabad'},
  {code: 'MI', name: 'Miyapur'},
];

export const DEPARTMENTS = [
  {code: 'HEM', name: 'Hematology', color: '#C8362A'},
  {code: 'BCH', name: 'Biochemistry', color: '#F0B429'},
  {code: 'IMM', name: 'Immunology', color: '#00B49A'},
  {code: 'MCR', name: 'Microbiology', color: '#7A4FBF'},
  {code: 'HPL', name: 'Histopath', color: '#1A3A2A'},
  {code: 'MOL', name: 'Molecular', color: '#D97706'},
];

export const TESTS = [
  {code: 'CBC', name: 'Complete Blood Count', dept: 'HEM', slaR: 4, slaS: 1, slaC: 0.5},
  {code: 'ESR', name: 'ESR', dept: 'HEM', slaR: 4, slaS: 1, slaC: 0.5},
  {code: 'PT', name: 'Prothrombin Time', dept: 'HEM', slaR: 4, slaS: 1, slaC: 0.5},
  {code: 'GLU', name: 'Glucose (RBS)', dept: 'BCH', slaR: 4, slaS: 1, slaC: 0.5},
  {code: 'HB1', name: 'HbA1c', dept: 'BCH', slaR: 8, slaS: 4, slaC: 2},
  {code: 'LFT', name: 'Liver Function Test', dept: 'BCH', slaR: 6, slaS: 2, slaC: 1},
  {code: 'RFT', name: 'Renal Function Test', dept: 'BCH', slaR: 6, slaS: 2, slaC: 1},
  {code: 'LIP', name: 'Lipid Profile', dept: 'BCH', slaR: 6, slaS: 3, slaC: 1.5},
  {code: 'TSH', name: 'TSH', dept: 'IMM', slaR: 24, slaS: 8, slaC: 4},
  {code: 'FT4', name: 'Free T4', dept: 'IMM', slaR: 24, slaS: 8, slaC: 4},
  {code: 'VD3', name: 'Vitamin D 25-OH', dept: 'IMM', slaR: 24, slaS: 12, slaC: 6},
  {code: 'V12', name: 'Vitamin B12', dept: 'IMM', slaR: 24, slaS: 12, slaC: 6},
  {code: 'DEN', name: 'Dengue NS1', dept: 'IMM', slaR: 6, slaS: 3, slaC: 1.5},
  {code: 'URC', name: 'Urine Culture', dept: 'MCR', slaR: 72, slaS: 48, slaC: 24},
  {code: 'BLC', name: 'Blood Culture', dept: 'MCR', slaR: 72, slaS: 48, slaC: 24},
  {code: 'HPB', name: 'Histopath · Biopsy', dept: 'HPL', slaR: 120, slaS: 72, slaC: 48},
  {code: 'PAP', name: 'Pap Smear', dept: 'HPL', slaR: 72, slaS: 48, slaC: 24},
  {code: 'CRP', name: 'CRP', dept: 'BCH', slaR: 6, slaS: 2, slaC: 1},
  {code: 'AMY', name: 'Amylase', dept: 'BCH', slaR: 6, slaS: 2, slaC: 1},
  {code: 'PCR', name: 'HCV RNA PCR', dept: 'MOL', slaR: 48, slaS: 24, slaC: 12},
];

export const PHASES = [
  'Collection',
  'Transport',
  'SRA / Accessioning',
  'Analytical',
  'Validation',
  'Reporting',
];

export const RIDERS = ['Rider #4', 'Rider #7', 'Rider #2', 'Rider #9', 'Rider #12'];

export const VALIDATORS = [
  'Dr. Reddy',
  'Dr. Sharma',
  'Dr. Iyer',
  'Dr. Rao',
  'Dr. Krishnan',
];

export const ANALYSERS = [
  'Sysmex XN-1000',
  'Cobas 6000',
  'Architect ci4100',
  'BD FACSLyric',
  'Alinity ci',
];

export const DEMO_USER = {
  name: 'Ravi Verma',
  initials: 'RV',
  role: 'CSD Shift Lead',
  branch: 'Begumpet HQ',
};
