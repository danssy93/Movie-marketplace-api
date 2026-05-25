import { Test, TestingModule } from '@nestjs/testing';
import { MovieTransactionController } from './movie-transaction.controller';

describe('MovieTransactionController', () => {
  let controller: MovieTransactionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MovieTransactionController],
    }).compile();

    controller = module.get<MovieTransactionController>(MovieTransactionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
