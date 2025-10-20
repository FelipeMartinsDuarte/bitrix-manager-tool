export type CrmEntity = {
  id: string; // This is the 'ID' from Bitrix API
  entityTypeId: number;
  title: string;
  created: string; // Keep as string for mock data compatibility
  isStagesEnabled?: string;
  isClientEnabled?: string;
  isUseInUserfieldEnabled?: string;
  isLinkWithProductsEnabled?: string;
  isMycompanyEnabled?: string;
  isDocumentsEnabled?: string;
  isSourceEnabled?: string;
  isObserversEnabled?: string;
  isRecyclebinEnabled?: string;
  isAutomationEnabled?: string;
  isBizProcEnabled?: string;
  isCountersEnabled?: string;
  customSectionId?: number | null;
  customPageUrl?: string;
  titlePlaceholder?: string;
};

export type CrmFieldType = 'string' | 'double' | 'datetime' | 'boolean' | 'crm_status' | 'enumeration' | 'user' | 'file';

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

export type BitrixApiConfig = {
  baseUrl: string;
  userId: string;
  apiToken: string;
};
