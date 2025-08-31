import React from "react";
import { Phone, Mail, MessageCircle, Send, Globe, Github, Instagram, Linkedin, Twitter, Link as LinkIcon } from "lucide-react";

export function ChannelIcon({ type, className = "w-5 h-5" }: { type: string; className?: string }) {
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
  return <span className="inline-flex items-center">{iconMap[type] ?? <LinkIcon className={className} />}</span>;
}
