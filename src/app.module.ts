import { Module } from '@nestjs/common';
import { PrismaService } from './core/services/prisma/prisma.service';
import { TasksModule } from './modules/tasks/tasks.module';
import { TaskModule } from './sockets/task/task.module';

@Module({
  imports: [TasksModule, TaskModule],
  controllers: [],
  providers: [PrismaService],
})
export class AppModule {}
