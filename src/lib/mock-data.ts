import type { CrmEntity, CrmField, BitrixUser, TimelineLog } from './types';

export const MOCK_USERS: BitrixUser[] = [
  { ID: '1', NAME: 'João', LAST_NAME: 'Silva', PERSONAL_PHOTO: 'https://picsum.photos/seed/user1/40/40', EMAIL: 'joao.silva@example.com' },
  { ID: '2', NAME: 'Maria', LAST_NAME: 'Oliveira', PERSONAL_PHOTO: 'https://picsum.photos/seed/user2/40/40', EMAIL: 'maria.o@example.com' },
  { ID: '10', NAME: 'Admin', LAST_NAME: 'User', PERSONAL_PHOTO: 'https://picsum.photos/seed/user3/40/40', EMAIL: 'admin@example.com' },
];

export const MOCK_CRMS: CrmEntity[] = [
  { id: '123', entityTypeId: 1, title: 'Leads de Marketing', created: '2023-10-26T10:00:00Z' },
  { id: '124', entityTypeId: 2, title: 'Projetos Internos', created: '2023-11-15T14:30:00Z' },
  { id: '125', entityTypeId: 3, title: 'Contratos Ativos', created: '2024-01-20T09:00:00Z' },
];

export const MOCK_FIELDS: Record<string, CrmField[]> = {
  '123': [
    { id: 1, fieldName: 'UF_CRM_1_SOURCE', listLabel: 'Origem do Lead', type: 'string', isMultiple: false, isPublic: true },
    { id: 2, fieldName: 'UF_CRM_1_BUDGET', listLabel: 'Orçamento', type: 'double', isMultiple: false, isPublic: true },
  ],
  '124': [
    { id: 3, fieldName: 'UF_CRM_2_MANAGER', listLabel: 'Gerente do Projeto', type: 'string', isMultiple: false, isPublic: true },
    { id: 4, fieldName: 'UF_CRM_2_DEADLINE', listLabel: 'Prazo Final', type: 'datetime', isMultiple: false, isPublic: true },
  ],
  '125': [],
};

export const MOCK_LOGS: TimelineLog[] = [
  {
    id: 'log1',
    created: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    author: MOCK_USERS[0],
    entity: { id: '123', type: 'Lead' },
    description: 'Status alterado para "Em Negociação".',
  },
  {
    id: 'log2',
    created: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    author: MOCK_USERS[1],
    entity: { id: '124', type: 'Projeto' },
    description: 'Nova tarefa "Definir escopo" adicionada.',
  },
  {
    id: 'log3',
    created: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    author: MOCK_USERS[0],
    entity: { id: '123', type: 'Lead' },
    description: 'Contato inicial realizado.',
  },
];
