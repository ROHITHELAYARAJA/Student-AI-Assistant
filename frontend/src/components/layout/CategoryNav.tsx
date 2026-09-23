import React from 'react';
import {
  BookOpen,
  GraduationCap,
  Code2,
  Users2,
  Atom,
  Microscope,
  Sparkles
} from 'lucide-react';
import { OperationCategory } from '../../types/study.js';

interface CategoryNavProps {
  selectedCategory: OperationCategory;
  onSelectCategory: (category: OperationCategory) => void;
  categoryCounts: Record<OperationCategory, number>;
}

interface CategoryConfig {
  id: OperationCategory;
  label: string;
  icon: React.ReactNode;
}

const CATEGORIES: CategoryConfig[] = [
  { id: 'Core Study', label: 'Core Study', icon: <BookOpen size={16} /> },
  { id: 'Exam Prep', label: 'Exam Prep', icon: <GraduationCap size={16} /> },
  { id: 'Coding', label: 'Coding & DSA', icon: <Code2 size={16} /> },
  { id: 'Interview Prep', label: 'Interview Prep', icon: <Users2 size={16} /> },
  { id: 'Math and Science', label: 'Math & Science', icon: <Atom size={16} /> },
  { id: 'Research and AI', label: 'Research & AI', icon: <Microscope size={16} /> },
  { id: 'Extras', label: 'Study Extras', icon: <Sparkles size={16} /> }
];

export const CategoryNav: React.FC<CategoryNavProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts
}) => {
  return (
    <nav
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        overflowX: 'auto',
        padding: '12px 28px',
        backgroundColor: 'rgba(255, 255, 255, 0.75)',
        borderBottom: '1px solid var(--color-border-subtle)',
        scrollbarWidth: 'none'
      }}
    >
      {CATEGORIES.map((cat) => {
        const isSelected = selectedCategory === cat.id;
        const count = categoryCounts[cat.id] || 0;

        return (
          <button
            key={cat.id}
            onClick={() => onSelectCategory(cat.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
              color: isSelected ? '#FFFFFF' : 'var(--color-text)',
              fontSize: '13px',
              fontWeight: 600,
              whiteSpace: 'nowrap',
              transition: 'all var(--transition-fast)',
              border: isSelected
                ? '1.5px solid var(--color-primary)'
                : '1.5px solid transparent'
            }}
            onMouseEnter={(e) => {
              if (!isSelected) {
                e.currentTarget.style.backgroundColor = 'var(--color-surface)';
                e.currentTarget.style.borderColor = 'var(--color-border)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isSelected) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'transparent';
              }
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center' }}>{cat.icon}</span>
            <span>{cat.label}</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '999px',
                backgroundColor: isSelected
                  ? 'rgba(255, 255, 255, 0.25)'
                  : 'rgba(255, 122, 148, 0.25)',
                color: isSelected ? '#FFFFFF' : 'var(--color-accent)'
              }}
            >
              {count}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
