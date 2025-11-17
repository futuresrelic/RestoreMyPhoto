"""
Data Models for RestoreMyPhoto Backend
"""
from enum import Enum
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime


class ProcessingType(str, Enum):
    """Types of image processing operations"""
    RESTORE = "restore"
    COLORIZE = "colorize"
    UPSCALE = "upscale"
    ENHANCE = "enhance"


class SubscriptionTier(str, Enum):
    """Subscription tiers"""
    FREE = "free"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    YEARLY = "yearly"


class ImageProcessRequest(BaseModel):
    """Request model for image processing"""
    processing_type: ProcessingType
    user_id: Optional[str] = None
    is_premium: bool = False
    upscale_factor: Optional[int] = Field(default=2, ge=1, le=4)

    class Config:
        use_enum_values = True


class ImageProcessResponse(BaseModel):
    """Response model for processed images"""
    success: bool
    message: str
    processed_image_url: Optional[str] = None
    has_watermark: bool = False
    processing_time: float
    image_id: str


class UserSubscription(BaseModel):
    """User subscription data"""
    user_id: str
    subscription_tier: SubscriptionTier
    stripe_customer_id: Optional[str] = None
    stripe_subscription_id: Optional[str] = None
    is_active: bool = False
    started_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    free_repairs_used: int = 0
    free_repairs_limit: int = 3

    class Config:
        use_enum_values = True


class StripeWebhookEvent(BaseModel):
    """Stripe webhook event data"""
    event_type: str
    customer_id: str
    subscription_id: Optional[str] = None
    payment_intent_id: Optional[str] = None


class OneTimePurchase(BaseModel):
    """One-time purchase for watermark removal"""
    user_id: str
    image_id: str
    payment_intent_id: str
    amount: float = 1.49
    created_at: datetime = Field(default_factory=datetime.utcnow)


class HealthCheck(BaseModel):
    """Health check response"""
    status: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    models_loaded: bool
    gpu_available: bool
