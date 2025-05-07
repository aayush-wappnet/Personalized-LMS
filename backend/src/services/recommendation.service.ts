import { AppDataSource } from '../config/database';
import { Course } from '../entities/Course';
import { InferenceClient } from '@huggingface/inference';
import { HfInference } from '@huggingface/inference';
import ndarray from 'ndarray';
import { Not } from 'typeorm';

export class RecommendationService {
  private courseRepository = AppDataSource.getRepository(Course);
  private hf: HfInference;

  constructor() {
    this.hf = new HfInference(process.env.HUGGINGFACE_API_KEY || 'your-hf-api-key');
  }

  // Generate embeddings for a given text using Hugging Face model
  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: text,
    });
    return response as number[];
  }

  // Compute cosine similarity between two vectors
  cosineSimilarity(vecA: number[], vecB: number[]): number {
    const a = ndarray(vecA);
    const b = ndarray(vecB);

    // Compute dot product
    let dotProduct = 0;
    for (let i = 0; i < vecA.length; i++) {
      dotProduct += a.get(i) * b.get(i);
    }

    // Compute norms
    let normA = 0;
    let normB = 0;
    for (let i = 0; i < vecA.length; i++) {
      normA += a.get(i) * a.get(i);
      normB += b.get(i) * b.get(i);
    }
    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    return dotProduct / (normA * normB);
  }

  // Generate recommendations based on a course ID
  async getCourseRecommendations(courseId: number, limit: number = 3) {
    // Fetch the target course
    const targetCourse = await this.courseRepository.findOne({ where: { id: courseId } });
    if (!targetCourse) throw new Error('Course not found');

    // Combine title and description for embedding
    const targetText = `${targetCourse.title} ${targetCourse.description || ''}`;
    const targetEmbedding = await this.generateEmbedding(targetText);

    // Fetch all other courses with instructor relation
    const allCourses = await this.courseRepository.find({
      where: { id: Not(courseId) },
      relations: ['instructor'],
    });
    const courseSimilarities: { course: Course; similarity: number }[] = [];

    // Compute similarity for each course
    for (const course of allCourses) {
      const courseText = `${course.title} ${course.description || ''}`;
      const courseEmbedding = await this.generateEmbedding(courseText);
      const similarity = this.cosineSimilarity(targetEmbedding, courseEmbedding);
      courseSimilarities.push({ course, similarity });
    }

    // Sort by similarity and limit results
    return courseSimilarities
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, limit)
      .map(item => ({
        id: item.course.id,
        title: item.course.title,
        description: item.course.description,
        thumbnailUrl: item.course.thumbnailUrl,
        instructorId: item.course.instructor?.id || null, // Handle case where instructor might be null
        createdAt: item.course.createdAt,
        updatedAt: item.course.updatedAt,
        similarity: item.similarity,
      }));
  }
}