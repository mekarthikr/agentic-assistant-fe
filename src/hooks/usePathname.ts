import { useCallback, useEffect, useState } from 'react';

export function usePathname() {
  const [pathname, setPathname] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setPathname(window.location.pathname);

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((path: string) => {
    if (path === window.location.pathname) return;

    window.history.pushState({}, '', path);
    setPathname(path);
  }, []);

  return { pathname, navigate };
}
