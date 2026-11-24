import React from 'react';
import { AdminPortalContent } from './AdminSection';

interface AdminDashboardModalProps {
  onClose: () => void;
}

export const AdminDashboardModal: React.FC<AdminDashboardModalProps> = ({
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-6xl my-auto max-h-[92vh] overflow-y-auto rounded-2xl">
        <AdminPortalContent isModal onClose={onClose} />
      </div>
    </div>
  );
};
