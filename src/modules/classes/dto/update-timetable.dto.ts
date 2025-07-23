import { TimetableDto } from "./timetable.dto";
import {PartialType} from "@nestjs/mapped-types";

export class UpdateTimetableDto extends PartialType(TimetableDto) {}