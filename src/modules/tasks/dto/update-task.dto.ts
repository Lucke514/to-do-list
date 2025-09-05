import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { IsEnum } from 'class-validator';
import { Status } from '@prisma/client';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
    @IsEnum(Status, {message: 'El estado debe ser "pendiente", "en_progreso" o "completada"'})
    status?: Status;
}
