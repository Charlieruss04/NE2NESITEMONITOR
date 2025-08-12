describe('Site Monitor Basic Test', () => {
  it('should show google.com as Online', () => {
    // Visit the application
    cy.visit('http://localhost:8000');
    
    // Check that google.com exists on the page
    cy.contains('https://google.com').should('be.visible');
    
    // Find the card containing google.com and check its status
    cy.contains('.card', 'https://google.com').within(() => {
      // Check that the status shows "Online"
      cy.get('.status-text').should('contain', 'Online');
      
      // Verify the status text is green (indicating online)
      cy.get('.status-text').should('have.css', 'color', 'rgb(40, 167, 69)');
    });
  });

  it('should have google.com in the default sites', () => {
    cy.visit('http://localhost:8000');
    
    // Verify google.com is one of the default sites
    cy.get('.site-url a[href="https://google.com"]').should('exist');
    
    // Verify the link opens in a new tab
    cy.get('.site-url a[href="https://google.com"]')
      .should('have.attr', 'target', '_blank');
  });

  it('should show google.com with proper status after page load', () => {
    cy.visit('http://localhost:8000');
    
    // Wait a bit for the status check to complete
    // The app checks status on load, so we need to wait
    cy.wait(2000);
    
    // Find the Google card specifically
    cy.contains('.card', 'https://google.com').within(() => {
      // Status should not be "Checking..."
      cy.get('.status-text').should('not.contain', 'Checking...');
      
      // Status should be either Online or Offline (but we expect Online for google.com)
      cy.get('.status-text').invoke('text').should('match', /Online|Offline/);
    });
  });
});