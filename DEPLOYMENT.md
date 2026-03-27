# Deploy to Vercel

## ⚠️ Important Note About Socket.IO

Your app uses Socket.IO for online chess multiplayer. **Vercel doesn't support WebSockets/Socket.IO** because it uses serverless functions.

**Options:**
1. Deploy to Vercel WITHOUT online chess (recommended for now)
2. Use a separate service for Socket.IO (Railway, Render, Heroku)
3. Deploy entire app to Railway/Render instead of Vercel

**This guide covers Option 1** (Vercel without Socket.IO)

## Prerequisites

1. **MongoDB Atlas Account** (Required - localhost won't work on Vercel)
   - Go to https://www.mongodb.com/cloud/atlas/register
   - Create a free M0 cluster
   - Get your connection string

2. **GitHub Account**
   - Push your code to GitHub

3. **Vercel Account**
   - Sign up at https://vercel.com

## Step 1: Setup MongoDB Atlas

1. Create a free cluster at https://cloud.mongodb.com
2. Click "Connect" → "Connect your application"
3. Copy the connection string (looks like):
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
4. Replace `<password>` with your database user password
5. Add `/QuizApp_users` before the `?` in the URL:
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/QuizApp_users?retryWrites=true&w=majority
   ```

## Step 2: Prepare for Vercel Deployment

Update `package.json` scripts to work with Vercel:

```json
"scripts": {
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

Note: Online chess mode won't work on Vercel. Consider hiding it or showing a "Coming Soon" message.

## Step 3: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

## Step 4: Deploy on Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure environment variables:
   - Click "Environment Variables"
   - Add each variable from your `.env.local`:

```
MONGODB_URL=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/QuizApp_users?retryWrites=true&w=majority
NEXTAUTH_SECRET=QuizzQuestSecretKey2024RandomString
NEXTAUTH_URL=https://your-app-name.vercel.app
GOOGLE_ID=your_google_oauth_client_id
GOOGLE_SECRET=your_google_oauth_client_secret
GEMINI_API_KEY=your_gemini_api_key
HUGGINGFACE_API_KEY=your_huggingface_api_key
OPENAI_API_KEY=your_openai_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
ROUTEWAY_API_KEY=your_routeway_api_key
```

4. Click "Deploy"

## Step 5: Update Google OAuth

After deployment, update your Google Cloud Console:

1. Go to https://console.cloud.google.com/apis/credentials
2. Edit your OAuth 2.0 Client ID
3. Add to **Authorized JavaScript origins**:
   ```
   https://your-app-name.vercel.app
   ```
4. Add to **Authorized redirect URIs**:
   ```
   https://your-app-name.vercel.app/api/auth/callback/google
   ```

## Step 6: Update NEXTAUTH_URL

1. Go to Vercel dashboard → Your project → Settings → Environment Variables
2. Update `NEXTAUTH_URL` to your actual Vercel URL:
   ```
   https://your-app-name.vercel.app
   ```
3. Redeploy (Vercel → Deployments → Three dots → Redeploy)

## Alternative: Deploy to Railway (Full Socket.IO Support)

If you need online chess multiplayer:

1. Go to https://railway.app
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Add environment variables (same as Vercel)
6. Railway will automatically detect and deploy your custom server
7. Update Google OAuth URLs with Railway domain

## Troubleshooting

### Build Errors
- Check Vercel build logs
- Ensure all dependencies are in `package.json`
- Make sure Node version is compatible (18.x or higher)

### Authentication Issues
- Verify Google OAuth redirect URIs match exactly
- Check NEXTAUTH_URL is correct
- Ensure NEXTAUTH_SECRET is set

### Database Connection
- Test MongoDB Atlas connection string locally first
- Whitelist all IPs (0.0.0.0/0) in MongoDB Atlas Network Access
- Verify database name is correct in connection string

### API Keys
- Ensure all API keys are added to Vercel environment variables
- Check for typos in variable names

## Custom Domain (Optional)

1. Vercel Dashboard → Your Project → Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. Update `NEXTAUTH_URL` and Google OAuth URLs to use custom domain
