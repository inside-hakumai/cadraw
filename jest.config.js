/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  projects: ['<rootDir>/core/'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['html-spa'],
}
