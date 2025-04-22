import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { hash, compare } from 'bcrypt';
import { generateToken } from '../utils/jwt';
import { Role } from '../types/role';

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  async register(userData: { userName: string; email: string; password: string; role?: Role }) {
    const { userName, email, password, role = Role.STUDENT } = userData;
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) throw new Error('Email already in use');

    const hashedPassword = await hash(password, 10);
    console.log('Registering with input password:', password); // Debug input
    console.log('Generated hashed password before save:', hashedPassword); // Debug pre-save hash
    const user = this.userRepository.create({ userName, email, password: hashedPassword, role });
    const savedUser = await this.userRepository.save(user);
    console.log('Saved hashed password in DB:', savedUser.password); // Debug post-save hash
    return { message: 'User registered, you can log in' };
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email }, select: ['id', 'userName', 'email', 'password', 'role'] });
    if (!user) throw new Error('Invalid credentials');

    console.log('Stored hashed password from DB:', user.password); // Debug DB hash
    console.log('Provided password for login:', password); // Debug input
    const isPasswordValid = await compare(password, user.password);
    console.log('Password comparison result:', isPasswordValid); // Debug comparison
    if (!isPasswordValid) {
      const manualHash = await hash(password, 10);
      console.log('Manual hash of provided password:', manualHash); // Debug manual hash
      throw new Error('Invalid credentials');
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    return { token }; // Return only the token
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    return { id: user.id, userName: user.userName, email: user.email, role: user.role };
  }

  async getAllUsers() {
    return this.userRepository.find();
  }

  async getUserById(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');
    return user;
  }
}