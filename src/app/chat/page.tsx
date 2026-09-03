'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';

interface ChatMessage {
  id: string;
  sender: 'user' | 'seller';
  text: string;
  timestamp: string;
}

interface ChatConversation {
  id: string;
  sellerName: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: boolean;
  messages: ChatMessage[];
}

const initialConversations: ChatConversation[] = [
  {
    id: 'conv-1',
    sellerName: '@vintage_jkt (Denim House)',
    avatar: 'VJ',
    lastMessage: 'Halo kak, kemeja Sage Green masih ready ya! Siap dikirim.',
    time: '10:42',
    unread: true,
    messages: [
      { id: 'm-1', sender: 'seller', text: 'Halo kak! Ada yang bisa kami bantu seputar produk vintage/preloved kami?', timestamp: '10:30' },
      { id: 'm-2', sender: 'user', text: 'Halo, apakah Kemeja Sage Green ukurannya fit L?', timestamp: '10:35' },
      { id: 'm-3', sender: 'seller', text: 'Halo kak, kemeja Sage Green masih ready ya! Siap dikirim.', timestamp: '10:42' },
    ],
  },
  {
    id: 'conv-2',
    sellerName: 'CleanCare Signature Kemang',
    avatar: 'CC',
    lastMessage: 'Jadwal penjemputan baju Anda pukul 14.00 WIB oleh kurir Klámbi.',
    time: 'Kemarin',
    unread: false,
    messages: [
      { id: 'm-4', sender: 'user', text: 'Halo min, untuk spa jaket denim butuh berapa hari?', timestamp: 'Kemarin' },
      { id: 'm-5', sender: 'seller', text: 'Proses deep clean & anti-odor membutuhkan waktu 2 hari kerja kak.', timestamp: 'Kemarin' },
      { id: 'm-6', sender: 'seller', text: 'Jadwal penjemputan baju Anda pukul 14.00 WIB oleh kurir Klámbi.', timestamp: 'Kemarin' },
    ],
  },
  {
    id: 'conv-3',
    sellerName: 'Taylor Studio Artisan Fatmawati',
    avatar: 'TS',
    lastMessage: 'Terima kasih kak, potongan celana sudah rapi chainstitch.',
    time: '14 Agu',
    unread: false,
    messages: [
      { id: 'm-7', sender: 'seller', text: 'Terima kasih kak, potongan celana sudah rapi chainstitch.', timestamp: '14 Agu' },
    ],
  },
];

export default function ChatPage() {
  const [conversations, setConversations] = useState<ChatConversation[]>(initialConversations);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [inputText, setInputText] = useState('');

  const activeConv = conversations.find((c) => c.id === activeConvId);

  const quickReplies = ['Nego harga', 'Tanya stok', 'Lokasi penjemputan', 'Minta foto asli'];

  const handleSendMessage = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || !activeConvId) return;

    const newMessage: ChatMessage = {
      id: `m-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? {
              ...c,
              lastMessage: text.trim(),
              messages: [...c.messages, newMessage],
            }
          : c
      )
    );

    setInputText('');

    // Auto reply simulation after 1.5 seconds
    setTimeout(() => {
      const autoReply: ChatMessage = {
        id: `m-reply-${Date.now()}`,
        sender: 'seller',
        text: 'Terima kasih telah menghubungi kami! Tim kami akan segera merespon pesan Anda.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? { ...c, lastMessage: autoReply.text, messages: [...c.messages, autoReply] }
            : c
        )
      );
    }, 1500);
  };

  return (
    <AppLayout title={activeConv ? activeConv.sellerName : 'Pesan & Chat'} showBack backHref="/">
      <div className="max-w-2xl mx-auto space-y-4 pb-20">
        {!activeConv ? (
          /* Conversation List */
          <div className="bg-card rounded-2xl border border-border divide-y divide-border shadow-sm overflow-hidden">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => {
                  setActiveConvId(conv.id);
                  setConversations((prev) =>
                    prev.map((c) => (c.id === conv.id ? { ...c, unread: false } : c))
                  );
                }}
                className="p-4 flex items-center gap-3 cursor-pointer hover:bg-muted/40 transition-colors"
              >
                <div className="w-11 h-11 rounded-full bg-[#10284D] text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                  {conv.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-foreground truncate">
                      {conv.sellerName}
                    </h4>
                    <span className="text-[10px] text-muted-foreground">{conv.time}</span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {conv.lastMessage}
                  </p>
                </div>
                {conv.unread && (
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E86D50] flex-shrink-0" />
                )}
              </div>
            ))}
          </div>
        ) : (
          /* Active Chat Room */
          <div className="flex flex-col h-[75vh]">
            {/* Header Back button to Conv List */}
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <button
                onClick={() => setActiveConvId(null)}
                className="flex items-center gap-2 text-xs font-bold text-[#10284D]"
              >
                <Icon name="ArrowLeftIcon" size={16} />
                Kembali ke Daftar Chat
              </button>
              <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                Online
              </span>
            </div>

            {/* Message History Container */}
            <div className="flex-1 overflow-y-auto space-y-3 py-4 pr-1">
              {activeConv.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs font-medium ${
                      msg.sender === 'user'
                        ? 'bg-[#10284D] text-white rounded-br-none'
                        : 'bg-muted text-foreground border border-border rounded-bl-none'
                    }`}
                  >
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-muted-foreground mt-1 px-1">
                    {msg.timestamp}
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Replies Chips */}
            <div className="flex gap-2 overflow-x-auto scrollbar-hide py-2">
              {quickReplies.map((chip) => (
                <button
                  key={chip}
                  onClick={() => handleSendMessage(chip)}
                  className="px-3 py-1.5 rounded-full bg-secondary border border-border text-[#10284D] text-[11px] font-bold whitespace-nowrap hover:bg-[#10284D] hover:text-white transition-all shadow-sm"
                >
                  ⚡ {chip}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <button
                onClick={() => toast.info('Kirim gambar/foto produk')}
                className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <Icon name="PhotoIcon" size={20} />
              </button>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Tulis pesan..."
                className="flex-1 bg-card border border-border rounded-full px-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-[#10284D]"
              />
              <button
                onClick={() => handleSendMessage()}
                className="w-10 h-10 rounded-full bg-[#10284D] text-white flex items-center justify-center hover:bg-[#152248] transition-colors shadow-md"
              >
                <Icon name="PaperAirplaneIcon" size={18} />
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
