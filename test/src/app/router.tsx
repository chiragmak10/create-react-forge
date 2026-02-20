import { Landing } from '@/features/misc/routes/Landing';
import { NotFound } from '@/features/misc/routes/NotFound';
import { useRoutes } from 'react-router-dom';

export function AppRouter() {
  const routes = useRoutes([
    {
      path: '/',
      element: <Landing />,
    },
    {
      path: '*',
      element: <NotFound />,
    },
  ]);

  return routes;
}

