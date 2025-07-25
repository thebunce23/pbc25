# 🎾 PBC25 Tennis Platform - Supabase Setup Guide

This guide will help you set up a real Supabase database and remove all mock implementations.

## 📋 Prerequisites

- Node.js and npm installed
- A Supabase account (free at [supabase.com](https://supabase.com))

## 🚀 Step 1: Create Supabase Project

1. **Go to [supabase.com](https://supabase.com)**
2. **Sign up or sign in**
3. **Click "New Project"**
4. **Fill in project details:**
   - **Organization**: Select or create one
   - **Name**: `pbc25-tennis-platform` (or your preference)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to you
5. **Click "Create new project"**
6. **Wait for project initialization** (takes 1-2 minutes)

## 🔑 Step 2: Get Your API Keys

Once your project is ready:

1. **Go to Project Settings** (⚙️ icon in sidebar)
2. **Click "API" in the left menu**
3. **Copy these values:**
   - **Project URL**: `https://xxxxx.supabase.co`
   - **Anon public key**: `eyJhbGciOiJIUzI1...` (long string)
   - **Service role key**: `eyJhbGciOiJIUzI1...` (different long string)

## 📝 Step 3: Update Environment Variables

Update your `.env.local` file with the real values:

```bash
# Replace with your actual Supabase project values
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## 🗄️ Step 4: Set Up Database Schema

### Option A: Using Supabase Dashboard (Recommended)

1. **Go to your Supabase project dashboard**
2. **Click "SQL Editor" in the sidebar**
3. **Copy and paste the contents from:** `supabase/migrations/20250704234654_create_pickleball_schema.sql`
4. **Click "Run"**
5. **Repeat for other migration files in `supabase/migrations/`:**
   - `20250704234915_add_missing_court_columns.sql`
   - `20250704235441_create_settings_tables.sql`
   - `20250704235709_create_players_matches_events_tables.sql`
   - `20250705001148_create_admin_user.sql`

### Option B: Using Command Line (If you have Supabase CLI)

```bash
# Link your local project to the cloud project
supabase link --project-ref your-project-ref

# Push migrations
supabase db push
```

## ✅ Step 5: Test Your Setup

Run the setup script to verify everything works:

```bash
node setup-supabase.js
```

This will:
- ✅ Verify your environment variables
- ✅ Test Supabase connection
- ✅ Check all database tables
- ✅ Test authentication
- ✅ Add sample data if needed

## 🎯 Step 6: Start Your Application

```bash
# Kill any existing dev server
pkill -f "npm run dev"

# Start fresh
npm run dev
```

Your app should now:
- ✅ Connect to real Supabase (no more mocks!)
- ✅ Have working authentication
- ✅ Display real data from the database
- ✅ Support all query methods (no more `.gte is not a function` errors)

## 🐛 Troubleshooting

### Error: "Missing Supabase environment variables"
- Double-check your `.env.local` file has the correct values
- Make sure there are no extra spaces or quotes
- Restart your dev server after changing environment variables

### Error: "Connection test failed"
- Verify your Project URL is correct (should end with `.supabase.co`)
- Check that your Service Role Key is correct (very long string starting with `eyJ`)
- Make sure your Supabase project is active (not paused)

### Error: "Table does not exist"
- Run the database migrations in your Supabase dashboard
- Check the SQL Editor for any error messages
- Verify you're connected to the right project

### Auth Issues
- Make sure you've enabled email authentication in Supabase
- Go to Authentication > Settings in your Supabase dashboard
- Enable "Enable email confirmations" if you want email verification

## 📊 Accessing Your Data

- **Supabase Dashboard**: Visit your project URL (without `/rest/v1`)
- **Table Editor**: View and edit data directly
- **SQL Editor**: Run custom queries
- **Authentication**: Manage users
- **API Docs**: Auto-generated documentation

## 🎉 Success!

Once complete, you'll have:
- ✅ Real Supabase database (no more mocks)
- ✅ Working authentication system
- ✅ All query methods available
- ✅ Persistent data storage
- ✅ Production-ready setup

## 🚀 Optional: Deploy to Production

When ready for production:
1. Create a new Supabase project for production
2. Add production environment variables to your hosting platform
3. Run migrations on production database
4. Update DNS and domains in Supabase settings

---

**Need help?** Check the [Supabase documentation](https://supabase.com/docs) or run `node setup-supabase.js` to test your configuration.
