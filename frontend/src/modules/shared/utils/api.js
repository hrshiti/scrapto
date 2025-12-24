import { API_BASE_URL, API_ENDPOINTS } from '../../../config/apiConfig.js';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to make API requests
const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();

  const isFormData = options.body instanceof FormData;

  // Build headers properly - ensure Authorization is always included if token exists
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers, // User-provided headers can override Content-Type but not Authorization
  };

  // If token exists, ensure Authorization is set (override any empty Authorization from options.headers)
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  // Debug logging for auth issues
  if (endpoint.includes('/uploads/') || endpoint.includes('/auth/me') || endpoint.includes('/kyc')) {
    console.log('🔍 API Request Debug:', {
      endpoint,
      hasToken: !!token,
      tokenLength: token?.length,
      tokenPreview: token ? `${token.substring(0, 20)}...` : 'none',
      hasAuthHeader: !!config.headers.Authorization,
      authHeaderValue: config.headers.Authorization ? `${config.headers.Authorization.substring(0, 30)}...` : 'none',
      isFormData: isFormData,
      method: config.method || 'GET'
    });
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      // Enhanced error logging for 401s
      if (response.status === 401) {
        console.error('❌ 401 Unauthorized:', {
          endpoint,
          hasToken: !!token,
          responseData: data
        });
      }
      const apiError = new Error(data.error || data.message || 'Something went wrong');
      apiError.status = response.status;
      apiError.data = data;
      throw apiError;
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// Auth API functions
export const authAPI = {
  // Register user
  register: async (userData) => {
    return apiRequest(API_ENDPOINTS.auth.register, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  // Login user
  login: async (email, password) => {
    return apiRequest(API_ENDPOINTS.auth.login, {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  // Send login OTP
  sendLoginOTP: async (phone, role = 'user') => {
    return apiRequest(API_ENDPOINTS.auth.loginOtp, {
      method: 'POST',
      body: JSON.stringify({ phone, role }),
    });
  },

  // Verify OTP
  verifyOTP: async (phone, otp, purpose = 'verification', role = null) => {
    const body = { phone, otp, purpose };
    if (role) {
      body.role = role;
    }
    return apiRequest(API_ENDPOINTS.auth.verifyOtp, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  // Resend OTP
  resendOTP: async (phone) => {
    return apiRequest(API_ENDPOINTS.auth.resendOtp, {
      method: 'POST',
      body: JSON.stringify({ phone }),
    });
  },

  // Get current user
  getMe: async () => {
    return apiRequest(API_ENDPOINTS.auth.me, {
      method: 'GET',
    });
  },

  // Update profile
  updateProfile: async (profileData) => {
    return apiRequest(API_ENDPOINTS.auth.profile, {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
};

// Order API
export const orderAPI = {
  create: async (payload) => {
    return apiRequest(API_ENDPOINTS.orders.root, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  getMy: async (query = '') => {
    const suffix = query ? `?${query}` : '';
    return apiRequest(`${API_ENDPOINTS.orders.my}${suffix}`, {
      method: 'GET',
    });
  },
  getById: async (id) => {
    return apiRequest(API_ENDPOINTS.orders.byId(id), {
      method: 'GET',
    });
  },
  updateStatus: async (id, status, paymentStatus = null, totalAmount = null) => {
    const body = { status };
    if (paymentStatus) body.paymentStatus = paymentStatus;
    if (totalAmount) body.totalAmount = totalAmount;

    return apiRequest(API_ENDPOINTS.orders.status(id), {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },
  cancel: async (id, reason) => {
    return apiRequest(API_ENDPOINTS.orders.cancel(id), {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
  accept: async (id) => {
    return apiRequest(API_ENDPOINTS.orders.accept(id), {
      method: 'POST',
    });
  },
};

// Payment API
export const paymentAPI = {
  createPaymentOrder: async (orderId) => {
    return apiRequest(API_ENDPOINTS.payments.createOrder, {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
  },
  verifyPayment: async (payload) => {
    return apiRequest(API_ENDPOINTS.payments.verify, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  getStatus: async (orderId) => {
    return apiRequest(API_ENDPOINTS.payments.status(orderId), {
      method: 'GET',
    });
  },
  getMyPayments: async (query = '') => {
    const suffix = query ? `?${query}` : '';
    return apiRequest(`${API_ENDPOINTS.payments.mine}${suffix}`, {
      method: 'GET',
    });
  },
  createSubscriptionOrder: async ({ amount, planName, durationDays }) => {
    return apiRequest('/payments/subscription/create', {
      method: 'POST',
      body: JSON.stringify({ amount, planName, durationDays }),
    });
  },
  verifySubscription: async (payload) => {
    return apiRequest('/payments/subscription/verify', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
};

// Subscription API functions
export const subscriptionAPI = {
  // Get all active plans
  getPlans: async () => {
    return apiRequest('/subscriptions/plans', {
      method: 'GET',
    });
  },

  // Get plan by ID
  getPlan: async (planId) => {
    return apiRequest(`/subscriptions/plans/${planId}`, {
      method: 'GET',
    });
  },

  // Get my subscription
  getMySubscription: async () => {
    return apiRequest('/subscriptions/my-subscription', {
      method: 'GET',
    });
  },

  // Subscribe to a plan
  subscribe: async (planId) => {
    return apiRequest('/subscriptions/subscribe', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    });
  },

  // Verify subscription payment
  verifyPayment: async (paymentData) => {
    return apiRequest('/subscriptions/verify-payment', {
      method: 'POST',
      body: JSON.stringify(paymentData),
    });
  },

  // Cancel subscription
  cancel: async (reason = null) => {
    return apiRequest('/subscriptions/cancel', {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  // Renew subscription
  renew: async (planId) => {
    return apiRequest('/subscriptions/renew', {
      method: 'POST',
      body: JSON.stringify({ planId }),
    });
  },

  // Get subscription history
  getHistory: async () => {
    return apiRequest('/subscriptions/history', {
      method: 'GET',
    });
  },
};

// Upload API (Cloudinary-backed)
export const uploadAPI = {
  uploadOrderImages: async (files) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    return apiRequest(API_ENDPOINTS.uploads.orderImages, {
      method: 'POST',
      body: formData,
      // Don't set headers: {} - let apiRequest handle Authorization header
      // Browser will automatically set Content-Type with boundary for FormData
    });
  },
  uploadKycDocs: async (fileMap = {}) => {
    const formData = new FormData();
    Object.entries(fileMap).forEach(([field, value]) => {
      if (Array.isArray(value)) {
        value.forEach((f) => formData.append(field, f));
      } else if (value) {
        formData.append(field, value);
      }
    });
    return apiRequest(API_ENDPOINTS.uploads.kycDocs, {
      method: 'POST',
      body: formData,
      headers: {}, // let browser set multipart boundary
    });
  },
};

// KYC API (scrapper)
export const kycAPI = {
  submit: async (formData) => {
    return apiRequest('/kyc', {
      method: 'POST',
      body: formData,
      headers: {}, // multipart
    });
  },
  getMy: async () => {
    return apiRequest('/kyc/me', {
      method: 'GET',
    });
  },
};

// Scrapper Orders API
export const scrapperOrdersAPI = {
  // Get available (unassigned) orders
  getAvailable: async (query = '') => {
    const suffix = query ? `?${query}` : '';
    return apiRequest(`${API_ENDPOINTS.orders.available}${suffix}`, {
      method: 'GET',
    });
  },
  // Get scrapper's assigned orders
  getMyAssigned: async (query = '') => {
    const suffix = query ? `?${query}` : '';
    return apiRequest(`${API_ENDPOINTS.orders.myAssigned}${suffix}`, {
      method: 'GET',
    });
  },
  // Accept an order (already exists in orderAPI, but keeping for clarity)
  accept: async (id) => {
    return apiRequest(API_ENDPOINTS.orders.accept(id), {
      method: 'POST',
    });
  },
};

// Admin Orders API
export const adminOrdersAPI = {
  // Get all orders (with filters)
  getAll: async (query = '') => {
    const suffix = query ? `?${query}` : '';
    return apiRequest(`${API_ENDPOINTS.orders.adminAll}${suffix}`, {
      method: 'GET',
    });
  },
  // Get order by ID
  getById: async (id) => {
    return apiRequest(API_ENDPOINTS.orders.adminById(id), {
      method: 'GET',
    });
  },
  // Assign order to scrapper
  assign: async (id, scrapperId) => {
    return apiRequest(API_ENDPOINTS.orders.adminAssign(id), {
      method: 'POST',
      body: JSON.stringify({ scrapperId }),
    });
  },
  // Cancel order (admin)
  cancel: async (id, reason) => {
    return apiRequest(API_ENDPOINTS.orders.adminCancel(id), {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};

// Earnings API (to be connected when backend endpoints are created)
export const earningsAPI = {
  // Scrapper earnings summary
  getSummary: async (query = '') => {
    const suffix = query ? `?${query}` : '';
    return apiRequest(`${API_ENDPOINTS.earnings.scrapperSummary}${suffix}`, {
      method: 'GET',
    });
  },
  // Scrapper earnings history
  getHistory: async (query = '') => {
    const suffix = query ? `?${query}` : '';
    return apiRequest(`${API_ENDPOINTS.earnings.scrapperHistory}${suffix}`, {
      method: 'GET',
    });
  },
  // Admin: Get scrapper earnings
  getScrapperEarnings: async (scrapperId, query = '') => {
    const suffix = query ? `?${query}` : '';
    return apiRequest(`${API_ENDPOINTS.earnings.adminScrapperEarnings(scrapperId)}${suffix}`, {
      method: 'GET',
    });
  },
  // Admin: Adjust scrapper earnings
  adjustEarnings: async (scrapperId, adjustmentData) => {
    return apiRequest(API_ENDPOINTS.earnings.adminAdjustEarnings(scrapperId), {
      method: 'POST',
      body: JSON.stringify(adjustmentData),
    });
  },
};

// Review API
export const reviewAPI = {
  // Create a review
  create: async ({ orderId, scrapperId, rating, comment = null, title = null, tags = [], images = [] }) => {
    return apiRequest('/reviews', {
      method: 'POST',
      body: JSON.stringify({ orderId, scrapperId, rating, comment, title, tags, images }),
    });
  },
  // Get reviews for a scrapper
  getScrapperReviews: async (scrapperId, query = '') => {
    const suffix = query ? `?${query}` : '';
    return apiRequest(`/reviews/scrapper/${scrapperId}${suffix}`, {
      method: 'GET',
    });
  },
  // Get reviews written by current user
  getMyReviews: async (query = '') => {
    const suffix = query ? `?${query}` : '';
    return apiRequest(`/reviews/my-reviews${suffix}`, {
      method: 'GET',
    });
  },
  // Get review by ID
  getById: async (reviewId) => {
    return apiRequest(`/reviews/${reviewId}`, {
      method: 'GET',
    });
  },
  // Update review
  update: async (reviewId, rating, comment = null, title = null, tags = [], images = []) => {
    return apiRequest(`/reviews/${reviewId}`, {
      method: 'PUT',
      body: JSON.stringify({ rating, comment, title, tags, images }),
    });
  },
  // Delete review
  delete: async (reviewId) => {
    return apiRequest(`/reviews/${reviewId}`, {
      method: 'DELETE',
    });
  },
  // Flag review
  flag: async (reviewId, reason = '') => {
    return apiRequest(`/reviews/${reviewId}/flag`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
};

// Chat API
export const chatAPI = {
  // Get all chats for current user/scrapper
  getMyChats: async (query = '') => {
    const suffix = query ? `?${query}` : '';
    return apiRequest(`/chats${suffix}`, {
      method: 'GET',
    });
  },
  // Get or create chat for an order
  getOrCreate: async (orderId) => {
    return apiRequest(`/chats/order/${orderId}`, {
      method: 'GET',
    });
  },
  // Get messages for a chat
  getMessages: async (chatId, page = 1, limit = 50) => {
    return apiRequest(`/chats/${chatId}/messages?page=${page}&limit=${limit}`, {
      method: 'GET',
    });
  },
  // Get chat by ID with messages (for compatibility)
  getChatById: async (chatId, query = '') => {
    const suffix = query ? `?${query}` : '';
    // First get chat info, then get messages
    const chatResponse = await apiRequest(`/chats/order/${chatId}${suffix}`, {
      method: 'GET',
    });
    if (chatResponse.success && chatResponse.data?.chat) {
      const messagesResponse = await apiRequest(`/chats/${chatResponse.data.chat._id}/messages`, {
        method: 'GET',
      });
      return {
        ...chatResponse,
        data: {
          ...chatResponse.data,
          messages: messagesResponse.success ? messagesResponse.data?.messages || [] : [],
        }
      };
    }
    return chatResponse;
  },
  // Create or get chat for an order (alias for getOrCreate)
  createChat: async (orderId) => {
    return apiRequest(`/chats/order/${orderId}`, {
      method: 'GET',
    });
  },
  // Send message in chat
  sendMessage: async (chatId, content, attachments = []) => {
    return apiRequest(`/chats/${chatId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ message: content, attachments }),
    });
  },
  // Mark messages as read
  markAsRead: async (chatId) => {
    return apiRequest(`/chats/${chatId}/read`, {
      method: 'POST',
    });
  },
  // Archive chat
  archiveChat: async (chatId) => {
    return apiRequest(`/chats/${chatId}/archive`, {
      method: 'PUT',
    });
  },
  // Get unread message count
  getUnreadCount: async () => {
    return apiRequest('/chats/unread-count', {
      method: 'GET',
    });
  },
};

// Admin API
export const adminAPI = {
  // KYC Management
  getScrappersWithKyc: async (query = '') => {
    const suffix = query ? `?${query}` : '';
    return apiRequest(`/kyc/scrappers${suffix}`, {
      method: 'GET',
    });
  },
  verifyKyc: async (scrapperId) => {
    return apiRequest(`/kyc/${scrapperId}/verify`, {
      method: 'POST',
    });
  },
  rejectKyc: async (scrapperId, reason) => {
    return apiRequest(`/kyc/${scrapperId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },
  // Dashboard & Analytics
  getDashboardStats: async () => {
    return apiRequest(API_ENDPOINTS.admin.dashboardStats, {
      method: 'GET',
    });
  },
  getPaymentAnalytics: async () => {
    return apiRequest(API_ENDPOINTS.admin.analyticsPayments, {
      method: 'GET',
    });
  },
  // User Management
  getAllUsers: async (query = '') => {
    const suffix = query ? `?${query}` : '';
    return apiRequest(`${API_ENDPOINTS.admin.users}${suffix}`, {
      method: 'GET',
    });
  },
  getUserById: async (id) => {
    return apiRequest(API_ENDPOINTS.admin.userById(id), {
      method: 'GET',
    });
  },
  updateUser: async (id, userData) => {
    return apiRequest(API_ENDPOINTS.admin.userById(id), {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },
  blockUser: async (id) => {
    return apiRequest(API_ENDPOINTS.admin.userBlock(id), {
      method: 'PATCH',
    });
  },
  deleteUser: async (id) => {
    return apiRequest(API_ENDPOINTS.admin.userById(id), {
      method: 'DELETE',
    });
  },
  // Scrapper Management
  getAllScrappers: async (query = '') => {
    const suffix = query ? `?${query}` : '';
    return apiRequest(`${API_ENDPOINTS.admin.scrappers}${suffix}`, {
      method: 'GET',
    });
  },
  getScrapperById: async (id) => {
    return apiRequest(API_ENDPOINTS.admin.scrapperById(id), {
      method: 'GET',
    });
  },
  updateScrapper: async (id, scrapperData) => {
    return apiRequest(API_ENDPOINTS.admin.scrapperById(id), {
      method: 'PUT',
      body: JSON.stringify(scrapperData),
    });
  },
  updateScrapperStatus: async (id, status) => {
    return apiRequest(API_ENDPOINTS.admin.scrapperStatus(id), {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },
  deleteScrapper: async (id) => {
    return apiRequest(API_ENDPOINTS.admin.scrapperById(id), {
      method: 'DELETE',
    });
  },
  // Price Feed Management
  getAllPrices: async () => {
    return apiRequest(API_ENDPOINTS.admin.prices, {
      method: 'GET',
    });
  },
  createPrice: async (priceData) => {
    return apiRequest(API_ENDPOINTS.admin.prices, {
      method: 'POST',
      body: JSON.stringify(priceData),
    });
  },
  updatePrice: async (id, priceData) => {
    return apiRequest(API_ENDPOINTS.admin.priceById(id), {
      method: 'PUT',
      body: JSON.stringify(priceData),
    });
  },
  deletePrice: async (id) => {
    return apiRequest(API_ENDPOINTS.admin.priceById(id), {
      method: 'DELETE',
    });
  },
  // Subscription Management
  getAllSubscriptions: async () => {
    return apiRequest(API_ENDPOINTS.admin.subscriptionsAll, {
      method: 'GET',
    });
  },
  // Subscription Plan Management
  createPlan: async (planData) => {
    return apiRequest(API_ENDPOINTS.admin.subscriptionPlans, {
      method: 'POST',
      body: JSON.stringify(planData),
    });
  },
  updatePlan: async (id, planData) => {
    return apiRequest(API_ENDPOINTS.admin.subscriptionPlanById(id), {
      method: 'PUT',
      body: JSON.stringify(planData),
    });
  },
  deletePlan: async (id) => {
    return apiRequest(API_ENDPOINTS.admin.subscriptionPlanById(id), {
      method: 'DELETE',
    });
  },
};

// Scrapper Profile API
export const scrapperProfileAPI = {
  getMyProfile: async () => {
    return apiRequest('/scrappers/me', {
      method: 'GET',
    });
  },
  updateMyProfile: async (profileData) => {
    return apiRequest('/scrappers/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },
  getPublicProfile: async (id) => {
    return apiRequest(`/scrappers/${id}/profile`, {
      method: 'GET',
    });
  },
};

// Banner API
export const bannerAPI = {
  // Get active banners (public)
  getActive: async (audience = 'both') => {
    return apiRequest(`/banners/public?audience=${audience}`, {
      method: 'GET',
    });
  },
  // Get all banners (admin)
  getAllAdmin: async () => {
    return apiRequest('/banners/admin/all', {
      method: 'GET',
    });
  },
  // Create banner
  create: async (formData) => {
    return apiRequest('/banners', {
      method: 'POST',
      body: formData,
      // headers: {} // let browser set multipart content type
    });
  },
  // Toggle status
  toggleStatus: async (id) => {
    return apiRequest(`/banners/${id}/status`, {
      method: 'PATCH',
    });
  },
  // Delete banner
  delete: async (id) => {
    return apiRequest(`/banners/${id}`, {
      method: 'DELETE',
    });
  }
};

export { API_BASE_URL, API_ENDPOINTS };
export default apiRequest;

