import { DomainException } from '../../shared/exceptions/domain.exception';

export class EmailAlreadyInUseException extends DomainException {
  constructor(email: string) {
    super('EMAIL_ALREADY_IN_USE', `Email "${email}" is already registered`);
  }
}
