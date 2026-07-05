import { DomainException } from '../../shared/exceptions/domain.exception';

export class ResourceNotFoundException extends DomainException {
  constructor(resource: string, id: string) {
    super('RESOURCE_NOT_FOUND', `${resource} "${id}" not found`);
  }
}
