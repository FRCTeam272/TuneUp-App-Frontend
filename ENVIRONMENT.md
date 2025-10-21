# Environment Configuration

This project uses different environment files for development and production:

## Environment Files

- **`.env.dev`** - Used during development (localhost backend)
- **`.env`** - Used during production builds (Heroku backend)

## Available Commands

### Development (uses .env.dev)
```bash
npm run develop          # Standard development server
npm run develop:ssr      # Development server with SSR enabled  
npm start                # Alias for develop
```

### Production Build (uses .env)
```bash
npm run build            # Production build
npm run build:ssr        # Production build + serve
npm run serve            # Serve built files
```

### Development Build (uses .env.dev)
```bash
npm run build:dev        # Build using development environment
```

## Environment Variables

Both files should contain:
```bash
GATSBY_TIMER=2:30
GATSBY_SHOW_FORM=false
GATSBY_BACKEND_URL=<backend-url>
GATSBY_DIVISOR=3
```

The system automatically selects the appropriate environment file based on NODE_ENV.