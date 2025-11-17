# RestoreMyPhoto - AI-Powered Photo Restoration App

A premium, production-ready mobile application for iOS and Android that uses AI to restore, colorize, upscale, and enhance old or damaged photos.

## Features

### AI Processing
- **Face Restoration**: Enhance and restore faces using GFPGAN
- **Colorization**: Transform B&W photos to color
- **Upscaling**: Increase resolution with Real-ESRGAN (up to 4x)
- **Enhancement**: Denoise, sharpen, and color correct

### Monetization
- **Free Tier**: 3 repairs per week with watermark and 720p limit
- **Premium Subscription**:
  - Weekly: $4.99
  - Monthly: $14.99
  - Yearly: $99.00
- **One-time Purchase**: Remove watermark for $1.49

### Premium Features
- Unlimited photo restorations
- No watermarks
- High-resolution exports (4K+)
- Priority AI processing
- All current and future features

## Tech Stack

### Frontend (React Native + Expo)
- **React Native** with Expo SDK 50
- **Expo Router** for navigation
- **TypeScript** for type safety
- **Zustand** for state management
- **Stripe React Native** for payments
- **Expo Image Picker** for image selection
- Premium UI with gold/black theme

### Backend (Python FastAPI)
- **FastAPI** for REST API
- **GFPGAN** for face restoration
- **Real-ESRGAN** for upscaling
- **OpenCV** for image processing
- **Stripe** for payment processing
- **PyTorch** for AI inference

## Project Structure

```
RestoreMyPhoto/
├── backend/                # Python FastAPI backend
│   ├── main.py            # FastAPI app & endpoints
│   ├── models.py          # Pydantic models
│   ├── inference.py       # AI model inference
│   ├── requirements.txt   # Python dependencies
│   ├── utils/             # Utility modules
│   │   ├── watermark.py   # Watermarking logic
│   │   ├── image_utils.py # Image processing
│   │   └── stripe_utils.py# Stripe integration
│   └── tests/             # Backend tests
│
├── frontend/              # React Native + Expo app
│   ├── app/               # Expo Router screens
│   │   ├── _layout.tsx    # Root layout
│   │   ├── index.tsx      # Home screen
│   │   ├── editor.tsx     # Editor screen
│   │   ├── results.tsx    # Results screen
│   │   ├── paywall.tsx    # Subscription screen
│   │   └── settings.tsx   # Settings screen
│   ├── components/        # Reusable components
│   │   ├── BeforeAfterSlider.tsx
│   │   ├── Button.tsx
│   │   ├── ActionCard.tsx
│   │   └── LoadingOverlay.tsx
│   ├── state/             # Zustand store
│   ├── utils/             # Utilities
│   │   ├── theme.ts       # Theme & colors
│   │   └── api.ts         # API client
│   ├── assets/            # Images & icons
│   ├── package.json
│   └── app.json           # Expo config
│
└── README.md              # This file
```

## Getting Started

See [SETUP.md](./SETUP.md) for detailed setup instructions.

### Quick Start

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env       # Configure environment variables
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env       # Configure environment variables
npm start
```

## Configuration

### Backend (.env)
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Stripe webhook secret
- `BASE_URL`: Backend URL (for image URLs)
- `DEVICE`: `cuda` for GPU, `cpu` for CPU inference

### Frontend (.env)
- `EXPO_PUBLIC_API_URL`: Backend API URL
- `EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Stripe publishable key

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for production deployment instructions.

### Backend Deployment Options
- **Render** (recommended for GPU)
- **Railway**
- **AWS Lightsail**
- **Google Cloud Run**

### Frontend Deployment
- **iOS**: Submit to App Store via Expo EAS Build
- **Android**: Submit to Google Play via Expo EAS Build

## Testing

**Backend:**
```bash
cd backend
pytest tests/ -v
```

**Frontend:**
```bash
cd frontend
npm test
```

## AI Models

The app uses the following open-source AI models:

1. **GFPGAN v1.4** - Face restoration
   - Auto-downloaded on first run
   - Requires ~350MB disk space

2. **Real-ESRGAN x4plus** - Image upscaling
   - Auto-downloaded on first run
   - Requires ~65MB disk space

3. **Custom Enhancement** - Denoising and color correction
   - Built-in OpenCV algorithms
   - No model download required

## Monetization Strategy

### Free Tier (Freemium Model)
- 3 repairs per week
- 720p resolution limit
- Watermarked exports
- All processing types available

### Premium Tier
- Unlimited repairs
- No watermarks
- 4K+ resolution exports
- Priority processing
- All features

### One-time Purchase
- $1.49 to remove watermark from single photo
- Useful for users who only need occasional repairs

## Design System

### Colors
- **Primary Gold**: `#D4AF37`
- **Background Black**: `#0A0A0A`
- **Elevated**: `#1A1A1A`, `#2A2A2A`

### Typography
- Premium photography app aesthetic
- Clean, modern, professional
- Gold accents on dark background

## License

Proprietary - All rights reserved

## Support

For support, email support@restoremyphoto.com

## Roadmap

- [ ] Batch processing
- [ ] Cloud storage integration
- [ ] Social sharing features
- [ ] Video restoration
- [ ] Advanced AI models (DeOldify, etc.)
- [ ] Desktop app (Electron)

---

Built with ❤️ using AI
