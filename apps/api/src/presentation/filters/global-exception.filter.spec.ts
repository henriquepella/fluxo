import { ArgumentsHost, BadRequestException, HttpStatus, NotFoundException } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { DomainException } from '../../shared/exceptions/domain.exception';
import { GlobalExceptionFilter } from './global-exception.filter';

class FakeDomainException extends DomainException {
  constructor() {
    super('FAKE_RULE_VIOLATED', 'Business rule violated');
  }
}

interface ErrorBody {
  statusCode: number;
  code: string;
  message: string;
  details?: string[];
  path: string;
}

describe('GlobalExceptionFilter', () => {
  let filter: GlobalExceptionFilter;
  let json: jest.Mock;
  let status: jest.Mock;
  let logger: { error: jest.Mock; warn: jest.Mock; setContext: jest.Mock };

  const createHost = (): ArgumentsHost =>
    ({
      switchToHttp: () => ({
        getResponse: () => ({ status }),
        getRequest: () => ({ url: '/api/v1/resource', method: 'GET' }),
      }),
    }) as unknown as ArgumentsHost;

  const responseBody = (): ErrorBody => (json.mock.calls as [ErrorBody][])[0][0];

  beforeEach(() => {
    json = jest.fn();
    status = jest.fn().mockReturnValue({ json });
    logger = { error: jest.fn(), warn: jest.fn(), setContext: jest.fn() };
    filter = new GlobalExceptionFilter(logger as unknown as PinoLogger);
  });

  it('maps DomainException to 422 with its domain code', () => {
    filter.catch(new FakeDomainException(), createHost());

    expect(status).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(responseBody().code).toBe('FAKE_RULE_VIOLATED');
    expect(responseBody().message).toBe('Business rule violated');
    expect(logger.warn).toHaveBeenCalled();
  });

  it('preserves HttpException status, code and message', () => {
    filter.catch(new NotFoundException('Account not found'), createHost());

    expect(status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(responseBody().code).toBe('NOT_FOUND');
    expect(responseBody().message).toBe('Account not found');
  });

  it('flattens class-validator messages into details', () => {
    filter.catch(new BadRequestException(['name should not be empty']), createHost());

    expect(status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(responseBody().code).toBe('VALIDATION_ERROR');
    expect(responseBody().message).toBe('Validation failed');
    expect(responseBody().details).toEqual(['name should not be empty']);
  });

  it('hides internals of unexpected errors and logs them as errors', () => {
    filter.catch(new Error('secret connection string'), createHost());

    expect(status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(responseBody().code).toBe('INTERNAL_SERVER_ERROR');
    expect(responseBody().message).toBe('Internal server error');
    expect(logger.error).toHaveBeenCalled();
  });

  it('includes the request path in the response body', () => {
    filter.catch(new Error('boom'), createHost());

    expect(responseBody().path).toBe('/api/v1/resource');
  });
});
