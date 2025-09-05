import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PrismaService } from 'src/core/services/prisma/prisma.service';
import { TaskGateway } from 'src/sockets/task/task.gateway';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

/**
 * @author Lucas Gonzalez
 * @description Test suite para el servicio de tareas (TasksService)
 */
describe('TasksService', () => {
    // Variables de utilidad para las pruebas
    let service         : TasksService;
    let prismaService   : any;
    let taskGateway     : jest.Mocked<TaskGateway>;

    // Mock de una tarea para usar en las pruebas
    const mockTask = {
        id: 1,
        titulo: 'Test Task',
        descripcion: 'Test Description',
        status: 'pendiente' as const,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
    };

    const mockPrismaService = {
        task: {
            create      : jest.fn(),
            findMany    : jest.fn(),
            findUnique  : jest.fn(),
            update      : jest.fn(),
            delete      : jest.fn(),
        },
    };

    const mockTaskGateway = {
        emitTaskCreated : jest.fn(),
        emitTaskUpdated : jest.fn(),
        emitTaskDeleted : jest.fn(),
    };

    /**
     * Configuración del módulo de pruebas antes de cada test
     */
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TasksService,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
                {
                    provide: TaskGateway,
                    useValue: mockTaskGateway,
                },
            ],
        }).compile();

        service = module.get<TasksService>(TasksService);
        prismaService = module.get(PrismaService);
        taskGateway = module.get(TaskGateway);
    });

    /**
     * Al finalizar cada prueba, limpiar los mocks para evitar interferencias entre tests
     */
    afterEach(() => {
        jest.clearAllMocks();
    });

    /**
     * @description Pruebas para el método create del servicio de tareas (TasksService)
     * @test Crea una nueva tarea en la base de datos utilizando Prisma ORM.
     * @validates Verifica que se cree correctamente una tarea con título y descripción opcional
     * @validates Verifica que se emita el evento WebSocket correspondiente
     */
    describe('create', () => {
        /**
         * @test Debe crear una nueva tarea exitosamente con título y descripción
         * @description Prueba que el método create funcione correctamente con datos completos
         * @expects La tarea se cree con status 'pendiente' por defecto
         * @expects Se emita el evento WebSocket taskCreated
         */
        it('debería crear una nueva tarea exitosamente', async () => {
            const createTaskDto: CreateTaskDto = {
                titulo: 'Test Task',
                descripcion: 'Test Description',
            };

            const expectedTask = {
                ...createTaskDto,
                id: 1,
                status: 'pendiente',
                fechaCreacion: new Date(),
                fechaActualizacion: new Date(),
            };

            prismaService.task.create.mockResolvedValue(expectedTask);

            const result = await service.create(createTaskDto);

            expect(prismaService.task.create).toHaveBeenCalledWith({
                data: {
                    ...createTaskDto,
                    status: 'pendiente',
                },
            });
            expect(taskGateway.emitTaskCreated).toHaveBeenCalledWith(expectedTask);
            expect(result).toEqual(expectedTask);
        });

        /**
         * @test Debe crear una tarea solo con título (descripción opcional)
         * @description Prueba que el método create funcione correctamente cuando solo se proporciona el título
         * @expects La tarea se cree correctamente sin descripción
         * @expects Se emita el evento WebSocket taskCreated
         */
        it('debería crear una tarea solo con título (descripción opcional)', async () => {
            const createTaskDto: CreateTaskDto = {
                titulo: 'Test Task Only Title',
            };

            const expectedTask = {
                ...createTaskDto,
                id: 1,
                status: 'pendiente',
                fechaCreacion: new Date(),
                fechaActualizacion: new Date(),
            };

            prismaService.task.create.mockResolvedValue(expectedTask);

            const result = await service.create(createTaskDto);

            expect(prismaService.task.create).toHaveBeenCalledWith({
                data: {
                    ...createTaskDto,
                    status: 'pendiente',
                },
            });
            expect(taskGateway.emitTaskCreated).toHaveBeenCalledWith(expectedTask);
            expect(result).toEqual(expectedTask);
        });
    });

    /**
     * @description Pruebas para el método findAll del servicio de tareas (TasksService)
     * @test Obtiene todas las tareas de la base de datos.
     * @validates Verifica que se retorne un array de tareas cuando existen
     * @validates Verifica que se retorne un array vacío cuando no hay tareas
     */
    describe('findAll', () => {
        /**
         * @test Debe retornar un array de tareas cuando existen tareas en la base de datos
         * @description Prueba que el método findAll retorne correctamente todas las tareas
         * @expects Se llame al método findMany de Prisma
         * @expects Se retorne un array con las tareas encontradas
         */
        it('debería retornar un array de tareas', async () => {
            const tasks = [mockTask, { ...mockTask, id: 2, titulo: 'Task 2' }];
            prismaService.task.findMany.mockResolvedValue(tasks);

            const result = await service.findAll();

            expect(prismaService.task.findMany).toHaveBeenCalled();
            expect(result).toEqual(tasks);
        });

        /**
         * @test Debe retornar un array vacío cuando no existen tareas en la base de datos
         * @description Prueba que el método findAll retorne array vacío correctamente
         * @expects Se llame al método findMany de Prisma
         * @expects Se retorne un array vacío
         */
        it('debería retornar un array vacío cuando no existen tareas', async () => {
            prismaService.task.findMany.mockResolvedValue([]);

            const result = await service.findAll();

            expect(prismaService.task.findMany).toHaveBeenCalled();
            expect(result).toEqual([]);
        });

        /**
         * @test Debe retornar un array vacío cuando findMany retorna null
         * @description Prueba el manejo de casos edge cuando Prisma retorna null
         * @expects Se retorne un array vacío en lugar de null
         */
        it('debería retornar un array vacío cuando findMany retorna null', async () => {
            prismaService.task.findMany.mockResolvedValue(null);

            const result = await service.findAll();

            expect(prismaService.task.findMany).toHaveBeenCalled();
            expect(result).toEqual([]);
        });
    });

    /**
     * @description Pruebas para el método findOne del servicio de tareas (TasksService)
     * @test Obtiene una tarea por su ID.
     * @validates Verifica que se retorne la tarea cuando existe
     * @validates Verifica que se lance NotFoundException cuando no existe
     */
    describe('findOne', () => {
        /**
         * @test Debe retornar una tarea cuando la encuentra por ID
         * @description Prueba que el método findOne retorne la tarea correcta
         * @expects Se llame al método findUnique de Prisma con el ID correcto
         * @expects Se retorne la tarea encontrada
         */
        it('debería retornar una tarea cuando la encuentra', async () => {
            prismaService.task.findUnique.mockResolvedValue(mockTask);

            const result = await service.findOne(1);

            expect(prismaService.task.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(result).toEqual(mockTask);
        });

        /**
         * @test Debe lanzar NotFoundException cuando la tarea no se encuentra
         * @description Prueba que se maneje correctamente el caso cuando no existe la tarea
         * @expects Se lance NotFoundException con el mensaje correcto
         * @expects Se llame al método findUnique de Prisma
         */
        it('debería lanzar NotFoundException cuando la tarea no se encuentra', async () => {
            prismaService.task.findUnique.mockResolvedValue(null);

            await expect(service.findOne(999)).rejects.toThrow(
                new NotFoundException('La tarea con ID 999 no existe'),
            );

            expect(prismaService.task.findUnique).toHaveBeenCalledWith({
                where: { id: 999 },
            });
        });
    });

    /**
     * @description Pruebas para el método update del servicio de tareas (TasksService)
     * @test Actualiza una tarea existente en la base de datos.
     * @validates Verifica que se actualice correctamente una tarea existente
     * @validates Verifica que se emita el evento WebSocket correspondiente
     * @validates Verifica que se lance NotFoundException cuando la tarea no existe
     */
    describe('update', () => {
        /**
         * @test Debe actualizar una tarea exitosamente con datos completos
         * @description Prueba que el método update funcione correctamente con datos completos
         * @expects Se valide que la tarea existe antes de actualizar
         * @expects Se actualice la tarea con los nuevos datos
         * @expects Se emita el evento WebSocket taskUpdated
         */
        it('debería actualizar una tarea exitosamente', async () => {
            const updateTaskDto: UpdateTaskDto = {
                titulo: 'Updated Task',
                descripcion: 'Updated Description',
                status: 'en_progreso',
            };

            const updatedTask = {
                ...mockTask,
                ...updateTaskDto,
                fechaActualizacion: new Date(),
            };

            prismaService.task.findUnique.mockResolvedValue(mockTask);
            prismaService.task.update.mockResolvedValue(updatedTask);

            const result = await service.update(1, updateTaskDto);

            expect(prismaService.task.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(prismaService.task.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { ...updateTaskDto },
            });
            expect(taskGateway.emitTaskUpdated).toHaveBeenCalledWith(updatedTask);
            expect(result).toEqual(updatedTask);
        });

        /**
         * @test Debe actualizar una tarea con datos parciales
         * @description Prueba que el método update funcione con actualizaciones parciales
         * @expects Se actualice solo los campos proporcionados
         * @expects Se emita el evento WebSocket taskUpdated
         */
        it('debería actualizar tarea con datos parciales', async () => {
            const updateTaskDto: UpdateTaskDto = {
                status: 'completada',
            };

            const updatedTask = {
                ...mockTask,
                status: 'completada',
                fechaActualizacion: new Date(),
            };

            prismaService.task.findUnique.mockResolvedValue(mockTask);
            prismaService.task.update.mockResolvedValue(updatedTask);

            const result = await service.update(1, updateTaskDto);

            expect(prismaService.task.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(prismaService.task.update).toHaveBeenCalledWith({
                where: { id: 1 },
                data: { ...updateTaskDto },
            });
            expect(taskGateway.emitTaskUpdated).toHaveBeenCalledWith(updatedTask);
            expect(result).toEqual(updatedTask);
        });

        /**
         * @test Debe lanzar NotFoundException cuando la tarea a actualizar no existe
         * @description Prueba que se valide la existencia de la tarea antes de actualizar
         * @expects Se lance NotFoundException cuando la tarea no existe
         * @expects No se ejecute la actualización
         * @expects No se emita evento WebSocket
         */
        it('debería lanzar NotFoundException cuando la tarea a actualizar no existe', async () => {
            const updateTaskDto: UpdateTaskDto = {
                titulo: 'Updated Task',
            };

            prismaService.task.findUnique.mockResolvedValue(null);

            await expect(service.update(999, updateTaskDto)).rejects.toThrow(
                new NotFoundException('La tarea con ID 999 no existe'),
            );

            expect(prismaService.task.findUnique).toHaveBeenCalledWith({
                where: { id: 999 },
            });
            expect(prismaService.task.update).not.toHaveBeenCalled();
            expect(taskGateway.emitTaskUpdated).not.toHaveBeenCalled();
        });
    });

    /**
     * @description Pruebas para el método remove del servicio de tareas (TasksService)
     * @test Elimina una tarea de la base de datos.
     * @validates Verifica que se elimine correctamente una tarea existente
     * @validates Verifica que se emita el evento WebSocket correspondiente
     * @validates Verifica que se lance NotFoundException cuando la tarea no existe
     */
    describe('remove', () => {
        /**
         * @test Debe eliminar una tarea exitosamente
         * @description Prueba que el método remove funcione correctamente
         * @expects Se valide que la tarea existe antes de eliminar
         * @expects Se elimine la tarea de la base de datos
         * @expects Se emita el evento WebSocket taskDeleted
         * @expects Se retorne la tarea eliminada
         */
        it('debería eliminar una tarea exitosamente', async () => {
            prismaService.task.findUnique.mockResolvedValue(mockTask);
            prismaService.task.delete.mockResolvedValue(mockTask);

            const result = await service.remove(1);

            expect(prismaService.task.findUnique).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(prismaService.task.delete).toHaveBeenCalledWith({
                where: { id: 1 },
            });
            expect(taskGateway.emitTaskDeleted).toHaveBeenCalledWith(mockTask);
            expect(result).toEqual(mockTask);
        });

        /**
         * @test Debe lanzar NotFoundException cuando la tarea a eliminar no existe
         * @description Prueba que se valide la existencia de la tarea antes de eliminar
         * @expects Se lance NotFoundException cuando la tarea no existe
         * @expects No se ejecute la eliminación
         * @expects No se emita evento WebSocket
         */
        it('debería lanzar NotFoundException cuando la tarea a eliminar no existe', async () => {
            prismaService.task.findUnique.mockResolvedValue(null);

            await expect(service.remove(999)).rejects.toThrow(
                new NotFoundException('La tarea con ID 999 no existe'),
            );

            expect(prismaService.task.findUnique).toHaveBeenCalledWith({
                where: { id: 999 },
            });
            expect(prismaService.task.delete).not.toHaveBeenCalled();
            expect(taskGateway.emitTaskDeleted).not.toHaveBeenCalled();
        });
    });
});
