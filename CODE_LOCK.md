# ChurPay Code Protection System

## 🔒 LOCKED CORE FILES
These files are protected and cannot be modified without explicit authorization:

### Database & Schema
- `shared/schema.ts` - Core database schema and fee calculations
- `server/db.ts` - Database configuration and connections
- `drizzle.config.ts` - Database migration configuration

### Authentication & Security
- `server/replitAuth.ts` - Replit authentication integration
- `server/storage.ts` - User storage and session management
- `client/src/hooks/useAuth.ts` - Authentication hooks
- `client/src/lib/authUtils.ts` - Authentication utilities

### Core Application Structure
- `server/index.ts` - Main server entry point
- `server/routes.ts` - API route definitions
- `client/src/App.tsx` - Main application router
- `client/src/main.tsx` - React application entry point
- `package.json` - Dependencies and scripts
- `vite.config.ts` - Build configuration
- `tailwind.config.ts` - Styling configuration

### Fee Structure & Payments
- Platform fee constants (3.9% + R3)
- Fee calculation utilities
- Transaction processing logic

## ✅ MODIFIABLE AREAS
Changes are permitted in these areas only when specifically requested:

### UI Components
- Individual page components for specific feature requests
- Styling updates for branding or UX improvements
- Component additions for new features

### Business Logic
- New feature implementations
- Dashboard enhancements
- Report generation
- Project management features

### Content & Copy
- Landing page text and messaging
- Help documentation
- User interface labels and descriptions

## 🛡️ PROTECTION RULES

1. **No Unauthorized Core Changes**: Core files cannot be modified without explicit user request
2. **Fee Structure Lock**: The 3.9% + R3 fee structure is locked and cannot be changed
3. **Authentication Lock**: Authentication flow and security measures are protected
4. **Database Schema Lock**: Core schema structure is protected (additions only with authorization)
5. **Build System Lock**: Vite, TypeScript, and build configurations are protected

## 📝 CHANGE LOG
All modifications to locked files must be documented here:

### January 2025
- Implemented pricing model update: 3.9% + R3 per transaction
- Removed subscription tiers system
- Added fee calculation utilities to schema
- Updated landing page pricing display

---
**WARNING**: Unauthorized modifications to locked files may compromise platform security, payment processing, or user data integrity.