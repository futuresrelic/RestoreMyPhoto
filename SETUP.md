# RestoreMyPhoto - Local Development Setup

Complete guide to setting up RestoreMyPhoto for local development.

## Prerequisites

### Required Software

1. **Python 3.9+**
   ```bash
   python --version  # Should be 3.9 or higher
   ```

2. **Node.js 18+**
   ```bash
   node --version    # Should be 18 or higher
   npm --version
   ```

3. **Expo CLI**
   ```bash
   npm install -g expo-cli
   ```

4. **Git**
   ```bash
   git --version
   ```

### Optional but Recommended

- **CUDA Toolkit** (for GPU acceleration)
  - Download from: https://developer.nvidia.com/cuda-downloads
  - Required for fast AI processing

- **Expo Go App** (for testing on real devices)
  - iOS: https://apps.apple.com/app/expo-go/id982107779
  - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

## Backend Setup

### Step 1: Clone Repository

```bash
git clone https://github.com/yourusername/RestoreMyPhoto.git
cd RestoreMyPhoto/backend
```

### Step 2: Create Virtual Environment

**macOS/Linux:**
```bash
python -m venv venv
source venv/bin/activate
```

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

### Step 3: Install Dependencies

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

**Note:** This will install PyTorch, GFPGAN, Real-ESRGAN and other dependencies. It may take 5-10 minutes depending on your internet connection.

### Step 4: Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env` and configure:

```env
# Server
BASE_URL=http://localhost:8000
PORT=8000

# Stripe (get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_test_your_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# AI Models
DEVICE=cuda  # or 'cpu' if no GPU
MODELS_DIR=./models

# Storage
UPLOAD_DIR=./uploads
OUTPUT_DIR=./outputs
```

### Step 5: Create Required Directories

```bash
mkdir -p models uploads outputs
```

### Step 6: Run Backend

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend should now be running at `http://localhost:8000`

**Test it:**
```bash
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "...",
  "models_loaded": true,
  "gpu_available": true
}
```

### Step 7: Setup Stripe (Optional for Testing)

1. Create a Stripe account: https://dashboard.stripe.com/register
2. Get your test API keys from: https://dashboard.stripe.com/test/apikeys
3. Create price objects by running:

```python
# In Python shell or create a script
from utils.stripe_utils import get_stripe_manager

manager = get_stripe_manager()
price_ids = manager.create_price_objects()
print(price_ids)
```

4. Update your `.env` with the returned price IDs

## Frontend Setup

### Step 1: Navigate to Frontend

```bash
cd ../frontend
```

### Step 2: Install Dependencies

```bash
npm install
```

**Note:** This installs React Native, Expo, and all required packages. May take 3-5 minutes.

### Step 3: Configure Environment Variables

```bash
cp .env.example .env
```

Edit `.env`:

```env
# API URL (use your local IP for testing on real devices)
EXPO_PUBLIC_API_URL=http://localhost:8000

# For testing on real devices, use your computer's IP:
# EXPO_PUBLIC_API_URL=http://192.168.1.100:8000

# Stripe
EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key_here
```

**Finding your local IP:**

**macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**Windows:**
```bash
ipconfig
```

### Step 4: Update Expo Configuration

Edit `app.json` and update the `extra` section:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "http://YOUR_LOCAL_IP:8000",
      "eas": {
        "projectId": "your-project-id"
      }
    }
  }
}
```

### Step 5: Run Frontend

**Start Metro bundler:**
```bash
npm start
```

**Or run on specific platform:**
```bash
npm run ios      # iOS Simulator (macOS only)
npm run android  # Android Emulator
npm run web      # Web browser
```

### Step 6: Test on Real Device

1. Install **Expo Go** app on your phone
2. Scan the QR code shown in terminal
3. Make sure your phone is on the same WiFi network

## Testing the Complete Flow

### 1. Start Backend
```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows
uvicorn main:app --reload
```

### 2. Start Frontend
```bash
cd frontend
npm start
```

### 3. Test Image Processing

1. Open app on device/simulator
2. Tap "Upload Photo"
3. Select a test image
4. Choose processing type (Restore/Colorize/Upscale/Enhance)
5. Tap "Process Photo"
6. Wait for AI processing (first run downloads models ~400MB)
7. View before/after comparison
8. Download or share result

## Troubleshooting

### Backend Issues

**Models not loading:**
```bash
# Manually download models
cd backend/models
# Download GFPGAN
wget https://github.com/TencentARC/GFPGAN/releases/download/v1.3.0/GFPGANv1.4.pth
# Download Real-ESRGAN
wget https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth
```

**CUDA errors:**
```bash
# Check CUDA installation
python -c "import torch; print(torch.cuda.is_available())"
# If False, set DEVICE=cpu in .env
```

**Port already in use:**
```bash
# Find and kill process using port 8000
# macOS/Linux:
lsof -ti:8000 | xargs kill -9
# Windows:
netstat -ano | findstr :8000
taskkill /PID [PID] /F
```

### Frontend Issues

**Metro bundler issues:**
```bash
# Clear cache
npm start -- --clear
# Or
npx expo start -c
```

**Connection refused:**
- Make sure backend is running
- Check API URL in `.env`
- Use local IP instead of localhost for device testing
- Check firewall settings

**Stripe errors:**
- Verify API keys are correct
- Use test mode keys (pk_test_... and sk_test_...)
- Check Stripe dashboard for webhook logs

**Image picker not working:**
```bash
# iOS Simulator - drag & drop image onto simulator
# Android Emulator - use AVD manager to add images
# Real device - grant camera/photo permissions
```

## Running Tests

### Backend Tests
```bash
cd backend
pytest tests/ -v --cov
```

### Frontend Tests
```bash
cd frontend
npm test
```

## Development Tips

1. **Hot Reload**: Both frontend (Metro) and backend (uvicorn --reload) support hot reload

2. **Debugging Backend**:
   ```python
   import pdb; pdb.set_trace()  # Add breakpoint
   ```

3. **Debugging Frontend**:
   - Use React DevTools
   - Check Expo DevTools in browser
   - View logs: `npx expo start --dev-client`

4. **API Testing**:
   ```bash
   # Test endpoints with curl
   curl -X POST http://localhost:8000/api/restore \
     -F "file=@test.jpg" \
     -F "user_id=test123" \
     -F "is_premium=false"
   ```

5. **Database** (Future):
   - Currently using in-memory storage
   - For production, integrate PostgreSQL/MongoDB

## Next Steps

After local development setup:

1. Read [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment
2. Configure Stripe webhooks
3. Set up CI/CD pipeline
4. Configure app icons and splash screens
5. Submit to App Store / Play Store

## Support

- GitHub Issues: https://github.com/yourusername/RestoreMyPhoto/issues
- Email: support@restoremyphoto.com

---

Happy coding! 🚀
