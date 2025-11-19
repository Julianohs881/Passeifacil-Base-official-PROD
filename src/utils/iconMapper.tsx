import React from 'react';
import {
  Apple,
  Wrench,
  Heart,
  Scale,
  Briefcase,
  Brain,
  GraduationCap,
  Code,
  Home,
  TrendingUp,
  BookOpen,
  Dna,
  Atom,
  FlaskConical,
  Calculator,
  LucideIcon
} from 'lucide-react';

// Mapeamento de nomes de ícones para componentes do Lucide React
const iconMap: Record<string, LucideIcon> = {
  'Apple': Apple,
  'Wrench': Wrench,
  'Heart': Heart,
  'Scale': Scale,
  'Briefcase': Briefcase,
  'Brain': Brain,
  'GraduationCap': GraduationCap,
  'Code': Code,
  'Home': Home,
  'TrendingUp': TrendingUp,
  'BookOpen': BookOpen,
  'Dna': Dna,
  'Atom': Atom,
  'FlaskConical': FlaskConical,
  'Calculator': Calculator,
};

/**
 * Converte um nome de ícone (string) em um componente do Lucide React
 * @param iconName - Nome do ícone (ex: 'Apple', 'Heart')
 * @param className - Classes CSS opcionais para o ícone
 * @param size - Tamanho do ícone (padrão: 16)
 * @returns Componente React do ícone ou null se não encontrado
 */
export const getIconComponent = (
  iconName: string | null | undefined,
  className?: string,
  size: number = 16
): React.ReactNode => {
  if (!iconName) return null;

  // Verificar se é um emoji (para compatibilidade com dados mockados)
  const emojiRegex = /[\u{1F300}-\u{1F9FF}]/u;
  if (emojiRegex.test(iconName)) {
    return <span className={className}>{iconName}</span>;
  }

  // Buscar o componente do ícone no mapeamento
  const IconComponent = iconMap[iconName];
  
  if (!IconComponent) {
    // Se não encontrar, retornar o texto como fallback
    console.warn(`Ícone não encontrado: ${iconName}`);
    return <span className={className}>{iconName}</span>;
  }

  // Renderizar o componente do ícone usando JSX
  const Icon = IconComponent;
  return <Icon className={className} size={size} aria-hidden="true" />;
};

