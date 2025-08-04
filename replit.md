# Overview

ChurPay is a comprehensive church management and donation platform designed specifically for South African churches. The application facilitates digital donations, member management, project fundraising, and financial oversight through a multi-role system. It serves churches of all sizes by providing tools for donation processing, member engagement, project campaigns, and administrative oversight, while ensuring compliance with South African financial regulations.

# User Preferences

Preferred communication style: Simple, everyday language.

# Recent Changes

## Pricing Model Update (January 2025)
- Removed subscription tiers and free trial system
- Implemented simple pay-per-transaction model: 3.9% + R3 per transaction  
- Updated landing page to reflect new pricing structure
- Added fee calculation utilities in shared schema
- No monthly fees, setup costs, or subscription charges

## Code Protection System Implementation (January 2025)
- Implemented comprehensive code locking system
- Protected core files from unauthorized modifications
- Locked fee structure (3.9% + R3) against changes
- Created protection monitoring and logging
- Documented all protected files and modification rules
- Only explicitly requested changes permitted on locked files

# System Architecture

## Frontend Architecture
The client application is built using **React with TypeScript** and **Vite** as the build tool. The frontend follows a component-based architecture with:

- **UI Framework**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom ChurPay brand variables and gradients
- **State Management**: React Query (TanStack Query) for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation schemas
- **Charts**: Recharts for data visualization and reporting

The application implements role-based routing with distinct dashboard experiences for different user types (super admin, church admin, church staff, members, and public users).

## Backend Architecture
The server is built with **Express.js** and follows a RESTful API design pattern:

- **Runtime**: Node.js with TypeScript and ESM modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Authentication**: Replit Auth integration with session-based authentication
- **File Structure**: Modular design with separate routes, storage layer, and database configuration
- **API Design**: RESTful endpoints with proper error handling and logging middleware

## Data Storage Solutions
The application uses **PostgreSQL** as the primary database with **Neon Database** as the hosting provider:

- **Schema Design**: Comprehensive relational schema with proper foreign key relationships
- **Enums**: PostgreSQL enums for status fields (user roles, church status, transaction status, etc.)
- **Migrations**: Drizzle Kit for database schema migrations
- **Connection Pooling**: Neon serverless connection pooling for optimal performance

Key database tables include users, churches, projects, transactions, payouts, and activity logs with proper indexing and relationships.

## Authentication and Authorization
The system implements **Replit Auth** for user authentication with role-based access control:

- **Session Management**: PostgreSQL-backed session storage
- **Role System**: Five-tier role system (superadmin, church_admin, church_staff, member, public)
- **Church Association**: Users are linked to specific churches for scoped access
- **Security**: Secure session handling with HTTP-only cookies and CSRF protection

## External Service Integrations

### Cloud Storage
- **Google Cloud Storage**: For file uploads and asset management
- **Uppy**: Client-side file upload handling with drag-and-drop interface

### Payment Processing
The application is architected to support South African payment methods:
- **Payment Gateway Integration**: Ready for integration with local payment processors
- **Banking Integration**: Support for South African banking systems with proper validation
- **Transaction Management**: Comprehensive transaction tracking and status management

### Development Tools
- **Replit Integration**: Native Replit development environment support
- **Development Overlays**: Runtime error modals and development banners
- **Hot Reload**: Vite HMR for efficient development workflow

The architecture supports scalable multi-tenant church management with proper data isolation, comprehensive audit trails, and flexible payment processing suitable for the South African market.