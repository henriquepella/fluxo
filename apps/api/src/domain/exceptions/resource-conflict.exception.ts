import { DomainException } from '../../shared/exceptions/domain.exception';

export class ResourceConflictException extends DomainException {
  constructor(message: string) {
    super('RESOURCE_CONFLICT', message);
  }
}
