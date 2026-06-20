import { useState } from 'react';
import './VoiceButton.css';

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export const VoiceButton = ({ onTranscript, disabled }: VoiceButtonProps) => {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const startListening = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice input is not supported on this browser. Please use Chrome.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => { setIsListening(false); setIsProcessing(false); };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setIsProcessing(true);
      onTranscript(transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed') {
        alert('Please allow microphone permissions in your browser settings to use this feature.');
      } else if (event.error !== 'no-speech') {
        alert(`Microphone error: ${event.error}. Try clicking again.`);
      }
      setIsListening(false);
      setIsProcessing(false);
    };

    recognition.start();
  };

  const buttonClass = [
    'voice-btn',
    isListening ? 'listening' : '',
    isProcessing ? 'processing' : '',
  ].filter(Boolean).join(' ');

  return (
    <button
      id="voice-input-btn"
      className={buttonClass}
      onClick={startListening}
      disabled={disabled || isListening}
      aria-label="Speak your question — बोलकर पूछें"
    >
      {isProcessing ? (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spin" aria-hidden="true">
          <path d="M21 12a9 9 0 11-6.219-8.56" />
        </svg>
      ) : (
        <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
          <path d="M19 10v2a7 7 0 0 1-14 0v-2" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <line x1="12" y1="19" x2="12" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          <line x1="8" y1="23" x2="16" y2="23" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      )}
      <span className="voice-label">
        {isListening ? 'सुन रहा हूँ...' : isProcessing ? 'Processing...' : 'बोलकर पूछें'}
      </span>
    </button>
  );
};

// Speak text aloud using Web Speech API (SaathiVoice fallback without Bhashini)
export function speakText(text: string, lang = 'hi-IN'): void {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = 0.85;
  utterance.pitch = 1.0;
  window.speechSynthesis.speak(utterance);
}
