<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Description

This project is a comprehensive school management system built using the [NestJS](https://nestjs.com) framework. It provides a robust backend for managing students, teachers, classes, events, results, and other school-related entities.

## Features

- User authentication and authorization
- Role-based access control (School Admin, Teacher, Student)
- Student management
- Teacher management
- Class management
- Event management
- Result management
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

### Key Modules

1. **Authentication**:
   - JWT-based authentication.
   - Role-based access control for School Admin, Teacher, and Student.

2. **Student Management**:
   - CRUD operations for students.
   - Assign students to classes.

3. **Teacher Management**:
   - CRUD operations for teachers.
   - Assign teachers to classes.

4. **Class Management**:
   - Manage classes, timetables, and assigned teachers.
   - Add or remove students from classes.

5. **Event Management**:
   - Create, update, and retrieve school events.
   - Role-based access for School Admin, Teacher, and Student.

6. **Result Management**:
   - Manage exam results for students.
   - Calculate total scores and percentages.

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