'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { BookOpen, ChevronRight } from 'lucide-react';
import { getTermOfDay, type GlossaryTerm } from '@/data/glossary-terms';

interface TermOfDayProps {
  customTerm?: GlossaryTerm;
  showSource?: boolean;
  compact?: boolean;
}

export function TermOfDay({ customTerm, showSource = true, compact = false }: TermOfDayProps) {
  const term = customTerm || getTermOfDay();

  const categoryColors: Record<string, string> = {
    'Digital Identity': 'bg-blue-100 text-blue-700',
    'Cryptography': 'bg-purple-100 text-purple-700',
    'Privacy': 'bg-green-100 text-green-700',
    'Privacy Rights': 'bg-green-100 text-green-700',
    'Blockchain': 'bg-indigo-100 text-indigo-700',
    'Security': 'bg-red-100 text-red-700',
    'Compliance': 'bg-yellow-100 text-yellow-700',
    'AI Ethics': 'bg-pink-100 text-pink-700',
    'AI Technology': 'bg-pink-100 text-pink-700',
    'Privacy Technology': 'bg-teal-100 text-teal-700',
    'Standards': 'bg-gray-100 text-gray-700',
  };

  const categoryColor = categoryColors[term.category] || 'bg-gray-100 text-gray-700';

  if (compact) {
    return (
      <Card className="p-4 hover:shadow-md transition-shadow" role="article" aria-label="Term of the day">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0" aria-hidden="true">
            <BookOpen className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs text-gray-500 font-medium mb-1">TERM OF THE DAY</div>
            <h3 className="font-semibold text-gray-900 mb-1 text-sm">{term.term}</h3>
            <p className="text-xs text-gray-600 line-clamp-2">{term.definition}</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 hover:shadow-lg transition-shadow" role="article" aria-label="Term of the day">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center" aria-hidden="true">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium">TERM OF THE DAY</div>
            <div className="text-xs text-gray-400">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full font-medium ${categoryColor}`}>
          {term.category}
        </span>
      </div>

      {/* Term */}
      <h3 className="text-xl font-bold text-gray-900 mb-3">
        {term.term}
      </h3>

      {/* Definition */}
      <p className="text-gray-700 leading-relaxed mb-4">
        {term.definition}
      </p>

      {/* Related Terms */}
      {term.relatedTerms && term.relatedTerms.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-medium text-gray-500 mb-2">Related Terms:</div>
          <div className="flex flex-wrap gap-2">
            {term.relatedTerms.map((relatedTerm) => (
              <span
                key={relatedTerm}
                className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors cursor-pointer"
              >
                {relatedTerm}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Source */}
      {showSource && term.source && (
        <div className="pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Source: <span className="text-gray-700 font-medium">{term.source}</span>
          </div>
        </div>
      )}

      {/* View Full Glossary Link */}
      <Link href="/glossary" className="mt-4 w-full flex items-center justify-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors" aria-label="View full glossary of digital policy terms">
        View Full Glossary
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
      </Link>
    </Card>
  );
}

export default TermOfDay;
