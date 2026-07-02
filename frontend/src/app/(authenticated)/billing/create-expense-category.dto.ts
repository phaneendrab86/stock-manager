import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateExpenseCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50) // Example validation: category name should not exceed 50 characters
  name: string;
}