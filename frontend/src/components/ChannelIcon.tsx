import { Phone, Mail, MessageCircle, Send, Globe, Github, Instagram, Linkedin, Twitter, Link as LinkIcon } from "lucide-react";

export function ChannelIcon({ type }: { type: string }) {
  const iconMap: Record<string, JSX.Element> = {
    phone: <Phone />,
    email: <Mail />,
    telegram: <Send />,
    whatsapp: <MessageCircle />,
    signal: <MessageCircle />,
    instagram: <Instagram />,
    twitter: <Twitter />,
    facebook: <LinkIcon />,
    linkedin: <Linkedin />,
    website: <Globe />,
    github: <Github />,
    custom: <LinkIcon />,
  };
  return <span className="inline-flex w-5 h-5 items-center">{iconMap[type] ?? <LinkIcon />}</span>;
}
