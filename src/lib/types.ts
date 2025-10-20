export type CrmEntity = {
  id: string;
  entityTypeId: number;
  title: string;
  created: string;
};

export type CrmFieldType = 'string' | 'double' | 'datetime' | 'boolean' | 'crm_status';

export type CrmField = {
  id: number;
  fieldName: string;
  listLabel: string;
  type: CrmFieldType;
  isMultiple: boolean;
  isPublic: boolean;
};

export type BitrixUser = {
  ID: string;
  NAME: string;
  LAST_NAME: string;
  PERSONAL_PHOTO: string;
  EMAIL: string;
};

export type TimelineLog = {
  id: string;
  created: string;
  author: BitrixUser;
  entity: {
    id: string;
    type: string;
  };
  description: string;
};
