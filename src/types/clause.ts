export type Clause = {
  id: string;
  text: string;
  title: string;
  position?: number;
  createdAt: Date;
  updatedAt: Date;
  organizationId?: string;
  organization?: {
    id: string;
    // outros campos da organização se necessário
  };
  contracts?: {
    id: string;
    // outros campos do contrato se necessário
  }[];
}; 