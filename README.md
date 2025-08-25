# SmartLager: Warehouse Management System

SmartLager is a comprehensive warehouse management system designed to streamline inventory, shipments, and client management. Built with Nuxt.js, it provides a modern and efficient interface for managing warehouse operations.

## Features

- **Client Management**: Add, edit, and manage client information.
- **Product Management**: Track and manage products, including adding new products and viewing product details.
- **Shipment Management**: Create and manage shipments with ease.
- **Supplier Management**: Manage supplier details and relationships.
- **User Management**: Administer user roles and permissions.
- **Localization**: Multi-language support (English, French, German).

## Setup

Make sure to install dependencies:

```bash
npm install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
npm run dev
```

## Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

## Folder Structure

- **assets/**: Contains CSS and other static assets.
- **composables/**: Reusable logic such as authentication and path utilities.
- **features/**: Modularized features like clients, products, shipments, and suppliers.
- **layouts/**: Application layouts.
- **pages/**: Application routes.
- **plugins/**: Nuxt plugins for extending functionality.
- **server/**: Backend server configuration.
- **types/**: TypeScript definitions.

## Deployment

Check out the [Nuxt deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
