import { Injectable } from '@nestjs/common';
import { ObjectLiteral, Repository } from 'typeorm';
import { ApiFeatures } from './pagination.service';

@Injectable()
export class ApiFeaturesFactory {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  create<T extends ObjectLiteral>(
    repository: Repository<T>,
    query: any,
  ): ApiFeatures<T> {
    return new ApiFeatures(repository, query);
  }
}
