import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Book, BookStatus } from './schemas/book.schema';
import { CreateBookDto } from './dto/create-book.dto';
import { UpdateBookDto } from './dto/update-book.dto';

@Injectable()
export class BooksService {
  constructor(
    @InjectModel(Book.name) private bookModel: Model<Book>,
  ) {}

  async create(createBookDto: CreateBookDto): Promise<Book> {
    // Check if ISBN already exists (if provided)
    if (createBookDto.ISBN) {
      const existingBook = await this.bookModel.findOne({ ISBN: createBookDto.ISBN }).exec();
      if (existingBook) {
        throw new ConflictException('Book with this ISBN already exists');
      }
    }

    // Set available copies equal to total copies initially
    const bookData = {
      ...createBookDto,
      availableCopies: createBookDto.totalCopies || 1,
      school: createBookDto.school ? new Types.ObjectId(createBookDto.school) : undefined,
    };

    const book = new this.bookModel(bookData);
    return await book.save();
  }

  async findAll(query: any): Promise<{ data: Book[]; total: number; page: number; limit: number }> {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      category, 
      language, 
      status, 
      school,
      author,
      publisher 
    } = query;
    
    const skip = (page - 1) * limit;
    const filter: any = {};

    // Text search
    if (search) {
      filter.$text = { $search: search };
    }

    // Category filter
    if (category) {
      filter.category = category;
    }

    // Language filter
    if (language) {
      filter.language = language;
    }

    // Status filter
    if (status) {
      filter.status = status;
    }

    // School filter
    if (school) {
      filter.school = new Types.ObjectId(school);
    }

    // Author filter
    if (author) {
      filter.authors = { $in: [new RegExp(author, 'i')] };
    }

    // Publisher filter
    if (publisher) {
      filter.publisher = new RegExp(publisher, 'i');
    }

    const [data, total] = await Promise.all([
      this.bookModel
        .find(filter)
        .populate('school', 'name')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.bookModel.countDocuments(filter),
    ]);

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Book> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid book ID');
    }

    const book = await this.bookModel
      .findById(id)
      .populate('school', 'name')
      .exec();

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    return book;
  }

  async update(id: string, updateBookDto: UpdateBookDto): Promise<Book> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid book ID');
    }

    const book = await this.bookModel.findById(id).exec();
    if (!book) {
      throw new NotFoundException('Book not found');
    }

    // Check if ISBN already exists (if changing)
    if (updateBookDto.ISBN && updateBookDto.ISBN !== book.ISBN) {
      const existingBook = await this.bookModel.findOne({ ISBN: updateBookDto.ISBN }).exec();
      if (existingBook) {
        throw new ConflictException('Book with this ISBN already exists');
      }
    }

    // Handle total copies update
    let availableCopiesUpdate: number | undefined;
    if (updateBookDto.totalCopies !== undefined) {
      const borrowedCopies = book.totalCopies - book.availableCopies;
      if (updateBookDto.totalCopies < borrowedCopies) {
        throw new BadRequestException(`Cannot reduce total copies below ${borrowedCopies} (currently borrowed)`);
      }
      availableCopiesUpdate = updateBookDto.totalCopies - borrowedCopies;
    }

    const updateData: any = { ...updateBookDto };
    
    // Add available copies update if calculated
    if (availableCopiesUpdate !== undefined) {
      updateData.availableCopies = availableCopiesUpdate;
    }
    
    if (updateBookDto.school) {
      updateData.school = new Types.ObjectId(updateBookDto.school);
    }

    const updatedBook = await this.bookModel
      .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
      .populate('school', 'name')
      .exec();

    if (!updatedBook) {
      throw new NotFoundException('Book not found after update');
    }

    return updatedBook;
  }

  async remove(id: string): Promise<void> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid book ID');
    }

    const book = await this.bookModel.findById(id).exec();
    if (!book) {
      throw new NotFoundException('Book not found');
    }

    // Check if book has borrowed copies
    if (book.totalCopies > book.availableCopies) {
      throw new BadRequestException('Cannot delete book with borrowed copies');
    }

    await this.bookModel.findByIdAndDelete(id).exec();
  }

  async updateStatus(id: string, status: BookStatus): Promise<Book> {
    if (!Types.ObjectId.isValid(id)) {
      throw new BadRequestException('Invalid book ID');
    }

    const book = await this.bookModel.findById(id).exec();
    if (!book) {
      throw new NotFoundException('Book not found');
    }

    // Validate status transition
    if (status === BookStatus.AVAILABLE && book.totalCopies === book.availableCopies) {
      throw new BadRequestException('Book is already available');
    }

    const updatedBook = await this.bookModel
      .findByIdAndUpdate(id, { status }, { new: true, runValidators: true })
      .populate('school', 'name')
      .exec();

    if (!updatedBook) {
      throw new NotFoundException('Book not found after status update');
    }

    return updatedBook;
  }

  async searchBooks(query: string): Promise<Book[]> {
    return await this.bookModel
      .find({ $text: { $search: query } })
      .populate('school', 'name')
      .limit(20)
      .exec();
  }

  async getBooksByCategory(category: string): Promise<Book[]> {
    return await this.bookModel
      .find({ category: new RegExp(category, 'i') })
      .populate('school', 'name')
      .exec();
  }

  async getAvailableBooks(schoolId?: string): Promise<Book[]> {
    const filter: any = { 
      status: BookStatus.AVAILABLE,
      availableCopies: { $gt: 0 }
    };

    if (schoolId) {
      filter.school = new Types.ObjectId(schoolId);
    }

    return await this.bookModel
      .find(filter)
      .populate('school', 'name')
      .exec();
  }

  async incrementBorrowCount(bookId: string): Promise<void> {
    await this.bookModel.findByIdAndUpdate(bookId, {
      $inc: { borrowCount: 1 }
    }).exec();
  }

  async decrementAvailableCopies(bookId: string): Promise<void> {
    await this.bookModel.findByIdAndUpdate(bookId, {
      $inc: { availableCopies: -1 }
    }).exec();
  }

  async incrementAvailableCopies(bookId: string): Promise<void> {
    await this.bookModel.findByIdAndUpdate(bookId, {
      $inc: { availableCopies: 1 }
    }).exec();
  }

  async incrementReservationCount(bookId: string): Promise<void> {
    await this.bookModel.findByIdAndUpdate(bookId, {
      $inc: { reservationCount: 1 }
    }).exec();
  }

  async decrementReservationCount(bookId: string): Promise<void> {
    await this.bookModel.findByIdAndUpdate(bookId, {
      $inc: { reservationCount: -1 }
    }).exec();
  }

  async getMostBorrowedBooks(limit: number = 10): Promise<Book[]> {
    return await this.bookModel
      .find()
      .sort({ borrowCount: -1 })
      .limit(limit)
      .populate('school', 'name')
      .exec();
  }

  async getBooksBySchool(schoolId: string): Promise<Book[]> {
    return await this.bookModel
      .find({ school: new Types.ObjectId(schoolId) })
      .populate('school', 'name')
      .exec();
  }
}
