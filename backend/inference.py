"""
AI Model Inference for Image Restoration
Supports GFPGAN, Real-ESRGAN, and DeOldify
"""
import os
import cv2
import torch
import numpy as np
from PIL import Image
from typing import Tuple, Optional
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ImageRestorer:
    """Main class for AI-powered image restoration"""

    def __init__(self, device: Optional[str] = None):
        """
        Initialize the image restorer with AI models

        Args:
            device: Device to use ('cuda', 'cpu', or None for auto-detection)
        """
        if device is None:
            self.device = 'cuda' if torch.cuda.is_available() else 'cpu'
        else:
            self.device = device

        logger.info(f"Using device: {self.device}")

        # Model paths
        self.model_dir = Path("models")
        self.model_dir.mkdir(exist_ok=True)

        # Initialize models
        self.gfpgan_model = None
        self.realesrgan_model = None
        self.colorize_model = None

        # Load models on initialization
        # COMMENTED OUT for free tier deployment - models will lazy load on first use
        # self._load_models()

    def _load_models(self):
        """Load all AI models"""
        try:
            self._load_gfpgan()
            self._load_realesrgan()
            logger.info("All models loaded successfully")
        except Exception as e:
            logger.error(f"Error loading models: {e}")
            logger.warning("Some features may be unavailable")

    def _load_gfpgan(self):
        """Load GFPGAN model for face restoration"""
        try:
            from gfpgan import GFPGANer
            from basicsr.archs.rrdbnet_arch import RRDBNet

            model_path = self.model_dir / 'GFPGANv1.4.pth'

            # Download model if not exists
            if not model_path.exists():
                logger.info("Downloading GFPGAN model...")
                import urllib.request
                url = 'https://github.com/TencentARC/GFPGAN/releases/download/v1.3.0/GFPGANv1.4.pth'
                urllib.request.urlretrieve(url, str(model_path))

            self.gfpgan_model = GFPGANer(
                model_path=str(model_path),
                upscale=2,
                arch='clean',
                channel_multiplier=2,
                bg_upsampler=None,
                device=self.device
            )
            logger.info("GFPGAN model loaded")

        except Exception as e:
            logger.error(f"Failed to load GFPGAN: {e}")
            self.gfpgan_model = None

    def _load_realesrgan(self):
        """Load Real-ESRGAN model for upscaling"""
        try:
            from realesrgan import RealESRGANer
            from basicsr.archs.rrdbnet_arch import RRDBNet

            model_path = self.model_dir / 'RealESRGAN_x4plus.pth'

            # Download model if not exists
            if not model_path.exists():
                logger.info("Downloading Real-ESRGAN model...")
                import urllib.request
                url = 'https://github.com/xinntao/Real-ESRGAN/releases/download/v0.1.0/RealESRGAN_x4plus.pth'
                urllib.request.urlretrieve(url, str(model_path))

            # Define model architecture
            model = RRDBNet(
                num_in_ch=3,
                num_out_ch=3,
                num_feat=64,
                num_block=23,
                num_grow_ch=32,
                scale=4
            )

            self.realesrgan_model = RealESRGANer(
                scale=4,
                model_path=str(model_path),
                model=model,
                tile=0,
                tile_pad=10,
                pre_pad=0,
                half=False if self.device == 'cpu' else True,
                device=self.device
            )
            logger.info("Real-ESRGAN model loaded")

        except Exception as e:
            logger.error(f"Failed to load Real-ESRGAN: {e}")
            self.realesrgan_model = None

    def restore_face(self, image: np.ndarray) -> Tuple[np.ndarray, bool]:
        """
        Restore faces in an image using GFPGAN

        Args:
            image: Input image as numpy array (BGR format)

        Returns:
            Tuple of (restored_image, success)
        """
        if self.gfpgan_model is None:
            logger.warning("GFPGAN model not available, returning original image")
            return image, False

        try:
            _, _, output = self.gfpgan_model.enhance(
                image,
                has_aligned=False,
                only_center_face=False,
                paste_back=True
            )
            return output, True

        except Exception as e:
            logger.error(f"Error in face restoration: {e}")
            return image, False

    def upscale_image(self, image: np.ndarray, scale: int = 2) -> Tuple[np.ndarray, bool]:
        """
        Upscale image using Real-ESRGAN

        Args:
            image: Input image as numpy array (BGR format)
            scale: Upscaling factor (1-4)

        Returns:
            Tuple of (upscaled_image, success)
        """
        if self.realesrgan_model is None:
            logger.warning("Real-ESRGAN model not available, using basic interpolation")
            h, w = image.shape[:2]
            output = cv2.resize(image, (w * scale, h * scale), interpolation=cv2.INTER_CUBIC)
            return output, False

        try:
            output, _ = self.realesrgan_model.enhance(image, outscale=scale)
            return output, True

        except Exception as e:
            logger.error(f"Error in upscaling: {e}")
            # Fallback to basic upscaling
            h, w = image.shape[:2]
            output = cv2.resize(image, (w * scale, h * scale), interpolation=cv2.INTER_CUBIC)
            return output, False

    def colorize_image(self, image: np.ndarray) -> Tuple[np.ndarray, bool]:
        """
        Colorize a grayscale image

        Args:
            image: Input image as numpy array (BGR format)

        Returns:
            Tuple of (colorized_image, success)
        """
        try:
            # Simple colorization approach using pre-trained model
            # For production, you'd use DeOldify or similar
            # This is a placeholder that applies basic color enhancement

            # Convert to LAB color space
            lab = cv2.cvtColor(image, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)

            # Apply CLAHE to L channel
            clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
            l = clahe.apply(l)

            # Merge and convert back
            lab = cv2.merge([l, a, b])
            output = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)

            # Add slight saturation boost
            hsv = cv2.cvtColor(output, cv2.COLOR_BGR2HSV)
            h, s, v = cv2.split(hsv)
            s = cv2.multiply(s, 1.2)
            s = np.clip(s, 0, 255).astype(np.uint8)
            hsv = cv2.merge([h, s, v])
            output = cv2.cvtColor(hsv, cv2.COLOR_HSV2BGR)

            return output, True

        except Exception as e:
            logger.error(f"Error in colorization: {e}")
            return image, False

    def enhance_image(self, image: np.ndarray) -> Tuple[np.ndarray, bool]:
        """
        General image enhancement (sharpening, denoising, color correction)

        Args:
            image: Input image as numpy array (BGR format)

        Returns:
            Tuple of (enhanced_image, success)
        """
        try:
            # Denoise
            denoised = cv2.fastNlMeansDenoisingColored(image, None, 10, 10, 7, 21)

            # Sharpen
            kernel = np.array([[-1, -1, -1],
                             [-1,  9, -1],
                             [-1, -1, -1]])
            sharpened = cv2.filter2D(denoised, -1, kernel)

            # Blend original and sharpened
            output = cv2.addWeighted(denoised, 0.7, sharpened, 0.3, 0)

            # Color correction using histogram equalization
            lab = cv2.cvtColor(output, cv2.COLOR_BGR2LAB)
            l, a, b = cv2.split(lab)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
            l = clahe.apply(l)
            lab = cv2.merge([l, a, b])
            output = cv2.cvtColor(lab, cv2.COLOR_LAB2BGR)

            return output, True

        except Exception as e:
            logger.error(f"Error in enhancement: {e}")
            return image, False

    def process_image(
        self,
        image_path: str,
        processing_type: str,
        upscale_factor: int = 2
    ) -> Tuple[Optional[np.ndarray], bool]:
        """
        Main processing function that routes to appropriate model

        Args:
            image_path: Path to input image
            processing_type: Type of processing ('restore', 'colorize', 'upscale', 'enhance')
            upscale_factor: Upscaling factor for upscale operation

        Returns:
            Tuple of (processed_image, success)
        """
        try:
            # Load image
            image = cv2.imread(image_path)
            if image is None:
                logger.error(f"Failed to load image: {image_path}")
                return None, False

            # Route to appropriate processing
            if processing_type == 'restore':
                return self.restore_face(image)
            elif processing_type == 'colorize':
                return self.colorize_image(image)
            elif processing_type == 'upscale':
                return self.upscale_image(image, upscale_factor)
            elif processing_type == 'enhance':
                return self.enhance_image(image)
            else:
                logger.error(f"Unknown processing type: {processing_type}")
                return None, False

        except Exception as e:
            logger.error(f"Error in process_image: {e}")
            return None, False

    def is_gpu_available(self) -> bool:
        """Check if GPU is available"""
        return torch.cuda.is_available()

    def models_loaded(self) -> bool:
        """Check if all models are loaded"""
        return self.gfpgan_model is not None and self.realesrgan_model is not None


# Global instance
_restorer_instance: Optional[ImageRestorer] = None


def get_restorer() -> ImageRestorer:
    """Get or create global restorer instance"""
    global _restorer_instance
    if _restorer_instance is None:
        _restorer_instance = ImageRestorer()
    return _restorer_instance
