# Overview
ChurPay is an enterprise-level church management and donation platform tailored for South African churches. It offers digital donations, member management, project fundraising, and financial oversight through a multi-role system. The platform provides world-class fintech infrastructure for donation processing, member engagement, project campaigns, and administrative oversight, ensuring compliance with South African financial regulations. Its business vision is to serve churches of all sizes, with the ambition of becoming a leading digital financial platform for religious organizations in South Africa.

## Current Status (August 4, 2025)
✅ **Core Platform Functional**: All major APIs working correctly
🔒 **MAXIMUM SECURITY CODE LOCK ACTIVE**: 29 core files protected with comprehensive integrity validation
✅ **Fee Structure Locked**: 3.9% + R3 per transaction permanently secured against modifications
✅ **Business Model Protected**: 90/10 revenue sharing model locked and validated
✅ **PayFast Integration Secured**: Merchant credentials and payment processing protected
✅ **Professional Dashboards Locked**: All banking-grade UI components protected
✅ **Registration System Complete**: Multi-step flows for churches and members fully secured
✅ **Super Admin Dashboard Fixed**: React rendering error resolved, all modals functional
✅ **Admin Authentication System**: Complete sign up/sign in with secure API integration
✅ **System Integrity Validation**: Real-time monitoring of protected constants and files
✅ **Admin Dashboard**: Professional interface with authentication middleware
🔴 **CRITICAL PROTECTION**: Unauthorized modifications will trigger system lockdown

# User Preferences
Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The client is built with React, TypeScript, and Vite, following a component-based architecture. It uses Radix UI with shadcn/ui for components, Tailwind CSS for styling with custom brand variables and gradients. State management is handled by React Query, routing by Wouter, and form validation by React Hook Form with Zod schemas. Data visualization is powered by Recharts. The application implements role-based routing for distinct user experiences (super admin, church admin, church staff, members, public users).

## Backend Architecture
The server is built with Express.js, Node.js, TypeScript, and ESM modules, following a RESTful API design pattern. It uses Drizzle ORM for type-safe database operations and integrates with Replit Auth for session-based authentication. The file structure is modular, separating routes, storage, and database configurations.

## Data Storage Solutions
PostgreSQL is the primary database, hosted on Neon Database. It features a comprehensive relational schema with foreign key relationships and PostgreSQL enums for status fields. Drizzle Kit is used for database migrations, and Neon serverless connection pooling ensures optimal performance. Key tables include users, churches, projects, transactions, payouts, and activity logs.

## Authentication and Authorization
The system uses Replit Auth for user authentication with a five-tier role-based access control system (superadmin, church_admin, church_staff, member, public). Session management is PostgreSQL-backed, and users are linked to specific churches for scoped access. Security measures include secure session handling with HTTP-only cookies and CSRF protection.

## UI/UX Decisions
The platform features a professional, enterprise-grade dark theme financial dashboard. It incorporates modern fintech styling, comprehensive sidebar navigation, and enterprise-grade headers. Visual elements include gradient finance cards, interactive charts, and dynamic displays for projects and giving history. Design patterns emphasize a unified, professional appearance across all dashboards, utilizing consistent ChurPay branding with purple/yellow gradients and professional visual hierarchy inspired by fintech industry standards. Components like backdrop-blur glass effects and professional quick action cards contribute to a premium user experience.

## Feature Specifications
Core features include:
- Digital wallet management for members, with achievement systems, reward points, and budget tracking.
- Advanced financial analytics for churches, showing member engagement and revenue sharing.
- Unified donation modal system (EnhancedDonationModal) handling all transaction types (donation, tithe, project sponsorship, wallet top-up).
- Comprehensive financial analytics integration across all dashboard levels (member, church, Super Admin) with multi-chart analysis.
- Super Admin dashboard with multi-tab system for overseeing churches, payouts, members, and system performance.
- Role-based access control ensuring tailored user experiences.
- A pay-per-transaction pricing model (3.9% + R3 per transaction) with a 10% annual revenue sharing benefit for churches.

# External Dependencies

## Cloud Storage
- **Google Cloud Storage**: Used for file uploads and asset management.
- **Uppy**: Client-side file upload handling.

## Payment Processing
The architecture is designed for South African payment methods, ready for integration with:
- Local payment processors.
- South African banking systems.

## Development Tools
- **Replit Integration**: Native Replit development environment support.