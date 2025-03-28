import { CreateTermDto } from "./create-term.dto";
import {PartialType} from "@nestjs/mapped-types";

export class UpdateTermDto extends PartialType(CreateTermDto) {}