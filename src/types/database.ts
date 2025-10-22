// Base DAO interface
export interface BaseDAO<T> {
  create(data: Partial<T>): Promise<T>;
  findById(id: number): Promise<T | null>;
  findAll(options?: any): Promise<T[]>;
  update(id: number, data: Partial<T>): Promise<T | null>;
  delete(id: number): Promise<boolean>;
}

// Database connection interface
export interface DatabaseConnection {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  sync(force?: boolean): Promise<void>;
}
