export type UserRole = "admin" | "editor" | "viewer";
export class User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;

  constructor(arr: {
    id: number;
    name: string;
    email: string;
    role: UserRole;
    createdAt: Date;
    updatedAt: Date;
  }) {
    this.id = arr.id;
    this.name = arr.name;
    this.email = arr.email;
    this.role = arr.role;
    this.createdAt = arr.createdAt;
    this.updatedAt = arr.updatedAt;
  }
}
