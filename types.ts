import type { ReactNode } from 'react';

export interface Modality {
  id: string;
  name: string;
  description: string;
  icon: ReactNode;
}

export interface UseCase {
  useCaseTitle: string;
  useCaseDescription:string;
  examplePrompt: string;
  benefits: string[];
}

export interface Feedback {
  useCase: UseCase;
  feedback: 'positive' | 'negative';
}
