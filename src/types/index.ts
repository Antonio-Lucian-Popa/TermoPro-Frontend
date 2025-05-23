export enum Role {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  TECHNICIAN = 'TECHNICIAN',
  OPERATOR = 'OPERATOR'
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum TaskType {
  MONTARE = 'MONTARE',
  REPARATIE = 'REPARATIE',
  MASURARE = 'MASURARE',
  CONSULTANTA = 'CONSULTANTA',
  ALTELE = 'ALTELE'
}

export enum OrderStatus {
  PENDING = 'PENDING',
  SCHEDULED = 'SCHEDULED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum TimeOffType {
  CONCEDIU = 'CONCEDIU',
  INVOIERE = 'INVOIERE',
  MEDICAL = 'MEDICAL',
  ALTELE = 'ALTELE'
}

export enum TimeOffStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED'
}

export interface User {
  id: string;
  keycloakId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  companyId: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser extends User {
  accessToken: string;
  refreshToken: string;
}

export interface Company {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  ownerId: string;
}

export interface Invitation {
  id: string;
  employeeEmail: string;
  role: Role;
  companyId: string;
  token: string;
  expiresAt: string;
  createdAt: string;
  used: boolean;
}

export interface Team {
  id: string;
  name: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  members: User[];
}

export interface Task {
  id: string;
  title: string;
  description: string;
  taskType: TaskType;
  status: TaskStatus;
  scheduledDate: string;
  teamId?: string;
  userId?: string;
  orderId?: string;
  assignedBy: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  team?: Team;
  user?: User;
  assignedByUser?: User;
}

export interface UpdateTeam {
  name: string;
  requesterId: string;
}

export interface TaskUpdate {
  id: string;
  taskId: string;
  userId: string;
  status: TaskStatus;
  comment?: string;
  imageUrls: string[];
  createdAt: string;
  user: User;
}

export interface Order {
  id: string;
  clientName: string;
  clientPhone: string;
  clientAddress: string;
  latitude?: number;
  longitude?: number;
  status: OrderStatus;
  scheduledDate: string;
  companyId: string;
  teamId?: string;
  createdAt: string;
  updatedAt: string;
  team?: Team;
}

export interface TimeOffRequest {
  id: string;
  userId: string;
  startDate: string;
  endDate: string;
  type: TimeOffType;
  startTime?: string;
  endTime?: string;
  status: TimeOffStatus;
  createdAt: string;
  updatedAt: string;
  user: User;
  companyId: string;
}

export interface DashboardStats {
  totalTasks: number;
  pendingTasks: number;
  completedTasks: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  upcomingTimeOff: TimeOffRequest[];
  recentTasks: Task[];
  todayTasks: Task[];
  totalTeams: number;
  totalTeamMembers: number;
}