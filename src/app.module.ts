import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [AdminModule,
    // TypeOrmModule.forRoot({
    //   type: 'mysql',  // Specify the database type
    //   host: 'localhost',  // Your MySQL host
    //   port: 3306,  // Your MySQL port
    //   username: 'root',  // Your MySQL username
    //   password: 'root',  // Your MySQL password
    //   database: 'available_time',  // Your MySQL database
    //   entities: [FreeTime],  // Add your entities here
    //   synchronize: true,  // Set to true for development, but false in production
    // }),
    // TypeOrmModule.forFeature([FreeTimeRepository]),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
