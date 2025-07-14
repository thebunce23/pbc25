# Team Generation Testing Guide

This document outlines the testing strategy for the team generation features, including the new **auto-expanding team ID system** that supports unlimited teams beyond A vs B.

## 🔄 System Changes

### Team ID Auto-Expansion
- **Before**: Fixed A vs B teams only
- **After**: Dynamic team generation A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z
- **Breaking Change**: Team IDs are now dynamically generated based on team count
- **Backward Compatible**: A vs B matches still work as before

## Unit Tests

### `calculateOptimalTeamSizes` Function

**Location**: `src/lib/utils/team-utils.test.ts`

**Test Cases**:
- ✅ Returns invalid for less than 6 players
- ✅ Calculates optimal sizes for 8 players with preferred team size 4 (2 teams of 4)
- ✅ Calculates optimal sizes for 12 players with preferred team size 4 (3 teams of 4)
- ✅ Handles 18 players with preferred team size 4 (4 teams of 4 + 1 team of 2, or similar)
- ✅ Handles edge cases with uneven division (10 players = 1 team of 4 + 1 team of 6)
- ✅ Falls back to flexible sizing when preferred size is not specified

**Run Tests**:
```bash
npm test
```

### `generateRoundRobinWithPlayers` Function

**Test Cases**:
- ✅ Generates correct number of matches for team-vs-team play
- ✅ Returns balanced player assignments
- ✅ Ensures each match has exactly 4 participants (2 from each team)

## End-to-End Tests (Cypress)

### UI Rendering Tests

**Location**: `cypress/e2e/team-ui-rendering.cy.ts`

**Test Cases**:
- ✅ Renders 3+ teams correctly in the UI
- ✅ Displays team colors correctly
- ✅ Shows team size recommendations for 8, 12, and 18 players
- ✅ Displays team vs team match information
- ✅ Validates team assignments section

**Run E2E Tests**:
```bash
npm run cypress:open  # Interactive mode
npm run cypress:run   # Headless mode
npm run test:e2e      # Full test suite with dev server
```

## Manual QA Test Cases

### Test Scenario 1: 8 Players
**Expected Result**: 2 teams of 4 players each
- ✅ UI shows "2 teams of 4 players each"
- ✅ Team assignments section displays 2 teams (A, B)
- ✅ Each team has exactly 4 players
- ✅ 1 match generated (Team A vs Team B)

### Test Scenario 2: 12 Players  
**Expected Result**: 3 teams of 4 players each
- ✅ UI shows "3 teams of 4 players each"
- ✅ Team assignments section displays 3 teams (A, B, C)
- ✅ Each team has exactly 4 players
- ✅ 3 matches generated (A vs B, A vs C, B vs C)

### Test Scenario 3: 18 Players
**Expected Result**: 4 teams of 4 players + 1 team of 2 players (or similar balanced distribution)
- ✅ UI shows appropriate team size recommendation
- ✅ Team assignments section displays 4+ teams
- ✅ All teams have at least 3 players
- ✅ All 18 players are assigned to teams
- ✅ Correct number of round-robin matches generated

## Manual QA Script

Run the manual QA script to verify configurations:
```bash
node scripts/manual-qa-team-generation.js
```

## Key Features Verified

1. **Team Size Configuration**: UI respects the selected team size preference
2. **Balanced Distribution**: Algorithm creates balanced teams with optimal sizes
3. **UI Rendering**: Teams display correctly with proper colors and organization
4. **Match Generation**: Correct number of round-robin matches created
5. **Edge Cases**: Handles uneven player counts gracefully

## Testing Checklist

- [ ] Unit tests pass for all team utility functions
- [ ] Cypress tests pass for UI rendering with 3+ teams
- [ ] Manual QA confirms correct behavior with 8, 12, and 18 players
- [ ] Team assignments section displays correctly
- [ ] Team size recommendations update based on player count
- [ ] Round-robin matches generated properly
- [ ] All players assigned to teams (no orphaned players)
- [ ] Team colors applied consistently

## Known Edge Cases

1. **Uneven Division**: When players don't divide evenly into preferred team size, the algorithm creates mixed-size teams (e.g., 10 players = 1 team of 4 + 1 team of 6)
2. **Minimum Team Size**: Teams must have at least 3 players minimum
3. **Maximum Team Size**: Teams are capped at 6 players maximum
4. **Insufficient Players**: Less than 6 players returns invalid configuration

## Troubleshooting

If tests fail:
1. Check that all dependencies are installed: `npm install`
2. Verify Jest configuration in `jest.config.js`
3. Ensure Cypress is properly configured in `cypress.config.ts`
4. Check for TypeScript compilation errors
5. Verify that the Next.js dev server is running for E2E tests
