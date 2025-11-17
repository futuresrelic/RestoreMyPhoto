"""
Watermarking utilities for free tier images
"""
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from typing import Tuple
import logging

logger = logging.getLogger(__name__)


def add_watermark(
    image: np.ndarray,
    text: str = "RestoreMyPhoto",
    position: str = "bottom-right",
    opacity: float = 0.5
) -> np.ndarray:
    """
    Add watermark to image

    Args:
        image: Input image as numpy array (BGR format)
        text: Watermark text
        position: Position of watermark ('bottom-right', 'bottom-left', 'center')
        opacity: Opacity of watermark (0.0 to 1.0)

    Returns:
        Watermarked image
    """
    try:
        # Convert to PIL for easier text rendering
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        pil_image = Image.fromarray(image_rgb)

        # Create a transparent overlay
        overlay = Image.new('RGBA', pil_image.size, (255, 255, 255, 0))
        draw = ImageDraw.Draw(overlay)

        # Calculate font size based on image size
        font_size = max(20, int(min(pil_image.size) * 0.03))

        try:
            # Try to use a nice font
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
        except:
            # Fallback to default font
            font = ImageFont.load_default()

        # Get text bounding box
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]

        # Calculate position
        padding = 20
        if position == 'bottom-right':
            x = pil_image.width - text_width - padding
            y = pil_image.height - text_height - padding
        elif position == 'bottom-left':
            x = padding
            y = pil_image.height - text_height - padding
        elif position == 'center':
            x = (pil_image.width - text_width) // 2
            y = (pil_image.height - text_height) // 2
        else:
            x = pil_image.width - text_width - padding
            y = pil_image.height - text_height - padding

        # Draw text with semi-transparent background
        alpha = int(255 * opacity)

        # Draw background rectangle
        bg_padding = 5
        draw.rectangle(
            [x - bg_padding, y - bg_padding, x + text_width + bg_padding, y + text_height + bg_padding],
            fill=(0, 0, 0, int(alpha * 0.7))
        )

        # Draw text
        draw.text((x, y), text, font=font, fill=(255, 255, 255, alpha))

        # Composite the overlay onto the original image
        pil_image = pil_image.convert('RGBA')
        watermarked = Image.alpha_composite(pil_image, overlay)

        # Convert back to BGR numpy array
        watermarked_rgb = watermarked.convert('RGB')
        result = cv2.cvtColor(np.array(watermarked_rgb), cv2.COLOR_RGB2BGR)

        return result

    except Exception as e:
        logger.error(f"Error adding watermark: {e}")
        return image


def add_diagonal_watermark(
    image: np.ndarray,
    text: str = "RestoreMyPhoto - Free Version"
) -> np.ndarray:
    """
    Add diagonal watermark across the image

    Args:
        image: Input image as numpy array (BGR format)
        text: Watermark text

    Returns:
        Watermarked image
    """
    try:
        # Convert to PIL
        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        pil_image = Image.fromarray(image_rgb)

        # Create a transparent overlay
        overlay = Image.new('RGBA', pil_image.size, (255, 255, 255, 0))
        draw = ImageDraw.Draw(overlay)

        # Font size
        font_size = max(30, int(min(pil_image.size) * 0.04))

        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
        except:
            font = ImageFont.load_default()

        # Calculate diagonal position
        bbox = draw.textbbox((0, 0), text, font=font)
        text_width = bbox[2] - bbox[0]
        text_height = bbox[3] - bbox[1]

        # Create a new image for rotated text
        txt_img = Image.new('RGBA', (text_width + 20, text_height + 20), (255, 255, 255, 0))
        txt_draw = ImageDraw.Draw(txt_img)
        txt_draw.text((10, 10), text, font=font, fill=(255, 255, 255, 128))

        # Rotate text
        rotated = txt_img.rotate(45, expand=True)

        # Calculate center position
        x = (pil_image.width - rotated.width) // 2
        y = (pil_image.height - rotated.height) // 2

        # Paste rotated text onto overlay
        overlay.paste(rotated, (x, y), rotated)

        # Composite
        pil_image = pil_image.convert('RGBA')
        watermarked = Image.alpha_composite(pil_image, overlay)

        # Convert back
        watermarked_rgb = watermarked.convert('RGB')
        result = cv2.cvtColor(np.array(watermarked_rgb), cv2.COLOR_RGB2BGR)

        return result

    except Exception as e:
        logger.error(f"Error adding diagonal watermark: {e}")
        return image


def limit_resolution(
    image: np.ndarray,
    max_width: int = 1280,
    max_height: int = 720
) -> np.ndarray:
    """
    Limit image resolution for free tier

    Args:
        image: Input image
        max_width: Maximum width
        max_height: Maximum height

    Returns:
        Resized image if necessary
    """
    height, width = image.shape[:2]

    if width <= max_width and height <= max_height:
        return image

    # Calculate scaling factor
    scale = min(max_width / width, max_height / height)

    new_width = int(width * scale)
    new_height = int(height * scale)

    resized = cv2.resize(image, (new_width, new_height), interpolation=cv2.INTER_AREA)
    return resized
