import { dbService } from '~/server/db';
import { ProjectRepository } from './project-repository'

export const projectRepository = new ProjectRepository(dbService)