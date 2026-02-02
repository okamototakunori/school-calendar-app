'use client';

import React, { useState, useEffect } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addDays,
  parseISO
} from 'date-fns';
import { ja } from 'date-fns/locale';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  X,
  Moon,
  Sun
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

type EventCategory = 'academic' | 'sport' | 'holiday' | 'exam' | 'other';

interface SchoolEvent {
  id: string;
  title: string;
  date: string;
  category: EventCategory;
  location?: string;
  description?: string;
}

const CATEGORY_COLORS: Record<EventCategory, string> = {
  academic: 'bg-blue-500',
  sport: 'bg-orange-500',
  holiday: 'bg-green-500',
  exam: 'bg-red-500',
  other: 'bg-purple-500',
};

const CATEGORY_LABELS: Record<EventCategory, string> = {
  academic: '学考・行事',
  sport: '運動',
  holiday: '祝日・休日',
  exam: '試験',
  other: 'その他',
};

// --- Initial Data ---

const INITIAL_EVENTS: SchoolEvent[] = [
  { id: '1', title: '始業式', date: format(new Date(), 'yyyy-MM-01'), category: 'academic' },
  { id: '2', title: '避難訓練', date: format(addDays(new Date(), 5), 'yyyy-MM-dd'), category: 'other' },
  { id: '3', title: '中間試験', date: format(addDays(new Date(), 10), 'yyyy-MM-dd'), category: 'exam' },
  { id: '4', title: '遠足', date: format(addDays(new Date(), 15), 'yyyy-MM-dd'), category: 'sport' },
];

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [events, setEvents] = useState<SchoolEvent[]>(INITIAL_EVENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  // --- Calendar Logic ---

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { locale: ja });
  const endDate = endOfWeek(monthEnd, { locale: ja });

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const eventsForSelectedDay = events.filter(event =>
    isSameDay(parseISO(event.date), selectedDate)
  );

  if (!mounted) return null;

  return (
    <main className="max-w-6xl mx-auto p-4 md:p-8">
      {/* Header */}
      <header className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-primary text-on-primary p-2 rounded-xl shadow-lg">
            <CalendarIcon size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">学校行事カレンダー</h1>
            <p className="text-secondary text-sm">2026年度 スケジュール管理</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-3 rounded-full hover:bg-surface transition-colors"
            aria-label="Toggle Dark Mode"
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="md-button flex items-center gap-2"
          >
            <Plus size={20} />
            <span className="hidden md:inline">行事追加</span>
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar View */}
        <div className="lg:col-span-2 space-y-6">
          <div className="md-card p-6 border border-outline/10 h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">
                {format(currentDate, 'yyyy年 MMMM', { locale: ja })}
              </h2>
              <div className="flex gap-1">
                <button onClick={prevMonth} className="p-2 hover:bg-outline/10 rounded-full transition-colors">
                  <ChevronLeft size={24} />
                </button>
                <button onClick={nextMonth} className="p-2 hover:bg-outline/10 rounded-full transition-colors">
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 mb-2">
              {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
                <div key={day} className={cn(
                  "text-center text-sm font-medium py-2",
                  i === 0 ? "text-red-500" : i === 6 ? "text-blue-500" : "text-secondary"
                )}>
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                const dayEvents = events.filter(e => isSameDay(parseISO(e.date), day));
                const isSelected = isSameDay(day, selectedDate);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isToday = isSameDay(day, new Date());

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      "relative h-24 p-2 rounded-lg transition-all border text-left flex flex-col gap-1 overflow-hidden group",
                      isCurrentMonth ? "bg-surface/50" : "bg-transparent opacity-40",
                      isSelected ? "border-primary ring-2 ring-primary/20" : "border-outline/5 hover:border-outline/30",
                      isToday && "bg-primary/5"
                    )}
                  >
                    <span className={cn(
                      "text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full transition-colors",
                      isToday ? "bg-primary text-on-primary" : isSelected ? "text-primary" : ""
                    )}>
                      {format(day, 'd')}
                    </span>

                    <div className="flex flex-col gap-1 mt-1">
                      {dayEvents.slice(0, 2).map(event => (
                        <div
                          key={event.id}
                          className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded-sm text-white truncate",
                            CATEGORY_COLORS[event.category]
                          )}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[10px] text-secondary text-right">
                          +{dayEvents.length - 2}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar / Daily Events */}
        <div className="space-y-6">
          <div className="md-card h-full flex flex-col">
            <div className="mb-6">
              <h3 className="text-secondary text-xs font-bold uppercase tracking-widest mb-1">SELECTED DATE</h3>
              <h2 className="text-2xl font-bold">
                {format(selectedDate, 'M月 d日 (EEEE)', { locale: ja })}
              </h2>
            </div>

            <div className="flex-1 space-y-4">
              {eventsForSelectedDay.length > 0 ? (
                eventsForSelectedDay.map(event => (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={event.id}
                    className="p-4 rounded-2xl bg-white dark:bg-black/20 border border-outline/10 shadow-sm"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <span className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded-full text-white uppercase tracking-wider",
                        CATEGORY_COLORS[event.category]
                      )}>
                        {CATEGORY_LABELS[event.category]}
                      </span>
                    </div>
                    <h4 className="text-lg font-bold mb-3">{event.title}</h4>
                    <div className="space-y-2 text-sm text-secondary">
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>終日</span>
                      </div>
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin size={16} />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center text-secondary">
                  <div className="bg-surface p-4 rounded-full mb-4">
                    <CalendarIcon size={32} />
                  </div>
                  <p>予定がありません</p>
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="mt-4 text-primary font-medium hover:underline flex items-center gap-1"
                  >
                    <Plus size={16} /> 新しい行事を作成
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Tooltip placeholder - simplified for brevity */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-background p-8 rounded-3xl shadow-2xl w-full max-w-md border border-outline/10"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">行事の追加</h2>
                <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-surface rounded-full">
                  <X />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const title = formData.get('title') as string;
                if (!title) return;

                const newEvent: SchoolEvent = {
                  id: Math.random().toString(36).substr(2, 9),
                  title: title,
                  date: format(selectedDate, 'yyyy-MM-dd'),
                  category: formData.get('category') as EventCategory,
                };
                setEvents([...events, newEvent]);
                setIsModalOpen(false);
              }} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-secondary">行事名</label>
                  <input
                    name="title"
                    type="text"
                    placeholder="例：体育祭"
                    autoFocus
                    className="w-full bg-surface border border-outline/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-secondary">カテゴリー</label>
                  <select
                    name="category"
                    className="w-full bg-surface border border-outline/20 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all appearance-none"
                  >
                    <option value="academic">学考・行事</option>
                    <option value="sport">運動</option>
                    <option value="holiday">祝日・休日</option>
                    <option value="exam">試験</option>
                    <option value="other">その他</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 p-4 bg-primary/5 rounded-2xl">
                  <CalendarIcon size={20} className="text-primary" />
                  <span className="font-semibold text-primary">
                    {format(selectedDate, 'yyyy年 M月 d日', { locale: ja })}
                  </span>
                </div>

                <button type="submit" className="md-button w-full py-4 text-lg">
                  保存する
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
