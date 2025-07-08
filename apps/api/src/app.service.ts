import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello() {
    return {
      message: 'Backend com NestJS',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
    };
  }
}
