export type EntityType = "style" | "artist" | "period" | "museum" | "note";

export interface Relationship {
  type: "direct" | "indirect" | "many-to-many";
  from: {
    type: EntityType;
    name: string;
  };
  to: {
    type: EntityType;
    name: string;
  };
  description?: string;
}

export interface ExtractionResult {
  styles: string[];
  artists: string[];
  periods: string[];
  museums: string[];
  relationships: Relationship[];
}

export interface GeneratedFiles {
  note: {
    filename: string;
    content: string;
  };
  entities: Array<{
    type: EntityType;
    filename: string;
    content: string;
  }>;
}
