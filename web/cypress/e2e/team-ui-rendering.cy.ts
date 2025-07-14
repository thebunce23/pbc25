/// <reference types="cypress" />

describe('Team UI Rendering', () => {
  beforeEach(() => {
    // Visit the match generation page
    cy.visit('/matches/generate')
  })

  it('should render 3+ teams correctly in the UI', () => {
    // Mock having at least 9 players (3 teams of 3)
    cy.intercept('GET', '/api/players', {
      statusCode: 200,
      body: {
        data: [
          { id: '1', first_name: 'John', last_name: 'Doe', skill_level: 'Intermediate' },
          { id: '2', first_name: 'Jane', last_name: 'Smith', skill_level: 'Advanced' },
          { id: '3', first_name: 'Bob', last_name: 'Johnson', skill_level: 'Beginner' },
          { id: '4', first_name: 'Alice', last_name: 'Brown', skill_level: 'Intermediate' },
          { id: '5', first_name: 'Charlie', last_name: 'Davis', skill_level: 'Advanced' },
          { id: '6', first_name: 'Diana', last_name: 'Wilson', skill_level: 'Beginner' },
          { id: '7', first_name: 'Eve', last_name: 'Miller', skill_level: 'Intermediate' },
          { id: '8', first_name: 'Frank', last_name: 'Garcia', skill_level: 'Advanced' },
          { id: '9', first_name: 'Grace', last_name: 'Martinez', skill_level: 'Beginner' }
        ]
      }
    }).as('getPlayers')

    // Mock courts
    cy.intercept('GET', '/api/courts', {
      statusCode: 200,
      body: {
        data: [
          { id: '1', name: 'Court 1', type: 'Tennis' },
          { id: '2', name: 'Court 2', type: 'Tennis' }
        ]
      }
    }).as('getCourts')

    // Wait for the data to load
    cy.wait('@getPlayers')
    cy.wait('@getCourts')

    // Select all players
    cy.get('[data-cy=select-all-players]').click()

    // Generate team matches
    cy.get('[data-cy=generate-team-matches]').click()

    // Verify that 3 teams are rendered
    cy.get('[data-cy=team-card]').should('have.length', 3)

    // Verify each team has correct structure
    cy.get('[data-cy=team-card]').each(($teamCard, index) => {
      const expectedTeamId = String.fromCharCode(65 + index) // A, B, C
      
      // Check team ID is displayed
      cy.wrap($teamCard).find('[data-cy=team-id]').should('contain', expectedTeamId)
      
      // Check team has players
      cy.wrap($teamCard).find('[data-cy=team-player]').should('have.length.greaterThan', 0)
      
      // Check team has match information
      cy.wrap($teamCard).find('[data-cy=team-matches]').should('exist')
    })

    // Verify team colors are applied correctly
    cy.get('[data-cy=team-card]').first().should('have.class', 'bg-blue-50')
    cy.get('[data-cy=team-card]').eq(1).should('have.class', 'bg-purple-50')
    cy.get('[data-cy=team-card]').eq(2).should('have.class', 'bg-green-50')
  })

  it('should handle team size recommendations correctly', () => {
    // Test with 8 players
    cy.intercept('GET', '/api/players', {
      statusCode: 200,
      body: {
        data: Array.from({ length: 8 }, (_, i) => ({
          id: `${i + 1}`,
          first_name: `Player${i + 1}`,
          last_name: 'Test',
          skill_level: 'Intermediate'
        }))
      }
    }).as('getPlayers8')

    cy.wait('@getPlayers8')

    // Check team size recommendation for 8 players
    cy.get('[data-cy=team-recommendation]').should('contain', '8 players')
    cy.get('[data-cy=team-recommendation]').should('contain', 'teams of')
  })

  it('should handle team size recommendations for 12 players', () => {
    // Test with 12 players
    cy.intercept('GET', '/api/players', {
      statusCode: 200,
      body: {
        data: Array.from({ length: 12 }, (_, i) => ({
          id: `${i + 1}`,
          first_name: `Player${i + 1}`,
          last_name: 'Test',
          skill_level: 'Intermediate'
        }))
      }
    }).as('getPlayers12')

    cy.wait('@getPlayers12')

    // Check team size recommendation for 12 players
    cy.get('[data-cy=team-recommendation]').should('contain', '12 players')
    cy.get('[data-cy=team-recommendation]').should('contain', 'teams of')
  })

  it('should handle team size recommendations for 18 players', () => {
    // Test with 18 players
    cy.intercept('GET', '/api/players', {
      statusCode: 200,
      body: {
        data: Array.from({ length: 18 }, (_, i) => ({
          id: `${i + 1}`,
          first_name: `Player${i + 1}`,
          last_name: 'Test',
          skill_level: 'Intermediate'
        }))
      }
    }).as('getPlayers18')

    cy.wait('@getPlayers18')

    // Check team size recommendation for 18 players
    cy.get('[data-cy=team-recommendation]').should('contain', '18 players')
    cy.get('[data-cy=team-recommendation]').should('contain', 'teams of')
  })

  it('should display team vs team match information', () => {
    // Mock having 9 players for clean 3 teams
    cy.intercept('GET', '/api/players', {
      statusCode: 200,
      body: {
        data: Array.from({ length: 9 }, (_, i) => ({
          id: `${i + 1}`,
          first_name: `Player${i + 1}`,
          last_name: 'Test',
          skill_level: 'Intermediate'
        }))
      }
    }).as('getPlayers9')

    cy.wait('@getPlayers9')

    // Select all players and generate team matches
    cy.get('[data-cy=select-all-players]').click()
    cy.get('[data-cy=generate-team-matches]').click()

    // Verify match templates are generated
    cy.get('[data-cy=match-template]').should('have.length.greaterThan', 0)

    // Verify match titles contain team vs team format
    cy.get('[data-cy=match-title]').first().should('contain', 'vs')
    
    // Verify participants are assigned to correct teams
    cy.get('[data-cy=match-participants]').should('exist')
  })
})
