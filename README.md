# ▲Vercel/Feedback

A comprehensive feedback collection, reporting, and action platform for Vercel's Go-to-Market (GTM) team. This tool serves as a real-time source of truth for customer demand, supporting both product research and GTM escalations.

## 🎯 Purpose

This application is designed to provide **zero-friction, revenue-aligned, curated logging** of what GTM teams hear from customers and prospects. It's built to be the real-time source of truth for customer demand while supporting product research and GTM escalations.

### What This Tool IS For:
- ✅ Zero-friction logging of customer & prospect feedback
- ✅ Real-time source of truth for customer demand
- ✅ Reports and views by product area and account
- ✅ Outgoing pushes to product area '#firehose' Slack channels
- ✅ Supporting GTM escalations and product research

### What This Tool is NOT For:
- ❌ Replacement for roadmap docs or launch calendar
- ❌ Task management or responsibility assignment for Product teams
- ❌ Comprehensive reporting system (focused on key reports only)

## 🚀 Features

### Core Functionality
- **Feedback Collection**: Log and categorize customer feedback entries
- **Account Management**: Track customer accounts and their feedback history
- **Product Area Organization**: Categorize feedback by product areas
- **Search & Discovery**: Powerful search capabilities across all feedback data
- **Real-time Updates**: Live data from Supabase backend
- **Slack Integration**: Automatic pushes to product area channels

### Key Pages
- **Dashboard**: Activity feed with recent feedback and top submitters
- **Feedback Browser**: Interactive tables for exploring feedback items and customer entries
- **Account Views**: Detailed customer account information and feedback history
- **Feedback Detail**: Individual feedback item pages with entry management

## 🛠 Tech Stack

- **Framework**: Next.js 15.3.3 with React 19
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS 4
- **UI Components**: Radix UI primitives with custom components
- **Data Visualization**: Recharts
- **Drag & Drop**: @dnd-kit
- **Tables**: TanStack React Table
- **Animations**: tsparticles
- **Analytics**: Vercel Analytics & Speed Insights
- **Authentication**: Supabase Auth
- **External Integrations**: Snowflake SDK, Google One Tap

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- pnpm (enforced via preinstall script)

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd feedback
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Environment Configuration**
   Create a `.env.local` file with the following variables:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   # Add other required environment variables
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── accounts/          # Account management pages
│   ├── feedback/          # Feedback collection & browsing
│   ├── about/             # About page
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── accounts/          # Account-related components
│   ├── feedback/          # Feedback-related components
│   ├── layout/            # Layout components
│   └── ui/                # Reusable UI components
├── lib/                   # Utility libraries
│   ├── actions/           # Server actions
│   ├── supabase/          # Supabase client configuration
│   └── snowflake.ts       # Snowflake integration
└── types/                 # TypeScript type definitions
```

## 🔧 Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint errors

## 🌐 Deployment

The application is deployed on Vercel at: [https://gtmfeedback.vercel.app/](https://gtmfeedback.vercel.app/)

## 🤝 Contributing

For questions or contributions, please visit the **#project-gtmfeedback-app** Slack channel.

## 📊 Data Sources

- **Supabase**: Primary database for feedback entries, accounts, and user data
- **Snowflake**: External data source for account and opportunity information
- **Slack**: Integration for notifications and data pushes

## 🔐 Authentication

The application uses Supabase authentication with support for:
- Email/password authentication
- Google One Tap integration
- Session management

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop browsers
- Tablet devices
- Mobile devices

## 🎨 UI/UX Features

- **Modern Design**: Clean, professional interface with Tailwind CSS
- **Dark Mode**: Optimized for dark theme usage
- **Keyboard Shortcuts**: Power user features for efficient navigation
- **Search**: Global search functionality with keyboard shortcuts
- **Animations**: Smooth transitions and particle effects
- **Accessibility**: Built with accessibility in mind using Radix UI

---

**Questions?** Visit [#project-gtmfeedback-app](https://vercel.slack.com/archives/C094FVBAVLH) on Slack for support and discussions.