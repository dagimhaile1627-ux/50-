import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Calendar, MapPin, Accessibility, ShieldCheck, Sparkles } from 'lucide-react';

export const EventsTab: React.FC = () => {
  const { events, dateSuggestions, handleToggleRSVP } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'events' | 'date_ideas'>('events');

  return (
    <div className="space-y-6 pb-8 text-white">
      {/* Sub Tabs Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-neutral-800 pb-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-white" />
            Events & Safe Dates
          </h2>
          <p className="text-xs sm:text-sm text-neutral-300">
            Real-world 50+ group meetups and verified public first-date ideas.
          </p>
        </div>

        <div className="flex items-center bg-neutral-900 border border-neutral-800 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setActiveSubTab('events')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'events' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Community Events
          </button>
          <button
            onClick={() => setActiveSubTab('date_ideas')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'date_ideas' ? 'bg-white text-black' : 'text-neutral-400 hover:text-white'
            }`}
          >
            Safe Venues
          </button>
        </div>
      </div>

      {activeSubTab === 'events' ? (
        /* Community Events List */
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-4 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-white shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-neutral-300">
              <span className="font-bold text-white">All Gatherings Are Verified & Public: </span>
              Every event is hosted by verified members in well-lit, accessible public venues with clear parking and seating.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 shadow-md flex flex-col justify-between space-y-4 hover:border-neutral-700 transition-all"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="bg-white text-black text-xs px-3 py-0.5 rounded-full font-bold uppercase tracking-wide">
                      {event.category}
                    </span>
                    <span className="text-xs text-neutral-300 font-semibold">
                      {event.attendeesCount} / {event.maxCapacity} Spots
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-serif text-white leading-snug">
                    {event.title}
                  </h3>

                  <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                    {event.description}
                  </p>

                  <div className="space-y-1.5 text-xs text-neutral-200 pt-1">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-white shrink-0" />
                      <span><strong>When:</strong> {event.date} • {event.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-white shrink-0" />
                      <span><strong>Where:</strong> {event.locationName}, {event.city}</span>
                    </div>
                  </div>

                  {/* Accessibility Highlights */}
                  <div className="bg-neutral-900 rounded-xl p-3 border border-neutral-800 space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 text-white font-bold">
                      <Accessibility className="w-3.5 h-3.5" />
                      <span>Accessibility & Comfort:</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {event.accessibilityNotes.map((note, idx) => (
                        <span key={idx} className="bg-black text-neutral-200 border border-neutral-800 px-2 py-0.5 rounded text-[11px]">
                          ✓ {note}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Host Info and RSVP Button */}
                <div className="pt-3 border-t border-neutral-800 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <img
                      src={event.host.photo}
                      alt={event.host.name}
                      className="w-8 h-8 rounded-full object-cover border border-neutral-700"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0 text-xs">
                      <span className="font-bold text-white block truncate">Host: {event.host.name}</span>
                      <span className="text-[10px] text-neutral-400">Verified Host</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleRSVP(event.id)}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-colors tap-active min-h-[42px] ${
                      event.isJoined
                        ? 'bg-neutral-800 text-white border border-neutral-600'
                        : 'bg-white hover:bg-neutral-200 text-black shadow'
                    }`}
                  >
                    {event.isJoined ? '✓ You Are Attending' : 'RSVP to Join'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Safe Public First-Date Suggestions */
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl p-4 flex items-start gap-3">
            <Sparkles className="w-5 h-5 text-white shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm text-neutral-300">
              <span className="font-bold text-white">Senior-Friendly Public Date Guide: </span>
              Curated locations chosen specifically for quiet acoustic environments, comfortable seating, accessible parking, and safe public daytime settings.
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dateSuggestions.map((date) => (
              <div
                key={date.id}
                className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 shadow-md space-y-4 hover:border-neutral-700 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="bg-white text-black text-xs px-3 py-0.5 rounded-full font-bold capitalize">
                    {date.category.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs font-bold text-white bg-neutral-900 border border-neutral-700 px-2.5 py-0.5 rounded">
                    Budget: {date.budget}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-bold font-serif text-white">{date.title}</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">📍 {date.locationName} • {date.address}</p>
                </div>

                <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                  {date.description}
                </p>

                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs space-y-1">
                  <div className="text-white font-bold flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Why This Venue is Safe:
                  </div>
                  <p className="text-neutral-300">{date.whySafe}</p>
                </div>

                <div className="space-y-1.5 text-xs text-neutral-300">
                  <div className="font-bold text-white">Accessibility Highlights:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {date.accessibilityHighlights.map((highlight, i) => (
                      <span key={i} className="bg-black text-neutral-200 border border-neutral-800 px-2 py-0.5 rounded text-[11px]">
                        ✓ {highlight}
                      </span>
                    ))}
                  </div>
                  <div className="text-[11px] text-neutral-400 pt-1">
                    <strong>Recommended Times:</strong> {date.bestTimes}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

