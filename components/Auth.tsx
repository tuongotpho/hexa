import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '../services/supabase';

const AuthComponent: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-lg shadow-lg">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-white">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            to start chatting
          </p>
        </div>
        <Auth
          supabaseClient={supabase}
          appearance={{ theme: ThemeSupa }}
          // 🛠️ FIX: The 'providers' prop has been removed to resolve the "Unsupported provider" error.
          // This error occurs when the social login providers (e.g., Google, GitHub) are not enabled
          // in your Supabase project's Authentication settings.
          //
          // To re-enable social logins:
          // 1. Go to your Supabase project dashboard.
          // 2. Navigate to Authentication > Providers.
          // 3. Enable the providers you want to use (e.g., Google, GitHub).
          // 4. Once enabled, you can add the following line back:
          //    providers={['google', 'github']}
          theme="dark"
          socialLayout="horizontal"
        />
      </div>
    </div>
  );
};

export default AuthComponent;
