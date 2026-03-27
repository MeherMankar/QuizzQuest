# Admin System Guide

## Overview

The QuizzQuest admin system allows administrators to manage user roles. By default, all new users are assigned the **student** role. Only admins can promote students to teachers.

## Admin Credentials

Set in `.env.local`:
```
ADMIN_USERNAME=admin@hello.com
ADMIN_PASSWORD=admin123
```

**IMPORTANT**: Change the default password in production!

## Admin Panel Access

**Web Interface**: http://localhost:3000/teacher/admin

1. Navigate to the teacher page
2. Click "Admin Panel" button
3. Login with admin credentials (email format required)
4. Manage user roles from the dashboard

## Role System

### Student (Default)
- Automatically assigned on first login
- Cannot self-promote to teacher
- Cannot switch roles
- Access to quizzes and games

### Teacher
- Assigned by admin only
- Can switch between teacher and student views
- Can create and manage questions
- Access to all student features

### Admin
- Full control over user roles
- Can promote students to teachers
- Can demote teachers to students
- Accessed via environment variables

## Managing Roles via Database

Since the admin panel UI is not yet implemented, you can manage roles directly through MongoDB:

### Promote Student to Teacher

```javascript
// Connect to MongoDB
use QuizApp_users

// Promote user to teacher
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "teacher" } }
)

// Add to teachers collection
db.teachers.insertOne({
  email: "user@example.com",
  createdAt: new Date()
})

// Remove from students collection
db.students.deleteOne({ email: "user@example.com" })
```

### Demote Teacher to Student

```javascript
// Demote user to student
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { role: "student" } }
)

// Add to students collection
db.students.insertOne({
  email: "user@example.com",
  createdAt: new Date()
})

// Remove from teachers collection
db.teachers.deleteOne({ email: "user@example.com" })
```

### List All Users and Their Roles

```javascript
// Get all users with roles
db.users.find({}, { email: 1, role: 1, _id: 0 })

// Get all teachers
db.teachers.find({}, { email: 1, _id: 0 })

// Get all students
db.students.find({}, { email: 1, _id: 0 })
```

## API Endpoints

### Check User Role
```
GET /api/auth/user_roles
```

### Switch Role (Teachers Only)
```
POST /api/auth/user_roles
Body: { "role": "student" | "teacher" }
```

Note: Students cannot promote themselves to teacher via this endpoint.

## Security Features

1. **Students cannot self-promote**: API prevents students from switching to teacher role
2. **Teachers can switch views**: Teachers can temporarily switch to student view
3. **Admin-only promotion**: Only admins can promote students to teachers
4. **Session-based auth**: All role changes require valid authentication

## Future Enhancements

- Web-based admin dashboard
- Bulk role management
- Role change history/audit log
- Email notifications for role changes
- Admin activity logging
