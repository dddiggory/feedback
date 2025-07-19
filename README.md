# GTM Feedback Collection Platform

**Vercel's home for GTM (Go-To-Market) feedback collection, reporting, and action**

🔗 **Live Application**: https://gtmfeedback.vercel.app/

## Overview

This is a comprehensive feedback management platform built for Vercel's GTM team to collect, organize, and act on product feedback from customers and internal stakeholders. The application provides structured feedback collection, customer account management, analytics, and collaboration features.

## Key Features

### 📝 Feedback Management
- **Structured Feedback Collection**: Organize feedback into categorized items with detailed descriptions
- **Customer Entry Tracking**: Link specific feedback entries to customer accounts and opportunities
- **Product Area Organization**: Categorize feedback by product areas for better organization
- **Status Tracking**: Monitor feedback status and progress through resolution

### 👥 Account Management
- **Customer Account Profiles**: Detailed view of customer accounts with ARR tracking
- **Company Integration**: Automatic logo fetching and company website integration
- **Opportunity Tracking**: Link feedback to sales opportunities and revenue impact

### 📊 Analytics & Reporting
- **Activity Feed**: Real-time feed of recent feedback submissions
- **Submitter Leaderboard**: "ITG Hall of Fame" tracking top contributors
- **Revenue Impact Analysis**: Track ARR associated with feedback items
- **Visual Analytics**: Charts and graphs for feedback trends and insights

### 🔍 Search & Discovery
- **Global Search**: Powerful search across all feedback items and entries
- **Advanced Filtering**: Filter by product areas, accounts, submitters, and more
- **Command Palette**: Quick navigation with keyboard shortcuts
- **Interactive Tables**: Sortable and filterable data tables

### 🔐 Authentication & Collaboration
- **Google OAuth Integration**: Seamless authentication with Google accounts
- **User Profiles**: Track individual contributor activity and history
- **Collaborative Comments**: Discussion threads on feedback items
- **Role-based Access**: Secure access control for team members

## Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS 4** - Utility-first styling
- **Radix UI** - Accessible component primitives
- **React Table** - Advanced table functionality
- **Recharts** - Data visualization
- **SWR** - Data fetching and caching

### Backend & Database
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Supabase Auth** - Authentication and user management
- **Snowflake Integration** - Data warehouse connectivity

### Development & Deployment
- **pnpm** - Fast, disk space efficient package manager
- **ESLint** - Code linting and formatting
- **Vercel** - Hosting and deployment platform
- **Vercel Analytics** - Performance monitoring

## Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (required - other package managers are blocked)
- Supabase account and project
- Environment variables configured

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd feedback
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Setup**
   Create environment variables for:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Additional Supabase and integration keys

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open the application**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm lint:fix     # Fix ESLint issues
```

## Application Structure

### Key Routes
- `/` - Dashboard with activity feed and top submitters
- `/feedback` - Browse all feedback items and customer entries
- `/feedback/new` - Create new feedback items
- `/feedback/[slug]` - Individual feedback item details
- `/accounts` - Customer account management
- `/accounts/[slug]` - Individual account details
- `/analytics` - Feedback analytics and reporting
- `/areas` - Product area management
- `/user` - User profile and activity

### Database Schema
The application uses Supabase with views and tables for:
- Feedback items and entries
- Customer accounts and opportunities
- Product areas and categorization
- User profiles and authentication
- Analytics and reporting data

## Key Features Detail

### Dashboard
- **Activity Feed**: Recent feedback submissions with customer context
- **Hall of Fame**: Top contributors leaderboard for the past 30 days
- **Quick Actions**: Global search and keyboard shortcuts
- **Navigation Links**: Access to launch calendar and documentation

### Feedback System
- **Structured Items**: Organize feedback into categorized items
- **Customer Entries**: Link specific feedback to customer accounts
- **Impact Tracking**: Monitor revenue impact and opportunity connections
- **Collaborative Tools**: Comments and discussion threads

### Account Management
- **Customer Profiles**: Comprehensive account information
- **ARR Tracking**: Annual Recurring Revenue monitoring
- **Opportunity Links**: Connection to sales opportunities
- **Company Branding**: Automatic logo and website integration

## Contributing

This is an internal Vercel project for GTM feedback management. For questions or contributions, please reach out to the GTM or product teams.

## Related Resources

- [Launch Calendar](https://www.notion.so/vercel/Launch-Calendar-4b4542b694974f269bb81b3ccc99e009) - Product launch tracking
- Internal documentation and processes
- GTM team guidelines and workflows