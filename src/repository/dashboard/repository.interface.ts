export interface IRepository<T> {
  create(data: any): Promise<T>;
  findById(id: string | number, type: string): Promise<T | null>;
  findAll(
    type: string,
    id?: string | number,
    id2?: string | number,
    params?: {
      filter?: any;
      skip?: any;
      take?: number;
      orderBy?: "asc" | "desc";
    }
  ): Promise<T[]>;
  findFirst(
    targetId: string | number,
    id: string | number,
    type?: string,
  ): Promise<T | null>;
  update(
    id: string | number,
    data?: Partial<T>,
    type?: string
  ): Promise<T | null>;
  delete(id: string | number): Promise<boolean>;
}
