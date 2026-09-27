import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { useQuery } from '@tanstack/react-query';
import { userAPI } from '../../api/endpoints/user';
import { ProfileIcon, EmailIcon } from '../../assets/data/icons';

export default function MyProfile() {
  const { user } = useAuthStore();
  const { userRole } = useUIStore();
  const userId = user?._id || user?.id;
  const { data: fresh } = useQuery({
    queryKey: ['profile', userId],
    queryFn: () => userAPI.getProfile(userId).then(r=>r.data),
    enabled: !!userId,
  });
  const u = fresh?.data || fresh?.user || user || {};
  const email = u.email || u.userEmail || 'N/A';
  const name = u.name || u.userName || 'N/A';
  const phone = u.phone || u.userPhone || 'N/A';
  const role = u.role || (userRole==='seller' ? 'admin/seller' : userRole);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold font-serif mb-6">My Profile</h1>
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="bg-green-footer border-b border-green-border p-6 flex items-center gap-4">
          <span className="w-16 h-16 rounded-full bg-white border-2 border-green-border flex items-center justify-center text-primary"><ProfileIcon size={36} /></span>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{name}</h2>
            <p className="text-sm text-gray-600 flex items-center gap-1.5"><EmailIcon /> {email}</p>
            <span className="inline-block mt-2 text-xs bg-white border border-green-border text-primary px-3 py-1 rounded-full font-medium capitalize">{role}</span>
          </div>
        </div>
        <div className="p-6 grid sm:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4"><p className="text-xs text-gray-500 uppercase">Full Name</p><p className="font-medium mt-1">{name}</p></div>
          <div className="bg-gray-50 rounded-lg p-4"><p className="text-xs text-gray-500 uppercase">Email</p><p className="font-medium mt-1 break-all">{email}</p></div>
          <div className="bg-gray-50 rounded-lg p-4"><p className="text-xs text-gray-500 uppercase">Phone</p><p className="font-medium mt-1">{phone}</p></div>
          <div className="bg-gray-50 rounded-lg p-4"><p className="text-xs text-gray-500 uppercase">Member Since</p><p className="font-medium mt-1">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</p></div>
        </div>
        <div className="px-6 pb-6">
          <details className="text-xs bg-gray-50 rounded p-3">
            <summary className="cursor-pointer font-medium">Debug (raw user)</summary>
            <pre className="mt-2 overflow-auto">{JSON.stringify(u, null, 2)}</pre>
          </details>
        </div>
      </div>
    </div>
  );
}
