# PBC25 Pickleball Club Platform

A comprehensive multi-tenant pickleball club management platform built with Next.js, Supabase, and TypeScript.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm, yarn, pnpm, or bun
- Supabase account

### Installation

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd pickleball-club-platform
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase credentials in `.env.local`

3. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   # or
   bun dev
   ```

4. **Open the application**
   Visit [http://localhost:3000](http://localhost:3000)

## 🏆 Team Management System

### Auto-Expanding Team IDs

The platform now supports **unlimited team expansion** beyond the traditional A vs B format:

- **Team IDs**: A, B, C, D, E, F, G, H, I, J, K, L, M, N, O, P, Q, R, S, T, U, V, W, X, Y, Z
- **Automatic Generation**: Teams are automatically assigned based on the number of teams needed
- **Dynamic Scaling**: The system adapts to any number of teams for tournaments and events

### Key Features

#### 🎯 **Smart Team Assignment**
- Automatically generates team IDs based on player count
- Optimal team size calculation (3-6 players per team)
- Balanced team creation with skill-level distribution

#### 🎨 **Team Color System**
- **Built-in Color Palette**: 8 predefined team colors (A-H)
- **Extensible Design**: Easy to add more colors for teams beyond H
- **Consistent Styling**: Each team has background, text, and border colors

#### 🔧 **API Usage**

```typescript
// Generate team IDs for any number of teams
import { getTeamIds } from '@/lib/utils/match-utils'

// Create 5 teams: ['A', 'B', 'C', 'D', 'E']
const teamIds = getTeamIds(5)

// Get team colors
import { getTeamColors } from '@/lib/utils/match-utils'
const teamAColors = getTeamColors('A')
// Returns: { background: 'bg-blue-100', text: 'text-blue-600', ... }

// Calculate optimal team sizes (respects user's preferred team size)
import { calculateOptimalTeamSizes } from '@/lib/utils/team-utils'
const result = calculateOptimalTeamSizes(18, 4) // 18 players, prefer 4 per team
// Returns: { teamCount: 4, playersPerTeam: [4, 4, 4, 6], isValid: true }

// Build participants for matches (team-size aware)
import { buildParticipantsForMatch } from '@/lib/utils/team-utils'
const { participants } = buildParticipantsForMatch(players, 4) // Respects preferred team size

// Generate round-robin matches with optimal team sizes
import { generateRoundRobinWithPlayers } from '@/lib/utils/team-utils'
const matches = generateRoundRobinWithPlayers(teamPlayerMap, 4) // Uses preferredTeamSize
```

## 📚 Documentation

- **[Feature Documentation](./README-FEATURES.md)** - Complete feature overview
- **[Testing Guide](./docs/TESTING_GUIDE.md)** - Team system testing
- **[Project Plan](./PROJECT_PLAN.md)** - Development roadmap

## 🔗 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## 🚀 Deployment

The platform is optimized for deployment on [Vercel](https://vercel.com) with Supabase as the backend.

See our [deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for details.
