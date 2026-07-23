import { useState } from 'react';
import { defaultAddresses } from '../data/demo';
import type { Address } from '../types';

export default function ProfilePage() {
  const [profile, setProfile] = useState({
    name: 'Alex Johnson',
    phone: '+91 98765 43210',
    email: 'alex@email.com',
  });
  const [addresses] = useState<Address[]>([...defaultAddresses]);
  const [isEditing, setIsEditing] = useState(false);

  const handleSaveProfile = () => {
    setIsEditing(false);
    const userProfile = { ...profile, savedAddresses: addresses };
    localStorage.setItem('quickbite_profile', JSON.stringify(userProfile));
  };

  return (
    <div className="max-w-lg mx-auto pb-6">
      <div className="px-4 py-3 border-b border-gray-100 bg-white">
        <h1 className="text-xl font-bold">Profile</h1>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Avatar & Name */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <span className="text-3xl font-bold text-red-500">
              {profile.name.charAt(0)}
            </span>
          </div>
          <h2 className="font-bold text-lg">{profile.name}</h2>
          <p className="text-sm text-gray-500">{profile.email}</p>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="mt-3 text-sm font-medium text-red-500"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Editable Profile */}
        {isEditing && (
          <div className="bg-white rounded-2xl border border-gray-100 p-4 animate-fade-in space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="w-full mt-1 px-3 py-2.5 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:border-red-300 focus:ring-2 focus:ring-red-100 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</label>
              <input
                type="tel"
                value={profile.phone}
                onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                className="w-full mt-1 px-3 py-2.5 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:border-red-300 focus:ring-2 focus:ring-red-100 outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                className="w-full mt-1 px-3 py-2.5 bg-gray-50 rounded-xl text-sm border border-gray-200 focus:border-red-300 focus:ring-2 focus:ring-red-100 outline-none"
              />
            </div>
            <button
              onClick={handleSaveProfile}
              className="w-full bg-red-500 text-white py-2.5 rounded-xl font-medium text-sm hover:bg-red-600 transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}

        {/* Saved Addresses */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h3 className="font-semibold text-sm mb-3">Saved Addresses</h3>
          <div className="space-y-2">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl"
              >
                <span className="text-lg mt-0.5">
                  {addr.label === 'Home' ? '🏠' : '💼'}
                </span>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm">{addr.label}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {addr.street}, {addr.city}, {addr.state} {addr.zipCode}
                  </p>
                </div>
                {addr.isDefault && (
                  <span className="text-[10px] bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
                    Default
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* App Info */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <h3 className="font-semibold text-sm mb-2">About</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">App</span>
              <span className="font-medium">QuickBite v1.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Build</span>
              <span className="font-medium">PWA</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Platform</span>
              <span className="font-medium">Android</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
