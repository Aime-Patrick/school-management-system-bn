# 📚 Library Management Module

A comprehensive library management system built with NestJS, MongoDB, and Mongoose for school management applications.

## 🏗️ **Architecture Overview**

The Library Module follows a **3-layer architecture**:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Controllers   │───▶│     Services    │───▶│   MongoDB DB    │
│   (HTTP API)    │    │  (Business      │    │   (Schemas)     │
│                 │    │   Logic)        │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🎯 **Core Features**

### **1. Book Management**
- ✅ **CRUD Operations**: Create, read, update, delete books
- ✅ **Advanced Search**: Full-text search by title, author, ISBN
- ✅ **Category Management**: Organize books by genre/subject
- ✅ **Copy Management**: Track total vs. available copies
- ✅ **Status Tracking**: Available, Borrowed, Reserved, Damaged, Lost
- ✅ **School Association**: Link books to specific schools

### **2. Member Management**
- ✅ **Role-Based Access**: Students, Teachers, Staff
- ✅ **Borrowing Limits**: Configurable limits per member type
- ✅ **Membership Tracking**: Join date, expiry, status
- ✅ **Fine Management**: Track overdue fines and payments

### **3. Borrowing System**
- ✅ **Book Issuance**: Check availability and member limits
- ✅ **Due Date Management**: Configurable borrowing periods
- ✅ **Return Processing**: Automatic fine calculation
- ✅ **Renewal Support**: Extend borrowing periods
- ✅ **Status Tracking**: Issued, Returned, Overdue, Lost, Damaged

### **4. Reservation System**
- ✅ **Book Reservations**: Reserve unavailable books
- ✅ **Queue Management**: Position tracking for reservations
- ✅ **Auto-Fulfillment**: Automatic reservation fulfillment
- ✅ **Expiry Handling**: Clean up expired reservations

### **5. Fine Management**
- ✅ **Automatic Calculation**: Daily fine rates for overdue books
- ✅ **Fine Types**: Overdue, Lost, Damaged
- ✅ **Payment Tracking**: Mark fines as paid/unpaid
- ✅ **Reference Management**: Link fines to borrow records

### **6. Reporting & Analytics**
- ✅ **Overdue Reports**: List all overdue books
- ✅ **Popular Books**: Most borrowed books analysis
- ✅ **Member Statistics**: Borrowing patterns and fines
- ✅ **School Reports**: Library usage by school

### **7. Automated Jobs**
- ✅ **Daily Overdue Check**: Runs at 2 AM daily
- ✅ **Weekly Notifications**: Send overdue reminders
- ✅ **Monthly Reports**: Generate overdue statistics
- ✅ **Reservation Cleanup**: Remove expired reservations

## 🗄️ **Database Schemas**

### **Book Schema**
```typescript
{
  title: string,           // Book title
  authors: string[],       // Array of authors
  ISBN?: string,          // International Standard Book Number
  publisher?: string,     // Publishing company
  category?: string,      // Genre/subject category
  language?: string,      // Book language
  edition?: string,       // Edition information
  totalCopies: number,    // Total copies owned
  availableCopies: number, // Currently available copies
  location?: string,      // Physical location in library
  coverImageUrl?: string, // Cover image URL
  status: BookStatus,     // Current book status
  school?: ObjectId,      // Associated school
  borrowCount: number,    // Total times borrowed
  reservationCount: number // Current reservations
}
```

### **Member Schema**
```typescript
{
  userId: string,         // User ID from main system
  memberId: string,       // Unique library member ID
  role: MemberRole,       // Student, Teacher, Staff
  classOrDept?: string,   // Class or department
  joinDate: Date,         // Membership start date
  expiryDate?: Date,      // Membership expiry
  maxBorrowLimit: number, // Maximum books allowed
  status: MemberStatus,   // Active, Inactive, Suspended
  currentBorrowCount: number, // Currently borrowed books
  totalBorrowCount: number,   // Total books borrowed
  overdueCount: number,       // Number of overdue incidents
  fineAmount: number          // Current outstanding fines
}
```

### **BorrowRecord Schema**
```typescript
{
  memberId: ObjectId,     // Member borrowing the book
  bookId: ObjectId,       // Book being borrowed
  borrowDate: Date,       // Date book was issued
  dueDate: Date,          // Expected return date
  returnDate?: Date,      // Actual return date
  status: BorrowStatus,   // Current status
  fineAmount: number,     // Calculated fine amount
  daysOverdue: number,    // Days past due date
  isRenewed: boolean,     // Whether book was renewed
  renewalCount: number    // Number of renewals
}
```

## 🚀 **API Endpoints**

### **Books Management**
- `POST /library/books` - Add new book
- `GET /library/books` - List all books (with pagination & filters)
- `GET /library/books/search?q=query` - Search books
- `GET /library/books/category/:category` - Books by category
- `GET /library/books/available` - Available books
- `GET /library/books/most-borrowed` - Popular books
- `GET /library/books/school/:schoolId` - Books by school
- `GET /library/books/:id` - Get book by ID
- `PATCH /library/books/:id` - Update book
- `PUT /library/books/:id/status` - Change book status
- `DELETE /library/books/:id` - Delete book

### **Members Management**
- `POST /library/members` - Create new member
- `GET /library/members` - List all members
- `GET /library/members/:id` - Get member by ID
- `PATCH /library/members/:id` - Update member
- `DELETE /library/members/:id` - Delete member

### **Borrowing Operations**
- `POST /library/borrow` - Borrow a book
- `POST /library/return` - Return a book
- `PUT /library/borrow/:id/renew` - Renew borrowing
- `GET /library/borrow/member/:memberId` - Member's borrow history
- `GET /library/borrow/book/:bookId` - Book's borrow history

### **Reservations**
- `POST /library/reservations` - Create reservation
- `PUT /library/reservations/:id/fulfill` - Fulfill reservation
- `PUT /library/reservations/:id/cancel` - Cancel reservation
- `GET /library/reservations/member/:memberId` - Member's reservations

### **Fines Management**
- `GET /library/fines` - List all fines
- `GET /library/fines/member/:memberId` - Member's fines
- `PUT /library/fines/:id/pay` - Mark fine as paid
- `GET /library/fines/unpaid` - Unpaid fines

### **Reports & Analytics**
- `GET /library/reports/overdue` - Overdue books report
- `GET /library/reports/most-borrowed` - Popular books report
- `GET /library/reports/member/:memberId` - Member activity report
- `GET /library/reports/school/:schoolId` - School library report

## ⏰ **Automated Cron Jobs**

### **Daily Overdue Check (2:00 AM)**
- Scans for overdue books
- Updates borrow record status
- Creates fine records automatically
- Updates member statistics

### **Weekly Notifications (Weekly)**
- Sends overdue reminders
- Generates notification logs
- Prepares email/SMS content

### **Monthly Reports (Monthly)**
- Generates overdue statistics
- Calculates fine totals
- Provides borrowing analytics

### **Reservation Cleanup (6:00 AM Daily)**
- Removes expired reservations
- Updates book availability
- Maintains system integrity

## 🔐 **Role-Based Access Control**

### **School Admin**
- Full access to all operations
- Can delete books and members
- Manages library settings

### **Teacher**
- Can add/update books
- Can manage borrowings
- Access to reports and analytics

### **Student/Staff**
- Can view available books
- Can borrow/return books
- Can create reservations
- Access to personal history

## 📊 **Search & Filtering**

### **Text Search**
- Full-text search across title, author, ISBN
- MongoDB text indexes for performance
- Fuzzy matching capabilities

### **Advanced Filters**
- By category, language, status
- By school, publisher, author
- By availability and location
- Date range filtering

### **Pagination**
- Configurable page sizes
- Total count information
- Efficient database queries

## 💰 **Fine Calculation System**

### **Overdue Fines**
- Configurable daily rate (default: $1/day)
- Automatic calculation on due date
- Accumulative fine amounts

### **Lost/Damaged Books**
- Replacement cost calculation
- Damage assessment tracking
- Payment status management

## 🔧 **Configuration Options**

### **Environment Variables**
```bash
LIB_DAILY_FINE_RATE=1          # Daily fine rate in dollars
LIB_MAX_BORROW_DAYS=14         # Default borrowing period
LIB_RESERVATION_EXPIRY_DAYS=7  # Reservation expiry period
LIB_MAX_RENEWALS=2             # Maximum renewal count
```

### **School-Specific Settings**
- Custom fine rates per school
- Borrowing limits by member type
- Category and language preferences

## 📱 **Integration Points**

### **User Management**
- Integrates with existing user system
- Role-based permissions
- Single sign-on support

### **School System**
- Links to school management
- Multi-tenant architecture
- School-specific configurations

### **Notification System**
- Email notifications
- SMS alerts
- In-app notifications

### **Payment System**
- Fine payment processing
- Integration with fees module
- Payment gateway support

## 🚀 **Getting Started**

### **1. Installation**
```bash
# The module is already integrated into your app
# No additional installation required
```

### **2. Environment Setup**
```bash
# Add to your .env file
LIB_DAILY_FINE_RATE=1
LIB_MAX_BORROW_DAYS=14
LIB_RESERVATION_EXPIRY_DAYS=7
```

### **3. Database Setup**
```bash
# MongoDB indexes are automatically created
# Text search indexes for books
# Performance indexes for queries
```

### **4. API Access**
```bash
# Access Swagger documentation at:
http://localhost:3000/api-docs

# Library endpoints are under:
/library/*
```

## 📈 **Performance Features**

### **Database Optimization**
- Strategic indexing for common queries
- Aggregation pipelines for reports
- Efficient text search capabilities

### **Caching Strategy**
- Book metadata caching
- Member information caching
- Search result caching

### **Query Optimization**
- Pagination for large datasets
- Selective field population
- Efficient aggregation queries

## 🔮 **Future Enhancements**

### **Planned Features**
- **E-Book Support**: Digital book management
- **Advanced Analytics**: Machine learning insights
- **Mobile App**: Native mobile application
- **Integration APIs**: Third-party library systems
- **Advanced Notifications**: Push notifications, reminders
- **Barcode Integration**: QR code and barcode scanning
- **Inventory Management**: Stock tracking and alerts

### **Scalability Improvements**
- **Microservices**: Break into smaller services
- **Event Streaming**: Real-time updates
- **Distributed Caching**: Redis cluster support
- **Load Balancing**: Multiple instance support

## 🧪 **Testing & Quality**

### **Code Quality**
- TypeScript strict mode
- Comprehensive error handling
- Input validation and sanitization
- Proper logging and monitoring

### **Security Features**
- JWT authentication
- Role-based authorization
- Input sanitization
- SQL injection prevention

## 📚 **Documentation**

### **API Documentation**
- Complete Swagger/OpenAPI specs
- Request/response examples
- Error code documentation
- Authentication requirements

### **Code Documentation**
- Inline code comments
- Service method documentation
- Schema field descriptions
- Architecture explanations

## 🤝 **Support & Contributing**

### **Getting Help**
- Check the Swagger documentation
- Review the code comments
- Check the application logs
- Contact the development team

### **Contributing**
- Follow NestJS best practices
- Maintain TypeScript strict mode
- Add comprehensive tests
- Update documentation

---

**Note**: This library management system is designed to be scalable, secure, and easy to use. It follows NestJS best practices and provides a solid foundation for school library management applications.
