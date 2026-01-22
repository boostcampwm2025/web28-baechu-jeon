import { Injectable } from '@nestjs/common';

import { Prisma, Project } from '@prisma/client';
import { PrismaService } from 'src/database/prisma.service';

export interface CreateProjectData {
  title: string;
  structure: unknown;
  files: unknown;
}

@Injectable()
export class ProjectRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateProjectData): Promise<Project> {
    return this.prisma.project.create({
      data: {
        title: data.title,
        structure: data.structure as Prisma.InputJsonValue,
        files: data.files as Prisma.InputJsonValue,
      },
    });
  }

  async findById(id: string): Promise<Project | null> {
    return this.prisma.project.findUnique({
      where: { id },
    });
  }

  async findStructureById(id: string) {
    return this.prisma.project.findUnique({
      where: { id },
      select: {
        id: true,
        status: true,
        structure: true,
      },
    });
  }
}
