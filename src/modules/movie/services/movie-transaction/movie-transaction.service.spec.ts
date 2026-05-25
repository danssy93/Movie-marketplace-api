import { Test, TestingModule } from '@nestjs/testing';
import { MovieTransactionService } from './movie-transaction.service';

describe('MovieTransactionService', () => {
  let service: MovieTransactionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MovieTransactionService],
    }).compile();

    service = module.get<MovieTransactionService>(MovieTransactionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
