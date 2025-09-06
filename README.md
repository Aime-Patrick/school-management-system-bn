<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Description

This project is a comprehensive school management system built using the [NestJS](https://nestjs.com) framework. It provides a robust backend for managing students, teachers, classes, events, results, and other school-related entities.

## Features

- User authentication and authorization
- Role-based access control (School Admin, Teacher, Student, Accountant, Librarian)
- Student management with profile pictures
- Teacher management
- Class management with timetables
- Assignment management with file uploads
- Event management
- Result management
- Library management
- Financial management
- Fee management
- Payment processing
- Academic year and term management
- Course management
- Quiz management
- Permission-based access control
- File upload with Cloudinary integration
- API documentation with Swagger

## Project Setup

### Prerequisites

- Node.js (>= 14.x)
- npm (>= 6.x)
- MongoDB

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/school-management-be.git
cd school-management-be
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file in the root directory and add the following environment variables:

```bash
MONGO_URI=your_mongo_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret
SYSTEM_EMAIL=admin@example.com
SYSTEM_USERNAME=system-admin
SYSTEM_PASSWORD=Admin@123
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### Running the Application

```bash
# development
npm run start

# watch mode
npm run start:dev

# production mode
npm run start:prod
```

### Testing

Run unit tests:

```bash
npm run test
```

Run end-to-end tests:

```bash
npm run test:e2e
```

Run linting:

```bash
npm run lint
```

### API Documentation

The API documentation is available at `/api-docs` when the application is running. It provides detailed information about the available endpoints, request parameters, and responses.

### Assignment System API

The assignment system provides comprehensive functionality for creating, managing, and grading assignments:

#### Assignment Creation Options

Teachers can create assignments using multiple approaches:

1. **Class-Based Assignment**:
   ```json
   {
     "title": "Math Assignment 1",
     "description": "Complete exercises 1-10",
     "dueDate": "2025-09-15T23:59:59.000Z",
     "course": "courseId",
     "term": "termId",
     "classId": "classId",
     "assignToAllCombinations": true
   }
   ```

2. **Specific Combinations**:
   ```json
   {
     "title": "Math Assignment 1",
     "description": "Complete exercises 1-10",
     "dueDate": "2025-09-15T23:59:59.000Z",
     "course": "courseId",
     "term": "termId",
     "classId": "classId",
     "assignToAllCombinations": false,
     "classCombinationIds": ["combination1", "combination2"]
   }
   ```

3. **Individual Students**:
   ```json
   {
     "title": "Math Assignment 1",
     "description": "Complete exercises 1-10",
     "dueDate": "2025-09-15T23:59:59.000Z",
     "course": "courseId",
     "term": "termId",
     "assignedStudents": ["student1", "student2", "student3"]
   }
   ```

4. **Mixed Approach**:
   ```json
   {
     "title": "Math Assignment 1",
     "description": "Complete exercises 1-10",
     "dueDate": "2025-09-15T23:59:59.000Z",
     "course": "courseId",
     "term": "termId",
     "classId": "classId",
     "classCombinationIds": ["combination1"],
     "assignedStudents": ["additionalStudent1", "additionalStudent2"]
   }
   ```

#### Key Assignment Endpoints

- `POST /assignments` - Create assignment with file attachments
- `POST /assignments/:id/submit` - Submit assignment with files
- `PUT /assignments/:id/grade/:studentId` - Grade student submission
- `GET /assignments/teacher` - Get teacher's assignments
- `GET /assignments/student` - Get student's assignments
- `GET /assignments/:id` - Get assignment details
- `PUT /assignments/:id/status` - Update assignment status
- `DELETE /assignments/:id` - Delete assignment

### Key Modules

1. **Authentication & Authorization**:
   - JWT-based authentication
   - Role-based access control (School Admin, Teacher, Student, Accountant, Librarian)
   - Permission-based access control
   - Password reset functionality

2. **Student Management**:
   - Complete CRUD operations for students
   - Profile picture uploads
   - Student enrollment and class assignment
   - Student credentials management
   - Course enrollment tracking

3. **Teacher Management**:
   - Complete CRUD operations for teachers
   - Teacher assignment to classes and combinations
   - Teacher credentials management
   - Password reset functionality

4. **Class Management**:
   - Class and class combination management
   - Timetable creation and management
   - Teacher assignment to combinations
   - Student assignment to combinations
   - Advanced filtering (by grade, subject, teacher)

5. **Assignment Management**:
   - Create assignments with file attachments
   - Flexible student assignment options:
     - Assign to entire class combinations
     - Assign to specific class combinations
     - Assign to individual students
     - Mix and match approaches
   - Student submission with file uploads
   - Teacher grading and feedback
   - Late submission handling with penalties
   - File type and size validation
   - Assignment status tracking (Draft, Published)

6. **Event Management**:
   - Create, update, and retrieve school events
   - Event invitation system
   - Role-based access control

7. **Result Management**:
   - Manage exam results for students
   - Calculate total scores and percentages
   - Grade tracking and analysis

8. **Library Management**:
   - Book catalog management
   - Book borrowing and return system
   - Fine calculation for overdue books
   - Student and teacher library access

9. **Financial Management**:
   - Fee structure management
   - Payment processing
   - Financial reporting
   - Payment history tracking

10. **Academic Management**:
    - Academic year management
    - Term management
    - Course management
    - Quiz and assessment management

11. **File Management**:
    - Cloudinary integration for file uploads
    - Support for multiple file types
    - File size validation
    - Secure file storage and retrieval

### Environment Variables

| Variable               | Description                          | Example                     |
|------------------------|--------------------------------------|-----------------------------|
| `MONGO_URI`            | MongoDB connection string            | `mongodb://localhost:27017` |
| `PORT`                 | Port for the application             | `5000`                      |
| `JWT_SECRET`           | Secret key for JWT authentication    | `your_jwt_secret`           |
| `SYSTEM_EMAIL`         | System admin email                   | `admin@example.com`         |
| `SYSTEM_USERNAME`      | System admin username                | `system-admin`              |
| `SYSTEM_PASSWORD`      | System admin password                | `Admin@123`                 |
| `CLOUDINARY_CLOUD_NAME`| Cloudinary cloud name                | `your_cloud_name`           |
| `CLOUDINARY_API_KEY`   | Cloudinary API key                   | `your_api_key`              |
| `CLOUDINARY_API_SECRET`| Cloudinary API secret                | `your_api_secret`           |

### Contribution

Contributions are welcome! Please fork the repository and submit a pull request.

### License

This project is licensed under the MIT License.