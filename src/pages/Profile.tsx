import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { UserIcon, CameraIcon, SaveIcon, ShieldIcon, LogOutIcon } from 'lucide-react';
export const Profile: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    role: 'Administrator',
    department: 'Operations',
    phone: '+1 (555) 123-4567'
  });
  const handleSave = async () => {
    try {
      // Simulated API call
      await fetch('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(formData)
      });
      setIsEditing(false);
      // Show success toast
    } catch (error) {
      console.error('Error updating profile:', error);
      // Show error toast
    }
  };
  const handlePasswordChange = async (currentPassword: string, newPassword: string) => {
    try {
      // Simulated API call
      await fetch('/api/profile/password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword,
          newPassword
        })
      });
      setShowPasswordModal(false);
      // Show success toast
    } catch (error) {
      console.error('Error changing password:', error);
      // Show error toast
    }
  };
  return <div className="space-y-6">
      <Card>
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center">
                <UserIcon size={48} className="text-gray-400" />
              </div>
              <button className="absolute bottom-0 right-0 p-2 bg-white rounded-full shadow-lg border border-gray-200 hover:bg-gray-50">
                <CameraIcon size={16} className="text-gray-600" />
              </button>
            </div>
            <div className="ml-6">
              <h2 className="text-2xl font-semibold text-gray-800">
                {formData.name}
              </h2>
              <p className="text-gray-500">{formData.role}</p>
            </div>
          </div>
          <div className="space-x-3">
            {!isEditing ? <Button onClick={() => setIsEditing(true)}>Edit Profile</Button> : <div className="space-x-3">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button icon={<SaveIcon size={18} />} onClick={handleSave}>
                  Save Changes
                </Button>
              </div>}
          </div>
        </div>
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input type="text" value={formData.name} onChange={e => setFormData(prev => ({
            ...prev,
            name: e.target.value
          }))} disabled={!isEditing} className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48] disabled:bg-gray-50 disabled:text-gray-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input type="email" value={formData.email} onChange={e => setFormData(prev => ({
            ...prev,
            email: e.target.value
          }))} disabled={!isEditing} className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48] disabled:bg-gray-50 disabled:text-gray-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <input type="text" value={formData.department} onChange={e => setFormData(prev => ({
            ...prev,
            department: e.target.value
          }))} disabled={!isEditing} className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48] disabled:bg-gray-50 disabled:text-gray-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input type="tel" value={formData.phone} onChange={e => setFormData(prev => ({
            ...prev,
            phone: e.target.value
          }))} disabled={!isEditing} className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48] disabled:bg-gray-50 disabled:text-gray-500" />
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Security</h3>
          <div className="space-y-4">
            <Button variant="outline" icon={<ShieldIcon size={18} />} onClick={() => setShowPasswordModal(true)}>
              Change Password
            </Button>
            <Button variant="destructive" icon={<LogOutIcon size={18} />}>
              Sign Out
            </Button>
          </div>
        </div>
      </Card>
      <Modal isOpen={showPasswordModal} onClose={() => setShowPasswordModal(false)} title="Change Password">
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Current Password
            </label>
            <input type="password" className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input type="password" className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm New Password
            </label>
            <input type="password" className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#2C5B48] focus:border-[#2C5B48]" />
          </div>
          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="outline" onClick={() => setShowPasswordModal(false)}>
              Cancel
            </Button>
            <Button>Update Password</Button>
          </div>
        </form>
      </Modal>
    </div>;
};