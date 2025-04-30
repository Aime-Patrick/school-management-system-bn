import { CreateAcademicDto } from "./create-academic.dto";
import {PartialType} from "@nestjs/mapped-types";

export class UpdateAcademicDto extends PartialType(CreateAcademicDto) {}