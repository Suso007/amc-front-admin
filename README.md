# AMC Management Frontend

A modern, responsive frontend application for AMC (Annual Maintenance Contract) management built with Next.js 16, TypeScript, and shadcn/ui.

## Features

- 🔐 **Authentication** - JWT-based auth with role-based access control
- 🎨 **Modern UI** - Built with shadcn/ui components
- 🌓 **Dark/Light Mode** - Theme switching with next-themes
- 📱 **Fully Responsive** - Mobile, tablet, and desktop support
- 🔄 **Real-time Updates** - Apollo Client for GraphQL integration
- 📊 **Dashboard** - Statistics and recent data overview
- ✏️ **CRUD Operations** - Full create, read, update, delete for all entities
- 🎯 **Type Safe** - Full TypeScript coverage
- 🚀 **Fast** - Built on Next.js 16 with App Router

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **GraphQL Client**: Apollo Client
- **State Management**: Zustand
- **Form Handling**: react-hook-form + zod
- **Theme**: next-themes
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend GraphQL server running

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Create `.env.local` file:

```env
NEXT_PUBLIC_GRAPHQL_URL=http://localhost:4000/admin/graphql
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── (admin)/           # Protected admin routes
│   ├── login/             # Login page
│   └── no-access/         # Access denied page
├── components/            # React components
│   ├── layout/           # Layout components (sidebar, header)
│   └── ui/               # shadcn/ui components
├── graphql/              # GraphQL queries and mutations
├── lib/                  # Utility functions and configurations
├── store/                # Zustand state management
└── types/                # TypeScript type definitions
```

## Available Pages

### Fully Implemented
- ✅ Dashboard - Statistics and overview
- ✅ Brands - Full CRUD operations
- ✅ Categories - Full CRUD operations
- ✅ Mail Settings - SMTP configuration
- ✅ Profile - User profile display

### Placeholder (Need Implementation)
- 📝 Products - With brand and category associations
- 📝 Customers - With locations management
- 📝 Invoices - With invoice items

## Authentication

The application uses JWT tokens for authentication:

1. Login with email and password
2. Token stored in localStorage and cookies
3. Role-based access control (admin/user)
4. Protected routes via middleware

**Default credentials** (from backend):
- Check your backend for admin credentials

## Development

### Adding a New Page

1. Create page file in `app/(admin)/your-page/page.tsx`
2. Add route to sidebar in `components/layout/app-sidebar.tsx`
3. Create GraphQL queries/mutations in `graphql/`
4. Add Zustand store if needed in `store/index.ts`
5. Implement CRUD operations using Apollo Client

### Using shadcn/ui Components

```bash
npx shadcn@latest add [component-name]
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_GRAPHQL_URL` | GraphQL backend endpoint | Yes |

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT

## Support

For support, email your-email@example.com or open an issue in the repository.
