# ▲ Vercel/Feedback

A feedback management system for Vercel's GTM team to track and organize customer feedback.

## Features

- **Feedback Management**: Log and organize customer feedback by product areas
- **Analytics Dashboard**: View feedback trends and insights
- **Account Management**: Track feedback by customer accounts
- **Real-time Updates**: Live updates with Supabase
- **Google OAuth**: Secure authentication with Google accounts

## Quick Start

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm
- Supabase account
- Google Cloud Console project

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

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your configuration:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Your Google OAuth client ID

4. **Run the development server**
   ```bash
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Development

### Code Quality

This project uses:
- **TypeScript** with strict type checking
- **ESLint** for code linting
- **Prettier** for code formatting
- **Structured logging** instead of console statements

### Available Scripts

- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm start` - Start production server
- `pnpm lint` - Run ESLint
- `pnpm lint:fix` - Fix ESLint issues automatically

### Project Structure

```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── feedback/       # Feedback-related components
│   ├── layout/         # Layout components
│   └── ui/             # Reusable UI components
├── lib/                # Utility libraries
│   ├── supabase/       # Supabase client configuration
│   └── actions/        # Server actions
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
└── config/             # Configuration files
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID | Yes |

## Contributing

1. Follow the existing code style and patterns
2. Use TypeScript with strict type checking
3. Write meaningful commit messages
4. Test your changes thoroughly
5. Update documentation as needed

## License

Internal Vercel project - not for public distribution.