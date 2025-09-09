// Debug layout test - Gandalf's diagnostic tool
describe('🔍 LAYOUT DEBUGGING', () => {
  it('Should capture current layout state', () => {
    cy.visit('http://localhost:3000')
    cy.wait(3000)
    
    // Take immediate screenshot
    cy.screenshot('debug-layout-current', {
      capture: 'fullPage',
      clip: { x: 0, y: 0, width: 1280, height: 720 }
    })
    
    // Get all elements for debugging
    cy.get('body').then($body => {
      console.log('Body HTML:', $body.html().slice(0, 500))
    })
  })
})