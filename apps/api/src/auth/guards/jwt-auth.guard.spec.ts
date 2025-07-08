import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JwtAuthGuard],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
  });

  it('deve estar definido', () => {
    expect(guard).toBeDefined();
  });

  it('deve estender AuthGuard com estratégia jwt', () => {
    expect(guard).toBeInstanceOf(JwtAuthGuard);
  });
});
