
// Backend configuration settings
export const BACKEND_CONFIG = {
  // API endpoints
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      LOGIN: '/auth/login/',
      REGISTER: '/auth/register/',
      LOGOUT: '/auth/logout/',
      REFRESH: '/auth/refresh/',
      VERIFY_OTP: '/auth/verify-otp/',
      RESEND_OTP: '/auth/resend-otp/',
      FORGOT_PASSWORD: '/auth/forgot-password/',
      VERIFY_FORGOT_OTP: '/auth/verify-forgot-otp/',
      RESET_PASSWORD: '/auth/reset-password/',
    },
    
    // User endpoints
    USERS: {
      PROFILE: '/users/profile/',
      USER_PROFILE: (id: number) => `/users/${id}/profile/`,
      FOLLOW_TOGGLE: (id: number) => `/users/${id}/follow-toggle/`,
      SAVED_POSTS: '/users/saved/',
    },
    
    // Posts endpoints
    POSTS: {
      LIST: '/posts/',
      DETAIL: (id: number) => `/posts/detail/${id}/`,
      LIKE: (id: number) => `/posts/${id}/like/`,
      SAVE: (id: number) => `/posts/${id}/save/`,
      COMMENTS: (id: number) => `/posts/${id}/comments/`,
      COMMENT_DETAIL: (id: number) => `/posts/comments/${id}/`,
    },
  },
  
  // Request settings
  TIMEOUT: 10000, // 10 seconds
  
  // File upload settings
  UPLOAD: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    ALLOWED_VIDEO_TYPES: ['video/mp4', 'video/webm', 'video/mov'],
  },
  
  // Pagination settings
  PAGINATION: {
    DEFAULT_PAGE_SIZE: 10,
    MAX_PAGE_SIZE: 50,
  },
  
  // Environment-specific URLs
  URLS: {
    DEVELOPMENT: 'http://localhost:8000/api',
    PRODUCTION: 'https://your-backend-domain.com/api', // Update this with your actual production URL
  },
} as const;

// Helper function to get the appropriate backend URL
export const getBackendURL = (): string => {
  const isDevelopment = import.meta.env.DEV;
  return isDevelopment ? BACKEND_CONFIG.URLS.DEVELOPMENT : BACKEND_CONFIG.URLS.PRODUCTION;
};

// Helper function to validate file uploads
export const validateFileUpload = (file: File): { isValid: boolean; error?: string } => {
  const { MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES, ALLOWED_VIDEO_TYPES } = BACKEND_CONFIG.UPLOAD;
  
  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`
    };
  }
  
  // Check file type
  const allowedTypes = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'File type not supported. Please upload images (JPEG, PNG, GIF, WebP) or videos (MP4, WebM, MOV)'
    };
  }
  
  return { isValid: true };
};
