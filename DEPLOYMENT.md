# Deployment Guide

This guide provides step-by-step instructions for deploying the Invoice Generator application to production using Vercel (frontend) and Render (backend).

## Prerequisites

- GitHub account
- Vercel account (free tier available)
- Render account (free tier available)
- MongoDB Atlas account (for database)

## Backend Deployment (Render)

### 1. Prepare Your Repository

1. Push your code to a GitHub repository
2. Ensure all configuration files are committed:
   - `render.yaml`
   - `server/package.json`
   - `tsconfig.server.json`

### 2. Deploy to Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `invoice-generator-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build:server`
   - **Start Command**: `node dist/server.js`
   - **Auto-Deploy**: `Yes`

### 3. Set Environment Variables

In Render dashboard, add these environment variables:

```
NODE_ENV=production
PORT=10000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
FRONTEND_URL=https://your-frontend-domain.vercel.app
```

### 4. Get Backend URL

After deployment, note your backend URL (e.g., `https://your-backend.onrender.com`)

## Frontend Deployment (Vercel)

### 1. Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` (or leave empty)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### 2. Set Environment Variables

In Vercel dashboard, add this environment variable:

```
VITE_API_URL=https://your-backend.onrender.com/api
```

### 3. Update Backend CORS

After getting your Vercel domain, update the `FRONTEND_URL` environment variable in Render with your actual Vercel domain.

## Database Setup (MongoDB Atlas)

### 1. Create MongoDB Cluster

1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Create a new cluster (free tier available)
3. Create a database user
4. Whitelist IP addresses (or use 0.0.0.0/0 for all IPs)

### 2. Get Connection String

1. Click "Connect" on your cluster
2. Choose "Connect your application"
3. Copy the connection string
4. Replace `<password>` with your database user password
5. Use this as your `MONGO_URI` environment variable

## CI/CD Setup (Optional)

### GitHub Actions for Automated Deployment

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Render
        run: |
          curl -X POST "https://api.render.com/deploy/srv-${{ secrets.RENDER_SERVICE_ID }}?key=${{ secrets.RENDER_API_KEY }}"
```

## Verification Steps

1. **Backend Health Check**: Visit `https://your-backend.onrender.com/` - should return API status
2. **Frontend Access**: Visit your Vercel domain - should load the application
3. **API Connection**: Test login/registration to verify frontend-backend communication
4. **Database Connection**: Verify data persistence by creating and retrieving products

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure `FRONTEND_URL` is correctly set in backend environment variables
2. **API Connection Failed**: Verify `VITE_API_URL` points to correct backend domain
3. **Database Connection**: Check MongoDB connection string and IP whitelist
4. **Build Failures**: Ensure all dependencies are listed in package.json

### Logs

- **Render Logs**: Available in Render dashboard under "Logs" tab
- **Vercel Logs**: Available in Vercel dashboard under "Functions" tab

## Security Considerations

1. Use strong, unique JWT secrets
2. Regularly rotate database passwords
3. Enable MongoDB IP whitelisting
4. Use HTTPS for all communications
5. Keep dependencies updated

## Monitoring

- Set up Render service monitoring
- Configure Vercel analytics
- Monitor database usage in MongoDB Atlas
- Set up error tracking (e.g., Sentry)

## Scaling

- **Render**: Upgrade to paid plans for better performance and scaling
- **Vercel**: Automatic scaling included
- **Database**: Monitor and upgrade MongoDB Atlas tier as needed

For support, refer to the respective platform documentation:
- [Render Documentation](https://render.com/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)