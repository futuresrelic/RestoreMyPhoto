# RestoreMyPhoto - Quick Start Guide

Get RestoreMyPhoto running in under 10 minutes!

## 🚀 Fastest Path to Running App

### Prerequisites
- Python 3.9+
- Node.js 18+
- Git

### Backend (2 minutes)

```bash
# 1. Clone and navigate
git clone https://github.com/yourusername/RestoreMyPhoto.git
cd RestoreMyPhoto/backend

# 2. Setup Python
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# 3. Create directories
mkdir models uploads outputs

# 4. Configure (optional - works without Stripe for testing)
cp .env.example .env
# Edit .env if you want Stripe integration

# 5. Run!
uvicorn main:app --reload
```

✅ Backend running at http://localhost:8000

### Frontend (2 minutes)

```bash
# In a new terminal
cd RestoreMyPhoto/frontend

# 1. Install
npm install

# 2. Configure
cp .env.example .env
# For device testing, update EXPO_PUBLIC_API_URL to your local IP

# 3. Run!
npm start
```

✅ Frontend running - scan QR code with Expo Go app!

## 📱 Test the App

1. Open Expo Go on your phone
2. Scan the QR code
3. Tap "Upload Photo"
4. Select a photo
5. Tap "Process Photo"
6. Watch the AI magic! ✨

**Note**: First run downloads AI models (~400MB). This only happens once!

## 🎯 What Works Out of the Box

### ✅ Works Immediately
- Image upload
- All 4 AI processing types (Restore, Colorize, Upscale, Enhance)
- Before/after comparison
- Download/share results
- Free tier limits (3 repairs/week)
- Watermarking

### ⚠️ Needs Configuration
- **Stripe payments**: Add your Stripe keys to `.env`
- **Production deployment**: See DEPLOYMENT.md

## 🔧 Common Issues

**"Module not found" errors:**
```bash
# Backend
pip install -r requirements.txt

# Frontend
cd frontend && npm install
```

**Can't connect to backend from phone:**
```bash
# Get your local IP
# macOS/Linux: ifconfig | grep inet
# Windows: ipconfig

# Update frontend/.env
EXPO_PUBLIC_API_URL=http://YOUR_IP:8000
```

**Models not downloading:**
```bash
# Download manually
cd backend/models
wget https://github.com/TencentARC/GFPGAN/releases/download/v1.3.0/GFPGANv1.4.pth
wget https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth
```

**Slow processing:**
- First run downloads models (slow)
- CPU inference is slower than GPU
- Use DEVICE=cuda in backend/.env if you have NVIDIA GPU

## 📚 Next Steps

1. **Add Stripe**: Get API keys from https://stripe.com
2. **Customize UI**: Edit colors in `frontend/utils/theme.ts`
3. **Deploy**: Follow DEPLOYMENT.md
4. **Read Full Docs**: See README.md and SETUP.md

## 🆘 Need Help?

- Full setup: [SETUP.md](./SETUP.md)
- Deployment: [DEPLOYMENT.md](./DEPLOYMENT.md)
- Issues: Open a GitHub issue
- Email: support@restoremyphoto.com

---

**That's it!** You now have a fully functional AI photo restoration app! 🎉
