import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/ui/GlassCard';
import { Button } from '../components/ui/Button';
import { mockActiveRooms } from '../data/mockData';
import { MessageCircle, Clock, ArrowRight, Code2 } from 'lucide-react';

export function RoomsList() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen pt-24 px-4 pb-20 w-full max-w-6xl mx-auto z-10 relative">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold mb-4 text-textMain">Active Collaborations</h1>
        <p className="text-xl text-textMuted max-w-2xl mx-auto">
          Jump back into your projects and continue building with your partners.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockActiveRooms.map((room, index) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <GlassCard 
              gradient={room.gradient} 
              className="h-full flex flex-col cursor-pointer transition-transform hover:-translate-y-2"
              onClick={() => navigate(`/room/${room.id}`)}
              glow={true}
            >
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-3">
                  <img src={room.partner.avatar} alt={room.partner.name} className="w-12 h-12 rounded-full border-2 border-primary/30" />
                  <div>
                    <p className="text-sm text-textMuted">Partner</p>
                    <p className="font-semibold text-textMain">{room.partner.name}</p>
                  </div>
                </div>
                {room.unreadMessages > 0 && (
                  <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold flex items-center shadow-[0_0_10px_rgba(34,211,238,0.3)]">
                    <MessageCircle className="w-3 h-3 mr-1" />
                    {room.unreadMessages} New
                  </div>
                )}
              </div>

              <h2 className="text-xl font-bold text-textMain mb-2 line-clamp-2">{room.projectName}</h2>
              
              <div className="flex flex-wrap gap-2 mb-6">
                {room.tags.map(tag => (
                  <span key={tag} className="bg-card border border-cardBorder text-textMuted text-xs px-2 py-1 rounded-md">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-auto pt-6 border-t border-cardBorder/50 flex items-center justify-between">
                <div className="flex items-center text-textMuted text-sm">
                  <Clock className="w-4 h-4 mr-1" />
                  {room.lastActive}
                </div>
                <div className="text-primary font-medium text-sm flex items-center group">
                  Enter Room
                  <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}

        {/* Empty state / Find new match card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: mockActiveRooms.length * 0.1 }}
        >
          <GlassCard 
            gradient="linear-gradient(137deg, #374151 0%, #111827 100%)" 
            className="h-full flex flex-col justify-center items-center text-center p-8 border-dashed border-2 border-cardBorder/50 cursor-pointer hover:border-primary/50 transition-colors"
            onClick={() => navigate('/dashboard')}
            glow={false}
          >
            <div className="w-16 h-16 bg-card rounded-full flex items-center justify-center mb-4">
              <Code2 className="w-8 h-8 text-textMuted" />
            </div>
            <h3 className="text-lg font-bold text-textMain mb-2">Start a New Project</h3>
            <p className="text-sm text-textMuted mb-6">Find a new partner and build something awesome together.</p>
            <Button variant="primary">Find Match</Button>
          </GlassCard>
        </motion.div>

      </div>
    </div>
  );
}
