import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, IsMongoId } from 'class-validator';

export class SubmitAssignmentDto {
  @ApiProperty({ 
    example: 'I have completed the assignment as requested', 
    description: 'Comments from the student about their submission'
  })
  @IsString()
  @IsOptional()
  comments?: string;

  @ApiProperty({ 
    example: ['60d0fe4f5311236168a109cc'], 
    description: 'Array of file IDs that were uploaded'
  })
  @IsArray()
  @IsMongoId({ each: true })
  @IsOptional()
  fileIds?: string[];
}
