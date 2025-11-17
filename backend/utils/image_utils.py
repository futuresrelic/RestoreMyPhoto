"""
Image processing utilities
"""
import os
import uuid
import cv2
import numpy as np
from pathlib import Path
from typing import Optional, Tuple
import logging

logger = logging.getLogger(__name__)


class ImageManager:
    """Manager for handling image I/O operations"""

    def __init__(self, upload_dir: str = "uploads", output_dir: str = "outputs"):
        """
        Initialize image manager

        Args:
            upload_dir: Directory for uploaded images
            output_dir: Directory for processed images
        """
        self.upload_dir = Path(upload_dir)
        self.output_dir = Path(output_dir)

        # Create directories
        self.upload_dir.mkdir(exist_ok=True)
        self.output_dir.mkdir(exist_ok=True)

    def save_upload(self, file_content: bytes, original_filename: str) -> Tuple[str, str]:
        """
        Save uploaded file

        Args:
            file_content: File content as bytes
            original_filename: Original filename

        Returns:
            Tuple of (saved_path, image_id)
        """
        try:
            # Generate unique ID
            image_id = str(uuid.uuid4())

            # Get file extension
            ext = Path(original_filename).suffix.lower()
            if not ext:
                ext = '.jpg'

            # Create filename
            filename = f"{image_id}{ext}"
            filepath = self.upload_dir / filename

            # Save file
            with open(filepath, 'wb') as f:
                f.write(file_content)

            logger.info(f"Saved upload: {filepath}")
            return str(filepath), image_id

        except Exception as e:
            logger.error(f"Error saving upload: {e}")
            raise

    def save_processed(
        self,
        image: np.ndarray,
        image_id: str,
        processing_type: str
    ) -> str:
        """
        Save processed image

        Args:
            image: Processed image as numpy array
            image_id: Image ID
            processing_type: Type of processing applied

        Returns:
            Path to saved image
        """
        try:
            filename = f"{image_id}_{processing_type}.jpg"
            filepath = self.output_dir / filename

            # Save with high quality
            cv2.imwrite(str(filepath), image, [cv2.IMWRITE_JPEG_QUALITY, 95])

            logger.info(f"Saved processed image: {filepath}")
            return str(filepath)

        except Exception as e:
            logger.error(f"Error saving processed image: {e}")
            raise

    def get_image_url(self, filepath: str, base_url: str) -> str:
        """
        Convert filepath to URL

        Args:
            filepath: Local filepath
            base_url: Base URL of the server

        Returns:
            Full URL to the image
        """
        # Extract relative path
        path = Path(filepath)
        relative_path = path.relative_to(Path.cwd())

        # Construct URL
        url = f"{base_url}/{relative_path}"
        return url

    def cleanup_old_files(self, max_age_hours: int = 24):
        """
        Clean up old files

        Args:
            max_age_hours: Maximum age of files in hours
        """
        import time

        current_time = time.time()
        max_age_seconds = max_age_hours * 3600

        for directory in [self.upload_dir, self.output_dir]:
            for filepath in directory.glob('*'):
                if filepath.is_file():
                    file_age = current_time - filepath.stat().st_mtime
                    if file_age > max_age_seconds:
                        try:
                            filepath.unlink()
                            logger.info(f"Deleted old file: {filepath}")
                        except Exception as e:
                            logger.error(f"Error deleting {filepath}: {e}")

    def delete_image(self, filepath: str):
        """
        Delete a specific image

        Args:
            filepath: Path to image to delete
        """
        try:
            path = Path(filepath)
            if path.exists():
                path.unlink()
                logger.info(f"Deleted image: {filepath}")
        except Exception as e:
            logger.error(f"Error deleting image: {e}")


def validate_image(file_content: bytes) -> bool:
    """
    Validate that uploaded file is a valid image

    Args:
        file_content: File content as bytes

    Returns:
        True if valid image, False otherwise
    """
    try:
        # Try to decode as image
        nparr = np.frombuffer(file_content, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        return img is not None

    except Exception as e:
        logger.error(f"Image validation failed: {e}")
        return False


def get_image_dimensions(filepath: str) -> Optional[Tuple[int, int]]:
    """
    Get image dimensions

    Args:
        filepath: Path to image

    Returns:
        Tuple of (width, height) or None if error
    """
    try:
        img = cv2.imread(filepath)
        if img is not None:
            height, width = img.shape[:2]
            return width, height
        return None

    except Exception as e:
        logger.error(f"Error getting image dimensions: {e}")
        return None
