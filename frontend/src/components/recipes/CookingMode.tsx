import { useState, useEffect, useCallback } from 'react';
import { X, Play, Pause, RotateCcw, ChevronLeft, ChevronRight, Timer } from 'lucide-react';
import { Button } from '@/components/ui';
import type { Instruction } from '@/types';

interface CookingModeProps {
  instructions: Instruction[];
  recipeName: string;
  onClose: () => void;
}

export default function CookingMode({ instructions, recipeName, onClose }: CookingModeProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState<number | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  const currentInstruction = instructions[currentStep];
  const hasTimer = currentInstruction?.timer_minutes && currentInstruction.timer_minutes > 0;

  const startTimer = useCallback(() => {
    if (hasTimer && currentInstruction.timer_minutes) {
      setTimerSeconds(currentInstruction.timer_minutes * 60);
      setIsTimerRunning(true);
    }
  }, [hasTimer, currentInstruction]);

  const resetTimer = useCallback(() => {
    if (hasTimer && currentInstruction.timer_minutes) {
      setTimerSeconds(currentInstruction.timer_minutes * 60);
      setIsTimerRunning(false);
    }
  }, [hasTimer, currentInstruction]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isTimerRunning && timerSeconds !== null && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev === null || prev <= 1) {
            setIsTimerRunning(false);
            // Play notification sound
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Timer Complete!', { body: `Step ${currentStep + 1} timer finished` });
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds, currentStep]);

  useEffect(() => {
    setTimerSeconds(null);
    setIsTimerRunning(false);
  }, [currentStep]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const goToPrevious = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  const goToNext = () => {
    if (currentStep < instructions.length - 1) setCurrentStep(currentStep + 1);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'Escape') onClose();
      if (e.key === ' ' && hasTimer) {
        e.preventDefault();
        if (timerSeconds === null) startTimer();
        else setIsTimerRunning(!isTimerRunning);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentStep, hasTimer, timerSeconds, isTimerRunning, onClose, startTimer]);

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 text-white flex flex-col">
      <header className="flex items-center justify-between p-4 border-b border-gray-700">
        <h1 className="text-xl font-semibold truncate">{recipeName}</h1>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          aria-label="Exit cooking mode"
        >
          <X className="h-6 w-6" />
        </button>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-6 max-w-3xl mx-auto w-full">
        <div className="text-center mb-8">
          <span className="text-primary-400 text-lg font-medium">
            Step {currentStep + 1} of {instructions.length}
          </span>
        </div>

        <p className="text-2xl md:text-3xl text-center leading-relaxed mb-8">
          {currentInstruction?.content}
        </p>

        {hasTimer && (
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="flex items-center gap-2 text-primary-400">
              <Timer className="h-5 w-5" />
              <span className="text-sm">Timer: {currentInstruction.timer_minutes} min</span>
            </div>
            
            {timerSeconds !== null ? (
              <div className="flex items-center gap-4">
                <span className={`text-5xl font-mono ${timerSeconds === 0 ? 'text-green-400 animate-pulse' : ''}`}>
                  {formatTimer(timerSeconds)}
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                  >
                    {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button variant="secondary" size="sm" onClick={resetTimer}>
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ) : (
              <Button onClick={startTimer}>
                <Play className="h-4 w-4 mr-2" />
                Start Timer
              </Button>
            )}
          </div>
        )}

        <div className="w-full flex items-center justify-between mt-auto pt-8">
          <Button
            variant="secondary"
            onClick={goToPrevious}
            disabled={currentStep === 0}
            className="min-w-[120px]"
          >
            <ChevronLeft className="h-5 w-5 mr-1" />
            Previous
          </Button>

          <div className="flex gap-1">
            {instructions.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`w-3 h-3 rounded-full transition-colors ${
                  idx === currentStep ? 'bg-primary-500' : 'bg-gray-600 hover:bg-gray-500'
                }`}
                aria-label={`Go to step ${idx + 1}`}
              />
            ))}
          </div>

          <Button
            variant={currentStep === instructions.length - 1 ? 'primary' : 'secondary'}
            onClick={currentStep === instructions.length - 1 ? onClose : goToNext}
            className="min-w-[120px]"
          >
            {currentStep === instructions.length - 1 ? (
              'Finish'
            ) : (
              <>
                Next
                <ChevronRight className="h-5 w-5 ml-1" />
              </>
            )}
          </Button>
        </div>
      </div>

      <footer className="p-4 text-center text-sm text-gray-500 border-t border-gray-700">
        Use arrow keys to navigate • Space to start/pause timer • Esc to exit
      </footer>
    </div>
  );
}
