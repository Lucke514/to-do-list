import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { PrismaService } from 'src/core/services/prisma/prisma.service';
import { TaskModule } from 'src/sockets/task/task.module';

@Module({
  imports: [TaskModule],
  controllers: [TasksController],
  providers: [TasksService, PrismaService],
})
export class TasksModule {}
