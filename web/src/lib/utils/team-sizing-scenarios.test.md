# Team Sizing Scenarios Test Suite

## Overview
This test suite provides comprehensive coverage for team sizing scenarios in the PBC25 application, specifically testing the `calculateOptimalTeamSizes` and `buildParticipantsForMatch` functions with various combinations of player counts and preferred team sizes.

## Test Coverage

### Test Matrix
- **Player counts**: 6-20 players
- **Preferred team sizes**: 3, 4, 5 players per team
- **Total scenarios**: 45 unique combinations (15 player counts × 3 team sizes)

### Functions Tested

#### `calculateOptimalTeamSizes`
- Validates correct `playersPerTeam` arrays for all scenarios
- Handles edge cases where `totalPlayers mod preferredSize ≠ 0`
- Verifies team count calculations
- Checks optimal vs sub-optimal configurations

#### `buildParticipantsForMatch`
- Validates participant assignment with correct team IDs
- Verifies player distribution across teams
- Tests sequential assignment of players to teams
- Handles insufficient player scenarios

## Key Test Categories

### 1. Perfect Divisions (No Remainder)
Tests scenarios where players divide evenly into teams:
- 6 players, team size 3 → 2 teams of 3
- 12 players, team size 4 → 3 teams of 4
- 15 players, team size 5 → 3 teams of 5

### 2. Edge Cases with Remainder
Tests scenarios where `totalPlayers mod preferredSize ≠ 0`:
- 7 players, team size 3 → 2 teams: [3, 4]
- 11 players, team size 4 → 2 teams: [4, 7]
- 13 players, team size 5 → 2 teams: [5, 8]

### 3. Insufficient Players
Tests scenarios with fewer players than ideal:
- 6 players with preferred team size 4 or 5
- Fallback to balanced 2-team distribution

### 4. Team ID Assignment
Validates correct alphabetical team ID assignment:
- Team IDs: A, B, C, D, E, F...
- Sequential assignment validation

### 5. Player Assignment Order
Ensures players are assigned sequentially:
- Players 1-3 → Team A
- Players 4-6 → Team B
- And so on...

## Test Results
✅ **101 tests pass** covering all scenarios
✅ **26 existing tests still pass** (no regressions)

## Edge Cases Covered

### Minimum Requirements
- Exactly 6 players (minimum for team matches)
- Different preferred sizes with minimum players

### Maximum Team Size Constraints
- Teams never exceed 10 players
- All teams have at least 2 players

### Consistency Validation
- Multiple runs produce identical results
- Deterministic behavior across all scenarios

## Test Structure

### Helper Functions
- `createMockPlayers(count)`: Creates test player data
- `countPlayersPerTeam(participants)`: Validates team distributions

### Test Organization
1. **calculateOptimalTeamSizes tests**
   - Organized by preferred team size (3, 4, 5)
   - Covers all player counts 6-20
   - Special edge case section

2. **buildParticipantsForMatch tests**
   - Mirrors calculateOptimalTeamSizes structure
   - Adds validation for actual participant assignment
   - Team ID and player order validation

3. **Comprehensive Edge Case Testing**
   - Boundary conditions
   - Fallback behavior
   - Consistency checks

## Key Findings

### Team Size 3 (Most Flexible)
- Works well with all player counts 6-20
- Minimal large remainders
- Good balance between team count and team size

### Team Size 4 (Moderate Flexibility)
- Requires minimum 8 players for optimal results
- Some large remainders (e.g., 11 players → [4, 7])
- Good for medium-sized groups

### Team Size 5 (Least Flexible)
- Requires minimum 10 players for optimal results
- Can create very large remainder teams (e.g., 19 players → [5, 5, 9])
- Best for larger groups with perfect divisions

## Coverage Validation

All test scenarios verify:
- ✅ Correct team count
- ✅ Correct player distribution
- ✅ All players assigned
- ✅ Valid team IDs
- ✅ Sequential player assignment
- ✅ Proper handling of remainders
- ✅ Consistent behavior

This comprehensive test suite ensures the team sizing logic works correctly across all realistic scenarios in the PBC25 application.
