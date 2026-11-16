/* The standards framework the picker shows. One constant; the UI, the coverage note and the standards
   header read it, so adding a state changes data, not markup. */
const FRAMEWORK = {
  id: 'tn',
  name: 'Tennessee',
  /* How this framework divides the grades; kindergarten is grade 0. Used by the grade-band filter in the standards panel. */
  bands: [{ id: 'k2', label: 'K to 2', grades: [0, 1, 2] }, { id: '35', label: '3 to 5', grades: [3, 4, 5] }],
  source: 'Tennessee Instructional Focus Documents, Kindergarten to Grade 5 (July 2025 binders)'
};
