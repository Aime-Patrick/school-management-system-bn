import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';

// Schemas
import { Book, BookSchema } from './books/schemas/book.schema';
import { Member, MemberSchema } from './members/schemas/member.schema';
import { BorrowRecord, BorrowRecordSchema } from './borrow/schemas/borrow-record.schema';
// import { Reservation, ReservationSchema } from './reservations/schemas/reservation.schema';
// import { Fine, FineSchema } from './fines/schemas/fine.schema';

// Services
import { BooksService } from './books/books.service';
import { MembersService } from './members/members.service';
import { BorrowService } from './borrow/borrow.service';
// import { ReservationsService } from './reservations/reservations.service';
// import { FinesService } from './fines/fines.service';
// import { ReportsService } from './reports/reports.service';

// Controllers
import { BooksController } from './books/books.controller';
import { MembersController } from './members/members.controller';
import { BorrowController } from './borrow/borrow.controller';
// import { ReservationsController } from './reservations/reservations.controller';
// import { FinesController } from './fines/fines.controller';
// import { ReportsController } from './reports/reports.controller';

// Jobs
import { OverdueJob } from './jobs/overdue.job';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Book.name, schema: BookSchema },
      { name: Member.name, schema: MemberSchema },
      { name: BorrowRecord.name, schema: BorrowRecordSchema },
      // { name: Reservation.name, schema: ReservationSchema },
      // { name: Fine.name, schema: FineSchema },
    ]),
    ScheduleModule.forRoot(),
  ],
  controllers: [
    BooksController,
    MembersController,
    BorrowController,
    // ReservationsController,
    // FinesController,
    // ReportsController,
  ],
  providers: [
    BooksService,
    MembersService,
    BorrowService,
    // ReservationsService,
    // FinesService,
    // ReportsService,
    OverdueJob,
  ],
  exports: [
    BooksService,
    MembersService,
    BorrowService,
    // ReservationsService,
    // FinesService,
    // ReportsService,
  ],
})
export class LibraryModule {}
