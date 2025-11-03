'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Shield, Clock, Save } from 'lucide-react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function AdminSettingsPage() {
  const { user, hasRole } = useAuth();
  const [sessionDuration, setSessionDuration] = useState(1);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const supabase = createClientComponentClient();

  useEffect(() => {
    if (user) {
      setSessionDuration(user.session_duration_hours || 1);
    }
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    setMessage('');

    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ session_duration_hours: sessionDuration })
        .eq('id', user.id);

      if (error) throw error;

      setMessage('Settings saved successfully!');
    } catch (error: any) {
      setMessage(`Error: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (!hasRole(['admin'])) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <Shield className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d5a8f] border-b border-blue-900/20">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <h1 className="text-4xl font-bold text-white mb-4">Admin Settings</h1>
          <p className="text-xl text-blue-100">Configure authentication and security settings</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Card className="p-8">
          <div className="flex items-center gap-3 mb-6">
            <Clock className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold text-gray-900">Session Duration</h2>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Active Session Duration (hours)
              </label>
              <input
                type="number"
                min="1"
                max="168"
                value={sessionDuration}
                onChange={(e) => setSessionDuration(parseInt(e.target.value))}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-2 text-sm text-gray-500">
                How long users stay signed in before requiring re-authentication. Max: 168 hours (7 days)
              </p>
            </div>

            {message && (
              <div className={`p-4 rounded-lg ${message.includes('Error') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {message}
              </div>
            )}

            <Button
              onClick={handleSave}
              disabled={saving}
              size="lg"
              className="w-full"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="w-5 h-5" />
                  Save Settings
                </span>
              )}
            </Button>
          </div>
        </Card>

        {/* Security Info */}
        <div className="mt-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">🔐 Security Standards</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• AES-256 encryption at rest</li>
            <li>• TLS 1.3 in transit</li>
            <li>• FIDO2/WebAuthn ready</li>
            <li>• JWT token rotation</li>
            <li>• Military-grade cryptography (NIST approved)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
