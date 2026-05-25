import { Test, TestingModule } from '@nestjs/testing';
import { UsermovieController } from './userMovie.controller';

describe('UsermovieController', () => {
  let controller: UsermovieController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsermovieController],
    }).compile();

    controller = module.get<UsermovieController>(UsermovieController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
