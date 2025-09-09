// 🔍 Full App Capture Test - Captura COMPLETA de la aplicación
// Creado por Bernard Orozco + Gandalf el Blanco

describe('📸 FULL APPLICATION CAPTURE', () => {
  it('Should capture the COMPLETE application with chat visible', () => {
    // Visit with larger viewport for better visibility
    cy.viewport(1920, 1080)
    
    // Visit the application
    cy.visit('http://localhost:3000')
    
    // Wait for page to fully load
    cy.wait(5000)
    
    // Force any collapsed panels to open
    cy.get('body').then($body => {
      // Click on any buttons that might expand panels
      if ($body.find('button').length > 0) {
        cy.get('button').first().click({ force: true })
        cy.wait(1000)
      }
    })
    
    // Capture full page screenshot
    cy.screenshot('full-app-rivendel', {
      capture: 'fullPage',
      overwrite: true,
      clip: { x: 0, y: 0, width: 1920, height: 1080 }
    })
    
    // Try to capture viewport
    cy.screenshot('viewport-rivendel', {
      capture: 'viewport',
      overwrite: true
    })
    
    // Scroll down if possible to capture more content
    cy.scrollTo('bottom', { duration: 1000 })
    cy.wait(1000)
    cy.screenshot('scrolled-rivendel', {
      capture: 'viewport',
      overwrite: true
    })
    
    // Scroll back to top
    cy.scrollTo('top', { duration: 1000 })
    cy.wait(1000)
    
    // Final capture with runner hidden
    cy.screenshot('final-beauty-rivendel', {
      capture: 'runner',
      overwrite: true
    })
  })
})