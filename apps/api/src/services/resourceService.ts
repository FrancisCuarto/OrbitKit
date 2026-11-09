import { ResourceModel } from '../models/Resource.js';
import { ResourceVersionModel } from '../models/ResourceVersion.js';
import { validateManifest } from '@devdock/manifest-schema';
import {
  ResourceSummary,
  ResourceDetail,
  PaginatedResponse,
  ResourceType,
  ResourceManifest
} from '@devdock/shared-types';
import { AppError } from '../middleware/errorHandler.js';

export interface QueryResourceOptions {
  search?: string;
  type?: ResourceType;
  tag?: string;
  page?: number;
  limit?: number;
}

export class ResourceService {
  /**
   * List resources with pagination and filters
   */
  public static async listResources(
    options: QueryResourceOptions
  ): Promise<PaginatedResponse<ResourceSummary>> {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(50, Math.max(1, options.limit || 20));
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};

    if (options.type) {
      query.type = options.type;
    }

    if (options.tag) {
      query.tags = options.tag;
    }

    if (options.search) {
      // Safe text search regex avoiding injection
      const safeSearch = options.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: safeSearch, $options: 'i' } },
        { description: { $regex: safeSearch, $options: 'i' } },
        { tags: { $regex: safeSearch, $options: 'i' } }
      ];
    }

    const [total, items] = await Promise.all([
      ResourceModel.countDocuments(query),
      ResourceModel.find(query).sort({ downloads_count: -1, created_at: -1 }).skip(skip).limit(limit)
    ]);

    const mappedItems: ResourceSummary[] = items.map((doc) => ({
      id: doc.id,
      name: doc.name,
      type: doc.type,
      description: doc.description,
      author: doc.author,
      license: doc.license,
      latest_version: doc.latest_version,
      tags: doc.tags,
      downloads_count: doc.downloads_count,
      created_at: doc.created_at.toISOString(),
      updated_at: doc.updated_at.toISOString()
    }));

    return {
      success: true,
      data: mappedItems,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Get single resource with manifest
   */
  public static async getResourceDetail(id: string): Promise<ResourceDetail> {
    const resource = await ResourceModel.findOne({ id });
    if (!resource) {
      throw new AppError(`Resource '${id}' not found`, 404, 'RESOURCE_NOT_FOUND');
    }

    const versions = await ResourceVersionModel.find({ resource_id: id }).sort({ created_at: -1 });
    const latestVersionDoc = versions.find((v) => v.version === resource.latest_version) || versions[0];

    if (!latestVersionDoc) {
      throw new AppError(`No valid manifest versions for resource '${id}'`, 500, 'VERSION_NOT_FOUND');
    }

    return {
      id: resource.id,
      name: resource.name,
      type: resource.type,
      description: resource.description,
      author: resource.author,
      license: resource.license,
      latest_version: resource.latest_version,
      tags: resource.tags,
      downloads_count: resource.downloads_count,
      created_at: resource.created_at.toISOString(),
      updated_at: resource.updated_at.toISOString(),
      manifest: latestVersionDoc.manifest,
      versions: versions.map((v) => v.version)
    };
  }

  /**
   * Get all version manifests of a resource
   */
  public static async getResourceVersions(id: string): Promise<ResourceManifest[]> {
    const versions = await ResourceVersionModel.find({ resource_id: id }).sort({ created_at: -1 });
    return versions.map((v) => v.manifest);
  }

  /**
   * Check compatibility with a Godot version
   */
  public static async checkCompatibility(
    id: string,
    godotVersion: string
  ): Promise<{ compatible: boolean; supported_versions: string[] }> {
    const detail = await this.getResourceDetail(id);
    const supported = detail.manifest.compatibility.godot || [];

    const isCompatible = supported.some((v) =>
      godotVersion.startsWith(v) || v === '*' || v === 'all'
    );

    return {
      compatible: isCompatible,
      supported_versions: supported
    };
  }

  /**
   * Register or update a resource version with strict manifest validation
   */
  public static async registerResourceVersion(
    rawManifest: unknown,
    changelog?: string
  ): Promise<{ resource: ResourceSummary; version: string }> {
    const validation = validateManifest(rawManifest);
    if (!validation.success) {
      throw new AppError(
        'Invalid manifest structure',
        400,
        'INVALID_MANIFEST',
        validation.errors
      );
    }

    const manifest = validation.data;

    // Save or update resource root
    const resourceDoc = await ResourceModel.findOneAndUpdate(
      { id: manifest.id },
      {
        id: manifest.id,
        name: manifest.name,
        type: manifest.type,
        description: manifest.description,
        author: manifest.author,
        license: manifest.license,
        tags: manifest.tags || [],
        latest_version: manifest.version
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Save version
    await ResourceVersionModel.findOneAndUpdate(
      { resource_id: manifest.id, version: manifest.version },
      {
        resource_id: manifest.id,
        version: manifest.version,
        manifest,
        changelog,
        verified: true
      },
      { upsert: true, new: true }
    );

    return {
      resource: {
        id: resourceDoc.id,
        name: resourceDoc.name,
        type: resourceDoc.type,
        description: resourceDoc.description,
        author: resourceDoc.author,
        license: resourceDoc.license,
        latest_version: resourceDoc.latest_version,
        tags: resourceDoc.tags,
        downloads_count: resourceDoc.downloads_count,
        created_at: resourceDoc.created_at.toISOString(),
        updated_at: resourceDoc.updated_at.toISOString()
      },
      version: manifest.version
    };
  }
}
