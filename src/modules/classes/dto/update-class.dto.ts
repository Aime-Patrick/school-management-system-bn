import { CreateCombinationDto } from "./create-class-combination.dto";
import {PartialType} from "@nestjs/mapped-types";

export class UpdateClassDto extends PartialType(CreateCombinationDto) {}