<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

## Description

This project is a comprehensive school management system built using the [NestJS](https://nestjs.com) framework. It provides a robust backend for managing students, teachers, classes, and other school-related entities.

## Features

- User authentication and authorization
- Role-based access control
- Student management
- Teacher management
- Class management
- School administration
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
2. Install dependencies

```bash
npm install
```

3. Create a .env file in the root directory and add the following environment variables:

```bash
MONGO_URI=
PORT=5000
JWT_SECRET=your_jwt_secret
SYSTEM_EMAIL=admin@example.com
SYSTEM_USERNAME=system-admin
SYSTEM_PASSWORD=Admin@123
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

### API Documentation

The API documentation is available at ```/api-docs``` when the application is running. It provides detailed information about the available endpoints, request parameters, and responses.