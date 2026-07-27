import type React from 'react';

import type { ChatIconName, ChatIconProps } from '@app/types';

export const ChatIcon: React.FC<ChatIconProps> = ({
  name,
  className = 'size-5',
}) => {
  const paths: Record<ChatIconName, React.ReactNode> = {
    'arrow-down': <path d="m7 10 5 5 5-5" />,
    close: (
      <>
        <path d="m6 6 12 12" />
        <path d="M18 6 6 18" />
      </>
    ),
    copy: (
      <>
        <rect width="13" height="13" x="9" y="9" rx="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
      </>
    ),
    expand: (
      <>
        <path d="M15 3h6v6" />
        <path d="m21 3-7 7" />
        <path d="m3 21 7-7" />
        <path d="M9 21H3v-6" />
      </>
    ),
    'external-link': (
      <>
        <path d="M15 3h6v6" />
        <path d="m10 14 11-11" />
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      </>
    ),
    plus: (
      <>
        <path d="M12 5v14" />
        <path d="M5 12h14" />
      </>
    ),
    retry: (
      <>
        <path d="M20 6v5h-5" />
        <path d="M20 11a8 8 0 1 0-2.3 5.7" />
      </>
    ),
    send: (
      <>
        <path d="m22 2-7 20-4-9-9-4Z" />
        <path d="M22 2 11 13" />
      </>
    ),
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />,
    sparkles: (
      <>
        <path d="m12 3-1.4 3.6L7 8l3.6 1.4L12 13l1.4-3.6L17 8l-3.6-1.4Z" />
        <path d="m5 14-.8 2.2L2 17l2.2.8L5 20l.8-2.2L8 17l-2.2-.8Z" />
        <path d="m19 14-.8 2.2L16 17l2.2.8L19 20l.8-2.2L22 17l-2.2-.8Z" />
      </>
    ),
    stop: <rect width="10" height="10" x="7" y="7" rx="1" />,
  };

  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
};
