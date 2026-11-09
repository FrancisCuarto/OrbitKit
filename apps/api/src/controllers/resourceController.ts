import { Request, Response, NextFunction } from 'express';
import { ResourceService } from '../services/resourceService.js';
import { ResourceType } from '@devdock/shared-types';

export class ResourceController {
  public static async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { search, type, tag, page, limit } = req.query;

      const result = await ResourceService.listResources({
        search: typeof search === 'string' ? search : undefined,
        type: typeof type === 'string' ? (type as ResourceType) : undefined,
        tag: typeof tag === 'string' ? tag : undefined,
        page: typeof page === 'string' ? parseInt(page, 10) : 1,
        limit: typeof limit === 'string' ? parseInt(limit, 10) : 20
      });

      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  public static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await ResourceService.getResourceDetail(id);
      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  public static async getVersions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const result = await ResourceService.getResourceVersions(id);
      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  public static async checkCompatibility(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const id = req.params.id as string;
      const godotVersion = typeof req.query.godot === 'string' ? req.query.godot : '4.4';
      const result = await ResourceService.checkCompatibility(id, godotVersion);
      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }

  public static async publishVersion(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { manifest, changelog } = req.body;
      const result = await ResourceService.registerResourceVersion(manifest, changelog);
      res.status(201).json({
        success: true,
        data: result,
        message: 'Resource published successfully',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      next(err);
    }
  }
}
