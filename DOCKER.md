# Docker Deployment Guide

## Quick Start

### 1. Build and Run with Docker Compose (Recommended)

```bash
# Create .env file with your variables
cp .env.local .env

# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

Your app will be available at http://localhost:3000

### 2. Build and Run with Docker Only

```bash
# Build the image
docker build -t quizzquest .

# Run the container
docker run -p 3000:3000 \
  -e MONGODB_URL="your_mongodb_url" \
  -e NEXTAUTH_SECRET="your_secret" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  -e GOOGLE_ID="your_google_id" \
  -e GOOGLE_SECRET="your_google_secret" \
  -e GEMINI_API_KEY="your_key" \
  -e HUGGINGFACE_API_KEY="your_key" \
  -e OPENAI_API_KEY="your_key" \
  -e OPENROUTER_API_KEY="your_key" \
  -e ROUTEWAY_API_KEY="your_key" \
  quizzquest
```

## Deploy to Cloud Platforms

### Deploy to Railway

1. Install Railway CLI:
   ```bash
   npm i -g @railway/cli
   ```

2. Login and deploy:
   ```bash
   railway login
   railway init
   railway up
   ```

3. Add environment variables in Railway dashboard

### Deploy to Render

1. Create account at https://render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Select "Docker" as environment
5. Add environment variables
6. Click "Create Web Service"

### Deploy to DigitalOcean App Platform

1. Go to https://cloud.digitalocean.com/apps
2. Click "Create App"
3. Connect GitHub repo
4. Select Dockerfile
5. Add environment variables
6. Deploy

### Deploy to AWS ECS/Fargate

1. Push image to ECR:
   ```bash
   aws ecr create-repository --repository-name quizzquest
   docker tag quizzquest:latest <account-id>.dkr.ecr.<region>.amazonaws.com/quizzquest:latest
   docker push <account-id>.dkr.ecr.<region>.amazonaws.com/quizzquest:latest
   ```

2. Create ECS task definition and service
3. Configure environment variables
4. Deploy

## Environment Variables

Create a `.env` file with:

```env
MONGODB_URL=mongodb+srv://username:password@cluster.mongodb.net/QuizApp_users
NEXTAUTH_SECRET=your_secret_key_here
NEXTAUTH_URL=http://localhost:3000
GOOGLE_ID=your_google_oauth_id
GOOGLE_SECRET=your_google_oauth_secret
GEMINI_API_KEY=your_gemini_key
HUGGINGFACE_API_KEY=your_huggingface_key
OPENAI_API_KEY=your_openai_key
OPENROUTER_API_KEY=your_openrouter_key
ROUTEWAY_API_KEY=your_routeway_key
```

## Production Checklist

- [ ] Use MongoDB Atlas (not local MongoDB)
- [ ] Set strong NEXTAUTH_SECRET
- [ ] Update NEXTAUTH_URL to production domain
- [ ] Update Google OAuth redirect URIs
- [ ] Enable HTTPS in production
- [ ] Set up proper logging
- [ ] Configure health checks
- [ ] Set up monitoring

## Troubleshooting

### Container won't start
```bash
docker logs <container-id>
```

### Check if app is running
```bash
docker ps
```

### Access container shell
```bash
docker exec -it <container-id> sh
```

### Rebuild without cache
```bash
docker build --no-cache -t quizzquest .
```

## Docker Hub (Optional)

Push to Docker Hub for easy deployment:

```bash
# Tag image
docker tag quizzquest your-username/quizzquest:latest

# Login
docker login

# Push
docker push your-username/quizzquest:latest

# Pull and run anywhere
docker pull your-username/quizzquest:latest
docker run -p 3000:3000 --env-file .env your-username/quizzquest:latest
```
