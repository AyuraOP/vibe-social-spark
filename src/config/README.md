
# Backend Configuration Guide

## Quick Setup

### 1. Development Environment
- Your Django backend should be running on `http://localhost:8000`
- Make sure CORS is properly configured in your Django settings to allow requests from `http://localhost:8080`
- Ensure all the API endpoints are implemented as described in the requirements

### 2. Production Environment
- Update the `PRODUCTION` URL in `src/config/backend.ts`
- Make sure your production backend has HTTPS enabled
- Configure proper CORS settings for your production frontend domain

## Backend Requirements

Your Django backend should have these endpoints implemented:

### Authentication
- `POST /auth/login/` - User login
- `POST /auth/register/` - User registration  
- `POST /auth/verify-otp/` - OTP verification
- `POST /auth/resend-otp/` - Resend OTP
- `POST /auth/logout/` - User logout
- `POST /auth/refresh/` - Token refresh
- `POST /auth/forgot-password/` - Forgot password
- `POST /auth/verify-forgot-otp/` - Verify forgot password OTP
- `POST /auth/reset-password/` - Reset password

### Users
- `GET /users/profile/` - Get current user profile
- `GET /users/{id}/profile/` - Get user profile by ID
- `POST /users/{id}/follow-toggle/` - Follow/unfollow user
- `GET /users/saved/` - Get saved posts

### Posts
- `GET /posts/` - Get posts feed (supports ?sort=liked,trending&search=keyword)
- `POST /posts/` - Create new post
- `GET /posts/detail/{id}/` - Get post details
- `PATCH /posts/detail/{id}/` - Update post
- `DELETE /posts/detail/{id}/` - Delete post
- `POST /posts/{id}/like/` - Like/unlike post
- `POST /posts/{id}/save/` - Save/unsave post
- `GET /posts/{id}/comments/` - Get post comments
- `POST /posts/{id}/comments/` - Add comment
- `PATCH /posts/comments/{id}/` - Update comment
- `DELETE /posts/comments/{id}/` - Delete comment

## CORS Configuration

Make sure your Django `settings.py` includes:

```python
# CORS settings
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8080",  # Vite dev server
    "https://yourdomain.com",  # Your production domain
]

CORS_ALLOW_CREDENTIALS = True
```

## File Upload Settings

The frontend is configured to handle:
- Images: JPEG, PNG, GIF, WebP (max 10MB)
- Videos: MP4, WebM, MOV (max 10MB)

Make sure your Django backend can handle these file types and sizes.
