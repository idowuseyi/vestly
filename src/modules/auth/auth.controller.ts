import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { RegisterInput, LoginInput } from './auth.schema';
import { ResponseUtil } from '../../shared/response.util';

export class AuthController {
  /**
   * @swagger
   * /api/v1/auth/register:
   *   post:
   *     summary: Register a new user
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *               - name
   *               - orgId
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *               name:
   *                 type: string
   *               role:
   *                 type: string
   *                 enum: [tenant, landlord, admin]
   *               orgId:
   *                 type: string
   *     responses:
   *       201:
   *         description: User registered successfully
   */
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.body as RegisterInput;
      const { user, token } = await AuthService.register(input);

      const response = {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          orgId: user.orgId,
        },
        token,
      };

      ResponseUtil.created(res, response, 'User registered successfully');
    } catch (error) {
      next(error);
    }
  }

  /**
   * @swagger
   * /api/v1/auth/login:
   *   post:
   *     summary: Login user
   *     tags: [Auth]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - email
   *               - password
   *             properties:
   *               email:
   *                 type: string
   *               password:
   *                 type: string
   *     responses:
   *       200:
   *         description: Login successful
   */
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const input = req.body as LoginInput;
      const { user, token } = await AuthService.login(input);

      const response = {
        user: {
          id: user._id,
          email: user.email,
          name: user.name,
          role: user.role,
          orgId: user.orgId,
        },
        token,
      };

      ResponseUtil.success(res, response, 'Login successful');
    } catch (error) {
      next(error);
    }
  }
}
