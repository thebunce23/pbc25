# buildParticipantsForMatch Usage Examples

This helper function provides a standardized way to build participants for matches, ensuring consistent team sizing across all match generators.

## Function Signature

```typescript
function buildParticipantsForMatch(
  players: Player[],
  preferredTeamSize: number
): { participants: GeneratedParticipant[]; teamCount: number }
```

## Usage Examples

### 1. Replace Manual Team Assignment in GenerateMatchForm

**Before (current implementation):**
```typescript
// In generate-match-form.tsx, lines 107-110
const matchData = {
  ...formData,
  participants: selectedPlayers.map((playerId, index) => ({
    player_id: playerId,
    team: index < Math.ceil(selectedPlayers.length / 2) ? 'A' as const : 'B' as const
  }))
}
```

**After (using buildParticipantsForMatch):**
```typescript
import { buildParticipantsForMatch } from '@/lib/utils/team-utils'

// Convert selected player IDs to Player objects
const selectedPlayerObjects = players.filter(p => selectedPlayers.includes(p.id))
const preferredTeamSize = formData.match_type === 'Singles' ? 1 : 2

// Use the helper function
const { participants } = buildParticipantsForMatch(selectedPlayerObjects, preferredTeamSize)

const matchData = {
  ...formData,
  participants: participants.map(p => ({
    player_id: p.playerId,
    team: p.team
  }))
}
```

### 2. Simplify Round Robin Generation

**Before (current implementation):**
```typescript
// In generate page, lines 665-670
const teamIds = getTeamIds(2);
const participants: GeneratedParticipant[] = [
  { playerId: combo[0].id, team: teamIds[0] },
  { playerId: combo[1].id, team: teamIds[0] },
  { playerId: combo[2].id, team: teamIds[1] },
  { playerId: combo[3].id, team: teamIds[1] }
]
```

**After (using buildParticipantsForMatch):**
```typescript
import { buildParticipantsForMatch } from '@/lib/utils/team-utils'

// For each combination of 4 players
const { participants } = buildParticipantsForMatch(combo, 2)
```

### 3. Standardize Team Match Generation

**Before (current implementation):**
```typescript
// In generate page, createBalancedTeams function
const teams: Player[][] = []
const totalPlayers = sortedPlayers.length
const optimalSizes = calculateOptimalTeamSizes(totalPlayers, teamSize)

if (!optimalSizes.isValid) {
  return teams
}

let playerIndex = 0
for (let i = 0; i < optimalSizes.playersPerTeam.length && playerIndex < totalPlayers; i++) {
  const currentTeamSize = optimalSizes.playersPerTeam[i]
  const team = []
  
  for (let j = 0; j < currentTeamSize && playerIndex < totalPlayers; j++) {
    team.push(sortedPlayers[playerIndex])
    playerIndex++
  }
  
  if (team.length >= 3) {
    teams.push(team)
  }
}
```

**After (using buildParticipantsForMatch):**
```typescript
import { buildParticipantsForMatch } from '@/lib/utils/team-utils'

// Simply use the helper function
const { participants, teamCount } = buildParticipantsForMatch(sortedPlayers, teamSize)

// Convert to the format needed for round robin generation
const teamPlayerMap = new Map<TeamId, Player[]>()
const teamIds = getTeamIds(teamCount)

// Group participants by team
teamIds.forEach(teamId => {
  const teamPlayers = participants
    .filter(p => p.team === teamId)
    .map(p => sortedPlayers.find(player => player.id === p.playerId)!)
    .filter(Boolean)
  
  if (teamPlayers.length > 0) {
    teamPlayerMap.set(teamId, teamPlayers)
  }
})
```

## Benefits

1. **Consistent Team Sizing**: All match generators use the same optimal team size calculation
2. **Reduced Code Duplication**: Single function handles team assignment logic
3. **Standardized Team Distribution**: Players are distributed sequentially across teams
4. **Respect for Optimal Sizing**: Uses `calculateOptimalTeamSizes` to determine best team configuration
5. **Future Parameterization**: `teamCount` is currently fixed at 2 but can be easily parameterized

## How It Works

1. Calls `calculateOptimalTeamSizes(players.length, preferredTeamSize)`
2. Uses `result.teamSize` if valid, otherwise falls back to `preferredTeamSize`
3. Sets `teamCount = 2` for A-vs-B matches (can be parameterized later)
4. Slices first `playersPerTeam * teamCount` players from the input array
5. Distributes players sequentially across teams using `getTeamIds(teamCount)`
6. Returns `{ participants, teamCount }` for use in match generation

## Testing

The function is fully tested with scenarios including:
- Optimal team sizes with even distribution
- Fewer players than optimal team size
- Sequential distribution across teams
- Proper team ID assignment
