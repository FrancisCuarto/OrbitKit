import { Request, Response, NextFunction } from 'express';
import { CategoryModel } from '../models/Category.js';

export class CategoryController {
  public static async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await CategoryModel.find().sort({ name: 1 });
      res.json({
        success: true,
        data: categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
          description: c.description,
          icon: c.icon,
          resource_count: c.resource_count
        })),
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }
}
