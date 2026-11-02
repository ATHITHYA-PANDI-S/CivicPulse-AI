import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Mic, 
  MicOff, 
  Send, 
  Sparkles, 
  Flame, 
  CheckCircle2, 
  Volume2, 
  VolumeX,
  ArrowRight,
  Globe,
  Loader2,
  Camera,
  X,
  MapPin,
  PhoneCall,
  Info,
  Clock,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';
import { useComplaints } from '../context/ComplaintContext';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { AIAnalysis, ComplaintCategory } from '../types';
import { COIMBATORE_LOCATIONS } from './CitizenReport';
import { CameraPhotoUploader } from '../components/common/CameraPhotoUploader';
import { VoiceInputModal } from '../components/common/VoiceInputModal';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  timestamp: string;
  language?: 'en' | 'ta' | 'hi';
  aiAnalysis?: AIAnalysis;
  attachedPhotos?: string[];
  canCreateComplaint?: boolean;
}

export const CitizenChatbot: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createComplaint } = useComplaints();

  const [language, setLanguage] = useState<'en' | 'ta' | 'hi'>('en');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg-1',
      sender: 'bot',
      text: 'வணக்கம்! नमस्ते! Hello! I am your CivicPulse AI Voice Assistant for Coimbatore City. You can speak to me in தமிழ் (Tamil), हिन्दी (Hindi), or English to report grievances, check emergency hotlines, or track city repair schedules.',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  
  // Voice Output (Text-To-Speech) State
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [currentlySpeakingId, setCurrentlySpeakingId] = useState<string | null>(null);
  
  // Attached Photos in Chat
  const [chatPhotos, setChatPhotos] = useState<string[]>([]);
  const [isCameraDrawerOpen, setIsCameraDrawerOpen] = useState(false);
  
  // Selected Locality for Instant Ticket Filing
  const [selectedWard, setSelectedWard] = useState('Gandhipuram');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, interimTranscript]);

  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  // Text-To-Speech (TTS) Voice Engine
  const speakText = (text: string, msgId?: string, lang: 'en' | 'ta' | 'hi' = language) => {
    if (!('speechSynthesis' in window) || !isAudioEnabled) return;

    window.speechSynthesis.cancel();

    // Clean text of emojis and special characters for clearer pronunciation
    const cleanText = text
      .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
      .replace(/[*_#]/g, '')
      .trim();

    if (!cleanText) return;

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Match language
    if (lang === 'ta') {
      utterance.lang = 'ta-IN';
    } else if (lang === 'hi') {
      utterance.lang = 'hi-IN';
    } else {
      utterance.lang = 'en-IN';
    }

    // Try finding matching voice in available system voices
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang.toLowerCase().startsWith(utterance.lang.toLowerCase()));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    if (msgId) setCurrentlySpeakingId(msgId);

    utterance.onend = () => {
      setCurrentlySpeakingId(null);
    };

    utterance.onerror = () => {
      setCurrentlySpeakingId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setCurrentlySpeakingId(null);
    }
  };

  // Speech Recognition (Speech-to-Text) Engine
  const handleToggleVoice = () => {
    stopSpeaking();

    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Speech Recognition is not supported by this browser. Please type your message or try Google Chrome / Microsoft Edge.');
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setInterimTranscript('');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'ta' ? 'ta-IN' : language === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
        setInterimTranscript('');
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (interim) {
          setInterimTranscript(interim);
        }

        if (final) {
          setInputText(final);
          setInterimTranscript('');
          setIsListening(false);
          // Automatically process recognized voice input
          handleSendMessage(final);
        }
      };

      recognition.onerror = (err: any) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
        setInterimTranscript('');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  // Conversational Intent Resolution & Civic Knowledge Engine
  const processCivicKnowledge = (text: string): { matched: boolean; response: string; emergency?: boolean } => {
    const t = text.toLowerCase();

    // 1. Emergency Helpline Questions
    if (t.includes('emergency') || t.includes('helpline') || t.includes('phone') || t.includes('number') || t.includes('அவசர') || t.includes('எண்') || t.includes('हेल्पलाइन') || t.includes('नंबर')) {
      if (language === 'ta') {
        return {
          matched: true,
          response: `📞 கோயம்புத்தூர் மாநகராட்சி முக்கிய அவசர தொடர்பு எண்கள்:\n• மின்சார வாரியம் (TNEB மின் விபத்து): 1912\n• தீயணைப்பு & மீட்புப்பணி: 101\n• ஆம்புலன்ஸ் (மருத்துவ அவசரம்): 108\n• காவல்துறை கட்டுப்பாட்டு அறை: 100\n• கோவை மாநகராட்சி உதவி மையம் (CCMC): 0422-2302323\n• பெண்கள் உதவி எண்: 1091`
        };
      } else if (language === 'hi') {
        return {
          matched: true,
          response: `📞 कोयंबटूर नगर निगम आपातकालीन हेल्पलाइन नंबर:\n• बिजली आपातकाल (TNEB): 1912\n• दमकल विभाग (Fire): 101\n• एम्बुलेंस (Ambulance): 108\n• पुलिस नियंत्रण कक्ष: 100\n• नगर निगम सहायता (CCMC): 0422-2302323`
        };
      } else {
        return {
          matched: true,
          response: `📞 Coimbatore Civic Emergency & Assistance Helplines:\n• TNEB Electricity Breakdown: 1912\n• Fire & Rescue Service: 101\n• Medical Emergency Ambulance: 108\n• Police Control Room: 100\n• Coimbatore Corporation HQ (CCMC): 0422-2302323\n• Disaster Helpline: 1077`
        };
      }
    }

    // 2. Waste & Garbage Collection Queries
    if (t.includes('garbage') || t.includes('waste') || t.includes('trash') || t.includes('குப்பை') || t.includes('கழிவு') || t.includes('कचरा')) {
      if (language === 'ta') {
        return {
          matched: true,
          response: `♻️ கோயம்புத்தூர் மாநகராட்சி தூய்மைப் பணி விவரம்:\n• வீடு வீடாக மக்கும்/மக்காத குப்பை சேகரிப்பு தினமும் காலை 6:30 மணி முதல் 11:00 மணி வரை நடைபெறும்.\n• உங்கள் பகுதியில் குப்பை வண்டி வரவில்லையா? உடனே இங்கே புகார் தெரிவிக்கலாம்.`
        };
      } else if (language === 'hi') {
        return {
          matched: true,
          response: `♻️ कोयंबटूर स्वच्छता सेवा:\n• घर-घर कचरा संग्रहण प्रतिदिन सुबह 6:30 से 11:00 बजे तक होता है।\n• यदि आपके क्षेत्र में कचरा गाड़ी नहीं आई है, तो आप तुरंत शिकायत दर्ज कर सकते हैं।`
        };
      } else {
        return {
          matched: true,
          response: `♻️ Coimbatore Municipal Solid Waste Schedule:\n• Door-to-door segregated waste collection runs daily between 6:30 AM – 11:00 AM.\n• Wet waste (green bins) collected daily; Dry waste (blue bins) collected twice weekly.\n• If your street bins are overflowing, let me know to dispatch a sanitation truck.`
        };
      }
    }

    // 3. Drinking Water Timings Queries
    if (t.includes('water') || t.includes('siruvani') || t.includes('pilloor') || t.includes('தண்ணீர்') || t.includes('குடிநீர்') || t.includes('पानी')) {
      if (language === 'ta') {
        return {
          matched: true,
          response: `🚰 கோவை குடிநீர் விநியோகம் (சிறுவாணி & பில்லூர் திட்டம்):\n• வார்டுகளுக்கு ஏற்ப 4 முதல் 8 நாட்களுக்கு ஒரு முறை குடிநீர் வழங்கப்படுகிறது.\n• பைப்லைன் உடைப்பு அல்லது குடிநீர் கசிவு இருப்பின், புகைப்படத்துடன் பதிவு செய்தால் 24 மணி நேரத்திற்குள் சரிசெய்யப்படும்.`
        };
      } else if (language === 'hi') {
        return {
          matched: true,
          response: `🚰 कोयंबटूर पेयजल आपूर्ति (सिरुवानी एवं पिल्लूर जल परियोजना):\n• वार्ड के अनुसार 4 से 7 दिनों के अंतराल पर पेयजल उपलब्ध कराया जाता है।\n• पाइपलाइन फटने की स्थिति में 24 घंटे में मरम्मत की जाती है।`
        };
      } else {
        return {
          matched: true,
          response: `🚰 Coimbatore Water Supply Timings (Siruvani & Pilloor Schemes):\n• Drinking water is supplied on rotation every 4–7 days depending on the ward division.\n• Pipeline bursts or contaminated water leaks are addressed within a guaranteed 24-hour SLA.`
        };
      }
    }

    // 4. Potholes & Road Repair Turnaround SLA
    if (t.includes('pothole') || t.includes('road') || t.includes('சாலை') || t.includes('பள்ளம்') || t.includes('सड़क') || t.includes('गड्ढा')) {
      if (language === 'ta') {
        return {
          matched: true,
          response: `🛣️ சாலை பராமரிப்பு & தார் சாலை பணிகள்:\n• முக்கிய சாலைகளில் உள்ள ஆபத்தான பள்ளங்கள் 24 முதல் 48 மணி நேரத்திற்குள் சீரமைக்கப்படும்.\n• புகைப்படத்தை இணைத்து புகாரை உடனே பதிவு செய்யுங்கள்.`
        };
      }
    }

    return { matched: false, response: '' };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text && chatPhotos.length === 0) return;

    const currentPhotos = [...chatPhotos];

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: text || '📸 [Attached Photo Evidence]',
      language,
      attachedPhotos: currentPhotos.length > 0 ? currentPhotos : undefined,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setChatPhotos([]);
    setIsCameraDrawerOpen(false);
    setIsProcessing(true);

    try {
      // 1. Check for quick conversational civic knowledge
      const knowledge = processCivicKnowledge(text);

      // 2. Perform deep AI classification
      const res = await api.analyzeText(text);
      const analysis = res.analysis;

      let botResponseText = '';

      if (knowledge.matched && !analysis.isEmergency) {
        botResponseText = knowledge.response;
      } else if (analysis.isEmergency) {
        if (language === 'ta') {
          botResponseText = `🚨 அவசர ஆபத்து கண்டறியப்பட்டது! (${analysis.emergencyReason || 'உயிருக்கு ஆபத்தான நிலை'}).\nநான் இதை ${analysis.recommendedDepartment} துறைக்கு மிக அவசர முன்னுரிமை 98/100 இல் தாமதமின்றி வழிநடத்துகிறேன். தயவுசெய்து உங்கள் வார்டை உறுதிசெய்து 'உடனடி பதிவு' பொத்தானை அழுத்தவும்.`;
        } else if (language === 'hi') {
          botResponseText = `🚨 आपातकालीन खतरा पाया गया! (${analysis.emergencyReason || 'गंभीर जीवन सुरक्षा खतरा'}).\nइसे तुरंत ${analysis.recommendedDepartment} को सर्वोच्च प्राथमिकता 98/100 पर भेजा जा रहा है। कृपया अपना वार्ड चुनें और शिकायत दर्ज करें।`;
        } else {
          botResponseText = `🚨 CRITICAL EMERGENCY DETECTED! (${analysis.emergencyReason || 'Immediate public safety risk'}).\nPrioritized to ${analysis.priorityScore}/100 and routed to ${analysis.recommendedDepartment}. Please confirm your Coimbatore location below to register this incident immediately.`;
        }
      } else {
        if (language === 'ta') {
          botResponseText = `உங்கள் புகாரை ஆய்வு செய்துள்ளேன்:\n• கண்டறியப்பட்ட வகை: ${analysis.category}\n• பரிந்துரைக்கப்பட்ட துறை: ${analysis.recommendedDepartment}\n• முன்னுரிமை மதிப்பு: ${analysis.priorityScore}/100\n• தீர்வு நேரம்: ${analysis.predictedResponseLabel}`;
        } else if (language === 'hi') {
          botResponseText = `आपकी शिकायत का विश्लेषण:\n• श्रेणी: ${analysis.category}\n• विभाग: ${analysis.recommendedDepartment}\n• प्राथमिकता: ${analysis.priorityScore}/100\n• अपेक्षित समाधान: ${analysis.predictedResponseLabel}`;
        } else {
          botResponseText = `I have analyzed your civic grievance:\n• Category: ${analysis.category} (${analysis.severity.toUpperCase()} severity)\n• Assigned Department: ${analysis.recommendedDepartment}\n• Priority Score: ${analysis.priorityScore}/100\n• SLA Target: ${analysis.predictedResponseLabel}`;
        }
      }

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: botResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        aiAnalysis: analysis,
        canCreateComplaint: true
      };

      setMessages(prev => [...prev, botMsg]);

      // Speak response aloud via Text-to-Speech
      speakText(botResponseText, botMsg.id, language);

    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Instant Ticket Registration from Chat Card
  const handleInstantRegister = async (analysis: AIAnalysis, descriptionText: string, photosToAttach: string[] = []) => {
    try {
      setIsProcessing(true);
      const loc = COIMBATORE_LOCATIONS.find(l => l.name === selectedWard) || COIMBATORE_LOCATIONS[0];

      const res = await createComplaint({
        description: descriptionText,
        category: analysis.category,
        location: {
          address: `Near ${loc.name} Central Junction, Coimbatore`,
          area: loc.name,
          city: 'Coimbatore',
          lat: loc.lat,
          lng: loc.lng
        },
        photos: photosToAttach.length > 0 
          ? photosToAttach 
          : ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80'],
        citizenId: user?.id || 'usr-citizen-1',
        citizenName: user?.name || 'Concerned Citizen',
        originalLanguage: language
      });

      const ticketId = res.isDuplicateGrouped ? res.masterComplaint?.id : res.complaint.id;
      navigate(`/citizen/complaints/${ticketId}`);
    } catch (err: any) {
      alert(err.message || 'Failed to register complaint');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl">
        <div className="flex items-center space-x-3.5">
          <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Bot className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 dark:text-white">
                Multilingual AI Voice Assistant
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 animate-pulse">
                LIVE VOICE TTS
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Speak naturally in <strong>தமிழ் (Tamil)</strong>, <strong>हिन्दी (Hindi)</strong>, or <strong>English</strong> with voice synthesis & camera photo attachment.
            </p>
          </div>
        </div>

        {/* Controls: Audio Mute/Unmute & Language switcher */}
        <div className="flex items-center gap-2">
          {/* TTS Audio toggle */}
          <button
            type="button"
            onClick={() => {
              if (isAudioEnabled) stopSpeaking();
              setIsAudioEnabled(!isAudioEnabled);
            }}
            className={`p-2.5 rounded-2xl border transition shadow-xs flex items-center gap-1.5 text-xs font-bold ${
              isAudioEnabled
                ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-700'
            }`}
            title={isAudioEnabled ? 'Voice Output ON (Click to Mute)' : 'Voice Output OFF (Click to Unmute)'}
          >
            {isAudioEnabled ? <Volume2 className="w-4 h-4 text-purple-600" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{isAudioEnabled ? 'Voice ON' : 'Muted'}</span>
          </button>

          {/* Language selector */}
          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => {
                stopSpeaking();
                setLanguage('ta');
              }}
              className={`px-3 py-1 rounded-xl text-xs font-black transition ${
                language === 'ta' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              தமிழ்
            </button>
            <button
              onClick={() => {
                stopSpeaking();
                setLanguage('hi');
              }}
              className={`px-3 py-1 rounded-xl text-xs font-black transition ${
                language === 'hi' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              हिन्दी
            </button>
            <button
              onClick={() => {
                stopSpeaking();
                setLanguage('en');
              }}
              className={`px-3 py-1 rounded-xl text-xs font-black transition ${
                language === 'en' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              English
            </button>
          </div>
        </div>
      </div>

      {/* Suggested Voice Triggers */}
      <div className="bg-slate-100 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-wrap items-center gap-2 text-xs">
        <span className="font-bold text-slate-500 text-[10px] uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          Click or Speak:
        </span>
        
        <button
          onClick={() => {
            setLanguage('ta');
            handleSendMessage('எங்க தெருவில் மின் கம்பி அறுந்து விழுந்து தீப்பொறி பறக்கிறது');
          }}
          className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 hover:bg-red-50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900 font-bold shadow-2xs transition"
        >
          ⚡ தமிழ்: "மின் கம்பி அறுந்து கிடக்குது"
        </button>

        <button
          onClick={() => {
            setLanguage('ta');
            handleSendMessage('காந்திபுரத்தில் பெரிய தண்ணீர் குழாய் உடைந்து ரோடே மூழ்கியுள்ளது');
          }}
          className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 hover:bg-blue-50 text-civic-700 dark:text-civic-300 border border-civic-200 dark:border-civic-800 font-bold shadow-2xs transition"
        >
          💧 தமிழ்: "தண்ணீர் பைப்லைன் உடைப்பு"
        </button>

        <button
          onClick={() => {
            setLanguage('en');
            handleSendMessage('What is Coimbatore Municipal Corporation emergency helpline number?');
          }}
          className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 hover:bg-purple-50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-bold shadow-2xs transition"
        >
          📞 "Emergency Helplines"
        </button>

        <button
          onClick={() => {
            setLanguage('en');
            handleSendMessage('Severe deep pothole causing road accidents near Peelamedu signal');
          }}
          className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 hover:bg-amber-50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 font-bold shadow-2xs transition"
        >
          🛣️ "Deep Pothole at Peelamedu"
        </button>
      </div>

      {/* Main Chat Conversation Container */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-4 sm:p-6 flex flex-col h-[560px]">
        
        {/* Messages List */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1.5 scrollbar-thin">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[88%] sm:max-w-[78%] rounded-3xl p-4 space-y-2.5 text-xs sm:text-sm ${
                m.sender === 'user'
                  ? 'bg-indigo-600 text-white rounded-br-none shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 rounded-bl-none border border-slate-200 dark:border-slate-700/80'
              }`}>
                
                {/* Message Header */}
                <div className="flex items-center justify-between gap-4 text-[10px] opacity-75 border-b border-black/5 dark:border-white/5 pb-1">
                  <span className="font-extrabold uppercase tracking-wider flex items-center gap-1">
                    {m.sender === 'user' ? (user?.name || 'Citizen Resident') : 'CivicPulse Voice AI'}
                  </span>
                  <div className="flex items-center gap-2">
                    {m.sender === 'bot' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (currentlySpeakingId === m.id) {
                            stopSpeaking();
                          } else {
                            speakText(m.text, m.id, m.language);
                          }
                        }}
                        className="p-1 rounded hover:bg-black/10 dark:hover:bg-white/10 transition"
                        title="Replay Voice Audio"
                      >
                        <Volume2 className={`w-3.5 h-3.5 ${currentlySpeakingId === m.id ? 'text-amber-500 animate-pulse' : 'text-slate-400'}`} />
                      </button>
                    )}
                    <span>{m.timestamp}</span>
                  </div>
                </div>

                {/* Attached Photo Evidence */}
                {m.attachedPhotos && m.attachedPhotos.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {m.attachedPhotos.map((photo, pIdx) => (
                      <img
                        key={pIdx}
                        src={photo}
                        alt="Attached Evidence"
                        className="w-28 h-20 object-cover rounded-xl border border-white/20 shadow-sm"
                      />
                    ))}
                  </div>
                )}

                {/* Message Text */}
                <p className="leading-relaxed whitespace-pre-wrap font-medium">
                  {m.text}
                </p>

                {/* AI Structured Action Card inside Chat */}
                {m.aiAnalysis && (
                  <div className="mt-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 space-y-3 text-xs shadow-sm">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <span className="font-extrabold flex items-center text-slate-900 dark:text-white">
                        {m.aiAnalysis.isEmergency ? (
                          <span className="text-red-600 font-black flex items-center gap-1.5 animate-pulse">
                            <Flame className="w-4 h-4 fill-current text-red-600" />
                            CRITICAL EMERGENCY HAZARD
                          </span>
                        ) : (
                          <span className="text-indigo-600 dark:text-indigo-400 font-black flex items-center gap-1.5">
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            CIVIC GRIEVANCE SUMMARY
                          </span>
                        )}
                      </span>
                      <span className="font-black text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white">
                        Priority: {m.aiAnalysis.priorityScore}/100
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-slate-400 block font-semibold">Category:</span>
                        <span className="font-bold">{m.aiAnalysis.category}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-semibold">Target Department:</span>
                        <span className="font-bold truncate block">{m.aiAnalysis.recommendedDepartment}</span>
                      </div>
                    </div>

                    {/* Ward Selector inside chat card */}
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                        Select Coimbatore Ward for Dispatch:
                      </label>
                      <select
                        value={selectedWard}
                        onChange={(e) => setSelectedWard(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold"
                      >
                        {COIMBATORE_LOCATIONS.map(loc => (
                          <option key={loc.name} value={loc.name}>
                            {loc.name} ({loc.zone})
                          </option>
                        ))}
                      </select>
                    </div>

                    {m.canCreateComplaint && (
                      <button
                        onClick={() => handleInstantRegister(m.aiAnalysis!, m.text, m.attachedPhotos)}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-1.5"
                      >
                        <span>Confirm & File Official Ticket Now</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}

              </div>
            </div>
          ))}

          {/* Real-time Listening Waveform Visualizer */}
          {isListening && (
            <div className="flex justify-start animate-fadeIn">
              <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white p-4 rounded-3xl rounded-bl-none shadow-xl space-y-2 max-w-sm">
                <div className="flex items-center gap-2 text-xs font-black">
                  <span className="w-2.5 h-2.5 bg-white rounded-full animate-ping"></span>
                  Listening in {language === 'ta' ? 'தமிழ் (Tamil)' : language === 'hi' ? 'हिन्दी (Hindi)' : 'English'}...
                </div>

                {/* Animated Waveform Bars */}
                <div className="flex items-center justify-center gap-1.5 py-2">
                  <span className="w-1.5 bg-white rounded-full h-4 animate-bounce"></span>
                  <span className="w-1.5 bg-white rounded-full h-8 animate-bounce delay-75"></span>
                  <span className="w-1.5 bg-white rounded-full h-6 animate-bounce delay-150"></span>
                  <span className="w-1.5 bg-white rounded-full h-10 animate-bounce delay-200"></span>
                  <span className="w-1.5 bg-white rounded-full h-5 animate-bounce delay-100"></span>
                  <span className="w-1.5 bg-white rounded-full h-8 animate-bounce delay-300"></span>
                </div>

                <div className="text-[11px] text-white/90 italic font-mono">
                  {interimTranscript ? `"${interimTranscript}..."` : "Speak clearly into your microphone..."}
                </div>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="flex justify-start">
              <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl text-xs flex items-center space-x-2 text-slate-500 shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                <span>AI analyzing speech intent and computing SLA priority...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Live Camera Drawer inside Chat */}
        {isCameraDrawerOpen && (
          <div className="p-3 my-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 animate-fadeIn">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-indigo-600" />
                Snap or Upload Photo Evidence for Voice Session
              </span>
              <button
                type="button"
                onClick={() => setIsCameraDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <CameraPhotoUploader
              photos={chatPhotos}
              onChange={setChatPhotos}
              maxPhotos={2}
              label="Live Damage Photo"
            />
          </div>
        )}

        {/* Attached photo indicator above input */}
        {chatPhotos.length > 0 && !isCameraDrawerOpen && (
          <div className="flex items-center gap-2 py-2 px-1">
            <span className="text-[11px] text-slate-500 font-bold">Attached ({chatPhotos.length}):</span>
            {chatPhotos.map((p, idx) => (
              <div key={idx} className="relative">
                <img src={p} alt="thumb" className="w-9 h-9 rounded-lg object-cover border" />
                <button
                  type="button"
                  onClick={() => setChatPhotos(prev => prev.filter((_, i) => i !== idx))}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Chat Input Bar */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
          
          {/* Camera Snapshot Button */}
          <button
            type="button"
            onClick={() => setIsCameraDrawerOpen(!isCameraDrawerOpen)}
            className={`p-3 rounded-2xl transition shadow-md flex items-center justify-center ${
              isCameraDrawerOpen || chatPhotos.length > 0
                ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200'
            }`}
            title="Attach Photo or Take Live Camera Snapshot"
          >
            <Camera className="w-5 h-5" />
          </button>

          {/* Voice Microphone Button */}
          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              setIsVoiceModalOpen(true);
            }}
            className="p-3 rounded-2xl transition shadow-md flex items-center justify-center bg-red-600 hover:bg-red-700 text-white ring-2 ring-red-400/50 hover:ring-red-400 group relative"
            title={`Open Voice Microphone (${language === 'ta' ? 'தமிழ்' : language === 'hi' ? 'हिन्दी' : 'English'})`}
          >
            <Mic className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-ping"></span>
          </button>

          {/* Text Input */}
          <input
            type="text"
            placeholder={
              language === 'ta'
                ? 'தமிழில் பேச மைக் அழுத்தவும் அல்லது தட்டச்சு செய்யவும்...'
                : language === 'hi'
                ? 'बोलने के लिए माइक दबाएं या यहाँ टाइप करें...'
                : 'Press mic to speak or type your civic problem...'
            }
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />

          {/* Send Button */}
          <button
            type="button"
            onClick={() => handleSendMessage()}
            disabled={!inputText.trim() && chatPhotos.length === 0}
            className="p-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white shadow-md transition"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>

      </div>

      {/* Voice Recognition & Audio Visualizer Modal */}
      <VoiceInputModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onTranscript={(spokenText) => {
          setInputText(spokenText);
          handleSendMessage(spokenText);
        }}
        language={language}
        onLanguageChange={(newLang) => setLanguage(newLang)}
      />

    </div>
  );
};
