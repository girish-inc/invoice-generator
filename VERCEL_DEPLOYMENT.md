# Vercel Frontend Deployment Guide

This guide explains how to deploy the Invoice Generator frontend to Vercel and connect it with the deployed backend on Render.

## Prerequisites

- Backend deployed on Render: `https://invoice-generator-backend-41i3.onrender.com`
- Vercel account
- GitHub repository connected to Vercel

## Deployment Steps

### 1. Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "New Project"
3. Import your GitHub repository
4. Select the root directory of your project

### 2. Configure Environment Variables in Vercel

In the Vercel dashboard, go to your project settings and add the following environment variable:

```
VITE_API_URL=https://invoice-generator-backend-41i3.onrender.com/api
```

**Important**: Make sure to set this for all environments (Production, Preview, and Development).

### 3. Configure Backend CORS in Render

After your Vercel app is deployed, you'll get a URL like `https://your-app-name.vercel.app`.

In your Render dashboard, add/update the following environment variable:

```
FRONTEND_URL=https://your-actual-vercel-app-url.vercel.app
```

Replace `your-actual-vercel-app-url` with your actual Vercel deployment URL.

### 4. Deploy

1. Vercel will automatically deploy when you push to your main branch
2. The build process will use the `vercel.json` configuration
3. The app will be available at your Vercel URL

## Configuration Files

### vercel.json
The project includes a `vercel.json` file with the correct configuration for Vite React deployment:

- Build command: `npm run build`
- Output directory: `dist`
- Framework: `vite`
- Environment variable mapping for `VITE_API_URL`

### Environment Variables

#### Frontend (Vercel)
- `VITE_API_URL`: Backend API URL (set to Render backend URL)

#### Backend (Render)
- `FRONTEND_URL`: Frontend URL (set to Vercel app URL)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: JWT secret for authentication
- `NODE_ENV`: Set to `production`
- `PORT`: Set to `10000`

## Testing the Deployment

1. Visit your Vercel app URL
2. Test user registration and login
3. Test invoice generation and PDF download
4. Verify all API calls are working correctly

## Troubleshooting

### CORS Issues
- Ensure `FRONTEND_URL` is correctly set in Render with your actual Vercel URL
- Check that the backend CORS configuration allows your frontend domain

### API Connection Issues
- Verify `VITE_API_URL` is correctly set in Vercel
- Check that the backend is running and accessible at the Render URL
- Test API endpoints directly using the Render URL

### Build Issues
- Check Vercel build logs for any errors
- Ensure all dependencies are properly listed in `package.json`
- Verify TypeScript compilation is successful

## Manual Deployment Steps Summary

1. **Vercel Setup**:
   - Import repository
   - Set `VITE_API_URL=https://invoice-generator-backend-41i3.onrender.com/api`
   - Deploy

2. **Render Update**:
   - Update `FRONTEND_URL` with your Vercel app URL
   - Redeploy backend service

3. **Test**:
   - Verify frontend-backend communication
   - Test all application features

Your Invoice Generator application will now be fully deployed with frontend on Vercel and backend on Render!