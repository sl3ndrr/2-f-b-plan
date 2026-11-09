export type Mode = 'plan' | 'all';
export type Status = 'all' | 'open' | 'done';
export type Band = 'subjects' | 'professional' | 'thesis';

export interface Category {
  id: string;
  name: string;
  symbol: string;
  required: number;
  colorToken: string;
  tileDescription: string;
  checklistLabel: string;
  band: Band;
}

export interface Group {
  id: string;
  labels: Record<Mode, string>;
  exclusive: boolean;
  fixedCredits: Record<string, number>;
}

export interface Module {
  id: string;
  code: string;
  title: string;
  credits: Record<string, number>;
  group: string;
  offered: 'WiSe' | 'SoSe' | 'both' | null;
  note: string | null;
}

export interface Data {
  categories: Category[];
  groups: Group[];
  modules: Module[];
  plan: string[];
  meta: { title: string; source: string; planNote: string };
}

export interface Filter {
  category: string | null;
  status: Status;
  query: string;
}

export interface Selection {
  mode: Mode;
  done: ReadonlySet<string>;
}
