import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class UpdateExpenseCategoryDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional() // Name is optional for update, as you might only want to update other fields in the future
  @MaxLength(50) // Example validation
  name?: string;
}