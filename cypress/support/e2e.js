// 📸 Cypress Support - Configuración E2E
// Creado por Bernard Orozco + Gandalf el Blanco

// Import commands.js using ES2015 syntax:
import './commands'

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Hide fetch/XHR requests from command log for cleaner output
Cypress.on('window:before:load', (win) => {
  win.console.log = () => {};
  win.console.warn = () => {};
});

// Global configuration
Cypress.Commands.add('waitForApp', () => {
  // Wait for the app to be ready
  cy.get('[data-testid="cognitive-dashboard"]', { timeout: 10000 }).should('be.visible')
  cy.wait(2000) // Additional wait for animations
})