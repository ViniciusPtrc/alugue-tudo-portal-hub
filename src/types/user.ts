
// User type definition for use across components
export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: string[];
  status: "ativo" | "inativo";
  created_at: string;
}

// Role type definition
export interface Role {
  id: string;
  label: string;
}

// Available roles constant
export const availableRoles: Role[] = [
  { id: "admin", label: "Administrador" },
  { id: "rh", label: "RH" },
  { id: "financeiro", label: "Financeiro" },
  { id: "comercial", label: "Comercial" },
  { id: "operacional", label: "Operacional" },
];
