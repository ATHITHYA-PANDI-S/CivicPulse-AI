import React, { useEffect } from 'react';
import { 
  Mic, 
  MicOff, 
  X, 
  Volume2, 
  Sparkles, 
  AlertCircle, 
  Check, 
  HelpCircle,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';
import { useVoiceRecognition } from '../../hooks/useVoiceRecognition';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onTranscript: (text: string) => void;
  language: 'en' | 'ta' | 'hi';
  onLanguageChange?: (lang: 'en' | 'ta' | 'hi') => void;
}

export const VoiceInputModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onTranscript,
  language,
  onLanguageChange
}) => {
  const {
    isListening,
    transcript,
    interimTranscript,
    audioVolume,
    errorMessage,
    hasMicPermission,
    isSupported,
    startListening,
    stopListening,
    clearError
  } = useVoiceRecognition({
    language,
    onFinalResult: (text) => {
      // Auto-commit final result if received
    }
  });

  // When modal opens, start listening automatically
  useEffect(() => {
    if (isOpen) {
      startListening(language);
    } else {
      stopListening();
    }
  }, [isOpen, language]);

  if (!isOpen) return null;

  const currentDisplaySpeech = transcript || interimTranscript;

  const handleApply = (textToApply?: string) => {
    const text = textToApply || currentDisplaySpeech;
    if (text.trim()) {
      onTranscript(text.trim());
    }
    stopListening();
    onClose();
  };

  const QUICK_PROMPTS = {
    ta: [
      'எங்க தெருவில் மின் கம்பி அறுந்து விழுந்து தீப்பொறி பறக்கிறது',
      'காந்திபுரத்தில் பெரிய தண்ணீர் குழாய் உடைந்து ரோடே மூழ்கியுள்ளது',
      'பீளமேடு பஸ் நிறுத்தம் அருகில் பெரிய தார் சாலை பள்ளம் உள்ளது',
      'சாக்கடை கால்வாய் அடைத்து சாக்கடை நீர் தெருவில் ஓடுகிறது'
    ],
    en: [
      'Live electrical transformer sparking and smoking near main bus stop',
      'Deep pothole causing serious vehicle damage on Cross Cut Road',
      'Major drinking water pipe burst flooding the residential street',
      'Garbage bins overflowing on roadside attracting stray animals'
    ],
    hi: [
      'बिजली का खंभा झुक गया है और तार से चिंगारी निकल रही है',
      'मुख्य सड़क पर गहरा गड्ढा है जिससे दुर्घटना हो रही है',
      'सड़क पर गंदा पानी जमा हो गया है और बदबू आ रही है'
    ]
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-6">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-red-600 to-indigo-600 text-white flex items-center justify-center shadow-md">
              <Mic className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                Live Voice Microphone
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300">
                  {isListening ? 'LISTENING' : 'PAUSED'}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Speak in your preferred language to dictate your grievance
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Tabs */}
        {onLanguageChange && (
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold">
            <button
              type="button"
              onClick={() => onLanguageChange('ta')}
              className={`py-2 rounded-xl transition ${
                language === 'ta' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              தமிழ் (Tamil)
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('en')}
              className={`py-2 rounded-xl transition ${
                language === 'en' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => onLanguageChange('hi')}
              className={`py-2 rounded-xl transition ${
                language === 'hi' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              हिन्दी (Hindi)
            </button>
          </div>
        )}

        {/* Dynamic Glowing Microphone Orb with Audio Wave Visualizer */}
        <div className="flex flex-col items-center justify-center py-4 space-y-4">
          <div className="relative flex items-center justify-center">
            {/* Pulsing ring scaling with real microphone audioVolume */}
            <div 
              className="absolute rounded-full bg-red-500/20 dark:bg-red-500/30 transition-all duration-75"
              style={{
                width: `${100 + audioVolume * 1.5}px`,
                height: `${100 + audioVolume * 1.5}px`,
              }}
            />
            <div 
              className="absolute rounded-full bg-red-500/30 dark:bg-red-500/40 transition-all duration-75"
              style={{
                width: `${80 + audioVolume * 0.9}px`,
                height: `${80 + audioVolume * 0.9}px`,
              }}
            />

            {/* Central Shutter Mic Button */}
            <button
              type="button"
              onClick={() => {
                if (isListening) {
                  stopListening();
                } else {
                  startListening(language);
                }
              }}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-2xl transition transform active:scale-95 ${
                isListening
                  ? 'bg-gradient-to-tr from-red-600 to-rose-600 text-white shadow-red-500/40 ring-4 ring-white dark:ring-slate-900'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
              }`}
              title={isListening ? 'Click to Pause Recording' : 'Click to Speak'}
            >
              {isListening ? (
                <Mic className="w-9 h-9 animate-pulse" />
              ) : (
                <MicOff className="w-9 h-9" />
              )}
            </button>
          </div>

          {/* Real Audio Volume Waveform Bars */}
          <div className="flex items-center justify-center gap-1.5 h-8">
            {[0.4, 0.8, 1.2, 1.5, 1.0, 0.6, 1.3, 0.9].map((multiplier, idx) => {
              const barHeight = Math.max(6, Math.min(32, Math.round(audioVolume * multiplier * 0.4)));
              return (
                <div
                  key={idx}
                  className="w-1.5 rounded-full bg-red-500 transition-all duration-75"
                  style={{ height: isListening ? `${barHeight}px` : '4px' }}
                />
              );
            })}
          </div>

          <div className="text-xs font-bold text-center">
            {isListening ? (
              <span className="text-red-600 dark:text-red-400 animate-pulse">
                Microphone is active! Speak now in {language === 'ta' ? 'தமிழ்' : language === 'hi' ? 'हिन्दी' : 'English'}...
              </span>
            ) : (
              <span className="text-slate-500">
                Microphone paused. Click the red button above to resume.
              </span>
            )}
          </div>
        </div>

        {/* Real-Time Transcript Display Box */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 min-h-[70px] flex items-center justify-center text-center">
          {currentDisplaySpeech ? (
            <p className="text-sm font-bold text-slate-900 dark:text-white leading-relaxed">
              "{currentDisplaySpeech}"
            </p>
          ) : (
            <p className="text-xs text-slate-400 italic">
              Words will appear here as you speak...
            </p>
          )}
        </div>

        {/* Error Alert with Browser Permission Help */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-1.5">
            <div className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              Microphone Permission Notice
            </div>
            <p className="text-[11px] leading-relaxed">
              {errorMessage}
            </p>
            <div className="text-[10px] text-amber-800 dark:text-amber-300 font-mono bg-white/60 dark:bg-slate-900/60 p-2 rounded-xl">
              💡 Tip: Click the <strong>Lock (🔒) or Camera/Mic</strong> icon in your browser URL address bar and choose <strong>"Allow"</strong> for Microphone.
            </div>
          </div>
        )}

        {/* Quick Simulated Voice Prompts */}
        <div className="space-y-2">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
            <span>Or click a voice sample prompt:</span>
            <span className="text-[10px] text-indigo-600 dark:text-indigo-400">1-Click Voice</span>
          </div>
          <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto pr-1">
            {QUICK_PROMPTS[language].map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleApply(prompt)}
                className="text-left p-2.5 rounded-xl bg-slate-100 hover:bg-indigo-50 dark:bg-slate-800 dark:hover:bg-indigo-950/40 text-slate-800 dark:text-slate-200 hover:text-indigo-700 dark:hover:text-indigo-300 text-xs font-medium border border-slate-200 dark:border-slate-700 transition flex items-center justify-between group"
              >
                <span className="truncate mr-2">🗣️ "{prompt}"</span>
                <span className="text-[10px] font-bold text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                  Use
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={!currentDisplaySpeech.trim()}
            onClick={() => handleApply()}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-black text-xs shadow-md transition flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Use Transcribed Speech</span>
          </button>
        </div>

      </div>
    </div>
  );
};
