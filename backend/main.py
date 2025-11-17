"""
RestoreMyPhoto Backend API
FastAPI server for AI-powered image restoration
"""
import os
import time
import logging
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, File, UploadFile, HTTPException, Form, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel

from models import (
    ImageProcessRequest,
    ImageProcessResponse,
    UserSubscription,
    HealthCheck,
    ProcessingType,
    SubscriptionTier
)
from inference import get_restorer
from utils import (
    ImageManager,
    validate_image,
    add_watermark,
    add_diagonal_watermark,
    limit_resolution,
    get_stripe_manager
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# In-memory user subscription storage (use database in production)
user_subscriptions = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup/shutdown"""
    # Startup
    logger.info("Starting RestoreMyPhoto Backend...")

    # Initialize AI models
    restorer = get_restorer()
    logger.info(f"Models loaded: {restorer.models_loaded()}")
    logger.info(f"GPU available: {restorer.is_gpu_available()}")

    # Initialize image manager
    app.state.image_manager = ImageManager()

    # Cleanup old files on startup
    app.state.image_manager.cleanup_old_files(max_age_hours=24)

    yield

    # Shutdown
    logger.info("Shutting down RestoreMyPhoto Backend...")


# Create FastAPI app
app = FastAPI(
    title="RestoreMyPhoto API",
    description="AI-powered photo restoration API",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
os.makedirs("uploads", exist_ok=True)
os.makedirs("outputs", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
app.mount("/outputs", StaticFiles(directory="outputs"), name="outputs")


# ============================================================================
# Helper Functions
# ============================================================================

def get_user_subscription(user_id: str) -> UserSubscription:
    """Get or create user subscription"""
    if user_id not in user_subscriptions:
        user_subscriptions[user_id] = UserSubscription(
            user_id=user_id,
            subscription_tier=SubscriptionTier.FREE,
            is_active=False,
            free_repairs_used=0,
            free_repairs_limit=3
        )
    return user_subscriptions[user_id]


def check_user_can_process(user_id: str) -> tuple[bool, str]:
    """Check if user can process image"""
    subscription = get_user_subscription(user_id)

    # Premium users can always process
    if subscription.is_active and subscription.subscription_tier != SubscriptionTier.FREE:
        return True, "Premium user"

    # Free users have limits
    if subscription.free_repairs_used >= subscription.free_repairs_limit:
        return False, "Free repair limit reached. Please upgrade to premium."

    return True, "Free repair available"


# ============================================================================
# API Endpoints
# ============================================================================

@app.get("/", response_model=dict)
async def root():
    """Root endpoint"""
    return {
        "message": "RestoreMyPhoto API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health", response_model=HealthCheck)
async def health_check():
    """Health check endpoint"""
    restorer = get_restorer()

    return HealthCheck(
        status="healthy",
        models_loaded=restorer.models_loaded(),
        gpu_available=restorer.is_gpu_available()
    )


@app.post("/api/restore", response_model=ImageProcessResponse)
async def restore_image(
    file: UploadFile = File(...),
    user_id: str = Form(...),
    is_premium: bool = Form(default=False),
    upscale_factor: int = Form(default=2)
):
    """
    Restore/enhance faces in uploaded image using GFPGAN
    """
    start_time = time.time()

    try:
        # Check user permissions
        can_process, message = check_user_can_process(user_id)
        if not can_process:
            raise HTTPException(status_code=403, detail=message)

        # Read and validate file
        file_content = await file.read()
        if not validate_image(file_content):
            raise HTTPException(status_code=400, detail="Invalid image file")

        # Save upload
        image_manager = app.state.image_manager
        filepath, image_id = image_manager.save_upload(file_content, file.filename)

        # Process image
        restorer = get_restorer()
        processed_image, success = restorer.process_image(
            filepath,
            ProcessingType.RESTORE,
            upscale_factor
        )

        if processed_image is None:
            raise HTTPException(status_code=500, detail="Image processing failed")

        # Note: success=False means AI models weren't used, but basic processing still works
        ai_processing_used = success

        # Apply watermark for free users
        has_watermark = False
        if not is_premium:
            processed_image = add_watermark(processed_image)
            processed_image = limit_resolution(processed_image, 1280, 720)
            has_watermark = True

            # Increment free repairs counter
            subscription = get_user_subscription(user_id)
            subscription.free_repairs_used += 1

        # Save processed image
        output_path = image_manager.save_processed(
            processed_image,
            image_id,
            ProcessingType.RESTORE
        )

        # Generate URL
        base_url = os.getenv('BASE_URL', 'http://localhost:8000')
        image_url = image_manager.get_image_url(output_path, base_url)

        processing_time = time.time() - start_time

        return ImageProcessResponse(
            success=True,
            message="Image restored successfully",
            processed_image_url=image_url,
            has_watermark=has_watermark,
            processing_time=processing_time,
            image_id=image_id
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in restore_image: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/colorize", response_model=ImageProcessResponse)
async def colorize_image(
    file: UploadFile = File(...),
    user_id: str = Form(...),
    is_premium: bool = Form(default=False)
):
    """
    Colorize grayscale image
    """
    start_time = time.time()

    try:
        # Check user permissions
        can_process, message = check_user_can_process(user_id)
        if not can_process:
            raise HTTPException(status_code=403, detail=message)

        # Read and validate file
        file_content = await file.read()
        if not validate_image(file_content):
            raise HTTPException(status_code=400, detail="Invalid image file")

        # Save upload
        image_manager = app.state.image_manager
        filepath, image_id = image_manager.save_upload(file_content, file.filename)

        # Process image
        restorer = get_restorer()
        processed_image, success = restorer.process_image(
            filepath,
            ProcessingType.COLORIZE
        )

        if processed_image is None:
            raise HTTPException(status_code=500, detail="Image processing failed")

        # Note: success=False means AI models weren't used, but basic processing still works
        ai_processing_used = success

        # Apply watermark for free users
        has_watermark = False
        if not is_premium:
            processed_image = add_watermark(processed_image)
            processed_image = limit_resolution(processed_image, 1280, 720)
            has_watermark = True

            # Increment free repairs counter
            subscription = get_user_subscription(user_id)
            subscription.free_repairs_used += 1

        # Save processed image
        output_path = image_manager.save_processed(
            processed_image,
            image_id,
            ProcessingType.COLORIZE
        )

        # Generate URL
        base_url = os.getenv('BASE_URL', 'http://localhost:8000')
        image_url = image_manager.get_image_url(output_path, base_url)

        processing_time = time.time() - start_time

        return ImageProcessResponse(
            success=True,
            message="Image colorized successfully",
            processed_image_url=image_url,
            has_watermark=has_watermark,
            processing_time=processing_time,
            image_id=image_id
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in colorize_image: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/upscale", response_model=ImageProcessResponse)
async def upscale_image(
    file: UploadFile = File(...),
    user_id: str = Form(...),
    is_premium: bool = Form(default=False),
    upscale_factor: int = Form(default=2)
):
    """
    Upscale image using Real-ESRGAN
    """
    start_time = time.time()

    try:
        # Check user permissions
        can_process, message = check_user_can_process(user_id)
        if not can_process:
            raise HTTPException(status_code=403, detail=message)

        # Read and validate file
        file_content = await file.read()
        if not validate_image(file_content):
            raise HTTPException(status_code=400, detail="Invalid image file")

        # Save upload
        image_manager = app.state.image_manager
        filepath, image_id = image_manager.save_upload(file_content, file.filename)

        # Process image
        restorer = get_restorer()
        processed_image, success = restorer.process_image(
            filepath,
            ProcessingType.UPSCALE,
            upscale_factor
        )

        if processed_image is None:
            raise HTTPException(status_code=500, detail="Image processing failed")

        # Note: success=False means AI models weren't used, but basic processing still works
        ai_processing_used = success

        # Apply watermark for free users
        has_watermark = False
        if not is_premium:
            processed_image = add_watermark(processed_image)
            processed_image = limit_resolution(processed_image, 1280, 720)
            has_watermark = True

            # Increment free repairs counter
            subscription = get_user_subscription(user_id)
            subscription.free_repairs_used += 1

        # Save processed image
        output_path = image_manager.save_processed(
            processed_image,
            image_id,
            ProcessingType.UPSCALE
        )

        # Generate URL
        base_url = os.getenv('BASE_URL', 'http://localhost:8000')
        image_url = image_manager.get_image_url(output_path, base_url)

        processing_time = time.time() - start_time

        return ImageProcessResponse(
            success=True,
            message="Image upscaled successfully",
            processed_image_url=image_url,
            has_watermark=has_watermark,
            processing_time=processing_time,
            image_id=image_id
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in upscale_image: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/enhance", response_model=ImageProcessResponse)
async def enhance_image(
    file: UploadFile = File(...),
    user_id: str = Form(...),
    is_premium: bool = Form(default=False)
):
    """
    General image enhancement (denoise, sharpen, color correct)
    """
    start_time = time.time()

    try:
        # Check user permissions
        can_process, message = check_user_can_process(user_id)
        if not can_process:
            raise HTTPException(status_code=403, detail=message)

        # Read and validate file
        file_content = await file.read()
        if not validate_image(file_content):
            raise HTTPException(status_code=400, detail="Invalid image file")

        # Save upload
        image_manager = app.state.image_manager
        filepath, image_id = image_manager.save_upload(file_content, file.filename)

        # Process image
        restorer = get_restorer()
        processed_image, success = restorer.process_image(
            filepath,
            ProcessingType.ENHANCE
        )

        if processed_image is None:
            raise HTTPException(status_code=500, detail="Image processing failed")

        # Note: success=False means AI models weren't used, but basic processing still works
        ai_processing_used = success

        # Apply watermark for free users
        has_watermark = False
        if not is_premium:
            processed_image = add_watermark(processed_image)
            processed_image = limit_resolution(processed_image, 1280, 720)
            has_watermark = True

            # Increment free repairs counter
            subscription = get_user_subscription(user_id)
            subscription.free_repairs_used += 1

        # Save processed image
        output_path = image_manager.save_processed(
            processed_image,
            image_id,
            ProcessingType.ENHANCE
        )

        # Generate URL
        base_url = os.getenv('BASE_URL', 'http://localhost:8000')
        image_url = image_manager.get_image_url(output_path, base_url)

        processing_time = time.time() - start_time

        return ImageProcessResponse(
            success=True,
            message="Image enhanced successfully",
            processed_image_url=image_url,
            has_watermark=has_watermark,
            processing_time=processing_time,
            image_id=image_id
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in enhance_image: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/webhook/stripe")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None)):
    """
    Handle Stripe webhook events
    """
    try:
        payload = await request.body()

        if not stripe_signature:
            raise HTTPException(status_code=400, detail="Missing stripe signature")

        # Verify webhook
        stripe_manager = get_stripe_manager()
        event = stripe_manager.verify_webhook(payload, stripe_signature)

        if not event:
            raise HTTPException(status_code=400, detail="Invalid webhook signature")

        # Handle different event types
        event_type = event['type']
        logger.info(f"Received Stripe webhook: {event_type}")

        if event_type == 'customer.subscription.created':
            # New subscription created
            subscription = event['data']['object']
            customer_id = subscription['customer']
            subscription_id = subscription['id']

            # Update user subscription (in production, query user by customer_id)
            # For now, we'll use metadata
            user_id = subscription.get('metadata', {}).get('user_id')
            if user_id:
                subscription_data = get_user_subscription(user_id)
                subscription_data.is_active = True
                subscription_data.stripe_customer_id = customer_id
                subscription_data.stripe_subscription_id = subscription_id

        elif event_type == 'customer.subscription.updated':
            # Subscription updated
            subscription = event['data']['object']
            user_id = subscription.get('metadata', {}).get('user_id')

            if user_id:
                subscription_data = get_user_subscription(user_id)
                subscription_data.is_active = subscription['status'] == 'active'

        elif event_type == 'customer.subscription.deleted':
            # Subscription cancelled
            subscription = event['data']['object']
            user_id = subscription.get('metadata', {}).get('user_id')

            if user_id:
                subscription_data = get_user_subscription(user_id)
                subscription_data.is_active = False

        elif event_type == 'payment_intent.succeeded':
            # One-time payment succeeded
            payment_intent = event['data']['object']
            logger.info(f"Payment succeeded: {payment_intent['id']}")

        return {"status": "success"}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error in stripe_webhook: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/subscription/{user_id}", response_model=UserSubscription)
async def get_subscription(user_id: str):
    """
    Get user subscription status
    """
    subscription = get_user_subscription(user_id)
    return subscription


@app.post("/api/subscription/reset-free/{user_id}")
async def reset_free_repairs(user_id: str):
    """
    Reset free repairs counter (called weekly)
    """
    subscription = get_user_subscription(user_id)
    subscription.free_repairs_used = 0
    return {"message": "Free repairs reset", "user_id": user_id}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
