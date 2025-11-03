# Mikaelson Initiative API Documentation for Frontend Developers

## 🚀 Overview

This document provides comprehensive API documentation for frontend developers working with the Mikaelson Initiative backend server. The API is built with Express.js, TypeScript, and MongoDB, providing a robust social productivity platform.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Base Configuration](#base-configuration)
3. [Authentication](#authentication)
4. [API Endpoints](#api-endpoints)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)
7. [File Uploads](#file-uploads)
8. [Real-time Features](#real-time-features)
9. [Testing](#testing)

## 🚀 Quick Start

### Base URL
- **Development**: `http://localhost:3000`
- **Production**: `https://api.mikaelsoninitiative.com`

### API Version
All endpoints are prefixed with `/api/v1`

### Content Type
All requests should include:
```
Content-Type: application/json
```

## ⚙️ Base Configuration

### CORS Settings
The server is configured to accept requests from:
- `http://localhost:3000` (Frontend development)
- `https://mikaelsoninitiative.com` (Production)

### Rate Limiting
- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: Rate limit info included in response headers

### Response Format
All API responses follow this structure:

**Success Response:**
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Success message",
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error message",
  "errors": [ ... ]
}
```

## 🔐 Authentication

### Clerk Integration
The API uses Clerk for authentication. Include the Clerk token in requests:

```javascript
headers: {
  'Authorization': `Bearer ${clerkToken}`,
  'Content-Type': 'application/json'
}
```

### User Identification
Users are identified by `clerkId` in the database, not by internal user IDs.

## 📡 API Endpoints

### 1. Users API (`/api/v1/users`)

#### Get Welcome Message
```http
GET /api/v1/users/welcome
```
**Response:** `"Welcome to Users API v1"`

#### Get Top Contributors
```http
GET /api/v1/users/top/contributors
```
**Description:** Get users with highest engagement
**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user_id",
      "username": "username",
      "profileImage": "image_url",
      "contributionScore": 150
    }
  ]
}
```

#### Create User
```http
POST /api/v1/users
```
**Body:**
```json
{
  "clerkId": "clerk_user_id",
  "username": "username",
  "uniqueName": "unique_name",
  "email": "user@example.com",
  "bio": "User bio"
}
```

#### Get All Users
```http
GET /api/v1/users
```
**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page

#### Follow/Unfollow User
```http
POST /api/v1/users/follow
```
**Body:**
```json
{
  "userId": "user_id_to_follow",
  "followerId": "current_user_id"
}
```

#### Subscribe to User
```http
POST /api/v1/users/subscribe
```
**Body:**
```json
{
  "subscribeToId": "user_id_to_subscribe",
  "subscriberId": "current_user_id"
}
```

#### Get User Followers
```http
GET /api/v1/users/:id/followers
```

#### Get User Followings
```http
GET /api/v1/users/:id/followings
```

#### Get User Likes
```http
GET /api/v1/users/:id/likes
```

#### Get User Challenges
```http
GET /api/v1/users/:id/challenges
```

#### Get User by ID
```http
GET /api/v1/users/:id
```

#### Update User Profile
```http
PATCH /api/v1/users/:id
```
**Content-Type:** `multipart/form-data`
**Body:**
- `profileImage` (file, optional): Profile image
- `coverImage` (file, optional): Cover image
- `username` (string, optional): New username
- `bio` (string, optional): New bio

#### Delete User
```http
DELETE /api/v1/users/:id
```

### 2. Posts API (`/api/v1/posts`)

#### Get Welcome Message
```http
GET /api/v1/posts/welcome
```

#### Create Post
```http
POST /api/v1/posts
```
**Content-Type:** `multipart/form-data`
**Body:**
- `post` (string): Post content
- `files` (file[]): Media files
- `tags` (string[]): Post tags
- `userId` (string): Author ID
- `challengeId` (string, optional): Associated challenge

#### Get All Posts
```http
GET /api/v1/posts
```
**Query Parameters:**
- `page` (optional): Page number
- `limit` (optional): Items per page

#### Get Today's Posts
```http
GET /api/v1/posts/today
```

#### Get Posts by Tags
```http
GET /api/v1/posts/tags
```
**Query Parameters:**
- `tags` (string[]): Array of tags to filter by

#### Repost Content
```http
POST /api/v1/posts/repost
```
**Content-Type:** `multipart/form-data`
**Body:**
- `repostOfId` (string): Original post ID
- `userId` (string): Reposter ID
- `post` (string, optional): Additional comment
- `files` (file[], optional): Additional media

#### Get Post by ID
```http
GET /api/v1/posts/:id
```

#### Update Post
```http
PATCH /api/v1/posts/:id
```
**Body:**
```json
{
  "post": "Updated content",
  "tags": ["updated", "tags"]
}
```

#### Delete Post
```http
DELETE /api/v1/posts/:id
```

#### Get User's Posts
```http
GET /api/v1/posts/user/:id
```

#### Get Following Posts
```http
GET /api/v1/posts/following/:id
```

#### Get User's Today Posts
```http
GET /api/v1/posts/user/:id/today
```

#### Track Post Views
```http
PATCH /api/v1/posts/:id/views
```

### 3. Likes API (`/api/v1/likes`)

#### Get Welcome Message
```http
GET /api/v1/likes/welcome
```

#### Create Like
```http
POST /api/v1/likes
```
**Body:**
```json
{
  "userId": "user_id",
  "postId": "post_id", // or commentId for comment likes
  "commentId": "comment_id" // optional
}
```

#### Get Likes for Content
```http
GET /api/v1/likes/:id
```

#### Get Post Likes
```http
GET /api/v1/likes/post/:id
```

#### Remove Like
```http
DELETE /api/v1/likes/:id
```

### 4. Comments API (`/api/v1/comments`)

#### Get Welcome Message
```http
GET /api/v1/comments/welcome
```

#### Create Comment
```http
POST /api/v1/comments
```
**Content-Type:** `multipart/form-data`
**Body:**
- `comment` (string): Comment content
- `files` (file[]): Media files
- `userId` (string): Commenter ID
- `postId` (string): Post ID

#### Get Post Comments
```http
GET /api/v1/comments/post/:id
```

#### Get Comment by ID
```http
GET /api/v1/comments/:id
```

#### Update Comment
```http
PATCH /api/v1/comments/:id
```
**Body:**
```json
{
  "comment": "Updated comment"
}
```

#### Delete Comment
```http
DELETE /api/v1/comments/:id
```

### 5. Bookmarks API (`/api/v1/bookmarks`)

#### Get Welcome Message
```http
GET /api/v1/bookmarks/welcome
```

#### Create Bookmark
```http
POST /api/v1/bookmarks
```
**Body:**
```json
{
  "postId": "post_id",
  "userId": "user_id"
}
```

#### Get User Bookmarks
```http
GET /api/v1/bookmarks/user/:id
```

#### Get Bookmark by ID
```http
GET /api/v1/bookmarks/:id
```

#### Remove Bookmark
```http
DELETE /api/v1/bookmarks/:id
```

### 6. Challenges API (`/api/v1/challenges`)

#### Get Welcome Message
```http
GET /api/v1/challenges/welcome
```

#### Create Challenge
```http
POST /api/v1/challenges
```
**Body:**
```json
{
  "challenge": "Challenge title",
  "userId": "creator_id",
  "days": 30
}
```

#### Get All Challenges
```http
GET /api/v1/challenges
```

#### Add Member to Challenge
```http
POST /api/v1/challenges/members
```
**Body:**
```json
{
  "challengeId": "challenge_id",
  "userId": "user_id"
}
```

#### Get Challenge by ID
```http
GET /api/v1/challenges/:id
```

#### Update Challenge
```http
PATCH /api/v1/challenges/:id
```
**Body:**
```json
{
  "challenge": "Updated challenge title",
  "days": 45
}
```

#### Delete Challenge
```http
DELETE /api/v1/challenges/:id
```

#### Get Challenge Members
```http
GET /api/v1/challenges/:id/members
```

#### Remove Member
```http
DELETE /api/v1/challenges/:id/members/:memberId
```

#### Get User Challenge Posts
```http
GET /api/v1/challenges/:id/:userId
```

### 7. Tasks/Habits API (`/api/v1/tasks`)

#### Get Welcome Message
```http
GET /api/v1/tasks/welcome
```

#### Create Task
```http
POST /api/v1/tasks
```
**Body:**
```json
{
  "task": "Task description",
  "description": "Detailed description",
  "dueTime": "2024-01-01T10:00:00Z", // ISO string, optional
  "userId": "user_id",
  "challengeId": "challenge_id" // optional
}
```

#### Get Task by ID
```http
GET /api/v1/tasks/:id
```

#### Update Task
```http
PATCH /api/v1/tasks/:id
```
**Body:**
```json
{
  "task": "Updated task",
  "isCompleted": true,
  "dueTime": "2024-01-01T12:00:00Z"
}
```

#### Delete Task
```http
DELETE /api/v1/tasks/:id
```

#### Get User Tasks
```http
GET /api/v1/tasks/:id/user
```

### 8. Notifications API (`/api/v1/notifications`)

#### Get Welcome Message
```http
GET /api/v1/notifications/welcome
```

#### Get User Notifications
```http
GET /api/v1/notifications/receiver/:id
```

#### Mark Notification as Read
```http
PATCH /api/v1/notifications/:id
```

#### Delete Notification
```http
DELETE /api/v1/notifications/:id
```

## 📊 Data Models

### User Model
```typescript
interface User {
  id: string;
  username: string;
  uniqueName: string;
  email: string;
  clerkId: string;
  bio?: string;
  profileImage?: string;
  coverImage?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Post Model
```typescript
interface Post {
  id: string;
  post?: string;
  files: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  challengeId?: string;
  repostOfId?: string;
  views: number;
}
```

### Challenge Model
```typescript
interface Challenge {
  id: string;
  challenge: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  days?: number;
}
```

### Habit/Task Model
```typescript
interface Habit {
  id: string;
  task: string;
  description?: string;
  dueTime?: Date;
  isCompleted: boolean;
  challengeId?: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  FirstReminder: boolean;
  SecondReminder: boolean;
  ThirdReminder: boolean;
  FourthReminder: boolean;
  DueTimeReminder: boolean;
  lastReminderSentAt?: Date;
}
```

### Notification Model
```typescript
interface Notification {
  id: string;
  actorId: string;
  receiverId: string;
  event_type: string;
  message: string;
  isRead: boolean;
  postId?: string;
  likeId?: string;
  taskId?: string;
  commentId?: string;
  bookmarkId?: string;
  challengeId?: string;
  followerId?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## ❌ Error Handling

### Common HTTP Status Codes
- 