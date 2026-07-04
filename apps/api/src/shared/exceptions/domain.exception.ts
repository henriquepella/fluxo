/**
 * Base class for all domain exceptions.
 *
 * Domain code never throws HTTP exceptions — it throws subclasses of this
 * class, and the presentation layer (GlobalExceptionFilter) translates them
 * into HTTP responses. This keeps the domain layer framework-agnostic.
 */
export abstract class DomainException extends Error {
  protected constructor(
    readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = new.target.name;
  }
}
