import { MarkdownTextPrimitive } from '@assistant-ui/react-markdown';
import type React from 'react';
import remarkGfm from 'remark-gfm';

const SAFE_LINK_PROTOCOLS = new Set(['http:', 'https:', 'mailto:', 'tel:']);

const isSafeLink = (href: string | undefined): href is string => {
  if (!href) return false;

  try {
    return SAFE_LINK_PROTOCOLS.has(
      new URL(href, window.location.origin).protocol,
    );
  } catch {
    return false;
  }
};

const MarkdownLink: React.FC<React.ComponentPropsWithoutRef<'a'>> = ({
  children,
  href,
  ...props
}) => {
  if (!isSafeLink(href)) return <span>{children}</span>;

  return (
    <a {...props} href={href} target="_blank" rel="noreferrer noopener">
      {children}
    </a>
  );
};

const markdownComponents = {
  a: MarkdownLink,
};
const remarkPlugins = [remarkGfm];

export const MarkdownText: React.FC = () => {
  return (
    <MarkdownTextPrimitive
      className="chat-markdown"
      remarkPlugins={remarkPlugins}
      components={markdownComponents}
    />
  );
};
