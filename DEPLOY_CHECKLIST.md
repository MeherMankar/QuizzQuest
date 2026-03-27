# Quick Deployment Checklist

## Before Deploying

- [ ] Create MongoDB Atlas cluster and get connection string
- [ ] Update `.env.local` with MongoDB Atlas URL (not localhost)
- [ ] Test locally with Atlas connection: `npm run dev`
- [ ] Commit all changes to Git

## Deploy to Vercel

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push
   ```

2. **Deploy on Vercel:**
   - Go to https://vercel.com/new
   - Import your GitHub repo
   - Add environment variables (copy from `.env.local`)
   - Click Deploy

3. **Update Google OAuth:**
   - Go to https://console.cloud.google.com/apis/credentials
   - Add Vercel URL to authorized origins and redirect URIs
   - Format: `https://your-app.vercel.app`

4. **Update Vercel Environment:**
   - Set `NEXTAUTH_URL` to your Vercel URL
   - Redeploy

## Environment Variables Needed

```
MONGODB_URL=mongodb+srv://...
NEXTAUTH_SECRET=QuizzQuestSecretKey2024RandomString
NEXTAUTH_URL=https://your-app.vercel.app
GOOGLE_ID=...
GOOGLE_SECRET=...
GEMINI_API_KEY=...
HUGGINGFACE_API_KEY=...
OPENAI_API_KEY=...
OPENROUTER_API_KEY=...
ROUTEWAY_API_KEY=...
```

## Note

Online chess multiplayer won't work on Vercel (requires WebSockets).
For full functionality, deploy to Railway or Render instead.

See DEPLOYMENT.md for detailed instructions.
