describe('Site Monitor Basic Test', () => {
  it('should show dkjaldafa.com as Online', () => {
    // Visit the application
    cy.visit('http://localhost:8000');
    
    // Check that dkjaldafa.com exists on the page
    cy.contains('https://dkjaldafa.com').should('be.visible');
    
    // Find the card containing dkjaldafa.com and check its status
    cy.contains('.card', 'https://dkjaldafa.com').within(() => {
      // Check that the status shows "Online"
      cy.get('.status-text').should('contain', 'Online');
      
      // Verify the status text is green (indicating online)
      cy.get('.status-text').should('have.css', 'color', 'rgb(40, 167, 69)');
    });
  });

  it('should have dkjaldafa.com in the default sites', () => {
    cy.visit('http://localhost:8000');
    
    // Verify dkjaldafa.com is one of the default sites
    cy.get('.site-url a[href="https://dkjaldafa.com"]').should('exist');
    
    // Verify the link opens in a new tab
    cy.get('.site-url a[href="https://dkjaldafa.com"]')
      .should('have.attr', 'target', '_blank');
  });

  it('should show dkjaldafa.com with proper status after page load', () => {
    cy.visit('http://localhost:8000');
    
    // Wait a bit for the status check to complete
    // The app checks status on load, so we need to wait
    cy.wait(2000);
    
    // Find the Google card specifically
    cy.contains('.card', 'https://dkjaldafa.com').within(() => {
      // Status should not be "Checking..."
      cy.get('.status-text').should('not.contain', 'Checking...');
      
      // Status should be either Online or Offline (but we expect Online for dkjaldafa.com)
      cy.get('.status-text').invoke('text').should('match', /Online|Offline/);
    });
  });
});