/**
 * Scentmap Core Types
 * Definitions for fragrance data structures to prevent "AI slop" and ensure type safety.
 */

export interface Fragrance {
  id: string;
  name: string;
  brand: string;
  family: 'citrus' | 'green' | 'aquatic' | 'floral' | 'chypre' | 'woody' | 'amber' | 'gourmand' | 'leather' | 'oud';
  sillage: number;   // 1-10 intensity
  layering: number;  // 1-10 complexity/layering potential
  top: string;       // Comma-separated notes
  mid: string;
  base: string;
  roles: string[];   // Assigned roles (e.g., ['casual', 'work'])
  description?: string;
  
  // Computed properties (added during initialization)
  _profile?: SensoryProfile;
  _nameL: string;
  _brandL: string;
  _nTop: string[];
  _nMid: string[];
  _nBase: string[];
  _nAll: string[];
}

export interface SensoryProfile {
  freshness: number;  // 0-1
  sweetness: number;
  warmth: number;
  intensity: number;
  complexity: number;
}

export interface Note {
  name: string;
  family: string;
  desc: string;
  _tier?: 'top' | 'mid' | 'base';
}

export interface Brand {
  id: string;
  name: string;
  desc?: string;
  tier?: 'designer' | 'niche' | 'artisanal';
}

export interface Role {
  id: string;
  name: string;
  sym: string;
  desc: string;
}
