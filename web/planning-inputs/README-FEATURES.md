# Pickleball Club Platform

A comprehensive multi-tenant pickleball club management platform built with Next.js, Supabase, and TypeScript.

## Features Implemented

### 🏢 Multi-Tenant Architecture
- **Tenant Management**: Self-service tenant registration with club details
- **Data Isolation**: Complete data separation between tenants using Row Level Security (RLS)
- **Subdomain Routing**: Support for subdomain-based tenant routing (e.g., club1.pickleballapp.com)
- **Tenant Configuration**: Each tenant can configure club-specific settings

### 🔐 Authentication & Authorization
- **Single Sign-On (SSO)**: Microsoft Azure AD and Google Workspace integration
- **Email/Password**: Traditional authentication with secure password handling
- **Role-Based Access Control**: Super Admin, Tenant Admin, Club Manager, Member, Guest roles
- **JWT Token Management**: Secure token generation and validation
- **Multi-Factor Authentication**: Ready for 2FA implementation

### 👥 Player Management
- **Player Profiles**: Complete player information including skill levels, contact details
- **Registration System**: Self-registration and admin-managed registration
- **Membership Status**: Active, inactive, trial, and suspended member tracking
- **Skill Level System**: Standard pickleball rating system (1.0-5.0+)
- **Statistics Tracking**: Match history, win/loss records, rating progression
- **Search & Filter**: Advanced search and filtering capabilities

### 📊 Dashboard & Analytics
- **Overview Dashboard**: Real-time statistics and activity feed
- **Quick Actions**: Easy access to common tasks
- **Recent Activity**: Live updates on club activities
- **Performance Metrics**: Court utilization, player engagement

### 🎨 User Interface
- **Modern Design**: Clean, responsive interface built with Tailwind CSS
- **Mobile-First**: Optimized for all device sizes
- **Dark Mode**: Ready for dark theme implementation
- **Accessible**: WCAG compliant design patterns
- **Form Validation**: Comprehensive form validation with Zod

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Headless UI components
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation
- **Lucide React** - Icon library

### Backend
- **Supabase** - PostgreSQL database with real-time features
- **Row Level Security** - Database-level multi-tenancy
- **Auth** - Built-in authentication with OAuth providers
- **Edge Functions** - Serverless functions (ready for implementation)

### Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting (ready for setup)
- **TypeScript** - Static type checking

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Main dashboard
│   ├── players/           # Player management
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── forms/             # Form components
│   ├── layout/            # Layout components
│   └── ui/                # Base UI components
├── lib/                   # Utility libraries
│   ├── services/          # Business logic services
│   ├── auth.ts            # Authentication service
│   ├── supabase.ts        # Supabase client
│   └── utils.ts           # Utility functions
├── middleware.ts          # Next.js middleware
db/
└── schema.sql            # Database schema
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pickleball-club-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Fill in your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   ```

4. **Set up the database**
   - Create a new Supabase project
   - Run the SQL schema from `db/schema.sql` in your Supabase SQL editor
   - Enable Row Level Security on all tables

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open the application**
   Visit [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Current Status

### ✅ Completed Features
- Multi-tenant architecture with RLS
- Authentication system with SSO support
- Player management with CRUD operations
- Dashboard with statistics
- Responsive UI components
- Form validation and error handling

### 🚧 Ready for Implementation
- Match management system
- Event scheduling
- Court management
- Communication system
- Payment integration
- Reporting & analytics
- Mobile app (PWA ready)

### 🔒 Security Features
- Row Level Security (RLS) for data isolation
- JWT token management
- Secure password handling
- CORS protection
- Rate limiting (middleware ready)

## Next Steps

1. **Set up Supabase project** and configure environment variables
2. **Implement remaining features** based on requirements
3. **Add payment integration** with Stripe
4. **Set up email services** for notifications
5. **Deploy to production** (Vercel recommended)
6. **Configure custom domains** for tenants

## Contributing

1. Follow the existing code structure and patterns
2. Use TypeScript for all new code
3. Add proper error handling and validation
4. Write tests for new features
5. Follow the existing naming conventions

## Support

For support and questions, please refer to the documentation or create an issue in the repository.