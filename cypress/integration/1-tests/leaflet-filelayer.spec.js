/// <reference types="cypress" />

// Welcome to Cypress!
//
// This spec file contains a variety of sample tests
// for a todo list app that are designed to demonstrate
// the power of writing tests in Cypress.
//
// To learn more about how Cypress works and
// what makes it such an awesome testing tool,
// please read our getting started guide:
// https://on.cypress.io/introduction-to-cypress

var _VALID_GEOJSON = {
  type: 'FeatureCollection',
  features: [
    { type: 'Point', coordinates: [0, 0] }
  ]
};

describe('example to-do app', () => {
  beforeEach(() => {
    // Cypress starts out with a blank slate for each test
    // so we must tell it to visit our website with the `cy.visit()` command.
    // Since we want to visit the same URL at the start of all our tests,
    // we include it in our beforeEach function so that it runs before each test
    cy.visit('dev/index.html');
  })

  it('should listen to click once added.', function () {
    cy.get('a.leaflet-control-filelayer').click().type('{esc}')
  });

  it('should be able to load several files', function () {
    cy.get('input.hidden').should('have.attr', 'multiple');
  });

  it('should add the layer to the map by default', function () {
    cy.get('input.hidden')
        .attachFile('example.geojson');
  });

})
