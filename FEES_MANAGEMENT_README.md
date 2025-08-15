# Fees Management Module

A comprehensive fees management system for school management applications, built with NestJS, MongoDB, and TypeScript.

## 🚀 Features

### Core Fee Management
- **Fee Categories**: Define different types of fees (Tuition, Transport, Library, Hostel, Sports, Exam, Lab, etc.)
- **Fee Structures**: Set amounts by class/grade with academic year and term support
- **Payment Frequencies**: Monthly, Term/Semester, Yearly, One-time
- **Custom Fees**: Support for individual student customizations

### Student Fee Assignment
- **Auto-assignment**: Automatically assign fees based on class/grade
- **Discounts & Scholarships**: Percentage and fixed amount discounts
- **Late Fee Rules**: Configurable late fees (flat or percentage-based)
- **Partial Payment Support**: Track partial payments and outstanding amounts

### Payment Processing
- **Multiple Payment Modes**: Cash, Bank Transfer, Card, Mobile Money, Online Payment Gateway, Cheque
- **Payment Status Tracking**: Pending, Completed, Failed, Cancelled, Refunded
- **Receipt Generation**: Auto-generate receipt numbers and reference numbers
- **Refund Management**: Full and partial refunds with audit trails

### Reporting & Analytics
- **Outstanding Fees Report**: Comprehensive list of unpaid fees
- **Payment Summary**: Daily, monthly, and yearly payment summaries
- **Defaulter Lists**: Students with overdue payments
- **Payment History**: Individual student payment tracking
- **Collection Reports**: Fee collection analysis by time period

### Security & Access Control
- **Role-based Access**: Admin, Accountant, Teacher, Parent/Student permissions
- **JWT Authentication**: Secure API access
- **Data Validation**: Comprehensive input validation and sanitization

## 🏗️ Architecture

### Database Schemas
- `FeeCategory`: Fee types and frequencies
- `FeeStructure`: Fee amounts by class and academic period
- `FeeAssignment`: Student-specific fee assignments with discounts
- `Payment`: Payment records and status tracking
- `Scholarship`: Scholarship and discount definitions
- `InstallmentPlan`: Installment payment plans

### Service Layer
- `FeeCategoryService`: CRUD operations for fee categories
- `FeeStructureService`: Fee structure management
- `FeeAssignmentService`: Student fee assignment logic
- `PaymentService`: Payment processing and management
- `ReportsService`: Comprehensive reporting and analytics

### Controllers
- `FeeCategoryController`: Fee category endpoints
- `FeeStructureController`: Fee structure endpoints
- `FeeAssignmentController`: Fee assignment endpoints
- `PaymentController`: Payment processing endpoints
- `ReportsController`: Reporting endpoints

## 📚 API Endpoints

### Fee Categories
```
POST   /fees/categories              # Create fee category
GET    /fees/categories              # List fee categories (with pagination)
GET    /fees/categories/:id          # Get fee category by ID
GET    /fees/categories/school/:id   # Get categories by school
GET    /fees/categories/active       # Get active categories
PATCH  /fees/categories/:id          # Update fee category
DELETE /fees/categories/:id          # Delete fee category
```

### Fee Structures
```
POST   /fees/structures              # Create fee structure
GET    /fees/structures              # List fee structures (with pagination)
GET    /fees/structures/:id          # Get fee structure by ID
GET    /fees/structures/class/:id    # Get structures by class
PATCH  /fees/structures/:id          # Update fee structure
DELETE /fees/structures/:id          # Delete fee structure
```

### Fee Assignments
```
POST   /fees/assignments              # Create fee assignment
GET    /fees/assignments              # List fee assignments (with pagination)
GET    /fees/assignments/student/:id  # Get assignments by student
GET    /fees/assignments/school/:id   # Get assignments by school
GET    /fees/assignments/outstanding/:schoolId # Get outstanding fees
POST   /fees/assignments/auto-assign/:studentId # Auto-assign fees
GET    /fees/assignments/:id          # Get assignment by ID
PATCH  /fees/assignments/:id          # Update fee assignment
PUT    /fees/assignments/:id/complete # Mark as completed
DELETE /fees/assignments/:id          # Delete fee assignment
```

### Payments
```
POST   /fees/payments                 # Create payment record
GET    /fees/payments                 # List payments (with pagination)
GET    /fees/payments/student/:id     # Get payments by student
GET    /fees/payments/fee-assignment/:id # Get payments by assignment
GET    /fees/payments/summary/:schoolId # Get payment summary
GET    /fees/payments/:id             # Get payment by ID
PATCH  /fees/payments/:id             # Update payment
PUT    /fees/payments/:id/approve     # Approve payment
PUT    /fees/payments/:id/reject      # Reject payment
PUT    /fees/payments/:id/refund      # Process refund
DELETE /fees/payments/:id             # Delete payment
```

### Reports
```
GET    /fees/reports/outstanding/:schoolId    # Outstanding fees report
GET    /fees/reports/summary/:schoolId        # Payment summary report
GET    /fees/reports/defaulters/:schoolId     # Defaulter list report
GET    /fees/reports/student/:id/history      # Student payment history
GET    /fees/reports/collection/:schoolId     # Fee collection report
```

## 🔧 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- NestJS CLI

### Installation
```bash
# Install dependencies
npm install

# Build the project
npm run build

# Start development server
npm run start:dev

# Start production server
npm run start:prod
```

### Environment Variables
```env
MONGO_URI=mongodb://localhost:27017/school-management
JWT_SECRET=your-jwt-secret-key
```

## 📖 Usage Examples

### Creating a Fee Category
```typescript
const feeCategory = {
  name: "Tuition Fee",
  description: "Monthly tuition fee for academic classes",
  frequency: "monthly",
  school: "507f1f77bcf86cd799439011",
  isActive: true,
  isCustom: false
};

const response = await fetch('/fees/categories', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify(feeCategory)
});
```

### Creating a Fee Structure
```typescript
const feeStructure = {
  feeCategory: "507f1f77bcf86cd799439011",
  class: "507f1f77bcf86cd799439012",
  school: "507f1f77bcf86cd799439013",
  amount: 50000,
  academicYear: "2024-2025",
  term: "First Term",
  dueDate: "2024-12-31T23:59:59.000Z",
  lateFeeAmount: 1000,
  lateFeePercentage: 5
};

const response = await fetch('/fees/structures', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify(feeStructure)
});
```

### Assigning Fees to a Student
```typescript
const feeAssignment = {
  student: "507f1f77bcf86cd799439011",
  feeStructure: "507f1f77bcf86cd799439012",
  school: "507f1f77bcf86cd799439013",
  assignedAmount: 50000,
  discountAmount: 5000,
  discountPercentage: 10,
  scholarshipAmount: 10000,
  assignedBy: "507f1f77bcf86cd799439014"
};

const response = await fetch('/fees/assignments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify(feeAssignment)
});
```

### Recording a Payment
```typescript
const payment = {
  student: "507f1f77bcf86cd799439011",
  feeAssignment: "507f1f77bcf86cd799439012",
  school: "507f1f77bcf86cd799439013",
  amount: 50000,
  paymentMode: "cash",
  paymentDate: "2024-12-01T10:00:00.000Z",
  recordedBy: "507f1f77bcf86cd799439014",
  notes: "Payment for first term fees"
};

const response = await fetch('/fees/payments', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify(payment)
});
```

### Getting Outstanding Fees Report
```typescript
const response = await fetch('/fees/reports/outstanding/507f1f77bcf86cd799439011?classId=507f1f77bcf86cd799439012&academicYear=2024-2025', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
});

const report = await response.json();
console.log(`Total outstanding: ${report.totalOutstandingAmount}`);
console.log(`Students affected: ${report.totalStudents}`);
```

## 🔐 Authentication & Authorization

### JWT Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <jwt-token>
```

### Role-based Access Control
- **Admin**: Full access to all endpoints
- **Accountant**: Can manage payments, receipts, discounts, and view reports
- **Teacher**: Read-only access to student fee information
- **Parent/Student**: Can view their own fee information and payment history

## 📊 Data Models

### Fee Category
```typescript
interface FeeCategory {
  _id: string;
  name: string;
  description: string;
  frequency: 'monthly' | 'term' | 'semester' | 'yearly' | 'one_time';
  school: string;
  isActive: boolean;
  isCustom: boolean;
  customFields?: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Fee Structure
```typescript
interface FeeStructure {
  _id: string;
  feeCategory: string;
  class: string;
  school: string;
  amount: number;
  academicYear: string;
  term: string;
  discountAmount: number;
  discountPercentage: number;
  isActive: boolean;
  dueDate?: Date;
  lateFeeAmount: number;
  lateFeePercentage: number;
  gracePeriodDays?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### Fee Assignment
```typescript
interface FeeAssignment {
  _id: string;
  student: string;
  feeStructure: string;
  school: string;
  status: 'active' | 'inactive' | 'completed';
  assignedAmount: number;
  discountAmount: number;
  discountPercentage: number;
  scholarshipAmount: number;
  scholarshipType?: string;
  scholarshipReason?: string;
  dueDate?: Date;
  lateFeeAmount: number;
  lateFeePercentage: number;
  notes?: string;
  assignedBy: string;
  assignedDate: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Payment
```typescript
interface Payment {
  _id: string;
  student: string;
  feeAssignment: string;
  school: string;
  amount: number;
  paymentMode: 'cash' | 'bank_transfer' | 'card' | 'mobile_money' | 'online_payment' | 'cheque';
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded' | 'partially_refunded';
  paymentType: 'full' | 'partial' | 'installment';
  paymentDate: Date;
  transactionId?: string;
  referenceNumber?: string;
  receiptNumber?: string;
  notes?: string;
  recordedBy: string;
  approvedBy?: string;
  approvedAt?: Date;
  refundAmount?: number;
  refundDate?: Date;
  refundReason?: string;
  refundedBy?: string;
  refundNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## 🧪 Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:cov
```

## 📝 API Documentation

The API is fully documented using Swagger/OpenAPI. After starting the application, visit:
```
http://localhost:3000/api-docs
```

## 🔄 Database Migrations

The system uses MongoDB with Mongoose schemas. No manual migrations are required as the schemas are automatically created when the application starts.

## 🚀 Deployment

### Production Build
```bash
npm run build
npm run start:prod
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist ./dist
EXPOSE 3000
CMD ["npm", "run", "start:prod"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation

## 🔮 Future Enhancements

- **Online Payment Gateway Integration**: Stripe, PayPal, local gateways
- **SMS/Email Notifications**: Payment reminders and confirmations
- **Multi-currency Support**: Handle different currencies
- **Advanced Analytics**: Dashboard with charts and graphs
- **Bulk Operations**: Import/export fee data
- **Audit Logging**: Comprehensive audit trails
- **Mobile App Support**: React Native or Flutter integration
- **API Rate Limiting**: Protect against abuse
- **Webhook Support**: Real-time notifications
- **Offline Mode**: Work without internet connection

---

**Note**: This fees management system is designed to be scalable, secure, and easy to use. It follows NestJS best practices and provides a solid foundation for school management applications.
