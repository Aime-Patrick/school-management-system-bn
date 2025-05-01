import { CreateStudentPaymentDto } from "./record-student-payment.dto";
import {PartialType} from "@nestjs/mapped-types";

export class UpdateStudentPaymentDto extends PartialType(CreateStudentPaymentDto) {}