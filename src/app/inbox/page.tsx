
'use client';

import { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Search, 
  Filter, 
  Phone, 
  Mail, 
  User, 
  Clock, 
  Send,
  MoreVertical,
  Circle
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useJsonStore } from '@/lib/store';
import { Message } from '@/lib/types';
import { format } from 'date-fns';

export default function UnifiedInbox() {
  const store = useJsonStore();
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedThread, setSelectedThread] = useState<Message | null>(null);
  const [replyText, setReplyText] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const msgs = store.getMessages();
    setMessages(msgs);
    if (msgs.length > 0) setSelectedThread(msgs[0]);
  }, []);

  const handleSend = () => {
    if (!replyText.trim()) return;

    // Simulate sending by updating the current thread's preview or adding a new message
    const newMsg: Message = {
      id: `MSG-${Date.now()}`,
      senderName: 'You (Admin)',
      preview: replyText,
      timestamp: new Date().toISOString(),
      status: 'read',
      type: 'Internal'
    };

    const updated = store.addMessage(newMsg);
    setMessages(updated);
    setReplyText('');
  };

  if (!isMounted) return null;

  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-140px)]">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-slate-800">Unified Communications</h1>
          <p className="text-muted-foreground">Manage real-time dialogue with guards and field supervisors.</p>
        </div>
        <div className="flex gap-2">
          <Badge variant="outline" className="bg-orange-50 text-primary border-primary/20 font-bold px-3">
            {messages.filter(m => m.status === 'unread').length} Unread Messages
          </Badge>
          <Button className="bg-primary text-white">+ New Broadcast</Button>
        </div>
      </div>

      <div className="flex gap-6 flex-1 overflow-hidden">
        {/* Chat List */}
        <Card className="w-80 flex flex-col shadow-sm border-none">
          <CardHeader className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search threads..." className="pl-8 text-xs bg-slate-50 border-none" />
            </div>
          </CardHeader>
          <div className="flex-1 overflow-y-auto">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                onClick={() => setSelectedThread(msg)}
                className={`p-4 border-b hover:bg-slate-50 cursor-pointer transition-colors relative ${selectedThread?.id === msg.id ? 'bg-slate-50' : ''}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-sm font-bold">{msg.senderName}</h4>
                  <span className="text-[10px] text-muted-foreground">
                    {format(new Date(msg.timestamp), 'HH:mm')}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">{msg.preview}</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="text-[9px] py-0 h-4 uppercase font-bold tracking-widest">
                    {msg.type}
                  </Badge>
                  {msg.status === 'unread' && <Circle className="h-2 w-2 fill-primary text-primary" />}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Chat Detail */}
        <Card className="flex-1 flex flex-col shadow-sm border-none overflow-hidden bg-white">
          {selectedThread ? (
            <>
              <CardHeader className="p-4 border-b flex flex-row items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 border shadow-sm">
                    {selectedThread.senderName.charAt(0)}
                  </div>
                  <div>
                    <CardTitle className="text-sm">{selectedThread.senderName}</CardTitle>
                    <CardDescription className="text-xs text-green-500 flex items-center gap-1 font-medium">
                      <Circle className="h-1.5 w-1.5 fill-green-500" /> Site Tracking Active
                    </CardDescription>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon"><Phone className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon"><User className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
                </div>
              </CardHeader>
              
              <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-50/30">
                <div className="flex flex-col gap-2 max-w-[80%]">
                  <div className="p-3 bg-white border rounded-2xl rounded-tl-none shadow-sm text-sm">
                    {selectedThread.preview}
                  </div>
                  <span className="text-[10px] text-muted-foreground ml-1">{selectedThread.senderName} • {format(new Date(selectedThread.timestamp), 'HH:mm')}</span>
                </div>

                {/* Simulated Conversation History */}
                <div className="flex flex-col gap-2 max-w-[80%] self-end items-end">
                  <div className="p-3 bg-primary text-white rounded-2xl rounded-tr-none shadow-sm text-sm">
                    Copy that. We are monitoring your location. Stay alert.
                  </div>
                  <span className="text-[10px] text-muted-foreground mr-1">Admin • {format(new Date(), 'HH:mm')}</span>
                </div>
              </div>

              <div className="p-4 border-t bg-white">
                <div className="flex gap-2 items-center">
                  <Input 
                    placeholder="Type your message..." 
                    className="bg-slate-50 border-none"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  />
                  <Button 
                    size="icon" 
                    className="rounded-full bg-primary hover:bg-primary/90 text-white shadow-md"
                    onClick={handleSend}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground italic">
              Select a thread to start messaging
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
