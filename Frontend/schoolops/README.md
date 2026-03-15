# SchoolOps Frontend

A modern React-based frontend application for the SchoolOps school management system. This application provides a comprehensive platform for administrators, teachers, and students to manage school operations, including user accounts, courses, attendance, assignments, and more.

## Tech Stack

- **Frontend Framework**: React 19.2.0
- **Build Tool**: Vite 7.2.4
- **Routing**: React Router DOM 7.13.0
- **HTTP Client**: Axios 1.13.5
- **Styling**: CSS (with potential for additional styling libraries)
- **Linting**: ESLint 9.39.1
- **Deployment**: Vercel (configured for SPA routing)

## Prerequisites

Before setting up the project locally, ensure you have the following installed:

- **Node.js**: Version 18.x or higher (LTS recommended)
- **npm**: Comes with Node.js, or use Yarn/PNPM if preferred
- **Git**: For version control
- **Backend API**: The application expects a backend API running on `http://localhost:8080` (see API Integration section)

## Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/kaws26/SchoolOps.git
   cd SchoolOps/Frontend/schoolops
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Environment Setup**:
   - The application is configured to connect to a backend API at `http://localhost:8080`
   - Ensure your backend server is running on this port
   - If you need to change the API URL, update `src/config.js`

## Running the Application

### Development Mode
```bash
npm run dev
```
This starts the Vite development server with hot module replacement (HMR). The application will be available at `http://localhost:5173`.

### Production Build
```bash
npm run build
```
This creates an optimized production build in the `dist` directory.

### Preview Production Build
```bash
npm run preview
```
This serves the production build locally for testing.

### Linting
```bash
npm run lint
```
Runs ESLint to check for code quality issues.

## Project Structure

```
schoolops/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Images, icons, etc.
│   ├── components/        # Reusable UI components
│   │   ├── common/        # Shared components
│   │   └── layout/        # Layout components (Navbar, Layouts)
│   ├── pages/             # Page components
│   │   ├── admin/         # Admin-specific pages
│   │   ├── student/       # Student-specific pages
│   │   ├── teacher/       # Teacher-specific pages
│   │   └── Home.jsx       # Public pages (Login, Signup, etc.)
│   ├── utils/             # Utility functions
│   │   ├── api.js         # Axios API client configuration
│   │   └── auth.js        # Authentication utilities
│   ├── App.jsx            # Main App component
│   ├── config.js          # API base URL configuration
│   ├── index.css          # Global styles
│   ├── main.jsx           # Application entry point
│   └── routes.jsx         # Route definitions
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite configuration
├── vercel.json            # Vercel deployment configuration
└── README.md              # This file
```

## API Integration

The application communicates with a backend API using Axios. Key details:

- **Base URL**: Configured in `src/config.js` (defaults to `http://localhost:8080`)
- **API Client**: Centralized in `src/utils/api.js`
- **Authentication**: JWT-based, handled in `src/utils/auth.js`
- **Proxy**: Vite dev server proxies `/api` requests to the backend during development

### Authentication Flow

- JWT tokens are stored in localStorage
- Auth headers are automatically included in API requests
- Protected routes redirect to login if not authenticated
- Logout clears the token and redirects to login

## Deployment

The application is configured for deployment on Vercel:

- **SPA Routing**: `vercel.json` handles client-side routing
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

To deploy:
1. Connect your GitHub repository to Vercel
2. Configure the build settings as above
3. Deploy automatically on push to main branch

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

### Code Style
- Use ESLint for code linting
- Follow React best practices
- Use meaningful commit messages
- Test your changes thoroughly

## Troubleshooting

### Common Issues

1. **API Connection Issues**:
   - Ensure the backend is running on `http://localhost:8080`
   - Check `src/config.js` for the correct API URL

2. **Build Errors**:
   - Run `npm install` to ensure all dependencies are installed
   - Clear node_modules and reinstall if issues persist

3. **Linting Errors**:
   - Run `npm run lint` to identify issues
   - Fix ESLint warnings and errors before committing

### Getting Help

- Check the issues section on GitHub
- Review the backend API documentation
- Contact the development team for support

## License

[Add license information here]
