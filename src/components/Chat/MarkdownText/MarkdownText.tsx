import { MarkdownTextPrimitive } from '@assistant-ui/react-markdown';
import type React from 'react';
import remarkGfm from 'remark-gfm';

const MarkdownLink: React.FC<React.ComponentPropsWithoutRef<'a'>> = ({
  children,
  ...props
}) => (
  <a {...props} target="_blank" rel="noreferrer noopener">
    {children}
  </a>
);

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
