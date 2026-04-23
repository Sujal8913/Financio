import { useState, useContext, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import AuthContext from '../context/AuthContext';
import api from '../api/axios';
import toast from 'react-hot-toast';
import { User, Mail, Globe, Save, Camera } from 'lucide-react';

const CURRENCIES = ['USD','EUR','GBP','INR','JPY','CAD','AUD'];

export default function Profile() {
  const { user, setUser } = useContext(AuthContext);
  const [form, setForm] = useState({ name: user?.name || '', currency: user?.currency || 'USD', avatar: user?.avatar || '' });
  const fileInputRef = useRef(null);
  const [pwForm, setPwForm] = useState({ current: '', newPw: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.patch('/auth/me', { name: form.name, currency: form.currency, avatar: form.avatar });
      setUser(data);
      toast.success('Profile updated!');
    } catch(err) { toast.error(err.response?.data?.message || 'Failed'); }
    setSaving(false);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return toast.error('Image must be less than 5MB');
      const reader = new FileReader();
      reader.onloadend = () => setForm({ ...form, avatar: reader.result });
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar title="Profile & Settings" />
        <main className="flex-1 overflow-y-auto p-6 space-y-6 max-w-3xl">
          
          <div className="card-glass p-6 flex items-center gap-5">
            <div className="relative group cursor-pointer inline-block" onClick={() => fileInputRef.current?.click()}>
              {form.avatar ? (
                <img src={form.avatar} alt="Profile" className="w-24 h-24 rounded-full object-cover shadow-lg border-2 border-border group-hover:border-primary transition-colors" />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg border-2 border-border group-hover:border-primary transition-colors">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="absolute bottom-0 right-0 bg-primary w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-md hover:scale-105 transition-transform cursor-pointer">
                <Camera className="text-white w-4 h-4" />
              </div>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageChange} className="hidden" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-textPrimary mb-1">{user?.name}</h2>
              <p className="text-textSecondary">{user?.email}</p>
            </div>
          </div>

          
          <div className="card-glass p-6">
            <h3 className="font-semibold text-textPrimary mb-4">Personal Information</h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-textPrimary mb-1">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" />
                  <input id="profile-name" type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field pl-10" placeholder="Your name" required />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-textPrimary mb-1">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" />
                  <input type="email" value={user?.email} disabled className="input-field pl-10 opacity-60 cursor-not-allowed" />
                </div>
                <p className="text-xs text-textSecondary mt-1">Email cannot be changed</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-textPrimary mb-1">Currency</label>
                  <div className="relative">
                    <Globe size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-textSecondary" />
                    <select id="profile-currency" value={form.currency} onChange={e => setForm({...form, currency: e.target.value})} className="input-field pl-10">
                      {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button id="profile-save" type="submit" disabled={saving} className="btn-primary">
                  <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>

          
          <div className="card-glass p-6">
            <h3 className="font-semibold text-textPrimary mb-4">Account Info</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                ['Member Since', user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'],
                ['Currency', form.currency],
              ].map(([label, value]) => (
                <div key={label} className="bg-surface-container rounded-md p-3">
                  <p className="text-xs text-textSecondary">{label}</p>
                  <p className="text-sm font-medium text-textPrimary mt-1">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
