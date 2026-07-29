import { useCallback, useEffect, useState } from 'react';

export function usePathname() {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname);

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((path: string) => {
    const target = new URL(path, window.location.origin);

    if (
      target.pathname === window.location.pathname &&
      target.search === window.location.search
    ) {
      return;
    }

    window.history.pushState({}, '', path);
    setPathname(window.location.pathname);
  }, []);

  return { pathname, navigate };
}
