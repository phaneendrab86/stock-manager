import { Test, TestingModule } from '@nestjs/testing';
import { SalesmenService } from './salesmen.service';

describe('SalesmenService', () => {
  let service: SalesmenService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SalesmenService],
    }).compile();

    service = module.get<SalesmenService>(SalesmenService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
