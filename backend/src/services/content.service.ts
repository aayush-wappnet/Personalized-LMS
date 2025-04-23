import { AppDataSource } from '../config/database';
import { Content } from '../entities/Content';
import { Module } from '../entities/Module';
import { Enrollment } from '../entities/Enrollment';
import { FastifyInstance } from 'fastify';
import { Role } from '../types/role';
import { MultipartFile } from '@fastify/multipart';
import { Readable } from 'stream';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import { NotificationService } from './notification.service';

export class ContentService {
  private contentRepository = AppDataSource.getRepository(Content);
  private moduleRepository = AppDataSource.getRepository(Module);
  private enrollmentRepository = AppDataSource.getRepository(Enrollment);
  private notificationService: NotificationService;
  private fastify: FastifyInstance;

  constructor(fastify: FastifyInstance) {
    this.fastify = fastify;
    this.notificationService = new NotificationService(fastify);
  }

  async createContent(instructorId: number, data: { moduleId: number; title: string; content: string; file?: MultipartFile | Buffer }) {
    const module = await this.moduleRepository.findOneOrFail({
      where: { id: data.moduleId, course: { instructor: { id: instructorId }, approvalStatus: 'APPROVED' } },
      relations: ['course'],
    });

    let fileUrl = '';
    if (data.file) {
      if (Buffer.isBuffer(data.file)) {
        const stream = new Readable();
        stream.push(data.file);
        stream.push(null);
        try {
          let cloudinaryInstance = this.fastify.cloudinary;
          if (!cloudinaryInstance || !cloudinaryInstance.uploader) {
            cloudinaryInstance = cloudinary;
          }
          const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
            const uploadStream = cloudinaryInstance.uploader.upload_stream(
              { resource_type: 'auto' },
              (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                if (error) reject(error);
                else if (result) resolve(result);
                else reject(new Error('Upload failed with no error or result'));
              }
            );
            stream.pipe(uploadStream);
          });
          fileUrl = uploadResult.secure_url;
          console.log('File uploaded, URL:', fileUrl);
        } catch (uploadError) {
          console.error('Cloudinary upload failed:', uploadError);
          throw new Error('Failed to upload file to Cloudinary');
        }
      }
    }

    const content = this.contentRepository.create({
      title: data.title,
      content: data.content,
      fileUrl,
      module,
    });
    const savedContent = await this.contentRepository.save(content);

    // Notify enrolled students about the new content
    const enrollments = await this.enrollmentRepository.find({ where: { course: { id: module.course.id } }, relations: ['student'] });
    for (const enrollment of enrollments) {
      await this.notificationService.createNotification(
        enrollment.student.id,
        `New content "${content.title}" has been added to the module "${module.title}".`,
        'Content',
        savedContent.id
      );
    }

    return savedContent;
  }

  async getContents(moduleId: number) {
    return await this.contentRepository.find({ where: { module: { id: moduleId } }, relations: ['module'] });
  }

  async updateContent(instructorId: number, contentId: number, data: { title: string; content: string; file?: MultipartFile | Buffer }) {
    const content = await this.contentRepository.findOneOrFail({
      where: { id: contentId, module: { course: { instructor: { id: instructorId }, approvalStatus: 'APPROVED' } } },
      relations: ['module'],
    });

    let fileUrl = content.fileUrl;
    if (data.file) {
      if (Buffer.isBuffer(data.file)) {
        const stream = new Readable();
        stream.push(data.file);
        stream.push(null);
        try {
          let cloudinaryInstance = this.fastify.cloudinary;
          if (!cloudinaryInstance || !cloudinaryInstance.uploader) {
            cloudinaryInstance = cloudinary;
          }
          const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
            const uploadStream = cloudinaryInstance.uploader.upload_stream(
              { resource_type: 'auto' },
              (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
                if (error) reject(error);
                else if (result) resolve(result);
                else reject(new Error('Upload failed with no error or result'));
              }
            );
            stream.pipe(uploadStream);
          });
          fileUrl = uploadResult.secure_url;
          console.log('File uploaded, URL:', fileUrl);
        } catch (uploadError) {
          console.error('Cloudinary upload failed:', uploadError);
          throw new Error('Failed to upload file to Cloudinary');
        }
      }
    }

    content.title = data.title;
    content.content = data.content;
    content.fileUrl = fileUrl;
    return await this.contentRepository.save(content);
  }

  async deleteContent(instructorId: number, contentId: number) {
    const content = await this.contentRepository.findOneOrFail({
      where: { id: contentId, module: { course: { instructor: { id: instructorId }, approvalStatus: 'APPROVED' } } },
      relations: ['module'],
    });
    await this.contentRepository.remove(content);
    return { message: 'Content deleted successfully' };
  }
}