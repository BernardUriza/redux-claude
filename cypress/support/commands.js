// 📸 Cypress Commands - Comandos Personalizados
// Creado por Bernard Orozco + Gandalf el Blanco

// Custom screenshot command for high quality captures
Cypress.Commands.add('captureAppBeauty', (filename = 'rivendel-beauty') => {
  cy.screenshot(filename, {
    capture: 'fullPage',
    clip: { x: 0, y: 0, width: 1920, height: 1080 },
    overwrite: true,
  })
})

// Wait for animations and loading states to complete
Cypress.Commands.add('waitForStability', (timeout = 3000) => {
  cy.wait(timeout)
  // Wait for any loading indicators to disappear
  cy.get('body').should('not.contain', 'loading', { timeout: 5000 })
  cy.get('[data-testid="loading"]').should('not.exist')
})