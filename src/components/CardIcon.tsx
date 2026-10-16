import React from 'react';
import {
  Rocket,
  Atom,
  Flame,
  Shield,
  Sparkles,
  Zap,
  Brain,
  Gem,
  Compass,
  Cpu,
  Moon,
  Sun,
  Anchor,
  Target,
  Feather,
  Globe,
  Key,
  Music,
  Heart,
  Flag,
  Bell,
  Cloud,
  Crown,
  Eye,
  HelpCircle,
} from 'lucide-react';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Rocket,
  Atom,
  Flame,
  Shield,
  Sparkles,
  Zap,
  Brain,
  Gem,
  Compass,
  Cpu,
  Moon,
  Sun,
  Anchor,
  Target,
  Feather,
  Globe,
  Key,
  Music,
  Heart,
  Flag,
  Bell,
  Cloud,
  Crown,
  Eye,
};

interface CardIconProps {
  name: string;
  className?: string;
}

export const CardIcon: React.FC<CardIconProps> = ({ name, className = 'w-8 h-8' }) => {
  const IconComponent = ICON_MAP[name] || HelpCircle;
  return <IconComponent className={className} />;
};
