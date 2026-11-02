import { Test, TestingModule } from '@nestjs/testing';
import { LojasService } from './lojas.service.js';

describe('LojasService', () => {
  let service: LojasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LojasService],
    }).compile();

    service = module.get<LojasService>(LojasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
