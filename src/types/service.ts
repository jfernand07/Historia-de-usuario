// Base controller interface
export interface BaseController {
  create(req: any, res: any): Promise<void>;
  getById(req: any, res: any): Promise<void>;
  getAll(req: any, res: any): Promise<void>;
  update(req: any, res: any): Promise<void>;
  delete(req: any, res: any): Promise<void>;
}

// Service interface
export interface BaseService<T> {
  create(data: any): Promise<T>;
  findById(id: number): Promise<T | null>;
  findAll(options?: any): Promise<T[]>;
  update(id: number, data: any): Promise<T | null>;
  delete(id: number): Promise<boolean>;
}
