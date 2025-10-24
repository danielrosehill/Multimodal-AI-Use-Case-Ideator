import React, { useState, useCallback, useMemo } from 'react';
import type { Modality, UseCase, Feedback } from './types';
import { generateUseCase } from './services/geminiService';
import { UseCaseCard } from './components/UseCaseCard';
import { AudioAnalysisIcon, ImageToVideoIcon, RealtimeConversationIcon, TextToSpeechIcon, TextToVideoIcon, VideoAnalysisIcon } from './components/Icons';

const ALL_MODALITIES: Modality[] = [
  { id: 'video_analysis', name: 'Video Analysis', description: 'Extract insights from video content.', icon: <VideoAnalysisIcon /> },
  { id: 'audio_analysis', name: 'Audio Analysis', description: 'Transcribe and understand spoken language.', icon: <AudioAnalysisIcon /> },
  { id: 'text_to_video', name: 'Text to Video', description: 'Generate video clips from text prompts.', icon: <TextToVideoIcon /> },
  { id: 'image_to_video', name: 'Image to Video', description: 'Animate static images into dynamic videos.', icon: <ImageToVideoIcon /> },
  { id: 'text_to_speech', name: 'Text to Speech', description: 'Create natural-sounding audio from text.', icon: <TextToSpeechIcon /> },
  { id: 'realtime_conversation', name: 'Real-time Audio Conversation', description: 'Engage in live, spoken dialogue with AI.', icon: <RealtimeConversationIcon /> },
];

const RANDOMNESS_LABELS: { [key: number]: string } = {
  1: 'Conventional',
  2: 'Practical',
  3: 'Creative',
  4: 'Innovative',
  5: 'Far-Out',
};

const LoadingSkeleton = () => (
  <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 md:p-8 animate-pulse">
    <div className="h-8 bg-gray-700 rounded-md w-3/4 mb-6"></div>
    <div className="h-6 bg-gray-700 rounded-md w-1/3 mb-4"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-700 rounded-md w-full"></div>
      <div className="h-4 bg-gray-700 rounded-md w-5/6"></div>
    </div>
    <div className="h-6 bg-gray-700 rounded-md w-1/3 mb-4 mt-6"></div>
    <div className="h-12 bg-gray-900 rounded-lg w-full"></div>
    <div className="h-6 bg-gray-700 rounded-md w-1/3 mb-4 mt-6"></div>
    <div className="space-y-3">
        <div className="flex items-center space-x-3">
            <div className="h-5 w-5 bg-gray-700 rounded-full"></div>
            <div className="h-4 bg-gray-700 rounded-md w-1/2"></div>
        </div>
        <div className="flex items-center space-x-3">
            <div className="h-5 w-5 bg-gray-700 rounded-full"></div>
            <div className="h-4 bg-gray-700 rounded-md w-2/3"></div>
        </div>
    </div>
  </div>
);

export default function App() {
  const [selectedModality, setSelectedModality] = useState<Modality | null>(null);
  const [randomness, setRandomness] = useState(3);
  const [useCase, setUseCase] = useState<UseCase | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackHistory, setFeedbackHistory] = useState<Feedback[]>([]);
  const [feedbackGiven, setFeedbackGiven] = useState(false);
  
  const handleGenerate = useCallback(async () => {
    if (!selectedModality) {
      setError("Please select a modality first.");
      return;
    }
    setIsLoading(true);
    setError(null);
    setUseCase(null);

    try {
      const result = await generateUseCase(selectedModality, randomness, feedbackHistory);
      setUseCase(result);
      setFeedbackGiven(false);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [selectedModality, randomness, feedbackHistory]);

  const handleFeedback = (feedback: 'positive' | 'negative') => {
    if (!useCase || feedbackGiven) return;

    setFeedbackHistory(prev => [...prev, { useCase, feedback }]);
    setFeedbackGiven(true);
  };

  const randomnessLabel = useMemo(() => RANDOMNESS_LABELS[randomness], [randomness]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center p-4 sm:p-6 md:p-8">
      <main className="w-full max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-teal-500">
            Multimodal AI Use Case Brainstormer
          </h1>
          <p className="text-lg text-gray-400">
            Explore the future of AI by generating innovative ideas.
          </p>
        </header>

        <section className="mb-8 p-6 bg-gray-800/50 border border-gray-700 rounded-2xl backdrop-blur-sm">
          <h2 className="text-2xl font-bold mb-4 text-white">1. Select an AI Modality</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {ALL_MODALITIES.map((modality) => (
              <button
                key={modality.id}
                onClick={() => setSelectedModality(modality)}
                className={`flex flex-col items-center justify-center text-center p-4 border-2 rounded-xl transition-all duration-200 ease-in-out transform hover:-translate-y-1 focus:outline-none focus:ring-4 focus:ring-cyan-500/50
                  ${selectedModality?.id === modality.id ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300' : 'bg-gray-700/50 border-gray-600 hover:border-gray-500 text-gray-300'}`}
              >
                {modality.icon}
                <span className="font-semibold mt-2 text-sm md:text-base">{modality.name}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="mb-8 p-6 bg-gray-800/50 border border-gray-700 rounded-2xl">
          <h2 className="text-2xl font-bold mb-4 text-white">2. Adjust Randomness Level</h2>
          <div className="flex flex-col items-center">
             <div className="w-full flex justify-between text-gray-400 text-sm mb-2">
                <span>Conventional</span>
                <span className="font-bold text-cyan-400">{randomnessLabel}</span>
                <span>Far-Out</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              step="1"
              value={randomness}
              onChange={(e) => setRandomness(Number(e.target.value))}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              style={{ accentColor: '#22d3ee' /* cyan-400 */ }}
            />
          </div>
        </section>
        
        <div className="flex justify-center mb-8">
          <button
            onClick={handleGenerate}
            disabled={isLoading || !selectedModality}
            className="w-full md:w-auto px-12 py-4 text-xl font-bold text-white bg-gradient-to-r from-cyan-500 to-teal-600 rounded-xl shadow-lg hover:from-cyan-600 hover:to-teal-700 focus:outline-none focus:ring-4 focus:ring-cyan-500/50 transition-all duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 flex items-center justify-center"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Generating...
              </>
            ) : (
              'Generate Use Case'
            )}
          </button>
        </div>

        <section id="results">
            {isLoading && <LoadingSkeleton />}
            {error && !isLoading && (
                <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-xl text-center">
                    <p className="font-bold">An Error Occurred</p>
                    <p>{error}</p>
                </div>
            )}
            {!isLoading && useCase && (
              <div className="animate-fade-in-up">
                <UseCaseCard useCase={useCase} />
                <div className="mt-6 flex justify-center items-center gap-4">
                    {feedbackGiven ? (
                        <p className="text-lg text-teal-400 font-semibold">Thanks for your feedback!</p>
                    ) : (
                        <>
                            <button
                                onClick={() => handleFeedback('negative')}
                                className="flex items-center gap-2 px-6 py-2 text-lg font-semibold text-gray-200 bg-gray-700/80 border border-gray-600 rounded-full hover:bg-gray-700 hover:border-red-500 hover:text-white transition-all transform hover:scale-105"
                            >
                                👎 Boring
                            </button>
                            <button
                                onClick={() => handleFeedback('positive')}
                                className="flex items-center gap-2 px-6 py-2 text-lg font-semibold text-gray-200 bg-gray-700/80 border border-gray-600 rounded-full hover:bg-gray-700 hover:border-cyan-400 hover:text-white transition-all transform hover:scale-105"
                            >
                                👍 Love It!
                            </button>
                        </>
                    )}
                </div>
              </div>
            )}
        </section>

      </main>
    </div>
  );
}
