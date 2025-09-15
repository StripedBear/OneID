"use client";

import React from "react";
import { Phone, Mail, MessageCircle, Send, Globe, Github, Instagram, Linkedin, Twitter, Link as LinkIcon, Copy } from "lucide-react";
import CopyButton from "./CopyButton";

interface SocialChannelProps {
  channel: {
    id: number;
    type: string;
    label?: string | null;
    value: string;
  };
}

// Helper function to generate social media links
const getSocialLink = (type: string, value: string): string => {
  switch (type) {
    case 'phone':
      return `tel:${value}`;
    case 'email':
      return `mailto:${value}`;
    case 'telegram':
      return `https://t.me/${value.replace('@', '')}`;
    case 'whatsapp':
      return `https://wa.me/${value.replace(/[^\d]/g, '')}`;
    case 'instagram':
      return `https://instagram.com/${value.replace('@', '')}`;
    case 'twitter':
      return `https://twitter.com/${value.replace('@', '')}`;
    case 'linkedin':
      return value.startsWith('http') ? value : `https://linkedin.com/in/${value}`;
    case 'github':
      return `https://github.com/${value.replace('@', '')}`;
    case 'website':
      return value.startsWith('http') ? value : `https://${value}`;
    default:
      return value.startsWith('http') ? value : `https://${value}`;
  }
};

// Helper function to get channel icon
const getChannelIcon = (type: string, className: string = "w-6 h-6") => {
  const iconMap: Record<string, React.ReactElement> = {
    phone: <Phone className={className} />,
    email: <Mail className={className} />,
    telegram: <Send className={className} />,
    whatsapp: <MessageCircle className={className} />,
    signal: <MessageCircle className={className} />,
    instagram: <Instagram className={className} />,
    twitter: <Twitter className={className} />,
    facebook: <LinkIcon className={className} />,
    linkedin: <Linkedin className={className} />,
    website: <Globe className={className} />,
    github: <Github className={className} />,
    custom: <LinkIcon className={className} />,
  };
  return iconMap[type] ?? <LinkIcon className={className} />;
};

// Helper function to get channel display name
const getChannelDisplayName = (type: string, label?: string | null): string => {
  if (label) return label;
  
  const typeMap: Record<string, string> = {
    phone: 'Phone',
    email: 'Email',
    telegram: 'Telegram',
    whatsapp: 'WhatsApp',
    signal: 'Signal',
    instagram: 'Instagram',
    twitter: 'Twitter',
    facebook: 'Facebook',
    linkedin: 'LinkedIn',
    website: 'Website',
    github: 'GitHub',
    custom: 'Custom',
  };
  return typeMap[type] ?? type;
};

export default function SocialChannel({ channel }: SocialChannelProps) {
  const { type, label, value } = channel;
  const socialLink = getSocialLink(type, value);
  const displayName = getChannelDisplayName(type, label);

  return (
    <div className="group relative">
      {/* Main social media button */}
      <a
        href={socialLink}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center w-16 h-16 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors duration-200 shadow-lg hover:shadow-xl"
        title={`Open ${displayName}`}
      >
        <div className="text-white">
          {getChannelIcon(type, "w-8 h-8")}
        </div>
      </a>
      
      {/* Copy button overlay */}
      <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <CopyButton 
          value={value}
          size="sm"
        />
      </div>
      
      {/* Channel label */}
      <div className="mt-2 text-center">
        <p className="text-xs text-slate-300 font-medium truncate max-w-16">
          {displayName}
        </p>
      </div>
    </div>
  );
}
