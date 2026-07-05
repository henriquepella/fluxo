import { DomainException } from '../../shared/exceptions/domain.exception';

export class BusinessRuleViolationException extends DomainException {
  constructor(message: string) {
    super('BUSINESS_RULE_VIOLATION', message);
  }
}
