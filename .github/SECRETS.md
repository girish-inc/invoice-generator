# GitHub Actions Secrets Configuration

This document explains how to set up the required secrets for automated CI/CD deployment.

## Required Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

### Vercel Secrets

1. **VERCEL_TOKEN**
   - Go to [Vercel Account Settings](https://vercel.com/account/tokens)
   - Create a new token with appropriate scope
   - Copy the token value

2. **VERCEL_ORG_ID**
   - Go to your Vercel team/account settings
   - Copy the Team ID (or Personal Account ID)

3. **VERCEL_PROJECT_ID**
   - Go to your Vercel project settings
   - Copy the Project ID from the General tab

### Render Secrets

1. **RENDER_SERVICE_ID**
   - Go to your Render service dashboard
   - Copy the Service ID from the URL or service settings
   - Format: `srv-xxxxxxxxxxxxxxxxxx`

2. **RENDER_API_KEY**
   - Go to [Render Account Settings](https://dashboard.render.com/account)
   - Create a new API key
   - Copy the key value

## Setting Up Secrets

1. Navigate to your GitHub repository
2. Click on "Settings" tab
3. In the left sidebar, click "Secrets and variables" → "Actions"
4. Click "New repository secret"
5. Add each secret with the exact name and value

## Verification

After setting up all secrets:

1. Push a commit to the main branch
2. Check the "Actions" tab in your GitHub repository
3. Verify that the workflow runs successfully
4. Check deployment status in Vercel and Render dashboards

## Security Notes

- Never commit secrets to your repository
- Regularly rotate API keys and tokens
- Use environment-specific secrets for different branches if needed
- Review secret access permissions regularly

## Troubleshooting

- **Invalid token errors**: Verify token has correct permissions
- **Service not found**: Check service ID format and existence
- **Deployment failures**: Check service logs in respective platforms
- **Permission denied**: Ensure tokens have deployment permissions