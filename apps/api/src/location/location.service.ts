import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateLocationDto } from './dto/create-location.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { LocationEntity } from './entities/location.entity';

@Injectable()
export class LocationService {
  constructor(private prisma: PrismaService) {}

  async create(createLocationDto: CreateLocationDto): Promise<LocationEntity> {
    // Check if location already exists
    const existingLocation = await this.prisma.location.findUnique({
      where: {
        city_state: {
          city: createLocationDto.city,
          state: createLocationDto.state,
        },
      },
    });

    if (existingLocation) {
      throw new ConflictException('Location already exists');
    }

    const location = await this.prisma.location.create({
      data: createLocationDto,
    });

    return new LocationEntity(location);
  }

  async findAll(): Promise<LocationEntity[]> {
    const locations = await this.prisma.location.findMany({
      orderBy: [{ state: 'asc' }, { city: 'asc' }],
    });

    return locations.map((location) => new LocationEntity(location));
  }

  async findOne(id: number): Promise<LocationEntity> {
    const location = await this.prisma.location.findUnique({
      where: { id },
    });

    if (!location) {
      throw new NotFoundException('Location not found');
    }

    return new LocationEntity(location);
  }

  async update(
    id: number,
    updateLocationDto: UpdateLocationDto,
  ): Promise<LocationEntity> {
    // Check if location exists
    await this.findOne(id);

    // Check if updated location would conflict with existing one
    if (updateLocationDto.city || updateLocationDto.state) {
      const existingLocation = await this.prisma.location.findFirst({
        where: {
          AND: [
            { id: { not: id } },
            {
              city: updateLocationDto.city,
              state: updateLocationDto.state,
            },
          ],
        },
      });

      if (existingLocation) {
        throw new ConflictException('Location already exists');
      }
    }

    const location = await this.prisma.location.update({
      where: { id },
      data: updateLocationDto,
    });

    return new LocationEntity(location);
  }

  async remove(id: number): Promise<void> {
    // Check if location exists
    await this.findOne(id);

    await this.prisma.location.delete({
      where: { id },
    });
  }
}
