import { CreateClassDto } from "./create-class.dto";
import {PartialType} from "@nestjs/mapped-types";

export class UpdateClassDto extends PartialType(CreateClassDto) {}