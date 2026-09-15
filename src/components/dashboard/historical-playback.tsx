'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  FastForward, 
  Clock, 
  MapPin, 
  ShieldAlert, 
  Heart,
  ChevronLeft,
  ChevronRight,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { format, parseISO, differenceInMinutes } from 'date-fns';
import { Guard, GuardLocation, SOSAlert, WelfareCheck } from '@/lib/types';

interface HistoricalPlaybackProps {
  guard: Guard;
  history: GuardLocation[];
  sosEvents: SOSAlert[];
  welfareEvents: WelfareCheck[];
  onFrameChange: (location: GuardLocation) => void;
}

export function HistoricalPlayback({ 
  guard, 
  history, 
  sosEvents, 
  welfareEvents,
  onFrameChange 
}: HistoricalPlaybackProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentLocation = history[currentIndex];
  const progress = history.length > 0 ? (currentIndex / (history.length - 1)) * 100 : 0;

  useEffect(() => {
    if (isPlaying && currentIndex < history.length - 1) {
      timerRef.current = setInterval(() => {
        setCurrentIndex(prev => {
          const next = prev + 1;
          if (next >= history.length - 1) {
            setIsPlaying(false);
            return history.length - 1;
          }
          return next;
        });
      }, 1000 / playbackSpeed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, playbackSpeed, currentIndex, history.length]);

  useEffect(() => {
    if (currentLocation) {
      onFrameChange(currentLocation);
    }
  }, [currentLocation, onFrameChange]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const resetPlayback = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
  };

  const getEventAtCurrentTime = () => {
    if (!currentLocation) return null;
    const time = currentLocation.timestamp;
    
    const sos = sosEvents.find(s => s.timestamp.substring(0, 16) === time.substring(0, 16));
    const welfare = welfareEvents.find(w => w.scheduledAt.substring(0, 16) === time.substring(0, 16));
    
    return { sos, welfare };
  };

  const event = getEventAtCurrentTime();

  if (history.length === 0) {
    return (
      <div className="p-12 text-center bg-slate-50 rounded-3xl border border-dashed text-slate-400 font-black uppercase italic">
        No forensic telemetry available for this period.
      </div>
    );
  }

  return (
    <Card className="border-none shadow-2xl rounded-[2.5rem] bg-white overflow-hidden">
      <CardHeader className="bg-slate-900 text-white p-8">
        <div className="flex justify-between items-start">
          <div>
            <Badge variant="outline" className="border-primary text-primary font-black uppercase text-[8px] mb-2 px-2">FORENSIC REPLAY</Badge>
            <CardTitle className="text-2xl font-black italic uppercase tracking-tighter">Path Replay: {guard.name}</CardTitle>
            <CardDescription className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">
              Playback Source: Immutable Simulation Logs
            </CardDescription>
          </div>
          <div className="text-right">
             <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Replay Time</p>
             <p className="text-2xl font-black italic text-primary">{currentLocation ? format(parseISO(currentLocation.timestamp), 'HH:mm:ss') : '--:--:--'}</p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-8 space-y-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center text-[10px] font-black uppercase text-slate-400 tracking-widest">
            <span>START: {format(parseISO(history[0].timestamp), 'HH:mm')}</span>
            <span>END: {format(parseISO(history[history.length - 1].timestamp), 'HH:mm')}</span>
          </div>
          <Slider 
            value={[currentIndex]} 
            max={history.length - 1} 
            step={1} 
            onValueChange={([val]) => setCurrentIndex(val)}
            className="cursor-pointer"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={resetPlayback} className="rounded-xl h-12 w-12 border-slate-200 shadow-sm"><RotateCcw className="h-5 w-5" /></Button>
            <Button 
              onClick={togglePlay} 
              className={`h-12 w-32 rounded-xl font-black uppercase italic shadow-xl transition-all ${isPlaying ? 'bg-amber-500 hover:bg-amber-600' : 'bg-primary hover:bg-primary/90'}`}
            >
              {isPlaying ? <Pause className="mr-2 h-5 w-5" /> : <Play className="mr-2 h-5 w-5" />}
              {isPlaying ? 'PAUSE' : 'PLAY'}
            </Button>
          </div>

          <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-2xl">
            {[1, 2, 5, 10].map(speed => (
              <Button 
                key={speed} 
                variant={playbackSpeed === speed ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setPlaybackSpeed(speed)}
                className={`rounded-xl px-4 font-black text-[10px] h-9 ${playbackSpeed === speed ? 'bg-white shadow-sm' : ''}`}
              >
                {speed}X
              </Button>
            ))}
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
           <div className="p-5 bg-slate-50 rounded-3xl border border-dashed space-y-1">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Position Snapshot</p>
              <p className="text-sm font-black text-slate-800 italic uppercase truncate">
                {currentLocation?.latitude.toFixed(6)}, {currentLocation?.longitude.toFixed(6)}
              </p>
              <p className="text-[9px] font-bold text-primary uppercase">Accuracy: ±{currentLocation?.accuracyMeters.toFixed(0)}m</p>
           </div>
           <div className="p-5 bg-slate-50 rounded-3xl border border-dashed space-y-1">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Forensic Events</p>
              <div className="flex gap-3">
                 <Badge variant="outline" className={`h-6 rounded-lg font-black text-[8px] uppercase ${event?.sos ? 'bg-red-50 text-red-600 border-red-200' : 'opacity-20'}`}>
                    <ShieldAlert className="w-3 h-3 mr-1" /> SOS
                 </Badge>
                 <Badge variant="outline" className={`h-6 rounded-lg font-black text-[8px] uppercase ${event?.welfare ? 'bg-amber-50 text-amber-600 border-amber-200' : 'opacity-20'}`}>
                    <Heart className="w-3 h-3 mr-1" /> Welfare
                 </Badge>
              </div>
           </div>
           <div className="p-5 bg-slate-50 rounded-3xl border border-dashed flex items-center justify-between">
              <div>
                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Playback Progress</p>
                <p className="text-lg font-black italic text-slate-800">{currentIndex + 1} / {history.length}</p>
              </div>
              <Clock className="h-8 w-8 text-slate-200" />
           </div>
        </div>

        {event?.sos && (
          <div className="p-5 bg-red-50 border border-red-100 rounded-3xl animate-in zoom-in-95 duration-300">
             <div className="flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
                <div>
                   <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">CRITICAL SOS SNAPSHOT</p>
                   <p className="text-xs font-bold text-red-800 mt-1 uppercase italic leading-relaxed">Emergency triggered at this coordinate. Personnel state: {event.sos.status}</p>
                </div>
             </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
