# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
- `npm run dev` - Start development server on port 3000 (with HTTPS via mkcert)
- `npm run build` - Build for production using Vite
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint with TypeScript and React rules

### Code Quality
The project uses strict linting with ESLint, Prettier, and import ordering:
- ESLint rules include React hooks validation and unused imports cleanup
- Import order: React modules → external modules → internal (@/) → relative imports
- Prettier with 120 character line width and sorted imports

## Architecture & Technology Stack

### Core Technologies
- **React 18** with TypeScript and Vite as build tool
- **Tailwind CSS** with shadcn/ui component library
- **React Router v6** for routing with role-based access control
- **TanStack Query** for server state management and caching
- **Axios** with CSRF token support for API communication
- **React Hook Form** with Zod validation
- **React Aclify** for role-based access control

### Project Structure

#### Module-Based Architecture
The application follows a module-based structure in `src/modules/`:
```
modules/
├── agency/          - Marketing agency management
├── branch/          - Branch management
├── claim/           - General claims management
├── claim-types/     - Claim type configuration
├── leave/           - Leave management
├── marketing/       - Marketing claims
├── marketing-types/ - Marketing claim type configuration
├── overview/        - Dashboard
├── team/            - Team management
├── user/            - User management
└── website/         - Website management
```

Each module typically contains:
- `columns.tsx` - TanStack Table column definitions
- `pages/` - Route components for listing and details
- `type.ts` - TypeScript type definitions
- `components/` - Module-specific components

#### Shared Components
- `src/components/ui/` - shadcn/ui components and custom UI components
- `src/components/ui/data-table/` - Reusable data table components with filtering, pagination, and sorting
- `src/components/ui/auto-form/` - Dynamic form generation from Zod schemas
- `src/components/ui/details-form/` - Form components for detail/edit pages

### Role-Based Access Control (RBAC)
The application uses a comprehensive role system defined in `src/acl.ts`:
- **Roles**: BOSS, DIRECTOR, BRANCH_MANAGER, CREDIT_OFFICER, ENGINEER, HR
- **Access Control**: Uses `CanAccess` component and `NoAccess` wrapper for route protection
- **Role Groups**: Predefined groups like `ADMIN_ONLY`, `ALL`, `NOT_HR` for common access patterns

### Data Layer Architecture
- **API Client**: Centralized Axios instance in `src/axios.ts` with automatic CSRF token handling
- **State Management**: TanStack Query for server state with optimistic updates
- **Data Tables**: Reusable data table system supporting server-side pagination, sorting, and filtering
- **Form Handling**: React Hook Form + Zod validation with auto-generated forms from schemas

### Authentication & Authorization
- Cookie-based authentication with CSRF protection
- Session management through `AclProvider` wrapper
- Protected routes using role-based access control
- Account management with password change functionality

### UI/UX Patterns
- **Theme Support**: Dark/light mode toggle with persistent storage
- **Responsive Design**: Mobile-first approach with responsive navigation
- **Loading States**: Consistent loading indicators throughout the application  
- **Toast Notifications**: User feedback via toast system
- **Modal/Drawer**: Responsive modal system that adapts to screen size

## Development Guidelines

### Component Patterns
- Use the established data table pattern for listing pages
- Implement details pages with the `useDetailsPageHook` for consistent create/edit behavior
- Follow the module structure when adding new features
- Use TypeScript types from the respective module's `type.ts` file

### Routing Patterns
- Main routes defined in `src/router.tsx` with nested route structure
- Access control applied at route level using `NoAccess` wrapper
- Navigation defined in `src/components/layout/main.tsx` with role-based visibility

### State Management Patterns
- Use TanStack Query for all server state management
- Implement optimistic updates for better UX
- Use React Hook Form for all form state management
- Leverage Zod schemas for both validation and auto-form generation

### API Integration Patterns
- All API calls go through the centralized Axios client
- Use consistent query keys following the pattern: `[entity, ...dependencies]`
- Implement proper error handling with toast notifications
- Support server-side pagination, filtering, and sorting in listing pages

### Styling Guidelines
- Use Tailwind CSS utility classes
- Leverage CSS custom properties for theming
- Follow shadcn/ui component patterns for consistency
- Maintain responsive design principles throughout

## Environment Configuration
- `VITE_API_URL` - Backend API URL for Axios client
- Development server runs on port 3000 with HTTPS via mkcert plugin
- Path aliases configured with `@/` pointing to `src/` directory