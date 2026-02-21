# 🚀 Tangled-GPT Deployment Guide

This guide covers deploying Tangled-GPT to Azure Static Web Apps with Azure OpenAI integration.

## Prerequisites

- Azure subscription
- GitHub account
- Azure CLI installed
- Node.js 18+ installed

## Step 1: Create Azure Resources

### 1.1 Create Resource Group

```bash
# Login to Azure
az login

# Create resource group
az group create --name rg-tangled-gpt --location eastus
```

### 1.2 Create Azure OpenAI Resource

```bash
# Create Azure OpenAI resource
az cognitiveservices account create \
  --name aoai-tangled-gpt \
  --resource-group rg-tangled-gpt \
  --kind OpenAI \
  --sku S0 \
  --location eastus \
  --custom-domain aoai-tangled-gpt

# Get the endpoint
az cognitiveservices account show \
  --name aoai-tangled-gpt \
  --resource-group rg-tangled-gpt \
  --query "properties.endpoint" \
  --output tsv

# Get the key
az cognitiveservices account keys list \
  --name aoai-tangled-gpt \
  --resource-group rg-tangled-gpt \
  --query "key1" \
  --output tsv
```

### 1.3 Deploy GPT-4o Model

```bash
# Deploy GPT-4o model
az cognitiveservices account deployment create \
  --name aoai-tangled-gpt \
  --resource-group rg-tangled-gpt \
  --deployment-name gpt-4o \
  --model-name gpt-4o \
  --model-version "2024-05-13" \
  --model-format OpenAI \
  --sku-capacity 10 \
  --sku-name Standard
```

> **Note**: Model availability varies by region. If gpt-4o is not available, use gpt-4 or gpt-35-turbo.

### 1.4 Create Azure Static Web App

```bash
# Create Static Web App
az staticwebapp create \
  --name swa-tangled-gpt \
  --resource-group rg-tangled-gpt \
  --source https://github.com/YOUR_USERNAME/tangled-gpt \
  --location "East US 2" \
  --branch main \
  --app-location "/" \
  --output-location "build" \
  --login-with-github
```

## Step 2: Configure GitHub Repository

### 2.1 GitHub Actions Workflow

The Azure Static Web Apps CLI will automatically create a GitHub Actions workflow. Verify it exists at `.github/workflows/azure-static-web-apps-*.yml`.

If not, create it manually:

```yaml
# .github/workflows/azure-static-web-apps.yml
name: Azure Static Web Apps CI/CD

on:
  push:
    branches:
      - main
  pull_request:
    types: [opened, synchronize, reopened, closed]
    branches:
      - main

jobs:
  build_and_deploy_job:
    if: github.event_name == 'push' || (github.event_name == 'pull_request' && github.event.action != 'closed')
    runs-on: ubuntu-latest
    name: Build and Deploy Job
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: true
          lfs: false

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          REACT_APP_AZURE_OPENAI_ENDPOINT: ${{ secrets.AZURE_OPENAI_ENDPOINT }}
          REACT_APP_AZURE_OPENAI_KEY: ${{ secrets.AZURE_OPENAI_KEY }}
          REACT_APP_AZURE_OPENAI_DEPLOYMENT: ${{ secrets.AZURE_OPENAI_DEPLOYMENT }}
          REACT_APP_AUTH_USERNAME: ${{ secrets.AUTH_USERNAME }}
          REACT_APP_AUTH_PASSWORD: ${{ secrets.AUTH_PASSWORD }}

      - name: Deploy
        id: deploy
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/"
          output_location: "build"
          skip_app_build: true

  close_pull_request_job:
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    name: Close Pull Request Job
    steps:
      - name: Close Pull Request
        id: closepullrequest
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          action: "close"
```

### 2.2 Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions → New repository secret

Add the following secrets:

| Secret Name | Value |
|-------------|-------|
| `AZURE_STATIC_WEB_APPS_API_TOKEN` | Get from Azure Portal (SWA → Manage deployment token) |
| `AZURE_OPENAI_ENDPOINT` | Your Azure OpenAI endpoint URL |
| `AZURE_OPENAI_KEY` | Your Azure OpenAI API key |
| `AZURE_OPENAI_DEPLOYMENT` | `gpt-4o` (or your deployment name) |
| `AUTH_USERNAME` | Your chosen username |
| `AUTH_PASSWORD` | Your chosen password |

## Step 3: Environment Configuration

### 3.1 Local Development

Create `.env` file in project root:

```env
REACT_APP_AZURE_OPENAI_ENDPOINT=https://aoai-tangled-gpt.openai.azure.com/
REACT_APP_AZURE_OPENAI_KEY=your-api-key-here
REACT_APP_AZURE_OPENAI_DEPLOYMENT=gpt-4o
REACT_APP_AUTH_USERNAME=yourUsername
REACT_APP_AUTH_PASSWORD=yourSecurePassword
```

### 3.2 Create .env.example

```env
REACT_APP_AZURE_OPENAI_ENDPOINT=https://your-resource.openai.azure.com/
REACT_APP_AZURE_OPENAI_KEY=your-api-key
REACT_APP_AZURE_OPENAI_DEPLOYMENT=gpt-4o
REACT_APP_AUTH_USERNAME=username
REACT_APP_AUTH_PASSWORD=password
```

## Step 4: Deploy

### 4.1 Initial Deployment

```bash
# Commit and push to trigger deployment
git add .
git commit -m "Initial deployment setup"
git push origin main
```

### 4.2 Verify Deployment

1. Go to GitHub repository → Actions tab
2. Watch the workflow run
3. Once complete, go to Azure Portal → Static Web Apps → swa-tangled-gpt
4. Click the URL to access your app

## Step 5: Post-Deployment Configuration

### 5.1 Custom Domain (Optional)

```bash
# Add custom domain
az staticwebapp hostname set \
  --name swa-tangled-gpt \
  --resource-group rg-tangled-gpt \
  --hostname your-custom-domain.com
```

### 5.2 Configure CORS (if needed)

Create `staticwebapp.config.json` in project root:

```json
{
  "globalHeaders": {
    "Access-Control-Allow-Origin": "*"
  },
  "navigationFallback": {
    "rewrite": "/index.html"
  }
}
```

## Troubleshooting

### Common Issues

#### 1. Build Fails
- Check Node.js version in workflow (should be 18+)
- Verify all environment variables are set in GitHub secrets
- Check for TypeScript/ESLint errors locally first

#### 2. API Calls Fail
- Verify Azure OpenAI endpoint URL format
- Check API key is correct
- Ensure model deployment is complete and active
- Check Azure OpenAI region matches endpoint

#### 3. Authentication Not Working
- Environment variables are baked into build at compile time
- Secrets must be set BEFORE the build runs
- Redeploy after adding/changing secrets

### Useful Commands

```bash
# Check SWA deployment status
az staticwebapp show \
  --name swa-tangled-gpt \
  --resource-group rg-tangled-gpt

# View deployment logs
az staticwebapp deployment show \
  --name swa-tangled-gpt \
  --resource-group rg-tangled-gpt

# List all resources in resource group
az resource list --resource-group rg-tangled-gpt --output table

# Delete everything (cleanup)
az group delete --name rg-tangled-gpt --yes --no-wait
```

## Cost Estimation

| Resource | Tier | Estimated Monthly Cost |
|----------|------|------------------------|
| Azure OpenAI | Pay-as-you-go | ~$5-20 (based on usage) |
| Azure Static Web Apps | Free | $0 |
| **Total** | | **~$5-20/month** |

> Costs depend heavily on chat usage. Personal use should be well under $20/month.

## Security Best Practices

1. **Never commit `.env` file** - It's in `.gitignore`
2. **Use strong auth password** - This is your only protection
3. **Rotate API keys periodically** - Update in Azure Portal and GitHub secrets
4. **Monitor usage** - Set up Azure Cost alerts
5. **Consider IP restrictions** - Azure AOAI supports network restrictions

## Support

For issues:
1. Check GitHub Actions logs for build errors
2. Check browser console for runtime errors
3. Verify Azure resource health in Azure Portal
