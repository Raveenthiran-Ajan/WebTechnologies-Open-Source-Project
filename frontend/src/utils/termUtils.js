// Term-based attendance configuration
export const ACADEMIC_TERMS = {
  TERM_1: {
    name: 'Term 1',
    months: [1, 2, 3, 4], // January to April
    startMonth: 1,
    endMonth: 4
  },
  TERM_2: {
    name: 'Term 2', 
    months: [5, 6, 7, 8], // May to August
    startMonth: 5,
    endMonth: 8
  },
  TERM_3: {
    name: 'Term 3',
    months: [9, 10, 11, 12], // September to December
    startMonth: 9,
    endMonth: 12
  }
};

export const getCurrentTerm = (date = new Date()) => {
  const month = date.getMonth() + 1; // getMonth() returns 0-11, we need 1-12
  
  if (month >= 1 && month <= 4) return 'TERM_1';
  if (month >= 5 && month <= 8) return 'TERM_2';
  if (month >= 9 && month <= 12) return 'TERM_3';
  
  return 'TERM_1'; // Default fallback
};

export const getTermName = (termKey) => {
  return ACADEMIC_TERMS[termKey]?.name || 'Unknown Term';
};

export const getTermMonths = (termKey) => {
  return ACADEMIC_TERMS[termKey]?.months || [];
};

export const getAllTerms = () => {
  return Object.keys(ACADEMIC_TERMS).map(key => ({
    key,
    ...ACADEMIC_TERMS[key]
  }));
};

export const isDateInTerm = (date, termKey) => {
  const month = date.getMonth() + 1;
  const termMonths = getTermMonths(termKey);
  return termMonths.includes(month);
};