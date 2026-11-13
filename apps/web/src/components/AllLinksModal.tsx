'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Globe,
  X,
  Copy,
  Check,
  Search,
  ArrowUpRight,
  FolderKanban,
  Boxes,
  Rocket,
  Compass,
  Code,
  FileText,
  Brain,
  Wrench,
  Zap,
  Sparkles,
} from 'lucide-react';
import { getPopupLinks, EcosystemLink } from '../data/all-links';

interface AllLinksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AllLinksModal({ isOpen, onClose }: AllLinksModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Excludes this project's link (mentor-api)
  const links = useMemo(() => getPopupLinks(), []);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(links.map((l) => l.category)));
    return ['all', ...cats];
  }, [links]);

  const filteredLinks = useMemo(() => {
    return links.filter((link) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        link.name.toLowerCase().includes(q) ||
        link.description.toLowerCase().includes(q) ||
        link.url.toLowerCase().includes(q) ||
        link.category.toLowerCase().includes(q);

      const matchesCategory =
        selectedCategory === 'all' || link.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [links, searchQuery, selectedCategory]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleCopy = (e: React.MouseEvent, link: EcosystemLink) => {
    e.stopPropagation();
    navigator.clipboard.writeText(link.url);
    setCopiedId(link.id);
    setTimeout(() => {
      setCopiedId(null);
    }, 2000);
  };

  const renderIcon = (iconName: EcosystemLink['icon']) => {
    const props = { size: 16, className: 'text-white' };
    switch (iconName) {
      case 'FolderKanban':
        return <FolderKanban {...props} />;
      case 'Boxes':
        return <Boxes {...props} />;
      case 'Rocket':
        return <Rocket {...props} />;
      case 'Compass':
        return <Compass {...props} />;
      case 'Code':
        return <Code {...props} />;
      case 'FileText':
        return <FileText {...props} />;
      case 'Brain':
        return <Brain {...props} />;
      case 'Wrench':
        return <Wrench {...props} />;
      case 'Zap':
      default:
        return <Zap {...props} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl bg-mentor-surface border border-mentor-border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-mentor-border bg-[#0d0f16] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-mentor-accent to-amber-600 flex items-center justify-center text-black font-black shadow-lg shadow-amber-950/30 shrink-0">
              <Globe size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">All Ecosystem Links</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#1c1407] text-mentor-accent border border-amber-900/60">
                  {links.length} Connected Apps
                </span>
              </div>
              <p className="text-xs text-mentor-muted mt-0.5">
                Explore live tools, launch suites, and developer operating systems
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/[0.06] transition"
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="p-4 sm:p-5 border-b border-mentor-border/70 bg-[#0a0c12] space-y-3 shrink-0">
          <div className="relative">
            <Search size={15} className="text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by app name, description, or domain..."
              className="w-full bg-[#12141c] border border-mentor-border rounded-xl pl-10 pr-9 py-2.5 text-xs sm:text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:border-mentor-accent transition"
              autoFocus
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 p-0.5"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-lg capitalize whitespace-nowrap text-[11px] font-bold transition ${
                  selectedCategory === cat
                    ? 'bg-mentor-accent text-black shadow-sm'
                    : 'bg-[#12141c] text-gray-400 hover:text-gray-200 hover:bg-[#1a1e2b] border border-mentor-border'
                }`}
              >
                {cat === 'all' ? 'All Platforms' : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Links Grid */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1">
          {filteredLinks.length === 0 ? (
            <div className="py-12 text-center text-gray-500 text-xs">
              No matching ecosystem platforms found for &ldquo;{searchQuery}&rdquo;
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredLinks.map((link) => {
                const isCopied = copiedId === link.id;
                const cleanDomain = link.url.replace(/^https?:\/\//, '').replace(/\/$/, '');

                return (
                  <div
                    key={link.id}
                    className="group relative flex flex-col justify-between p-4 rounded-2xl bg-[#0e1017] hover:bg-[#131622] border border-mentor-border hover:border-mentor-accent/50 transition-all hover:shadow-xl"
                  >
                    <div>
                      {/* Top Row: Icon, Name, Category, Badge */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-8 h-8 rounded-xl bg-gradient-to-br ${link.gradient} flex items-center justify-center shrink-0 shadow-sm`}
                          >
                            {renderIcon(link.icon)}
                          </div>
                          <div className="truncate">
                            <h4 className="text-xs sm:text-sm font-bold text-white group-hover:text-mentor-accent transition truncate">
                              {link.name}
                            </h4>
                            <span className="text-[10px] text-mentor-muted font-medium">
                              {link.category}
                            </span>
                          </div>
                        </div>

                        {/* Deployment Badge */}
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-mono uppercase font-bold shrink-0 border ${
                            link.badge === 'Worker'
                              ? 'bg-amber-950/40 text-amber-300 border-amber-800/60'
                              : 'bg-blue-950/40 text-blue-300 border-blue-800/60'
                          }`}
                        >
                          {link.badge}
                        </span>
                      </div>

                      {/* Description */}
                      <p className="text-[11px] text-gray-400 line-clamp-2 leading-relaxed mb-3">
                        {link.description}
                      </p>
                    </div>

                    {/* Bottom Row: Clean Domain & Action Buttons */}
                    <div className="pt-2.5 border-t border-mentor-border/70 flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono text-gray-500 truncate max-w-[140px] sm:max-w-[170px]">
                        {cleanDomain}
                      </span>

                      <div className="flex items-center gap-1.5 shrink-0">
                        {/* Copy Link Button */}
                        <button
                          type="button"
                          onClick={(e) => handleCopy(e, link)}
                          className="px-2 py-1 rounded-lg bg-[#181b26] hover:bg-[#202534] text-gray-400 hover:text-white transition text-[11px] flex items-center gap-1 border border-mentor-border/60"
                          title="Copy URL to clipboard"
                        >
                          {isCopied ? (
                            <>
                              <Check size={12} className="text-emerald-400" />
                              <span className="text-emerald-400 font-bold text-[10px]">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span className="text-[10px]">Copy</span>
                            </>
                          )}
                        </button>

                        {/* Open URL Button */}
                        <a
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-mentor-accent to-amber-600 hover:brightness-110 active:scale-[0.98] text-black font-extrabold text-[11px] transition flex items-center gap-1 shadow-sm"
                        >
                          <span>Open</span>
                          <ArrowUpRight size={13} className="stroke-[2.5]" />
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-mentor-border bg-[#0d0f16] flex items-center justify-between text-xs text-gray-400 shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles size={13} className="text-mentor-accent" />
            <span className="text-[11px]">
              Showing <strong className="text-white">{filteredLinks.length}</strong> of{' '}
              {links.length} connected ecosystem platforms
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline text-[10px] text-gray-500">
              Press <kbd className="px-1.5 py-0.5 rounded bg-[#181b26] border border-mentor-border text-gray-300 font-mono text-[9px]">ESC</kbd>
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-xl bg-[#181b26] hover:bg-[#222638] text-gray-200 font-bold text-xs transition border border-mentor-border"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
