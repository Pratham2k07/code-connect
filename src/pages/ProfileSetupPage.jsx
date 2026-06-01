import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { GlassCard } from '../components/ui/GlassCard';
import { mockInterests, mockTechStacks, mockGoals } from '../data/mockData';
import { Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export function ProfileSetupPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [gender, setGender] = useState('');
  const [preference, setPreference] = useState('');
  const [selectedTech, setSelectedTech] = useState([]);
  const [customTech, setCustomTech] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [selectedGoals, setSelectedGoals] = useState([]);

  const handleNext = async () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      if (user) {
        try {
          const { error } = await supabase.from('profiles').upsert({
            id: user.id,
            gender,
            preference,
            tech_stack: selectedTech,
            interests: selectedInterests,
            goals: selectedGoals,
            updated_at: new Date()
          });
          if (error) throw error;
        } catch (error) {
          alert("Error saving profile: " + error.message);
          return;
        }
      }
      navigate('/dashboard');
    }
  };

  const toggleSelection = (item, list, setList) => {
    if (list.includes(item)) setList(list.filter(i => i !== item));
    else setList([...list, item]);
  };

  const toggleGoal = (goal) => {
    if (selectedGoals.includes(goal)) {
      setSelectedGoals(selectedGoals.filter(g => g !== goal));
    } else if (selectedGoals.length < 4) {
      setSelectedGoals([...selectedGoals, goal]);
    }
  };

  return (
    <div className="min-h-screen pt-24 px-4 pb-20 flex flex-col items-center max-w-3xl mx-auto z-10 relative w-full">
      <div className="w-full mb-8">
        <div className="flex justify-between text-sm font-medium text-textMuted mb-2">
          <span>Step {step} of 4</span>
          <span>{step === 1 ? 'Basics' : step === 2 ? 'Tech Stack' : step === 3 ? 'Interests' : 'Goals'}</span>
        </div>
        <div className="w-full h-2 bg-card rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-primary to-secondary"
            initial={{ width: 0 }}
            animate={{ width: `${(step / 4) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>

      <GlassCard 
        gradient={
          step === 1 ? 'linear-gradient(137deg, #6366f1 0%, #a855f7 100%)' :
          step === 2 ? 'linear-gradient(137deg, #22d3ee 0%, #a78bfa 100%)' :
          step === 3 ? 'linear-gradient(137deg, #FF3D77 0%, #FF9D3C 100%)' :
          'linear-gradient(137deg, #10B981 0%, #059669 100%)'
        }
        className="w-full flex-1 flex flex-col p-6 sm:p-8"
      >
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1"
            >
              <h2 className="text-3xl font-bold mb-2 text-textMain">The Basics</h2>
              <p className="text-textMuted mb-8">Tell us about yourself to help us find the right match.</p>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-textMuted uppercase tracking-wider mb-3">I identify as</h3>
                <div className="flex gap-3">
                  {['Male', 'Female', 'Non-binary'].map(g => (
                    <button
                      key={g}
                      onClick={() => setGender(g)}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                        gender === g
                          ? 'bg-primary text-[#0A0A0B] shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                          : 'bg-card border border-cardBorder text-textMuted hover:border-primary/50 hover:text-textMain'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <h3 className="text-sm font-semibold text-textMuted uppercase tracking-wider mb-3">I'm looking to collaborate with</h3>
                <div className="flex gap-3">
                  {['Male', 'Female', 'Anyone'].map(p => (
                    <button
                      key={p}
                      onClick={() => setPreference(p)}
                      className={`flex-1 py-3 rounded-xl text-sm font-medium transition-all ${
                        preference === p
                          ? 'bg-primary text-[#0A0A0B] shadow-[0_0_15px_rgba(139,92,246,0.3)]'
                          : 'bg-card border border-cardBorder text-textMuted hover:border-primary/50 hover:text-textMain'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1"
            >
              <h2 className="text-3xl font-bold mb-2 text-textMain">What's your Tech Stack?</h2>
              <p className="text-textMuted mb-6">Select the tools you love building with.</p>
              
              <div className="relative mb-6 max-w-sm">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-textMuted" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search tech stack..."
                  className="w-full bg-card border border-cardBorder rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:border-primary/50 text-textMain placeholder:text-textMuted/50 transition-colors"
                />
              </div>

              <div className="flex flex-wrap gap-3 mb-6 overflow-y-auto custom-scrollbar pr-2 max-h-[300px]">
                {[...new Set([...mockTechStacks, ...selectedTech])]
                  .filter(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map(tech => (
                  <button
                    key={tech}
                    onClick={() => toggleSelection(tech, selectedTech, setSelectedTech)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      selectedTech.includes(tech)
                        ? 'bg-primary/20 text-primary border border-primary/50 shadow-[0_0_15px_rgba(139,92,246,0.15)]'
                        : 'bg-card border border-cardBorder text-textMuted hover:border-primary/30 hover:text-textMain'
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={customTech}
                  onChange={(e) => setCustomTech(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customTech.trim()) {
                      e.preventDefault();
                      const newTech = customTech.trim();
                      if (!selectedTech.includes(newTech)) {
                        setSelectedTech([...selectedTech, newTech]);
                      }
                      setCustomTech('');
                    }
                  }}
                  placeholder="Other (type and press Enter)"
                  className="bg-background border border-cardBorder rounded-xl px-4 py-2 focus:outline-none focus:border-primary/50 text-sm transition-colors w-full max-w-xs text-textMain placeholder:text-textMuted/50"
                />
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1"
            >
              <h2 className="text-3xl font-bold mb-2">What are your interests?</h2>
              <p className="text-textMuted mb-6">Beyond code, what makes you tick?</p>
              <div className="flex flex-wrap gap-3">
                {mockInterests.map(interest => (
                  <button
                    key={interest}
                    onClick={() => toggleSelection(interest, selectedInterests, setSelectedInterests)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      selectedInterests.includes(interest)
                        ? 'bg-secondary/20 text-secondary border border-secondary/50 shadow-[0_0_15px_rgba(217,70,239,0.15)]'
                        : 'bg-card border border-cardBorder text-textMuted hover:border-secondary/30 hover:text-textMain'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1"
            >
              <div className="flex justify-between items-end mb-2">
                <h2 className="text-3xl font-bold">What are your goals?</h2>
                <span className="text-sm text-textMuted">{selectedGoals.length}/4 selected</span>
              </div>
              <p className="text-textMuted mb-6">Select up to 4 things you are looking for.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {mockGoals.map(goal => (
                  <button
                    key={goal}
                    onClick={() => toggleGoal(goal)}
                    disabled={!selectedGoals.includes(goal) && selectedGoals.length >= 4}
                    className={`p-4 rounded-xl text-left font-medium transition-all ${
                      selectedGoals.includes(goal)
                        ? 'bg-gradient-to-br from-primary/20 to-secondary/20 border border-primary/50 shadow-[0_0_15px_rgba(139,92,246,0.15)] text-textMain'
                        : 'bg-card border border-cardBorder text-textMuted hover:border-primary/30 hover:text-textMain disabled:opacity-50 disabled:cursor-not-allowed'
                    }`}
                  >
                    {goal}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-8 flex justify-between pt-6 border-t border-cardBorder">
          {step > 1 ? (
            <Button variant="ghost" onClick={() => setStep(step - 1)}>
              Back
            </Button>
          ) : <div></div>}
          
          <Button onClick={handleNext} disabled={
            (step === 1 && (!gender || !preference)) ||
            (step === 2 && selectedTech.length === 0) ||
            (step === 3 && selectedInterests.length === 0) ||
            (step === 4 && selectedGoals.length === 0)
          }>
            {step === 4 ? 'Find Match' : 'Continue'}
          </Button>
        </div>
      </GlassCard>
    </div>
  );
}
