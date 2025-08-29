// FILE: src/lib/types.ts
// Tipos centrais do app (mantidos simples e compatíveis com seu código)

import type { ElementType } from 'react';

// ========================
// Sessão / Usuário / Planos
// ========================
export type Plan = 'trial' | 'pro' | 'enterprise';

export interface UserSession {
  userId: string;
  email: string;
  plan: Plan;
  trialEndsAt?: string; // ISO
}

// ========================
// Bots / Broadcasts / Contatos
// ========================
export interface Bot {
  id: string;
  name: string;
  status: 'active' | 'paused';
  createdAt: string; // ISO
}

export interface Broadcast {
  id: string;
  name: string;
  createdAt: string;
  totalRecipients: number;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
  scheduledAt?: string;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  tags: string[];
  createdAt: string;
}

export interface ApiResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
}

// ========================
// Dashboard / Activity
// ========================
export type ActivityType = 'bot_run' | 'broadcast' | 'contact_import' | 'flow_published';

export interface Activity {
  id: string;
  type: ActivityType;
  ts: string;
  title?: string;
  description?: string;
  status?: 'ok' | 'warning' | 'error';
  [key: string]: any;
}

export interface DashboardSnapshot {
  totals: {
    automations: number;
    successRate: number;
    contacts: number;
    messages: number;
  };
  [key: string]: any;
}

// ========================
// FLOWS (MODELO / BACKEND MOCK)
// ========================
// ⚠️ Estes tipos são usados pelo storage/local API (api.ts)

export type NodeKind = 'start' | 'message' | 'choice';

export interface FlowNode {
  id: string;
  kind: NodeKind;
  x: number;
  y: number;
  data: {
    label?: string;
    text?: string;      // p/ 'message'
    options?: string[]; // p/ 'choice'
    [key: string]: any;
  };
}

export interface FlowEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
}

export interface FlowModel {
  id: string;
  name?: string;
  nodes: FlowNode[];
  edges: FlowEdge[];
  updatedAt: string;
  createdAt?: string;
}

export interface BotFlow {
  id: string;
  name: string;
  status: 'draft' | 'published';
  createdAt: string;
  updatedAt: string;
}

// ========================
// FUNIS (UI) — Cards/Galeria (Lista)
// ========================
export type FlowStatus = 'published' | 'draft' | 'archived';

export interface Flow {
  id: string;
  name: string;
  description: string;
  nodes: number;
  edges: number;
  lastUpdated: Date; // usado nos cards para "Atualizado ..."
  status: FlowStatus;
  performance: {
    views: number;
    conversions: number;
    rate: number;
  };
  color: string;     // ex.: "from-green-500 to-emerald-600"
  icon: ElementType; // componente de ícone (lucide-react)
}

export type TemplateCategory = 'vendas' | 'suporte' | 'marketing' | 'atendimento';
export type TemplateDifficulty = 'beginner' | 'intermediate' | 'advanced';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  nodes: number;
  difficulty: TemplateDifficulty;
  rating: number;
  uses: number;
  preview: string;
  color: string;      // ex.: "from-purple-500 to-pink-600"
  icon: ElementType;  // componente de ícone (lucide-react)
  premium?: boolean;
}

// ========================
// FUNIL — Canvas (Editor Visual) (UI)
// ========================
// ⚠️ Estes tipos são do CANVAS (UI) e NÃO devem colidir com os de backend.
// Renomeamos para evitar conflitos com FlowNode/FlowEdge do modelo.

export type NodeType =
  | 'start'
  | 'message'
  | 'choice'
  | 'collect'
  | 'delay'
  | 'ai'
  | 'http'
  | 'end';

// Nó do CANVAS (UI)
export interface CanvasFlowNode {
  id: string;
  type: NodeType;
  position: { x: number; y: number };
  data: {
    label: string;
    message?: string;
    choices?: string[];
    delay?: number;
    showTyping?: boolean;
    mediaType?: 'image' | 'video' | 'audio' | 'document';
    mediaUrl?: string;
    validation?: 'text' | 'email' | 'phone';
    aiPrompt?: string;
    httpMethod?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    httpUrl?: string;

    // 👇 NOVO: encadeamento de funis. Usado principalmente no nó 'end'.
    nextFlowId?: string;
  };
}

// Aresta do CANVAS (UI)
export interface CanvasFlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  sourceHandle?: string;
  targetHandle?: string;
}

// Estado do Editor Visual (UI)
export interface CanvasFlowData {
  id: string;
  name: string;
  nodes: CanvasFlowNode[];
  edges: CanvasFlowEdge[];
  version: string;
  lastSaved: Date | null;
  isDirty: boolean;
  isPublished: boolean;
  labels?: string[];
  internalNote?: string;
}

// Aliases para manter teu import atual no Canvas:
// (Mantemos FlowData no Canvas, mas evitamos colisão de FlowNode/FlowEdge)
export type FlowData = CanvasFlowData;
export type UINode = CanvasFlowNode;
export type UIEdge = CanvasFlowEdge;
