import { useEffect } from 'react';
import { Language } from '../content/translations';

interface SeoHeadProps {
  lang: Language;
}

const SEO_METADATA: Record<
  Language,
  {
    title: string;
    description: string;
    ogLocale: string;
  }
> = {
  es: {
    title: 'VGskillframe (Videogame Skill Frame) — AI Skills, MCP Servers & Pipeline Blender 3D para Godot 4',
    description:
      'Mantén todos tus proyectos de Godot 4 y Blender 3D actualizados con las últimas AI Skills (SKILL.md), servidores Model Context Protocol (MCP) como Context7 (ctx7) y addons con un solo comando: npm i -g @francisiv/vgskillframe.',
    ogLocale: 'es_ES'
  },
  en: {
    title: 'VGskillframe (Videogame Skill Frame) — Automated AI Skills, MCP Servers & Blender Pipeline for Godot 4',
    description:
      'Keep all your Godot 4 and Blender 3D projects synchronized with curated AI Skills (SKILL.md), Model Context Protocol (MCP) servers like Context7 (ctx7), and addons with a single CLI command: npm i -g @francisiv/vgskillframe.',
    ogLocale: 'en_US'
  }
};

export function SeoHead({ lang }: SeoHeadProps) {
  useEffect(() => {
    const meta = SEO_METADATA[lang];
    document.documentElement.lang = lang;
    document.title = meta.title;

    const setMetaContent = (selector: string, content: string) => {
      const el = document.querySelector<HTMLMetaElement>(selector);
      if (el) {
        el.setAttribute('content', content);
      }
    };

    setMetaContent('meta[name="title"]', meta.title);
    setMetaContent('meta[name="description"]', meta.description);
    setMetaContent('meta[property="og:title"]', meta.title);
    setMetaContent('meta[property="og:description"]', meta.description);
    setMetaContent('meta[property="og:locale"]', meta.ogLocale);
    setMetaContent('meta[name="twitter:title"]', meta.title);
    setMetaContent('meta[name="twitter:description"]', meta.description);
  }, [lang]);

  return null;
}
