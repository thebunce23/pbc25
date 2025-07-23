# Team Management System Documentation

## Overview

The PBC25 Pickleball Club Platform features a comprehensive team management system that supports unlimited team expansion beyond the traditional A vs B format. This system is designed to handle tournaments, events, and matches with any number of teams.

## 🚀 Key Features

### Auto-Expanding Team IDs
- **Support for A-Z teams**: Automatically generates team IDs from A through Z
- **Dynamic scaling**: Adapts to any number of teams needed for events
- **Backward compatibility**: Maintains support for traditional A vs B matches

### Smart Team Assignment
- **Optimal team sizing**: Calculates the best team sizes based on player count
- **Flexible team sizes**: Supports 3-6 players per team with intelligent distribution
- **Skill-level balancing**: Distributes players across teams based on skill levels

### Team Color System
- **Predefined palette**: 8 built-in team colors (A-H)
- **Extensible design**: Easy to add more colors for additional teams
- **Consistent styling**: Each team has background, text, and border color classes

## 🔧 API Reference

### Core Functions

#### `getTeamIds(count: number, customList?: TeamId[]): TeamId[]`
Generates an array of team IDs for the specified number of teams.

```typescript
import { getTeamIds } from '@/lib/utils/match-utils'

// Generate 5 teams
const teamIds = getTeamIds(5)
// Returns: ['A', 'B', 'C', 'D', 'E']

// Use custom team names
const customTeams = getTeamIds(3, ['Red', 'Blue', 'Green'])
// Returns: ['Red', 'Blue', 'Green']
```

#### `getTeamColors(teamId: TeamId)`
Returns the color configuration for a specific team.

```typescript
import { getTeamColors } from '@/lib/utils/match-utils'

const teamAColors = getTeamColors('A')
// Returns: {
//   background: 'bg-blue-100',
//   text: 'text-blue-600',
//   lightBackground: 'bg-blue-50',
//   border: 'border-blue-200'
// }
```

#### `calculateOptimalTeamSizes(totalPlayers: number, preferredTeamSize?: number)`
Calculates optimal team configurations for a given number of players.

```typescript
import { calculateOptimalTeamSizes } from '@/lib/utils/team-utils'

const result = calculateOptimalTeamSizes(18, 4)
// Returns: {
//   teamSize: 4,
//   teamCount: 4,
//   playersPerTeam: [4, 4, 4, 6],
//   isValid: true,
//   description: '3 teams of 4 players + 1 team of 6 players',
//   options: [...] // Alternative configurations
// }
```

#### `buildParticipantsForMatch(players: Player[], preferredTeamSize: number)`
**Team-Size Aware**: Builds participants with optimal team sizes based on user preferences.

```typescript
import { buildParticipantsForMatch } from '@/lib/utils/team-utils'

const { participants, teamCount } = buildParticipantsForMatch(players, 4)
// Returns participants with teams sized as close to 4 as possible
// participants: [{ playerId: 'p1', team: 'A' }, { playerId: 'p2', team: 'A' }, ...]
```

#### `generateRoundRobinWithPlayers(teamPlayerMap: Map<TeamId, Player[]>, preferredTeamSize?: number)`
**Team-Size Aware**: Generates matches between pre-sized teams.

```typescript
import { generateRoundRobinWithPlayers } from '@/lib/utils/team-utils'

// Generate matches with explicit preferred team size
const matches = generateRoundRobinWithPlayers(teamPlayerMap, 4)
// Creates matches respecting the preferred team size of 4 players
```

## 🎨 Color System

### Built-in Team Colors

| Team ID | Background | Text | Light Background | Border |
|---------|------------|------|------------------|--------|
| A | `bg-blue-100` | `text-blue-600` | `bg-blue-50` | `border-blue-200` |
| B | `bg-purple-100` | `text-purple-600` | `bg-purple-50` | `border-purple-200` |
| C | `bg-green-100` | `text-green-600` | `bg-green-50` | `border-green-200` |
| D | `bg-red-100` | `text-red-600` | `bg-red-50` | `border-red-200` |
| E | `bg-yellow-100` | `text-yellow-600` | `bg-yellow-50` | `border-yellow-200` |
| F | `bg-indigo-100` | `text-indigo-600` | `bg-indigo-50` | `border-indigo-200` |
| G | `bg-pink-100` | `text-pink-600` | `bg-pink-50` | `border-pink-200` |
| H | `bg-orange-100` | `text-orange-600` | `bg-orange-50` | `border-orange-200` |

### Adding New Team Colors

To add support for more team colors beyond H, update the `TEAM_COLORS` constant in `src/lib/utils/match-utils.ts`:

```typescript
export const TEAM_COLORS = {
  // ... existing colors A-H
  I: {
    background: 'bg-teal-100',
    text: 'text-teal-600',
    lightBackground: 'bg-teal-50',
    border: 'border-teal-200'
  },
  J: {
    background: 'bg-slate-100',
    text: 'text-slate-600',
    lightBackground: 'bg-slate-50',
    border: 'border-slate-200'
  },
  // ... add more as needed
} as const
```

**Important**: When adding new colors, ensure they are included in your Tailwind CSS configuration or use Tailwind's safelist to prevent purging.

## 📖 Usage Examples

### Basic Team Creation

```typescript
// Generate teams for a tournament
const playerCount = 20
const teamIds = getTeamIds(5) // Create 5 teams
const teamSizes = calculateOptimalTeamSizes(playerCount, 4)

if (teamSizes.isValid) {
  console.log(`Creating ${teamSizes.teamCount} teams:`)
  teamSizes.playersPerTeam.forEach((size, index) => {
    const teamId = teamIds[index]
    const colors = getTeamColors(teamId)
    console.log(`Team ${teamId}: ${size} players (${colors.background})`)
  })
}
```

### Round Robin Tournament

```typescript
import { generateRoundRobinWithPlayers } from '@/lib/utils/team-utils'

// Create team-player mapping
const teamPlayerMap = new Map<TeamId, Player[]>()
teamPlayerMap.set('A', [player1, player2, player3, player4])
teamPlayerMap.set('B', [player5, player6, player7, player8])
teamPlayerMap.set('C', [player9, player10, player11, player12])

// Generate all possible matches
const matches = generateRoundRobinWithPlayers(teamPlayerMap)
// Creates matches: A vs B, A vs C, B vs C
```

### UI Component Integration

```tsx
// Example team display component
function TeamDisplay({ teamId, players }: { teamId: TeamId, players: Player[] }) {
  const colors = getTeamColors(teamId)
  
  return (
    <div className={`${colors.lightBackground} border ${colors.border} rounded-lg p-4`}>
      <div className={`${colors.background} ${colors.text} rounded-full w-12 h-12 flex items-center justify-center mb-2`}>
        {teamId}
      </div>
      <h3 className="font-semibold">Team {teamId}</h3>
      <p className="text-sm text-gray-600">{players.length} players</p>
    </div>
  )
}
```

## 🏗️ Architecture

### File Structure
```
src/
├── lib/utils/
│   ├── match-utils.ts       # Core team utilities and color system
│   ├── team-utils.ts        # Team sizing and tournament logic
│   └── team-utils.test.ts   # Comprehensive tests
├── types/
│   └── match.ts            # Team-related type definitions
└── components/
    └── [various UI components using team system]
```

### Key Types

```typescript
// Team ID type
export type TeamId = string // e.g., 'A', 'B', 'C', etc.

// Team structure
export interface Team {
  id: TeamId
  players: Player[]
  displayName: string
}

// Team configuration for optimal sizing
export interface TeamConfiguration {
  teamSize: number
  teamCount: number
  playersPerTeam: number[]
  description: string
  efficiency: number
  isOptimal: boolean
}
```

## 🧪 Testing

The team system includes comprehensive tests in `src/lib/utils/team-utils.test.ts`:

```bash
# Run team system tests
npm test team-utils

# Run specific test suites
npm test -- --testNamePattern="calculateOptimalTeamSizes"
npm test -- --testNamePattern="getTeamIds"
```

### Test Coverage
- ✅ Team ID generation for various counts
- ✅ Custom team list support
- ✅ Team color assignments
- ✅ Optimal team size calculations
- ✅ Round robin match generation
- ✅ Edge cases and error handling

## 🔄 Migration Notes

### Breaking Changes
- **Team IDs are now dynamic**: The system no longer assumes only A and B teams exist
- **Color system expanded**: New color properties added to team configurations
- **API changes**: Some functions now accept team count parameters

### Backward Compatibility
- All existing A vs B functionality remains intact
- Default team constants (`DEFAULT_TEAM_A`, `DEFAULT_TEAM_B`) still available
- Legacy score parsing continues to work

### Migration Steps

1. **Update imports**: Ensure you're using the latest utility functions
2. **Update components**: Use `getTeamIds()` instead of hardcoded team arrays
3. **Update styling**: Use `getTeamColors()` for consistent team styling
4. **Update tests**: Add tests for multi-team scenarios

## 🚀 Future Enhancements

### Planned Features
- **Custom team names**: Support for named teams (e.g., "Eagles", "Tigers")
- **Team logos**: Integration with team logo/image system
- **Advanced balancing**: AI-powered team balancing based on historical performance
- **Team statistics**: Track team performance across tournaments

### Configuration Options
- **Maximum team count**: Configurable limit for team generation
- **Custom color themes**: Support for club-specific color schemes
- **Team naming patterns**: Configurable team naming conventions

## 📞 Support

For questions or issues related to the team system:

1. **Check the tests**: `src/lib/utils/team-utils.test.ts` provides usage examples
2. **Review the implementation**: Core logic is in `src/lib/utils/match-utils.ts`
3. **Create an issue**: Include team configuration details and expected behavior

---

*Last updated: Current implementation*
*Version: 1.0.0*
*Contributors: Development Team*
