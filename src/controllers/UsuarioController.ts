import { Request, Response } from 'express';
import { UsuarioDAO } from '../dao/UsuarioDAO';
import { ResponseHelper } from '../utils/helpers';
import { ValidationMiddleware } from '../middlewares/ValidationMiddleware';
import { authSchemas } from '../dto/validationSchemas';

export class UsuarioController {
  private usuarioDAO: UsuarioDAO;

  constructor() {
    this.usuarioDAO = new UsuarioDAO();
  }

  /**
   * Get all usuarios with filters and pagination
   */
  public getAllUsuarios = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters = {
        rol: req.query.rol as 'admin' | 'vendedor' | undefined,
        activo: req.query.activo === 'true' ? true : req.query.activo === 'false' ? false : undefined,
        search: req.query.search as string | undefined
      };

      const pagination = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10
      };

      const result = await this.usuarioDAO.findAll({
        filters,
        pagination,
        order: [['createdAt', 'DESC']]
      });

      ResponseHelper.success(res, {
        usuarios: result.usuarios,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      }, 'Usuarios retrieved successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error retrieving usuarios', 500, error);
    }
  };

  /**
   * Get usuario by ID
   */
  public getUsuarioById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      const usuario = await this.usuarioDAO.findById(id);
      
      if (!usuario) {
        ResponseHelper.error(res, 'Usuario not found', 404);
        return;
      }

      // Remove password from response
      const { password, ...usuarioResponse } = usuario.toJSON();

      ResponseHelper.success(res, usuarioResponse, 'Usuario retrieved successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error retrieving usuario', 500, error);
    }
  };

  /**
   * Create new usuario
   */
  public createUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
      const usuarioData = req.body;

      // Check if email already exists
      const emailExists = await this.usuarioDAO.emailExists(usuarioData.email);
      if (emailExists) {
        ResponseHelper.error(res, 'Email already exists', 409);
        return;
      }

      const usuario = await this.usuarioDAO.create(usuarioData);
      
      // Remove password from response
      const { password, ...usuarioResponse } = usuario.toJSON();

      ResponseHelper.success(res, usuarioResponse, 'Usuario created successfully', 201);

    } catch (error) {
      ResponseHelper.error(res, 'Error creating usuario', 500, error);
    }
  };

  /**
   * Update usuario
   */
  public updateUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;

      // Check if email is being updated and if it already exists
      if (updateData.email) {
        const emailExists = await this.usuarioDAO.emailExists(updateData.email, id);
        if (emailExists) {
          ResponseHelper.error(res, 'Email already exists', 409);
          return;
        }
      }

      const usuario = await this.usuarioDAO.update(id, updateData);
      
      if (!usuario) {
        ResponseHelper.error(res, 'Usuario not found', 404);
        return;
      }

      // Remove password from response
      const { password, ...usuarioResponse } = usuario.toJSON();

      ResponseHelper.success(res, usuarioResponse, 'Usuario updated successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error updating usuario', 500, error);
    }
  };

  /**
   * Delete usuario (soft delete)
   */
  public deleteUsuario = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      const success = await this.usuarioDAO.delete(id);
      
      if (!success) {
        ResponseHelper.error(res, 'Usuario not found', 404);
        return;
      }

      ResponseHelper.success(res, null, 'Usuario deleted successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error deleting usuario', 500, error);
    }
  };

  /**
   * Get usuario statistics
   */
  public getUsuarioStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const statistics = await this.usuarioDAO.getStatistics();
      
      ResponseHelper.success(res, statistics, 'Usuario statistics retrieved successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error retrieving usuario statistics', 500, error);
    }
  };

  /**
   * Search usuarios
   */
  public searchUsuarios = async (req: Request, res: Response): Promise<void> => {
    try {
      const searchTerm = req.query.q as string;
      
      if (!searchTerm || searchTerm.trim().length < 2) {
        ResponseHelper.validationError(res, 'Search term must be at least 2 characters long');
        return;
      }

      const result = await this.usuarioDAO.findAll({
        filters: { search: searchTerm.trim() },
        pagination: { page: 1, limit: 20 },
        order: [['nombre', 'ASC']]
      });

      ResponseHelper.success(res, {
        usuarios: result.usuarios,
        total: result.total
      }, 'Search completed successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error searching usuarios', 500, error);
    }
  };
}
