import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { PrismaService } from 'src/core/services/prisma/prisma.service';
import { TaskGateway } from 'src/sockets/task/task.gateway';

@Injectable()
export class TasksService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly taskGateway: TaskGateway,
    ) {}

    /**
     * @description Crea una nueva tarea en la base de datos utilizando Prisma ORM.
     * @param createTaskDto - Data Transfer Object para crear una tarea con un titulo y una descripción.
     * @returns La tarea creada.
     */
    async create(createTaskDto: CreateTaskDto) {
        const newTask = await this.prisma.task.create({
            data: {
                ...createTaskDto,
                status: 'pendiente',
            },
        });

        // Emitir evento WebSocket cuando se crea una nueva tarea
        this.taskGateway.emitTaskCreated(newTask);

        return newTask;
    }

    /**
     * @description Obtiene todas las tareas de la base de datos.
     * @returns Un array de tareas.
     */
    async findAll() {
        // Leer todas las tareas
        const tasks = await this.prisma.task.findMany();

        // Retornar array vacío si no hay tareas (no lanzar excepción)
        return tasks || [];
    }

    /**
     * @description Obtiene una tarea por su ID.
     * @param id - ID de la tarea a buscar
     * @returns La tarea encontrada
     */
    async findOne(id: number) {
        // Leer la tarea con el ID proporcionado
        const task = await this.prisma.task.findUnique({
            where: { id },
        });

        // validar que esta tarea exista
        if (!task) {
            throw new NotFoundException(`La tarea con ID ${id} no existe`);
        }

        return task;
    }

    /**
     * @description Actualiza una tarea existente en la base de datos.
     * @param id - ID de la tarea a actualizar
     * @param updateTaskDto - Data Transfer Object para actualizar una tarea
     * @returns La tarea actualizada
     */
    async update(id: number, updateTaskDto: UpdateTaskDto) {
        // Validar que la tarea exista
        const task = await this.prisma.task.findUnique({
            where: { id },
        });

        if (!task) {
            throw new NotFoundException(`La tarea con ID ${id} no existe`);
        }

        // Actualizar la tarea
        const updatedTask = await this.prisma.task.update({
            where: { id },
            data: { ...updateTaskDto },
        });

        // Emitir evento WebSocket cuando se actualiza una tarea
        this.taskGateway.emitTaskUpdated(updatedTask);

        return updatedTask;
    }

    /**
     * @description Elimina una tarea de la base de datos.
     * @param id - ID de la tarea a eliminar
     * @returns La tarea eliminada
     */
    async remove(id: number) {
        // Validar que la tarea exista
        const task = await this.prisma.task.findUnique({
            where: { id },
        });

        if (!task) {
            throw new NotFoundException(`La tarea con ID ${id} no existe`);
        }

        // Eliminar la tarea
        const deletedTask = await this.prisma.task.delete({
            where: { id },
        });

        // Emitir evento WebSocket cuando se elimina una tarea
        this.taskGateway.emitTaskDeleted(deletedTask);

        return deletedTask;
    }
}
