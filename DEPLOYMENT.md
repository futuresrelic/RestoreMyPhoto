# RestoreMyPhoto - Deployment Guide

Complete guide for deploying RestoreMyPhoto to production.

## Overview

This guide covers deploying:
- **Backend**: FastAPI + AI models on cloud infrastructure
- **Frontend**: React Native app to App Store and Google Play Store

## Backend Deployment

### Option 1: Render (Recommended)

Render provides GPU instances ideal for AI workloads.

#### Step 1: Create Render Account
- Sign up at https://render.com
- Connect your GitHub repository

#### Step 2: Create New Web Service
1. Click "New +" → "Web Service"
2. Connect your repository
3. Configure:
   - **Name**: `restoremyphoto-backend`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

#### Step 3: Configure Environment Variables
Add in Render dashboard:
```env
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
BASE_URL=https://restoremyphoto-backend.onrender.com
DEVICE=cuda
MODELS_DIR=/opt/render/project/src/models
```

#### Step 4: Add Persistent Disk (for models)
1. Go to service settings
2. Add disk: `/opt/render/project/src/models`
3. Size: 5GB minimum

#### Step 5: Deploy
- Click "Create Web Service"
- Wait for deployment (first deploy takes ~10 minutes to download models)

**Render GPU Instance** (for faster processing):
- Upgrade to GPU plan ($0.50/hour)
- Better for production with high traffic

---

### Option 2: Railway

Railway is simpler but no GPU support (CPU-only inference).

#### Step 1: Setup
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd backend
railway init
```

#### Step 2: Configure
Create `railway.json`:
```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE"
  }
}
```

#### Step 3: Add Environment Variables
```bash
railway variables set STRIPE_SECRET_KEY=sk_live_...
railway variables set DEVICE=cpu
railway variables set BASE_URL=$RAILWAY_PUBLIC_DOMAIN
```

#### Step 4: Deploy
```bash
railway up
```

---

### Option 3: AWS Lightsail

For full control and scalability.

#### Step 1: Create Lightsail Instance
1. Go to https://lightsail.aws.amazon.com
2. Create instance:
   - OS: Ubuntu 22.04 LTS
   - Plan: $40/month (2 vCPU, 4GB RAM) minimum
   - For GPU: Use EC2 with g4dn.xlarge

#### Step 2: Setup Server
SSH into instance:
```bash
ssh -i YourKey.pem ubuntu@your-instance-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Python
sudo apt install python3.9 python3.9-venv python3-pip -y

# Install CUDA (if using GPU instance)
wget https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/cuda-ubuntu2204.pin
sudo mv cuda-ubuntu2204.pin /etc/apt/preferences.d/cuda-repository-pin-600
sudo apt-key adv --fetch-keys https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/3bf863cc.pub
sudo add-apt-repository "deb https://developer.download.nvidia.com/compute/cuda/repos/ubuntu2204/x86_64/ /"
sudo apt update
sudo apt install cuda -y

# Clone repository
git clone https://github.com/yourusername/RestoreMyPhoto.git
cd RestoreMyPhoto/backend

# Setup Python environment
python3.9 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create systemd service
sudo nano /etc/systemd/system/restoremyphoto.service
```

Add to service file:
```ini
[Unit]
Description=RestoreMyPhoto Backend
After=network.target

[Service]
User=ubuntu
WorkingDirectory=/home/ubuntu/RestoreMyPhoto/backend
Environment="PATH=/home/ubuntu/RestoreMyPhoto/backend/venv/bin"
EnvironmentFile=/home/ubuntu/RestoreMyPhoto/backend/.env
ExecStart=/home/ubuntu/RestoreMyPhoto/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000

[Install]
WantedBy=multi-user.target
```

#### Step 3: Configure Nginx
```bash
sudo apt install nginx -y
sudo nano /etc/nginx/sites-available/restoremyphoto
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /uploads {
        alias /home/ubuntu/RestoreMyPhoto/backend/uploads;
    }

    location /outputs {
        alias /home/ubuntu/RestoreMyPhoto/backend/outputs;
    }
}
```

#### Step 4: Enable and Start
```bash
sudo ln -s /etc/nginx/sites-available/restoremyphoto /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

sudo systemctl enable restoremyphoto
sudo systemctl start restoremyphoto
```

#### Step 5: Setup SSL with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

---

## Configure Stripe Webhooks

### Step 1: Create Webhook Endpoint
1. Go to https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. URL: `https://your-backend-url.com/api/webhook/stripe`
4. Events to listen for:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `payment_intent.succeeded`

### Step 2: Get Webhook Secret
- Copy the webhook signing secret (starts with `whsec_`)
- Add to your backend environment variables

### Step 3: Test Webhook
```bash
# Use Stripe CLI
stripe listen --forward-to localhost:8000/api/webhook/stripe
stripe trigger customer.subscription.created
```

---

## Frontend Deployment (iOS & Android)

### Prerequisites

1. **Apple Developer Account** ($99/year)
   - https://developer.apple.com

2. **Google Play Developer Account** ($25 one-time)
   - https://play.google.com/console

3. **Expo Account**
   ```bash
   npm install -g eas-cli
   eas login
   ```

### Step 1: Configure Expo Project

```bash
cd frontend

# Create EAS project
eas init

# Configure EAS Build
eas build:configure
```

This creates `eas.json`:
```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

### Step 2: Update App Configuration

Edit `app.json`:
```json
{
  "expo": {
    "name": "RestoreMyPhoto",
    "slug": "restore-my-photo",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.yourcompany.restoremyphoto",
      "buildNumber": "1"
    },
    "android": {
      "package": "com.yourcompany.restoremyphoto",
      "versionCode": 1
    },
    "extra": {
      "apiUrl": "https://your-backend-url.com",
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

### Step 3: Build for iOS

```bash
# Build for App Store
eas build --platform ios --profile production

# This will:
# 1. Ask for Apple credentials
# 2. Generate certificates
# 3. Build the app
# 4. Upload to EAS servers
```

**Download .ipa file** and upload to App Store Connect:
1. Go to https://appstoreconnect.apple.com
2. Create new app
3. Use Xcode or Transporter to upload .ipa

### Step 4: Build for Android

```bash
# Build for Play Store
eas build --platform android --profile production

# Generate signing key if needed
eas credentials
```

**Download .aab file** and upload to Play Console:
1. Go to https://play.google.com/console
2. Create new app
3. Upload Android App Bundle (.aab)

### Step 5: App Store Submission

#### iOS (App Store Connect)
1. Upload build via Transporter
2. Fill out app information:
   - App name, subtitle, description
   - Keywords for ASO
   - Screenshots (6.5", 6.7", 12.9" iPad)
   - App preview video (optional)
   - Privacy policy URL
   - Support URL
3. Set pricing ($0 - free with IAP)
4. Submit for review

#### Android (Google Play Console)
1. Upload .aab bundle
2. Fill out store listing:
   - Title, short description, full description
   - Screenshots (phone, tablet, TV)
   - Feature graphic (1024x500)
   - App icon
3. Content rating questionnaire
4. Pricing & distribution
5. Submit for review

### Step 6: Over-the-Air (OTA) Updates

Configure EAS Update for instant updates without app store review:

```bash
# Configure updates
eas update:configure

# Publish update
eas update --branch production --message "Bug fixes"
```

Users will get updates automatically on app restart!

---

## Production Checklist

### Backend
- [ ] Environment variables set correctly
- [ ] HTTPS enabled (SSL certificate)
- [ ] Stripe webhooks configured
- [ ] AI models downloaded and cached
- [ ] Log monitoring setup (e.g., Sentry)
- [ ] Database backup strategy (if using DB)
- [ ] Rate limiting configured
- [ ] CORS configured for production domain
- [ ] File cleanup cron job running

### Frontend
- [ ] Production API URL configured
- [ ] Stripe live keys (not test keys!)
- [ ] App icons generated (all sizes)
- [ ] Splash screens created
- [ ] Privacy policy published
- [ ] Terms of service published
- [ ] Analytics configured (Firebase, Amplitude, etc.)
- [ ] Crash reporting (Sentry, Bugsnag)
- [ ] Push notifications setup (optional)

### App Store
- [ ] App Store screenshots (all required sizes)
- [ ] App preview video
- [ ] App description optimized for ASO
- [ ] Keywords researched
- [ ] Privacy policy accessible
- [ ] Support email/website setup

### Legal
- [ ] Privacy policy compliant with GDPR, CCPA
- [ ] Terms of service
- [ ] Refund policy
- [ ] Cookie policy (if web version)

---

## Monitoring & Maintenance

### Backend Monitoring
```bash
# Setup monitoring with Sentry
pip install sentry-sdk[fastapi]
```

Add to `main.py`:
```python
import sentry_sdk

sentry_sdk.init(
    dsn="your-sentry-dsn",
    traces_sample_rate=1.0,
)
```

### Frontend Monitoring
```bash
npm install @sentry/react-native
```

### Analytics
- Google Analytics for Firebase
- Mixpanel
- Amplitude

### Logging
- Backend: Python logging → CloudWatch/Datadog
- Frontend: Expo logging → Sentry

---

## Scaling Strategy

### As You Grow

**0-1K users:**
- Basic Render/Railway deployment
- CPU inference OK

**1K-10K users:**
- GPU instance (Render GPU or AWS g4dn)
- CDN for image delivery (CloudFront, Cloudflare)
- Redis for caching

**10K-100K users:**
- Kubernetes cluster (EKS, GKE)
- Load balancing
- PostgreSQL database
- S3 for image storage
- Multi-region deployment

**100K+ users:**
- Auto-scaling
- Global CDN
- Database read replicas
- Message queue (Celery, RabbitMQ)
- Dedicated AI inference cluster

---

## Cost Estimation

### Monthly Costs (Estimated)

**Small Scale (0-1K users):**
- Backend: $50/month (Render/Railway)
- Stripe fees: ~3% of revenue
- Total: ~$50-100/month

**Medium Scale (1K-10K users):**
- Backend: $200-500/month (GPU instances)
- CDN: $50/month
- Database: $25/month
- Monitoring: $50/month
- Total: ~$325-625/month

**Large Scale (10K+ users):**
- Infrastructure: $2000+/month
- Scale with usage

**Revenue Potential:**
- 1K users × 10% conversion × $14.99/month = $1,499/month
- 10K users × 10% conversion × $14.99/month = $14,990/month

---

## Support & Resources

- **Expo Docs**: https://docs.expo.dev
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Stripe Docs**: https://stripe.com/docs
- **App Store Guidelines**: https://developer.apple.com/app-store/review/guidelines/
- **Play Store Policies**: https://play.google.com/about/developer-content-policy/

---

## Rollback Strategy

If issues occur after deployment:

### Backend
```bash
# Render/Railway: Revert to previous deployment in dashboard
# AWS: Revert code and restart service
git revert HEAD
git push
sudo systemctl restart restoremyphoto
```

### Frontend
```bash
# Revert OTA update
eas update --branch production --message "Rollback" --platform all

# For app store, submit previous version
```

---

**Congratulations!** 🎉 Your app is now ready for the world!

For support during deployment, email: support@restoremyphoto.com
