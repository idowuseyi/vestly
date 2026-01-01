import jwt from 'jsonwebtoken';
import { User, IUser } from './auth.model';
import { RegisterInput, LoginInput } from './auth.schema';
import { config } from '../../config/env';

export class AuthService {
  /**
   * Register a new user
   */
  static async register(input: RegisterInput): Promise<{ user: IUser; token: string }> {
    // Check if user already exists
    const existingUser = await User.findOne({ email: input.email });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Create new user
    const user = await User.create(input);

    // Generate JWT token
    const token = this.generateToken(user);

    return { user, token };
  }

  /**
   * Login user
   */
  static async login(input: LoginInput): Promise<{ user: IUser; token: string }> {
    // Find user by email
    const user = await User.findOne({ email: input.email });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(input.password);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = this.generateToken(user);

    return { user, token };
  }

  /**
   * Generate JWT token
   */
  private static generateToken(user: IUser): string {
    const payload = {
      userId: user._id.toString(),
      orgId: user.orgId,
      role: user.role,
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as jwt.SignOptions);
  }

  /**
   * Get user by ID
   */
  static async getUserById(userId: string): Promise<IUser | null> {
    return User.findById(userId).select('-password');
  }
}
