# שיבוץ+ (ShibutzPlus)

Shibutz Plus built with Next.js 15.3.3.

## Tech Stack

- **Next.js 15.3.3** with App Router
- **TypeScript** for type safety
- **CSS Modules** for component-scoped styling
- **Next-Auth** for authentication
- **MongoDB** for database
- **Mongoose** for MongoDB schema
- **Nodemailer** for email sending
- **React Email** for email templates

## Architecture Overview

```
src/
├── app/                # App Router pages and layouts
│   ├── (auth)/         # Authentication pages (login, register) - route group
│   ├── (private)/      # Protected pages requiring authentication
│   └── (public)/       # Public pages accessible to all users
│
├── components/         # Reusable UI components
│   └── ui/             # Shared UI components (buttons, inputs, etc.)
│
├── context/            # Context providers
├── emails/             # Email templates
├── models/             # Types, Constants and MongoDB schemas
├── resources/          # Text resources
├── routes/             # Route definitions and protection logic
├── services/           # Logic services
├── styles/             # UI that not fit the components
├── lib/                # Big utils functions
└── utils/              # Small utils functions
```

## App Router

- **Route Groups**: The `(auth)`, `(private)`, and `(public)` directories are route groups that don't affect the URL structure but help organize code logically.

- **Layouts**: Each route group has its own layout that wraps the pages within that group, allowing for shared UI elements.

- **Page Structure**: Each page is defined by a `page.tsx` file within its respective directory.

- **Nested Routing**: The App Router supports nested routes, allowing for complex page hierarchies.

Example of how routes map to the filesystem:

- `/login` → `src/app/(auth)/login/page.tsx`
- `/register` → `src/app/(auth)/register/page.tsx`
- `/dashboard` → `src/app/(private)/dashboard/page.tsx`
- `/about` → `src/app/(public)/about/page.tsx`

## Use Client / Use Server

All components are server components by default. They run only on the server and send HTML to the client.

Add the `"use client"` directive at the top of the file to make it a client component. 

When to add `"use client"`:
1. When you need to use React hooks (`useState`, `useEffect`, `useContext`, etc.)
2. When you need browser-only APIs (like `window`, `document`, etc.)
3. When you need event listeners (`onClick`, `onChange`, etc.)
4. When using client-side libraries that depend on the DOM
5. When using styled-jsx or other client-side styling solutions

## Authentication with Next-Auth

The application uses Next-Auth for authentication. 
On client components use the `useSession` hook 
On server components use the `getServerSession` function. 
Protected routes are handled by middleware that checks for valid sessions.

```tsx
// Client component example
import { useSession } from "next-auth/react";

const MyComponent = () => {
  const { data: session } = useSession();
  return session ? <p>Logged in as {session.user.name}</p> : <p>Not logged in</p>;
};
```

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```
# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here

# Database
DB_HOST=your-db-host
DB_NAME=your-db-name
DB_USER=your-db-username
DB_PASSWORD=your-db-password
MONGODB_URI=your-mongodb-connection-string

# Email
EMAIL_USER=shibutzplus@gmail.com
EMAIL_PASS=your-email-password

# Company Information
COMPANY_NAME=שיבוץ+
WEBSITE_URL=https://shibutzplus.com
LOGO_URL=https://shibutzplus.com/logo.png
```

## Getting Started

```bash
npm install
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.