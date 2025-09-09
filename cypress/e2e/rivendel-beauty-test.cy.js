// 📸 Rivendel Beauty Test - Capturador de Belleza Élfica
// Creado por Bernard Orozco + Gandalf el Blanco

describe('🏞️ RIVENDEL BEAUTY VALIDATION', () => {
  beforeEach(() => {
    // Visit the application
    cy.visit('/')
    
    // Wait for the app to load completely
    cy.get('body', { timeout: 15000 }).should('be.visible')
    
    // Wait for any initial loading states to complete
    cy.wait(3000)
    
    // Wait for critical elements to be present
    cy.get('main', { timeout: 10000 }).should('be.visible')
  })

  it('🧙‍♂️ Should capture the complete visual beauty of our reforged application', () => {
    // Ensure the page is fully loaded and stable
    cy.wait(5000)
    
    // Wait for any animations or transitions to complete
    cy.get('body').should('be.visible')
    
    // Try to interact with the app to ensure it's responsive
    cy.get('body').click(100, 100, { force: true })
    cy.wait(1000)
    
    // Capture the full beauty
    cy.captureAppBeauty('rivendel-final-beauty')
    
    // Also capture individual sections if they exist
    cy.get('body').within(() => {
      // Try to find and capture the metrics section
      cy.get('body').then($body => {
        if ($body.find('[class*="metric"]').length > 0) {
          cy.get('[class*="metric"]').first().scrollIntoView()
          cy.wait(1000)
          cy.captureAppBeauty('rivendel-metrics-section')
        }
      })
    })
    
    // Final stability check and capture
    cy.wait(2000)
    cy.captureAppBeauty('rivendel-stability-final')
  })

  it('🎨 Should verify the visual hierarchy and modern design', () => {
    // Check for modern design elements
    cy.get('body').should('exist')
    
    // Look for responsive grid layouts
    cy.get('[class*="grid"]', { timeout: 5000 }).should('exist')
    
    // Check for modern card components
    cy.get('[class*="rounded"]', { timeout: 5000 }).should('exist')
    
    // Verify modern color scheme
    cy.get('[class*="slate"]', { timeout: 5000 }).should('exist')
    
    // Capture the design validation
    cy.captureAppBeauty('rivendel-design-validation')
  })

  it('📱 Should test responsive behavior at different viewports', () => {
    // Desktop view
    cy.viewport(1920, 1080)
    cy.wait(2000)
    cy.captureAppBeauty('rivendel-desktop-view')
    
    // Tablet view
    cy.viewport(768, 1024)
    cy.wait(2000)
    cy.captureAppBeauty('rivendel-tablet-view')
    
    // Mobile view
    cy.viewport(375, 667)
    cy.wait(2000)
    cy.captureAppBeauty('rivendel-mobile-view')
    
    // Back to desktop for final assessment
    cy.viewport(1920, 1080)
    cy.wait(2000)
    cy.captureAppBeauty('rivendel-responsive-final')
  })
})