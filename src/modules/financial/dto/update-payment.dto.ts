import { CreatePaymentDto } from "./create-payment.dto";
import {PartialType} from "@nestjs/mapped-types";

export class UpdatePaymentDto extends PartialType(CreatePaymentDto) {}