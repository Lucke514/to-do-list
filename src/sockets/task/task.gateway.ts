import { Logger } from '@nestjs/common';
import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer, } from '@nestjs/websockets';
import { task } from '@prisma/client';
import { Server } from 'socket.io';

@WebSocketGateway({
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
})
export class TaskGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
    logger: Logger = new Logger('TaskGateway');

    handleDisconnect(client: any) {
        this.logger.log(`Cliente desconectado: ${client.id}`);
    }
    
    handleConnection(client: any ) {
        this.logger.log(`Cliente conectado: ${client.id}`);
    }

    /**
     * @description Emite un evento cuando se crea una nueva tarea
     * @param task - La tarea que fue creada
     */
    emitTaskCreated(task: task) {
        this.logger.log(`Emitiendo evento de tarea creada: ${task.id}`);
        this.server.emit('taskCreated', task);
    }

    /**
     * @description Emite un evento cuando se actualiza una tarea
     * @param task - La tarea que fue actualizada
     */
    emitTaskUpdated(task: task) {
        this.logger.log(`Emitiendo evento de tarea actualizada: ${task.id}`);
        this.server.emit('taskUpdated', task);
    }

    /**
     * @description Emite un evento cuando se elimina una tarea
     * @param task - La tarea que fue eliminada
     */
    emitTaskDeleted(task: task) {
        this.logger.log(`Emitiendo evento de tarea eliminada: ${task.id}`);
        this.server.emit('taskDeleted', task);
    }
}
