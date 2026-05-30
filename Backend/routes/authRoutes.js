import express from 'express'
import { 
  registerUser, 
  googleRegisterUser, 
  loginUser, 
  getUsers, 
  getSearchHistory, 
  addSearchHistory, 
  clearSearchHistory,
  logoutUser,
  getMessages,
  sendMessage,
  getConversations,
  createConversation,
  getProfile,
  updateProfile,
  checkUsernameAvailability,
  checkPhoneAvailability,
  sendEmailOtp,
  verifyEmailOtp,
  createGroup,
  getGroupInfo,
  addMembersToGroup,
  leaveGroup,
  deleteGroup,
  markAsRead
} from '../controllers/authController.js'

const router = express.Router()

// POST route for registering a new user
router.post('/register', registerUser)

// POST route for Google register/login
router.post('/google-register', googleRegisterUser)

// POST route for standard login
router.post('/login', loginUser)

// POST route for user logout status update
router.post('/logout', logoutUser)

// GET route for fetching all users
router.get('/users', getUsers)

// Search History routes
router.get('/search-history', getSearchHistory)
router.post('/search-history', addSearchHistory)
router.delete('/search-history', clearSearchHistory)

// Normalized Dynamic Messaging routes
router.post('/conversations', createConversation)
router.get('/conversations/:userId', getConversations)
router.get('/messages/:conversationId', getMessages)
router.post('/messages', sendMessage)
router.post('/messages/read', markAsRead)

// User Profile routes
router.get('/profile/:userId', getProfile)
router.put('/profile/:userId', updateProfile)

// Realtime Username & Phone Availability routes
router.get('/check-username/:username', checkUsernameAvailability)
router.get('/check-phone/:phone', checkPhoneAvailability)

// Secure Email OTP routes
router.post('/send-email-otp', sendEmailOtp)
router.post('/verify-email-otp', verifyEmailOtp)

// Premium Group management routes
router.post('/groups', createGroup)
router.get('/groups/:groupId/info', getGroupInfo)
router.post('/groups/:groupId/members', addMembersToGroup)
router.delete('/groups/:groupId/members/:userId', leaveGroup)
router.delete('/groups/:groupId', deleteGroup)

export default router
