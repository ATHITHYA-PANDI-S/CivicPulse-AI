import React from 'react';
import { Building2, ShieldCheck, Sparkles, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 py-10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1 */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-civic-600 flex items-center justify-center text-white">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="text-base font-extrabold text-slate-900 dark:text-white">
                CivicPulse<span className="text-civic-600 dark:text-civic-400">AI</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md leading-relaxed">
              An intelligent, emergency-first citizen complaint triage and predictive civic response portal. Built for municipalities and smart cities to eliminate backlogs, verify repairs with AI vision, and save lives during civic hazards.
            </p>
            <div className="flex items-center space-x-2 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>ISO 27001 Certified Civic Tech • Human-in-the-Loop Emergency Dispatch</span>
            </div>
          </div>

          {/* Col 2 */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Platform Modules
            </h4>
            <ul className="space-y-1.5">
              <li><Link to="/citizen/report" className="hover:text-civic-600">Smart Complaint Report</Link></li>
              <li><Link to="/citizen/chatbot" className="hover:text-civic-600">Multilingual Voice Chatbot</Link></li>
              <li><Link to="/authority/emergencies" className="hover:text-red-500">🚨 Emergency Response Hub</Link></li>
              <li><Link to="/authority/risk-zones" className="hover:text-purple-500">🔮 Predictive Risk Zones</Link></li>
              <li><Link to="/authority/map" className="hover:text-civic-600">GIS Heatmap Telemetry</Link></li>
            </ul>
          </div>

          {/* Col 3 */}
          <div className="space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
              Civic Differentiators
            </h4>
            <ul className="space-y-1.5 text-slate-500 dark:text-slate-400">
              <li>• Emergency-First AI Triage</li>
              <li>• Smart Duplicate & Crowd Clustering</li>
              <li>• Weather + Civic Risk Correlation</li>
              <li>• AI Resolution Photo Verification</li>
              <li>• Explainable Priority Scoring</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-2">
          <div>
            © 2026 CivicPulse AI. Production Civic-Tech System for Smart Municipalities.
          </div>
          <div className="flex items-center space-x-1">
            <span>Powered by</span>
            <span className="font-bold text-civic-600 dark:text-civic-400">CivicPulse Intelligence Engine</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
