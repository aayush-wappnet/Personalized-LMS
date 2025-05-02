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
    console.log('Registering with input password:', password);
    console.log('Generated hashed password before save:', hashedPassword);
    const user = this.userRepository.create({ userName, email, password: hashedPassword, role });
    const savedUser = await this.userRepository.save(user);
    console.log('Saved hashed password in DB:', savedUser.password);
    return { message: 'User registered, you can log in' };
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({ where: { email }, select: ['id', 'userName', 'email', 'password', 'role'] });
    if (!user) throw new Error('Invalid credentials');

    console.log('Stored hashed password from DB:', user.password);
    console.log('Provided password for login:', password);
    const isPasswordValid = await compare(password, user.password);
    console.log('Password comparison result:', isPasswordValid);
    if (!isPasswordValid) {
      const manualHash = await hash(password, 10);
      console.log('Manual hash of provided password:', manualHash);
      throw new Error('Invalid credentials');
    }

    const token = generateToken({ id: user.id, email: user.email, role: user.role });
    return { token };
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'userName', 'email', 'role', 'points', 'badges'],
    });
    if (!user) throw new Error('User not found');

    const profile: any = {
      id: user.id,
      userName: user.userName,
      email: user.email,
      role: user.role,
    };

    // Include points and badges only for students
    if (user.role === Role.STUDENT) {
      profile.points = user.points || 0;
      profile.badges = user.badges ? JSON.parse(user.badges) : [];
    }

    return profile;
  }

  async getAllUsers() {
    return this.userRepository.find({ select: ['id', 'userName', 'email', 'role'] });
  }

  async getUserById(userId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId }, select: ['id', 'userName', 'email', 'role'] });
    if (!user) throw new Error('User not found');
    return user;
  }
}