import { useState, useRef, useEffect, useCallback } from 'react';

interface VoiceRecognitionOptions {
  language?: 'en' | 'ta' | 'hi';
  onFinalResult?: (transcript: string) => void;
  onInterimResult?: (transcript: string) => void;
  onError?: (errorMessage: string) => void;
}

export const useVoiceRecognition = (options: VoiceRecognitionOptions = {}) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [audioVolume, setAudioVolume] = useState(0); // 0 to 100
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hasMicPermission, setHasMicPermission] = useState<boolean | null>(null);

  const recognitionRef = useRef<any>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const isSupported = typeof window !== 'undefined' && 
    ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window);

  // Stop real audio stream & volume analyser
  const stopAudioAnalyser = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch (e) {
        // ignore
      }
      audioContextRef.current = null;
    }
    setAudioVolume(0);
  };

  // Start real AudioContext analyser from user's microphone
  const startAudioAnalyser = async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });

      mediaStreamRef.current = stream;
      setHasMicPermission(true);

      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const audioCtx = new AudioContextClass();
        audioContextRef.current = audioCtx;

        if (audioCtx.state === 'suspended') {
          await audioCtx.resume();
        }

        const analyser = audioCtx.createAnalyser();
        analyser.fftSize = 64;
        analyser.smoothingTimeConstant = 0.5;

        const source = audioCtx.createMediaStreamSource(stream);
        source.connect(analyser);

        const dataArray = new Uint8Array(analyser.frequencyBinCount);

        const updateVolume = () => {
          if (!mediaStreamRef.current) return;
          analyser.getByteFrequencyData(dataArray);

          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            sum += dataArray[i];
          }
          const avg = sum / dataArray.length;
          // Scale to 0 - 100
          const volume = Math.min(100, Math.round((avg / 128) * 100));
          setAudioVolume(volume);

          animationFrameRef.current = requestAnimationFrame(updateVolume);
        };

        updateVolume();
      }

      return true;
    } catch (err: any) {
      console.warn('Microphone permission / stream error:', err);
      setHasMicPermission(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        const msg = 'Microphone permission was denied. Please allow microphone access in your browser settings (look for the lock or camera/mic icon in the URL address bar).';
        setErrorMessage(msg);
        options.onError?.(msg);
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        const msg = 'No microphone device was detected. Please connect a microphone or headset.';
        setErrorMessage(msg);
        options.onError?.(msg);
      } else {
        const msg = `Microphone error: ${err.message || 'Unable to access audio input.'}`;
        setErrorMessage(msg);
        options.onError?.(msg);
      }
      return false;
    }
  };

  const startListening = useCallback(async (lang: 'en' | 'ta' | 'hi' = options.language || 'en') => {
    setErrorMessage(null);
    setTranscript('');
    setInterimTranscript('');

    // 1. First obtain real microphone permission & start volume visualizer
    const micGranted = await startAudioAnalyser();
    if (!micGranted) {
      setIsListening(false);
      return;
    }

    // 2. Initialize SpeechRecognition if supported by browser
    const SpeechRecognitionClass = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionClass) {
      setIsListening(true);
      const msg = 'Your browser does not natively support the SpeechRecognition API (Google Chrome or Microsoft Edge is recommended). However, your microphone is active!';
      setErrorMessage(msg);
      options.onError?.(msg);
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          // ignore
        }
      }

      const recognition = new SpeechRecognitionClass();
      recognitionRef.current = recognition;

      // Language selection
      recognition.lang = lang === 'ta' ? 'ta-IN' : lang === 'hi' ? 'hi-IN' : 'en-IN';
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setErrorMessage(null);
      };

      recognition.onresult = (event: any) => {
        let currentInterim = '';
        let currentFinal = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const item = event.results[i];
          if (item.isFinal) {
            currentFinal += item[0].transcript;
          } else {
            currentInterim += item[0].transcript;
          }
        }

        if (currentInterim) {
          setInterimTranscript(currentInterim);
          options.onInterimResult?.(currentInterim);
        }

        if (currentFinal) {
          const trimmed = currentFinal.trim();
          setTranscript(prev => (prev ? `${prev} ${trimmed}` : trimmed));
          setInterimTranscript('');
          options.onFinalResult?.(trimmed);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('SpeechRecognition event error:', event.error);
        if (event.error === 'not-allowed') {
          const msg = 'Microphone blocked by browser. Please enable microphone permissions in your URL bar.';
          setErrorMessage(msg);
          options.onError?.(msg);
          stopListening();
        } else if (event.error === 'network') {
          const msg = 'Speech service network error. Cloud voice recognition requires an internet connection to Google services. You can also type or use Quick Voice Prompts.';
          setErrorMessage(msg);
          options.onError?.(msg);
        } else if (event.error === 'no-speech') {
          // Keep listening or prompt user to speak
          setInterimTranscript('No speech detected yet. Speak clearly...');
        } else if (event.error !== 'aborted') {
          const msg = `Speech error (${event.error}). Please speak again.`;
          setErrorMessage(msg);
          options.onError?.(msg);
        }
      };

      recognition.onend = () => {
        // Recognition completed or stopped
      };

      recognition.start();
      setIsListening(true);
    } catch (err: any) {
      console.warn('SpeechRecognition startup error:', err);
      setIsListening(true);
    }
  }, [options.language]);

  const stopListening = useCallback(() => {
    setIsListening(false);
    setInterimTranscript('');
    stopAudioAnalyser();

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
      recognitionRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      stopListening();
    };
  }, [stopListening]);

  return {
    isListening,
    transcript,
    interimTranscript,
    audioVolume,
    errorMessage,
    hasMicPermission,
    isSupported,
    startListening,
    stopListening,
    clearError: () => setErrorMessage(null)
  };
};
