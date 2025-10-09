# Mikaelson Initiative Server - Features Documentation

## Overview
This document provides a comprehensive overview of all server-side features implemented in the Mikaelson Initiative platform. The server is built with Express.js, TypeScript, MongoDB (Prisma ORM), and Redis, designed to support a social productivity platform that helps users build better habits through community engagement.

## 🏗️ Architecture & Tech Stack

### Core Technologies
- **Backend Framework**: Express.js with TypeScript
- **Database**: MongoDB with Prisma ORM
- **Caching**: Redis for session management and performance
- **File Storage**: AWS S3 for media uploads
- **Email Service**: Nodemailer with SMTP
- **Authentication**: Clerk integration
- **Validation**: Zod for runtime type checking
- **Logging**: Pino for structured logging

### Project Structure
```
Server/src/
├── config/           # Database and email configuration
├── constants/        # Application constants
├── features/         # Feature-based controllers
│   ├── account/      # User management
│   ├── dashboard/    # Task/habit management
│   └── social-feed/  # Social features
├── generated/        # Prisma generated files
├── jobs/            # Background jobs (cron tasks)
├── libs/            # External service integrations
├── middleware/      # Express middleware
├── modules/         # Application modules
├── repository/      # Data access layer
├── routes/          # API route definitions
├── services/        # Business logic layer
├── tests/           # Test files
├── utils/           # Utility functions
└── validations/     # Input validation schemas
```

## 🚀 API Endpoints

### Base URL: `/api/v1`

### 1. User Management (`/users`)
- `GET /welcome` - API welcome message
- `GET /top/contributors` - Get top contributing users
- `POST /` - Create new user account
- `GET /` - Get all users
- `POST /follow` - Follow/unfollow users
- `GET /:id/followers` - Get user's followers
- `GET /:id/followings` - Get user's followings
- `GET /:id/likes` - Get user's liked content
- `GET /:id/challenges` - Get user's challenges
- `GET /:id` - Get user by ID
- `PATCH /:id` - Update user profile (with file upload)
- `DELETE /:id` - Delete user account

### 2. Social Posts (`/posts`)
- `GET /welcome` - API welcome message
- `POST /` - Create new post (with file attachments)
- `GET /` - Get all posts
- `GET /today` - Get today's posts
- `GET /tags` - Get posts by tags
- `POST /repost` - Repost content
- `GET /:id` - Get post by ID
- `PATCH /:id` - Update post
- `DELETE /:id` - Delete post
- `GET /user/:id` - Get user's posts
- `GET /user/:id/today` - Get user's today posts
- `PATCH /:id/views` - Track post views

### 3. Likes System (`/likes`)
- `GET /welcome` - API welcome message
- `POST /` - Create like (post or comment)
- `GET /:id` - Get likes for content
- `DELETE /:id` - Remove like

### 4. Comments (`/comments`)
- `GET /welcome` - API welcome message
- `POST /` - Create comment (with file attachments)
- `GET /post/:id` - Get comments for post
- `GET /:id` - Get comment by ID
- `PATCH /:id` - Update comment
- `DELETE /:id` - Delete comment

### 5. Bookmarks (`/bookmarks`)
- `GET /welcome` - API welcome message
- `POST /` - Create bookmark
- `GET /user/:id` - Get user's bookmarks
- `GET /:id` - Get bookmark by ID
- `DELETE /:id` - Remove bookmark

### 6. Challenges (`/challenges`)
- `GET /welcome` - API welcome message
- `POST /` - Create new challenge
- `GET /` - Get all challenges
- `POST /members` - Add member to challenge
- `GET /:id` - Get challenge by ID
- `PATCH /:id` - Update challenge
- `DELETE /:id` - Delete challenge
- `GET /:id/members` - Get challenge members
- `DELETE /:id/members/:memberId` - Remove member
- `GET /:id/:userId` - Get user's challenge posts

### 7. Tasks/Habits (`/tasks`)
- `GET /welcome` - API welcome message
- `POST /` - Create new task/habit
- `GET /:id` - Get task by ID
- `PATCH /:id` - Update task
- `DELETE /:id` - Delete task
- `GET /:id/user` - Get user's tasks

## 🎯 Key Features

### 1. User Authentication & Profile Management
- **Clerk Integration**: Seamless authentication with ClerkId
- **Profile Management**: Update username, bio, uniqueName
- **File Uploads**: Profile and cover image uploads via AWS S3
- **Social Features**: Follow/unfollow system with follower tracking

### 2. Social Media Platform
- **Content Creation**: Create posts with text and file attachments
- **Media Upload**: Multiple file upload support (images, documents)
- **Engagement**: Like, comment, bookmark, and repost functionality
- **Analytics**: View tracking and engagement metrics
- **Tagging System**: Organize content with tags

### 3. Habit Tracking & Task Management
- **Task Creation**: Create habits and tasks with descriptions
- **Due Time Management**: Set specific due times for tasks
- **Completion Tracking**: Mark tasks as completed
- **Progress Monitoring**: Track user's task completion history

### 4. Automated Reminder System
**Background Cron Job** (runs every minute):
- **2-hour reminder**: For tasks created 2+ hours ago
- **6-hour reminder**: For tasks not completed after 6 hours
- **12-hour reminder**: For tasks not completed after 12 hours
- **23-hour reminder**: Final reminder before day ends
- **End-of-day overdue**: Notifications for incomplete tasks
- **Time-based reminders**: 
  - 2 hours before due time
  - 30 minutes before due time
  - Overdue notifications for missed deadlines

### 5. Challenge System
- **Community Challenges**: Create and join group challenges
- **Member Management**: Add/remove members from challenges
- **Challenge Posts**: Share progress within challenges
- **Progress Tracking**: Monitor challenge participation

### 6. Email Notification System
- **Welcome Emails**: Sent to new users upon registration
- **Task Reminders**: Personalized reminder emails with HTML formatting
- **Overdue Notifications**: Alert users about missed deadlines
- **SMTP Integration**: Gmail SMTP for reliable email delivery

### 7. File Storage & AWS Integration
- **AWS S3 Storage**: Secure file upload and storage
- **Presigned URLs**: Secure file upload with temporary access
- **Multiple File Support**: Upload various file types
- **Automatic Naming**: UUID-based file naming for uniqueness

## 🔧 Technical Implementation

### Database Schema (MongoDB with Prisma)
```prisma
- User: Profile information, authentication data
- Follower: User relationship tracking
- Challenge: Community challenges and metadata
- Members: Challenge membership tracking
- Post: Social media posts with files and tags
- Like: Like/unlike functionality
- Comment: Post comments with file support
- Bookmark: Saved posts
- Habit: Tasks and habits with reminder tracking
```

### Security Features
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Zod schemas for all endpoints
- **CORS Configuration**: Secure cross-origin requests
- **File Upload Security**: Validated file types and sizes
- **Error Handling**: Standardized API error responses

### Performance Optimizations
- **Redis Caching**: Session and data caching
- **Response Compression**: Gzip compression for responses
- **Database Indexing**: Optimized queries with Prisma
- **Background Jobs**: Non-blocking reminder system

## 📧 Email Templates

### Welcome Email
- Sent to new users upon registration
- HTML formatted with Mikaelson branding
- Encourages engagement and community participation

### Task Reminder Emails
- Personalized based on time remaining
- Dynamic content based on task status
- Motivational messaging to encourage completion

### Overdue Notifications
- Alert users about missed deadlines
- Provide context about overdue tasks
- Encourage immediate action

## 🔄 Background Jobs

### Task Reminder Cron Job
**Schedule**: Every minute (`* * * * *`)

**Functions**:
1. `TwoHoursReminder()` - 2-hour task reminders
2. `SixHoursReminder()` - 6-hour task reminders
3. `TwelveHoursReminder()` - 12-hour task reminders
4. `TwentyThreeHoursReminder()` - End-of-day reminders
5. `sendEndOfDayOverdue()` - Daily overdue notifications
6. `TasksWithDueTime()` - Handle tasks with specific due times
7. `TasksWithDueTimeTwoHoursToDue()` - 2-hour pre-due reminders
8. `TasksWithDueTimeThirtyMinutesToDue()` - 30-minute pre-due reminders

## 🛠️ Development Setup

### Prerequisites
- Node.js (v16+)
- MongoDB database
- Redis server
- AWS S3 bucket
- SMTP email credentials

### Environment Variables
```env
DATABASE_URL=mongodb://...
REDIS_URL=redis://...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET_NAME=...
SMTP_EMAIL=...
SMTP_PASSWORD=...
```

### Installation & Running
```bash
npm install
npm run start  # Development with nodemon
```

## 📊 API Response Format

### Success Response
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success message",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "errors": [ ... ]
}
```

## 🔍 Monitoring & Logging

- **Pino Logger**: Structured JSON logging
- **Request Logging**: All API requests logged
- **Error Tracking**: Comprehensive error logging
- **Performance Monitoring**: Response time tracking
- **Email Delivery**: SMTP delivery confirmation

## 🚀 Future Enhancements

### Planned Features
- Real-time notifications via WebSocket
- Advanced analytics dashboard
- Push notification system
- Mobile app API optimization
- Advanced search functionality
- Content moderation system

### Performance Improvements
- Database query optimization
- Redis caching strategies
- CDN integration for file delivery
- API response pagination
- Background job optimization

---

## 📞 Support & Contact

For technical questions or feature requests, please contact the development team or refer to the project documentation.

**Last Updated**: December 2024
**Version**: 1.0.0
