# Pekosite

## Environment Variables Setup

### Development
Create a `.env.local` file in the root directory with your development environment variables.

### Production
Create a `.env.production` file in the root directory with your production environment variables.

**Required Production Environment Variables:**

```env
# Application URL (used for logout redirects and metadata)
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# NextAuth Configuration (should match NEXT_PUBLIC_APP_URL)
NEXTAUTH_URL=https://yourdomain.com

# NextAuth Secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET=your-nextauth-secret-here

# JWT Secret (generate with: openssl rand -base64 32)
JWT_SECRET=your-jwt-secret-here

# Google OAuth Credentials (from Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# reCAPTCHA Site Key (for production)
RECAPTCHA_SITE_KEY=your-recaptcha-site-key

# Node Environment
NODE_ENV=production
```

**Optional Environment Variables:**

```env
# API URL (if different from NEXT_PUBLIC_APP_URL)
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Important Notes

- **NEXT_PUBLIC_APP_URL**: This is critical for logout functionality. It should be your production domain (e.g., `https://yourdomain.com`), NOT `http://0.0.0.0:3000` or `http://localhost:3000`.
- **NEXTAUTH_URL**: Should match `NEXT_PUBLIC_APP_URL` for proper authentication redirects.
- Next.js automatically loads `.env.production` when `NODE_ENV=production`.
- The `docker-compose.yml` file is configured to mount `.env.production` into the container.

## Running in Production

1. Create `.env.production` file with your production values
2. Update `NEXT_PUBLIC_APP_URL` and `NEXTAUTH_URL` to your production domain
3. Build and start with Docker Compose:
   ```bash
   docker-compose up -d --build
   ```


