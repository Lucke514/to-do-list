import { Test, TestingModule } from '@nestjs/testing';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';
import { NotFoundException } from '@nestjs/common';

/**
 * @author Lucas Gonzalez
 * @description Test suite para el controlador de tareas (TasksController)
 */
describe('TasksController', () => {
    // Variables de utilidad para las pruebas
    let controller: TasksController;
    let service: jest.Mocked<TasksService>;

    // Mock de una tarea para usar en las pruebas
    const mockTask = {
        id: 1,
        titulo: 'Test Task',
        descripcion: 'Test Description',
        status: 'pendiente' as const,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
    };

    const mockTasksService = {
        create: jest.fn(),
        findAll: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
    };

    /**
     * Configuración del módulo de pruebas antes de cada test
     */
    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [TasksController],
            providers: [
                {
                    provide: TasksService,
                    useValue: mockTasksService,
                },
            ],
        }).compile();

        controller = module.get<TasksController>(TasksController);
        service = module.get(TasksService);
    });

    /**
     * Al finalizar cada prueba, limpiar los mocks para evitar interferencias entre tests
     */
    afterEach(() => {
        jest.clearAllMocks();
    });

    /**
     * @description Pruebas para el endpoint POST /tasks (crear tarea)
     * @endpoint POST /tasks
     * @validates Verifica que el controlador delegue correctamente al servicio
     * @validates Verifica que se retorne la respuesta correcta
     */
    describe('create', () => {
        /**
         * @test Debe crear una nueva tarea a través del endpoint POST
         * @description Prueba que el controlador maneje correctamente la creación de tareas
         * @expects Se llame al servicio create con los datos correctos
         * @expects Se retorne la tarea creada
         */
        it('debería crear una nueva tarea', async () => {
            const createTaskDto: CreateTaskDto = {
                titulo: 'New Task',
                descripcion: 'New Description',
            };

            const expectedTask = {
                id: 1,
                titulo: createTaskDto.titulo,
                descripcion: createTaskDto.descripcion || null,
                status: 'pendiente' as const,
                fechaCreacion: new Date(),
                fechaActualizacion: new Date(),
            };

            service.create.mockResolvedValue(expectedTask);

            const result = await controller.create(createTaskDto);

            expect(service.create).toHaveBeenCalledWith(createTaskDto);
            expect(result).toEqual(expectedTask);
        });

        /**
         * @test Debe crear una tarea solo con título (descripción opcional)
         * @description Prueba que el controlador maneje correctamente tareas sin descripción
         * @expects Se llame al servicio create con solo el título
         * @expects Se retorne la tarea creada sin descripción
         */
        it('debería crear una tarea solo con título', async () => {
            const createTaskDto: CreateTaskDto = {
                titulo: 'New Task Only Title',
            };

            const expectedTask = {
                id: 1,
                titulo: createTaskDto.titulo,
                descripcion: null,
                status: 'pendiente' as const,
                fechaCreacion: new Date(),
                fechaActualizacion: new Date(),
            };

            service.create.mockResolvedValue(expectedTask);

            const result = await controller.create(createTaskDto);

            expect(service.create).toHaveBeenCalledWith(createTaskDto);
            expect(result).toEqual(expectedTask);
        });
    });

    /**
     * @description Pruebas para el endpoint GET /tasks (obtener todas las tareas)
     * @endpoint GET /tasks
     * @validates Verifica que el controlador delegue correctamente al servicio
     * @validates Verifica que se retorne la lista de tareas
     */
    describe('findAll', () => {
        /**
         * @test Debe retornar un array de tareas del endpoint GET
         * @description Prueba que el controlador maneje correctamente la consulta de todas las tareas
         * @expects Se llame al servicio findAll
         * @expects Se retorne el array de tareas
         */
        it('debería retornar un array de tareas', async () => {
            const tasks = [
                mockTask,
                { ...mockTask, id: 2, titulo: 'Task 2' },
            ];

            service.findAll.mockResolvedValue(tasks);

            const result = await controller.findAll();

            expect(service.findAll).toHaveBeenCalled();
            expect(result).toEqual(tasks);
        });

        /**
         * @test Debe retornar un array vacío cuando no existen tareas
         * @description Prueba que el controlador maneje correctamente el caso sin tareas
         * @expects Se llame al servicio findAll
         * @expects Se retorne un array vacío
         */
        it('debería retornar un array vacío cuando no existen tareas', async () => {
            service.findAll.mockResolvedValue([]);

            const result = await controller.findAll();

            expect(service.findAll).toHaveBeenCalled();
            expect(result).toEqual([]);
        });
    });

    /**
     * @description Pruebas para el endpoint GET /tasks/:id (obtener una tarea específica)
     * @endpoint GET /tasks/:id
     * @validates Verifica que el controlador delegue correctamente al servicio
     * @validates Verifica que se convierta el parámetro string a number
     * @validates Verifica que se manejen las excepciones correctamente
     */
    describe('findOne', () => {
        /**
         * @test Debe retornar una tarea específica por ID
         * @description Prueba que el controlador maneje correctamente la consulta por ID
         * @expects Se llame al servicio findOne con el ID convertido a número
         * @expects Se retorne la tarea encontrada
         */
        it('debería retornar una tarea específica', async () => {
            service.findOne.mockResolvedValue(mockTask);

            const result = await controller.findOne('1');

            expect(service.findOne).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockTask);
        });

        /**
         * @test Debe convertir string ID a número correctamente
         * @description Prueba que el controlador convierta el parámetro de ruta string a number
         * @expects Se llame al servicio con el ID convertido a número
         */
        it('debería convertir string ID a número correctamente', async () => {
            service.findOne.mockResolvedValue(mockTask);

            await controller.findOne('123');

            expect(service.findOne).toHaveBeenCalledWith(123);
        });

        /**
         * @test Debe lanzar NotFoundException cuando la tarea no se encuentra
         * @description Prueba que el controlador propague correctamente las excepciones del servicio
         * @expects Se lance NotFoundException cuando el servicio la lance
         */
        it('debería lanzar NotFoundException cuando la tarea no se encuentra', async () => {
            service.findOne.mockRejectedValue(
                new NotFoundException('La tarea con ID 999 no existe'),
            );

            await expect(controller.findOne('999')).rejects.toThrow(
                NotFoundException,
            );

            expect(service.findOne).toHaveBeenCalledWith(999);
        });
    });

    /**
     * @description Pruebas para el endpoint PUT /tasks/:id (actualizar tarea)
     * @endpoint PUT /tasks/:id
     * @validates Verifica que el controlador delegue correctamente al servicio
     * @validates Verifica que se convierta el parámetro string a number
     * @validates Verifica que se manejen las excepciones correctamente
     */
    describe('update', () => {
        /**
         * @test Debe actualizar una tarea a través del endpoint PUT
         * @description Prueba que el controlador maneje correctamente la actualización de tareas
         * @expects Se llame al servicio update con ID y datos correctos
         * @expects Se retorne la tarea actualizada
         */
        it('debería actualizar una tarea', async () => {
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

            service.update.mockResolvedValue(updatedTask);

            const result = await controller.update('1', updateTaskDto);

            expect(service.update).toHaveBeenCalledWith(1, updateTaskDto);
            expect(result).toEqual(updatedTask);
        });

        /**
         * @test Debe actualizar tarea con datos parciales
         * @description Prueba que el controlador maneje correctamente actualizaciones parciales
         * @expects Se llame al servicio update con solo los campos a actualizar
         * @expects Se retorne la tarea actualizada
         */
        it('debería actualizar tarea con datos parciales', async () => {
            const updateTaskDto: UpdateTaskDto = {
                status: 'completada',
            };

            const updatedTask = {
                ...mockTask,
                status: 'completada' as const,
                fechaActualizacion: new Date(),
            };

            service.update.mockResolvedValue(updatedTask);

            const result = await controller.update('1', updateTaskDto);

            expect(service.update).toHaveBeenCalledWith(1, updateTaskDto);
            expect(result).toEqual(updatedTask);
        });

        /**
         * @test Debe convertir string ID a número correctamente en actualización
         * @description Prueba que el controlador convierta el parámetro de ruta string a number en update
         * @expects Se llame al servicio con el ID convertido a número
         */
        it('debería convertir string ID a número correctamente', async () => {
            const updateTaskDto: UpdateTaskDto = {
                titulo: 'Updated Task',
            };

            const updatedTask = {
                ...mockTask,
                titulo: 'Updated Task',
                fechaActualizacion: new Date(),
            };

            service.update.mockResolvedValue(updatedTask);

            await controller.update('123', updateTaskDto);

            expect(service.update).toHaveBeenCalledWith(123, updateTaskDto);
        });

        /**
         * @test Debe lanzar NotFoundException cuando la tarea a actualizar no existe
         * @description Prueba que el controlador propague correctamente las excepciones del servicio en update
         * @expects Se lance NotFoundException cuando el servicio la lance
         */
        it('debería lanzar NotFoundException cuando la tarea a actualizar no existe', async () => {
            const updateTaskDto: UpdateTaskDto = {
                titulo: 'Updated Task',
            };

            service.update.mockRejectedValue(
                new NotFoundException('La tarea con ID 999 no existe'),
            );

            await expect(controller.update('999', updateTaskDto)).rejects.toThrow(
                NotFoundException,
            );

            expect(service.update).toHaveBeenCalledWith(999, updateTaskDto);
        });
    });

    /**
     * @description Pruebas para el endpoint DELETE /tasks/:id (eliminar tarea)
     * @endpoint DELETE /tasks/:id
     * @validates Verifica que el controlador delegue correctamente al servicio
     * @validates Verifica que se convierta el parámetro string a number
     * @validates Verifica que se manejen las excepciones correctamente
     */
    describe('remove', () => {
        /**
         * @test Debe eliminar una tarea a través del endpoint DELETE
         * @description Prueba que el controlador maneje correctamente la eliminación de tareas
         * @expects Se llame al servicio remove con el ID correcto
         * @expects Se retorne la tarea eliminada
         */
        it('debería eliminar una tarea', async () => {
            service.remove.mockResolvedValue(mockTask);

            const result = await controller.remove('1');

            expect(service.remove).toHaveBeenCalledWith(1);
            expect(result).toEqual(mockTask);
        });

        /**
         * @test Debe convertir string ID a número correctamente en eliminación
         * @description Prueba que el controlador convierta el parámetro de ruta string a number en remove
         * @expects Se llame al servicio con el ID convertido a número
         */
        it('debería convertir string ID a número correctamente', async () => {
            service.remove.mockResolvedValue(mockTask);

            await controller.remove('123');

            expect(service.remove).toHaveBeenCalledWith(123);
        });

        /**
         * @test Debe lanzar NotFoundException cuando la tarea a eliminar no existe
         * @description Prueba que el controlador propague correctamente las excepciones del servicio en remove
         * @expects Se lance NotFoundException cuando el servicio la lance
         */
        it('debería lanzar NotFoundException cuando la tarea a eliminar no existe', async () => {
            service.remove.mockRejectedValue(
                new NotFoundException('La tarea con ID 999 no existe'),
            );

            await expect(controller.remove('999')).rejects.toThrow(
                NotFoundException,
            );

            expect(service.remove).toHaveBeenCalledWith(999);
        });
    });
});
