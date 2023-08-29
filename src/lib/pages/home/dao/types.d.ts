export interface Proposal {
    id: string;
    title: string;
    body: string;
    choices: string[];
    start: number;
    end: number;
    snapshot: string;
    state: string;
    author: string;
    space: {
      id: string;
      name: string;
    };
    summary?: string;
    votes?: {
      id: string;
      votes: number;
    }[];
  }
  