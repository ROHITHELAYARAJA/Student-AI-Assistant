import React, { useEffect, useState } from 'react';
import { router, RouteState } from './services/router';
import { StudyWorkspace } from './components/workspace/StudyWorkspace';
import ModernLoginSignup from './components/ui/modern-login-signup';

export const App: React.FC = () => {
  const [route, setRoute] = useState<RouteState>(router.getState());

  useEffect(() => {
    return router.subscribe(next => setRoute(next));
  }, []);

  if (route.routeName === 'login' || route.routeName === 'signup') {
    return (
      <ModernLoginSignup
        defaultMode={route.routeName === 'signup' ? 'signup' : 'login'}
        onCancel={() => router.navigate('/dashboard')}
        onSuccess={() => router.navigate('/dashboard')}
      />
    );
  }

  return <StudyWorkspace />;
};
