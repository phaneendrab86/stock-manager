import { Test, TestingModule } from '@nestjs/testing';
import { SalesmenController } from './salesmen.controller';

describe('SalesmenController', () => {
  let controller: SalesmenController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SalesmenController],
    }).compile();

    controller = module.get<SalesmenController>(SalesmenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
