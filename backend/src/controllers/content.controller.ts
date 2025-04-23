import { FastifyRequest, FastifyReply } from 'fastify';
import { Role } from '../types/role';
import { Static } from '@sinclair/typebox';
import { CreateContentSchema, GetContentsSchema, UpdateContentSchema, DeleteContentSchema } from '../schemas/content.schema';
import { MultipartFile } from '@fastify/multipart';

type CreateContentBody = {
  title?: string;
  content?: string;
  moduleId?: string;
  file?: Buffer | MultipartFile;
};
type UpdateContentBody = {
  title?: string;
  content?: string;
  file?: Buffer | MultipartFile;
};
type GetContentsParams = Static<typeof GetContentsSchema.params>;
type UpdateContentParams = Static<typeof UpdateContentSchema.params>;
type DeleteContentParams = Static<typeof DeleteContentSchema.params>;

export const createContent = async (request: FastifyRequest<{ Body: CreateContentBody }>, reply: FastifyReply) => {
  try {
    const user = request.user as { id: number; role: Role };
    if (user.role !== Role.INSTRUCTOR && user.role !== Role.ADMIN) {
      throw new Error('Only instructors or admins can create content');
    }

    let title: string | undefined;
    let content: string | undefined;
    let moduleId: number | undefined;
    let file: Buffer | MultipartFile | undefined;

    if (request.isMultipart()) {
      title = request.body.title;
      content = request.body.content;
      moduleId = request.body.moduleId ? parseInt(request.body.moduleId, 10) : undefined;
      file = request.body.file;

      if (Buffer.isBuffer(file)) {
        console.log('File detected as Buffer with length:', file.length);
      }
    }

    if (!title || !content || !moduleId) {
      throw new Error('Title, content, and moduleId are required');
    }

    const dataToService = { title, content, moduleId, file };
    const createdContent = await request.server.contentService.createContent(user.id, dataToService);
    reply.code(201).send({ id: createdContent.id, message: 'Content created successfully' });
  } catch (err: any) {
    reply.code(400).send({ error: err.message });
  }
};

export const getContents = async (request: FastifyRequest<{ Params: GetContentsParams }>, reply: FastifyReply) => {
  try {
    const { moduleId } = request.params;
    const contents = await request.server.contentService.getContents(moduleId);
    reply.send(contents);
  } catch (err: any) {
    reply.code(400).send({ error: err.message });
  }
};

export const updateContent = async (request: FastifyRequest<{ Params: UpdateContentParams; Body: UpdateContentBody }>, reply: FastifyReply) => {
  try {
    const user = request.user as { id: number; role: Role };
    if (user.role !== Role.INSTRUCTOR && user.role !== Role.ADMIN) {
      throw new Error('Only instructors or admins can update content');
    }

    let title: string | undefined;
    let content: string | undefined;
    let file: Buffer | MultipartFile | undefined;

    if (request.isMultipart()) {
      title = request.body.title;
      content = request.body.content;
      file = request.body.file;

      if (Buffer.isBuffer(file)) {
        console.log('File detected as Buffer with length:', file.length);
      }
    }

    if (!title || !content) {
      throw new Error('Title and content are required');
    }

    const dataToService = { title, content, file };
    const updatedContent = await request.server.contentService.updateContent(user.id, request.params.id, dataToService);
    reply.send({ id: updatedContent.id, message: 'Content updated successfully' });
  } catch (err: any) {
    reply.code(400).send({ error: err.message });
  }
};

export const deleteContent = async (request: FastifyRequest<{ Params: DeleteContentParams }>, reply: FastifyReply) => {
  try {
    const user = request.user as { id: number; role: Role };
    if (user.role !== Role.INSTRUCTOR && user.role !== Role.ADMIN) {
      throw new Error('Only instructors or admins can delete content');
    }
    await request.server.contentService.deleteContent(user.id, request.params.id);
    reply.send({ message: 'Content deleted successfully' });
  } catch (err: any) {
    reply.code(400).send({ error: err.message });
  }
};