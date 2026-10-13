import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { AuditLog } from '../../types';
import { History, Shield, CheckCircle } from 'lucide-react';

interface AdminAuditLogsProps {
  logs: AuditLog[];
}

export const AdminAuditLogs: React.FC<AdminAuditLogsProps> = ({ logs }) => {
  const { isRTL } = useLanguage();

  return (
    <div className="space-y-6 text-start">
      <div>
        <h2 className="text-xl sm:text-2xl font-serif font-medium text-[#1F1C18]">
          {isRTL ? 'سجل العمليات والتدقيق الإداري (Audit Trail)' : 'Administrative Audit Trail'}
        </h2>
        <p className="text-xs sm:text-sm text-[#736B5E]">
          {isRTL
            ? 'سجل غير قابل للتعديل يوثق جميع التغييرات الحساسة (الأسعار، الحجوزات، المصروفات)'
            : 'Immutable ledger tracking sensitive operations per Egyptian compliance and security policies'}
        </p>
      </div>

      <div className="rounded-xl bg-[#FAF7F2] border border-[#DECDB8] overflow-hidden shadow-xs">
        {logs.length === 0 ? (
          <div className="text-center py-12 text-[#736B5E] text-sm">
            {isRTL ? 'لا توجد سجلات تدقيق حتى الآن.' : 'No audit records yet.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-xs text-start">
              <thead className="bg-[#F3ECE2] border-b border-[#DECDB8] text-[#4A4235] font-semibold">
                <tr>
                  <th className="py-3 px-4">{isRTL ? 'الوقت والتاريخ' : 'Timestamp'}</th>
                  <th className="py-3 px-4">{isRTL ? 'نوع العملية' : 'Action Type'}</th>
                  <th className="py-3 px-4">{isRTL ? 'المسؤول' : 'Actor Email'}</th>
                  <th className="py-3 px-4">{isRTL ? 'التفاصيل' : 'Details'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBE1D3] bg-white">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="py-3 px-4 font-mono text-[#5D5548]" dir="ltr">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#8A714C]">
                      {log.action}
                    </td>
                    <td className="py-3 px-4 font-mono text-[#1F1C18]">
                      {log.actorEmail}
                    </td>
                    <td className="py-3 px-4 text-[#4A4337]">
                      {log.details}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
