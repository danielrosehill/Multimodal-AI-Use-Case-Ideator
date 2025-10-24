import React from 'react';
import type { UseCase } from '../types';

interface UseCaseCardProps {
  useCase: UseCase;
}

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="mb-6">
    <h3 className="text-xl font-semibold text-cyan-400 mb-2">{title}</h3>
    {children}
  </div>
);

export const UseCaseCard: React.FC<UseCaseCardProps> = ({ useCase }) => {
  return (
    <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 md:p-8 animate-fade-in-up">
      <h2 className="text-3xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-500">{useCase.useCaseTitle}</h2>
      
      <Section title="Use Case Description">
        <p className="text-gray-300 leading-relaxed">{useCase.useCaseDescription}</p>
      </Section>
      
      <Section title="Example Prompt">
        <div className="bg-gray-900 rounded-lg p-4 border border-gray-600">
          <p className="text-gray-300 italic font-mono text-sm md:text-base">"{useCase.examplePrompt}"</p>
        </div>
      </Section>
      
      <Section title="Key Benefits">
        <ul className="space-y-3">
          {useCase.benefits.map((benefit, index) => (
            <li key={index} className="flex items-start">
              <svg className="w-5 h-5 text-teal-400 mr-3 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <span className="text-gray-300">{benefit}</span>
            </li>
          ))}
        </ul>
      </Section>
    </div>
  );
};
