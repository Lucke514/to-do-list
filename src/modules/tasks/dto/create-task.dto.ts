import { IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class CreateTaskDto {
    @IsString({message: 'El título debe ser una cadena de texto'})
    @IsNotEmpty({message: 'El título es obligatorio'})
    @MaxLength(100, {message: 'El título no puede tener más de 100 caracteres'})
    titulo      : string;

    @IsOptional()
    @IsString({message: 'La descripción debe ser una cadena de texto'})
    @MaxLength(500, {message: 'La descripción no puede tener más de 500 caracteres'})
    descripcion ?: string;
}
