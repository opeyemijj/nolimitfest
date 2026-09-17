declare module "node:sqlite" {
  export class DatabaseSync {
    constructor(location: string);
    exec(sql: string): void;
    prepare(sql: string): {
      all(...params: any[]): any[];
      get(...params: any[]): any;
      run(...params: any[]): void;
    };
    close(): void;
  }
}
