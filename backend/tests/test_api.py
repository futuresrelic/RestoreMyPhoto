"""
Tests for RestoreMyPhoto API endpoints
"""
import pytest
from fastapi.testclient import TestClient
from main import app
import io
from PIL import Image
import numpy as np


@pytest.fixture
def client():
    """Create test client"""
    return TestClient(app)


@pytest.fixture
def sample_image():
    """Create a sample image for testing"""
    # Create a simple test image
    img = Image.new('RGB', (100, 100), color='red')
    img_bytes = io.BytesIO()
    img.save(img_bytes, format='JPEG')
    img_bytes.seek(0)
    return img_bytes


class TestHealthEndpoints:
    """Test health check endpoints"""

    def test_root(self, client):
        """Test root endpoint"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "running"
        assert "version" in data

    def test_health_check(self, client):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "models_loaded" in data
        assert "gpu_available" in data


class TestImageProcessing:
    """Test image processing endpoints"""

    def test_restore_endpoint(self, client, sample_image):
        """Test restore endpoint"""
        files = {"file": ("test.jpg", sample_image, "image/jpeg")}
        data = {"user_id": "test_user", "is_premium": False}

        response = client.post("/api/restore", files=files, data=data)

        assert response.status_code == 200
        result = response.json()
        assert result["success"] is True
        assert "processed_image_url" in result
        assert "image_id" in result

    def test_colorize_endpoint(self, client, sample_image):
        """Test colorize endpoint"""
        files = {"file": ("test.jpg", sample_image, "image/jpeg")}
        data = {"user_id": "test_user", "is_premium": False}

        response = client.post("/api/colorize", files=files, data=data)

        assert response.status_code == 200
        result = response.json()
        assert result["success"] is True

    def test_upscale_endpoint(self, client, sample_image):
        """Test upscale endpoint"""
        files = {"file": ("test.jpg", sample_image, "image/jpeg")}
        data = {"user_id": "test_user", "is_premium": False, "upscale_factor": 2}

        response = client.post("/api/upscale", files=files, data=data)

        assert response.status_code == 200
        result = response.json()
        assert result["success"] is True

    def test_enhance_endpoint(self, client, sample_image):
        """Test enhance endpoint"""
        files = {"file": ("test.jpg", sample_image, "image/jpeg")}
        data = {"user_id": "test_user", "is_premium": False}

        response = client.post("/api/enhance", files=files, data=data)

        assert response.status_code == 200
        result = response.json()
        assert result["success"] is True

    def test_invalid_file(self, client):
        """Test with invalid file"""
        files = {"file": ("test.txt", io.BytesIO(b"not an image"), "text/plain")}
        data = {"user_id": "test_user"}

        response = client.post("/api/restore", files=files, data=data)

        assert response.status_code == 400


class TestSubscription:
    """Test subscription endpoints"""

    def test_get_subscription(self, client):
        """Test get subscription endpoint"""
        response = client.get("/api/subscription/test_user")

        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == "test_user"
        assert "subscription_tier" in data
        assert "is_active" in data

    def test_free_tier_limits(self, client, sample_image):
        """Test free tier repair limits"""
        files = {"file": ("test.jpg", sample_image, "image/jpeg")}
        data = {"user_id": "test_user_limits", "is_premium": False}

        # Should succeed for first 3 repairs
        for i in range(3):
            response = client.post("/api/restore", files=files, data=data)
            assert response.status_code == 200

        # 4th repair should fail
        sample_image.seek(0)
        response = client.post("/api/restore", files=files, data=data)
        assert response.status_code == 403

    def test_reset_free_repairs(self, client):
        """Test reset free repairs"""
        response = client.post("/api/subscription/reset-free/test_user")

        assert response.status_code == 200
        data = response.json()
        assert data["user_id"] == "test_user"


class TestWatermark:
    """Test watermarking functionality"""

    def test_free_user_has_watermark(self, client, sample_image):
        """Test that free users get watermarked images"""
        files = {"file": ("test.jpg", sample_image, "image/jpeg")}
        data = {"user_id": "test_free_user", "is_premium": False}

        response = client.post("/api/restore", files=files, data=data)

        assert response.status_code == 200
        result = response.json()
        assert result["has_watermark"] is True

    def test_premium_user_no_watermark(self, client, sample_image):
        """Test that premium users don't get watermarks"""
        files = {"file": ("test.jpg", sample_image, "image/jpeg")}
        data = {"user_id": "test_premium_user", "is_premium": True}

        response = client.post("/api/restore", files=files, data=data)

        assert response.status_code == 200
        result = response.json()
        assert result["has_watermark"] is False


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
