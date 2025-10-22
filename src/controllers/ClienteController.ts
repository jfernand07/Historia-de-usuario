import { Request, Response } from 'express';
import { ClienteDAO } from '../dao/ClienteDAO';
import { ResponseHelper } from '../utils/helpers';
import { ValidationMiddleware } from '../middlewares/ValidationMiddleware';
import { clientSchemas } from '../dto/validationSchemas';

export class ClienteController {
  private clienteDAO: ClienteDAO;

  constructor() {
    this.clienteDAO = new ClienteDAO();
  }

  /**
   * Get all clientes with filters and pagination
   */
  public getAllClientes = async (req: Request, res: Response): Promise<void> => {
    try {
      const filters = {
        tipoDocumento: req.query.tipoDocumento as 'cedula' | 'pasaporte' | 'nit' | undefined,
        activo: req.query.activo === 'true' ? true : req.query.activo === 'false' ? false : undefined,
        search: req.query.search as string | undefined
      };

      const pagination = {
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 10
      };

      const result = await this.clienteDAO.findAll({
        filters,
        pagination,
        order: [['createdAt', 'DESC']]
      });

      ResponseHelper.success(res, {
        clientes: result.clientes,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      }, 'Clientes retrieved successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error retrieving clientes', 500, error);
    }
  };

  /**
   * Get cliente by ID
   */
  public getClienteById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      const cliente = await this.clienteDAO.findById(id);
      
      if (!cliente) {
        ResponseHelper.error(res, 'Cliente not found', 404);
        return;
      }

      ResponseHelper.success(res, cliente, 'Cliente retrieved successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error retrieving cliente', 500, error);
    }
  };

  /**
   * Get cliente by document
   */
  public getClienteByDocument = async (req: Request, res: Response): Promise<void> => {
    try {
      const documento = req.params.documento;
      
      const cliente = await this.clienteDAO.findByDocument(documento);
      
      if (!cliente) {
        ResponseHelper.error(res, 'Cliente not found', 404);
        return;
      }

      ResponseHelper.success(res, cliente, 'Cliente retrieved successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error retrieving cliente', 500, error);
    }
  };

  /**
   * Create new cliente
   */
  public createCliente = async (req: Request, res: Response): Promise<void> => {
    try {
      const clienteData = req.body;

      // Check if document already exists
      const documentExists = await this.clienteDAO.documentExists(clienteData.documento);
      if (documentExists) {
        ResponseHelper.error(res, 'Document already exists', 409);
        return;
      }

      // Check if email already exists
      const emailExists = await this.clienteDAO.emailExists(clienteData.email);
      if (emailExists) {
        ResponseHelper.error(res, 'Email already exists', 409);
        return;
      }

      const cliente = await this.clienteDAO.create(clienteData);
      
      ResponseHelper.success(res, cliente, 'Cliente created successfully', 201);

    } catch (error) {
      ResponseHelper.error(res, 'Error creating cliente', 500, error);
    }
  };

  /**
   * Update cliente
   */
  public updateCliente = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      const updateData = req.body;

      // Check if document is being updated and if it already exists
      if (updateData.documento) {
        const documentExists = await this.clienteDAO.documentExists(updateData.documento, id);
        if (documentExists) {
          ResponseHelper.error(res, 'Document already exists', 409);
          return;
        }
      }

      // Check if email is being updated and if it already exists
      if (updateData.email) {
        const emailExists = await this.clienteDAO.emailExists(updateData.email, id);
        if (emailExists) {
          ResponseHelper.error(res, 'Email already exists', 409);
          return;
        }
      }

      const cliente = await this.clienteDAO.update(id, updateData);
      
      if (!cliente) {
        ResponseHelper.error(res, 'Cliente not found', 404);
        return;
      }

      ResponseHelper.success(res, cliente, 'Cliente updated successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error updating cliente', 500, error);
    }
  };

  /**
   * Delete cliente (soft delete)
   */
  public deleteCliente = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = parseInt(req.params.id);
      
      const success = await this.clienteDAO.delete(id);
      
      if (!success) {
        ResponseHelper.error(res, 'Cliente not found', 404);
        return;
      }

      ResponseHelper.success(res, null, 'Cliente deleted successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error deleting cliente', 500, error);
    }
  };

  /**
   * Get clientes by document type
   */
  public getClientesByDocumentType = async (req: Request, res: Response): Promise<void> => {
    try {
      const tipoDocumento = req.params.tipoDocumento as 'cedula' | 'pasaporte' | 'nit';
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!['cedula', 'pasaporte', 'nit'].includes(tipoDocumento)) {
        ResponseHelper.validationError(res, 'Invalid document type');
        return;
      }

      const result = await this.clienteDAO.findAll({
        filters: { tipoDocumento, activo: true },
        pagination: { page, limit },
        order: [['nombre', 'ASC']]
      });

      ResponseHelper.success(res, {
        clientes: result.clientes,
        tipoDocumento,
        pagination: {
          page: result.page,
          limit: result.limit,
          total: result.total,
          totalPages: result.totalPages
        }
      }, 'Clientes by document type retrieved successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error retrieving clientes by document type', 500, error);
    }
  };

  /**
   * Search clientes
   */
  public searchClientes = async (req: Request, res: Response): Promise<void> => {
    try {
      const searchTerm = req.query.q as string;
      
      if (!searchTerm || searchTerm.trim().length < 2) {
        ResponseHelper.validationError(res, 'Search term must be at least 2 characters long');
        return;
      }

      const result = await this.clienteDAO.findAll({
        filters: { search: searchTerm.trim(), activo: true },
        pagination: { page: 1, limit: 20 },
        order: [['nombre', 'ASC']]
      });

      ResponseHelper.success(res, {
        clientes: result.clientes,
        total: result.total,
        searchTerm
      }, 'Search completed successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error searching clientes', 500, error);
    }
  };

  /**
   * Get cliente statistics
   */
  public getClienteStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const statistics = await this.clienteDAO.getStatistics();
      
      ResponseHelper.success(res, statistics, 'Cliente statistics retrieved successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error retrieving cliente statistics', 500, error);
    }
  };

  /**
   * Get clientes with recent activity
   */
  public getRecentClientes = async (req: Request, res: Response): Promise<void> => {
    try {
      const days = parseInt(req.query.days as string) || 30;
      const limit = parseInt(req.query.limit as string) || 10;

      const clientes = await this.clienteDAO.findRecent(days, limit);

      ResponseHelper.success(res, {
        clientes,
        days,
        count: clientes.length
      }, 'Recent clientes retrieved successfully');

    } catch (error) {
      ResponseHelper.error(res, 'Error retrieving recent clientes', 500, error);
    }
  };
}
