# Contact Form API Integration Guide

## Overview
The contact form on the Contact page has been integrated with a dedicated contact API service. Currently, the implementation uses **simulated submissions** for development purposes, but is fully structured for seamless backend integration when ready.

## Current Status ✅
- **Status**: Simulated submission (Development mode)
- **File Location**: `src/services/contactApi.js`
- **Form Location**: `src/pages/ContactPage.jsx`
- **Build Status**: ✅ Successful compilation

## Features

### Current Features (Simulated Mode)
✅ Form validation using Zod schema  
✅ Real-time field validation with error messages  
✅ Loading states during submission  
✅ Success/error toast notifications  
✅ Ticket ID generation for tracking  
✅ Local storage of submissions (development mode)  
✅ Realistic API call simulation with delays  
✅ Error handling with user-friendly messages  

### Future Features (When Backend is Ready)
🔄 Real API endpoint integration  
🔄 Database storage of contact submissions  
🔄 Email notifications to admin  
🔄 Auto-reply emails to users  
🔄 Contact submission history  
🔄 Admin dashboard for contact management  

## Architecture

### Frontend Service: `contactApi.js`
```javascript
// Feature flag for switching between simulated and real API
const ENABLE_REAL_CONTACT_API = false; // Set to true when backend is ready

// API endpoints
const AUTH_API_BASE_URL = import.meta.env.VITE_AUTH_API_URL || 'http://localhost:5000';
```

### Form Validation Schema
```javascript
const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  subject: z.string().min(5, 'Subject must be at least 5 characters'),
  category: z.string().min(1, 'Please select a category'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
  phone: z.string().optional(),
  organization: z.string().optional()
})
```

### Categories Supported
- **General Inquiry** - General questions about the service
- **Technical Support** - Technical issues and bugs
- **Partnership** - Business partnership inquiries
- **Bug Report** - Report software bugs
- **Feature Request** - Suggest new features
- **Billing & Pricing** - Payment and subscription questions

## Backend Integration Steps

When you're ready to connect the contact form to a real backend API, follow these steps:

### Step 1: Backend Endpoint Creation

Create a new route in `auth_backend/src/routes/contact.routes.js`:

```javascript
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const rateLimiter = require('../middleware/rate-limiter');

// Contact form submission endpoint
router.post(
  '/',
  rateLimiter(10, 15), // 10 requests per 15 minutes
  [
    body('name').trim().isLength({ min: 2 }).escape(),
    body('email').isEmail().normalizeEmail(),
    body('subject').trim().isLength({ min: 5 }).escape(),
    body('category').isIn(['general', 'technical', 'partnership', 'bug', 'feature', 'billing']),
    body('message').trim().isLength({ min: 20 }).escape(),
    body('phone').optional().trim().escape(),
    body('organization').optional().trim().escape()
  ],
  async (req, res) => {
    try {
      // Validate input
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ 
          success: false, 
          errors: errors.array() 
        });
      }

      // Save to database using Prisma
      const contact = await prisma.contactSubmission.create({
        data: {
          name: req.body.name,
          email: req.body.email,
          subject: req.body.subject,
          category: req.body.category,
          message: req.body.message,
          phone: req.body.phone || null,
          organization: req.body.organization || null,
          status: 'pending',
          submitted_at: new Date()
        }
      });

      // Generate ticket ID
      const ticketId = `TICKET-${contact.id.toString().padStart(8, '0')}`;

      // TODO: Send email notification to admin
      // TODO: Send auto-reply email to user

      res.status(201).json({
        success: true,
        message: 'Contact form submitted successfully',
        ticket_id: ticketId
      });
    } catch (error) {
      console.error('Contact submission error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit contact form'
      });
    }
  }
);

module.exports = router;
```

### Step 2: Database Schema

Add to `auth_backend/prisma/schema.prisma`:

```prisma
model ContactSubmission {
  id            Int      @id @default(autoincrement())
  name          String
  email         String
  subject       String
  category      String
  message       String   @db.Text
  phone         String?
  organization  String?
  status        String   @default("pending") // pending, in-progress, resolved, closed
  submitted_at  DateTime @default(now())
  resolved_at   DateTime?
  resolved_by   Int?     // User ID of admin who resolved
  notes         String?  @db.Text
  
  @@index([email])
  @@index([status])
  @@index([submitted_at])
  @@map("contact_submissions")
}
```

### Step 3: Register Route in Server

Update `auth_backend/src/server.js`:

```javascript
const contactRoutes = require('./routes/contact.routes');

// Add this line with other routes
app.use('/api/contact', contactRoutes);
```

### Step 4: Update Frontend Environment

Add to `.env` or `.env.production`:

```env
# Contact API Configuration
VITE_AUTH_API_URL=https://your-auth-backend-url.com
```

### Step 5: Enable Real API in Frontend

Update `src/services/contactApi.js`:

```javascript
// Change this line
const ENABLE_REAL_CONTACT_API = true; // ✅ Now using real backend API
```

### Step 6: Test Integration

1. Run backend: `npm run dev` (in auth_backend directory)
2. Run frontend: `npm run dev` (in ML_frontend directory)
3. Submit a test contact form
4. Verify submission in database
5. Check console logs for any errors

### Step 7: Deploy

1. Deploy backend to Render/Heroku
2. Update `VITE_AUTH_API_URL` in Vercel environment variables
3. Redeploy frontend
4. Test production contact form

## Development Testing

### View Local Submissions (Dev Console)

```javascript
// Get all local submissions
const submissions = await contactApiService.getLocalSubmissions();
console.log('Local submissions:', submissions);

// Clear local submissions
await contactApiService.clearLocalSubmissions();
```

### Test Error Handling

The service includes a 10% random failure rate in development mode to test error handling. You can disable this by commenting out:

```javascript
// Comment out this block in contactApi.js
if (import.meta.env.DEV && Math.random() < 0.1) {
  throw new Error('Simulated random failure for testing');
}
```

## Error Handling

### Frontend Error Messages
- **Missing fields**: Zod validation errors shown inline
- **Invalid email**: "Please enter a valid email address"
- **Network error**: "Unable to connect to the contact service"
- **Timeout**: "The submission is taking longer than expected"
- **Server error**: "Our contact service is temporarily unavailable"
- **Rate limit**: "Too many contact requests. Please wait a moment"

### Backend Error Responses
All backend errors should follow this format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Optional: Validation errors array
}
```

## API Request Format

### POST /api/contact

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Question about NEET predictions",
  "category": "general",
  "message": "I have a question about how the ML predictions work...",
  "phone": "+91 9876543210",
  "organization": "ABC School"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Contact form submitted successfully",
  "ticket_id": "TICKET-00000123"
}
```

**Error Response (400/500):**
```json
{
  "success": false,
  "message": "Failed to submit contact form",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    }
  ]
}
```

## Security Considerations

✅ Input sanitization using express-validator  
✅ Rate limiting (10 requests per 15 minutes)  
✅ SQL injection prevention (Prisma ORM)  
✅ XSS prevention (input escaping)  
✅ CORS configuration for allowed origins  
✅ Email validation and normalization  
✅ Message length limits  

## Testing Checklist

Before enabling the real API:

- [ ] Backend endpoint created and tested
- [ ] Database schema migrated
- [ ] Environment variables configured
- [ ] CORS settings allow frontend domain
- [ ] Rate limiting configured
- [ ] Input validation working
- [ ] Email notifications tested (if implemented)
- [ ] Error handling covers all cases
- [ ] Load testing completed
- [ ] Security audit passed

## Monitoring & Analytics

Recommended metrics to track:
- Contact form submission rate
- Success/failure rate
- Response time
- Error types and frequency
- Category distribution
- Average resolution time
- User satisfaction (optional follow-up)

## Support

For questions or issues with the contact form integration:
- **Email**: akhilesh@aaseduguide.com
- **Phone**: +91 97216 36379
- **Documentation**: This file

## Changelog

### v1.0.0 (Current) - Simulated Mode
- ✅ Initial contact form implementation
- ✅ Form validation with Zod
- ✅ Simulated API submissions
- ✅ Local storage in development
- ✅ Toast notifications
- ✅ Error handling
- ✅ Ticket ID generation
- ✅ Responsive design

### v2.0.0 (Future) - Backend Integration
- 🔄 Real API endpoint connection
- 🔄 Database storage
- 🔄 Email notifications
- 🔄 Admin dashboard
- 🔄 Submission history

---

**Last Updated**: January 2025  
**Maintainer**: AAS EduGuide Development Team
