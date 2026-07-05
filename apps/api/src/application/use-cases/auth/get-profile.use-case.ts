import { Inject, Injectable } from '@nestjs/common';
import { PublicUser, toPublicUser } from '../../../domain/entities/user.entity';
import { ResourceNotFoundException } from '../../../domain/exceptions/resource-not-found.exception';
import { USER_REPOSITORY, type UserRepository } from '../../../domain/repositories/user.repository';

@Injectable()
export class GetProfileUseCase {
  constructor(@Inject(USER_REPOSITORY) private readonly users: UserRepository) {}

  async execute(userId: string): Promise<PublicUser> {
    const user = await this.users.findById(userId);
    if (!user) {
      throw new ResourceNotFoundException('User', userId);
    }
    return toPublicUser(user);
  }
}
