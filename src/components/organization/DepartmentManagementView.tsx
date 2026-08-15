import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Users, Building2, ShieldCheck, CheckCircle2, Search, Plus, BarChart2 } from 'lucide-react';

export default function DepartmentManagementView() {
  const [departments] = useState([
    {
      id: 'dept-1',
      name: 'Legal, Tax & Regulatory Affairs',
      code: 'LEG-TAX',
      head: 'Nusrat Jahan',
      recordCount: 14,
      complianceHealth: 96,
      budget: '৳2,50,000'
    },
    {
      id: 'dept-2',
      name: 'Environment, Health & Safety (EHS)',
      code: 'EHS-SAF',
      head: 'Tariq Rahman',
      recordCount: 18,
      complianceHealth: 88,
      budget: '৳4,10,000'
    },
    {
      id: 'dept-3',
      name: 'Finance, Accounts & Audit',
      code: 'FIN-ACC',
      head: 'Mahmud Hasan',
      recordCount: 12,
      complianceHealth: 100,
      budget: '৳1,80,000'
    },
    {
      id: 'dept-4',
      name: 'Human Resources & Labor Compliance',
      code: 'HR-LAB',
      head: 'Amina Begum',
      recordCount: 9,
      complianceHealth: 92,
      budget: '৳1,20,000'
    }
  ]);

  return (
    <div className="space-y-6 text-slate-100 pb-12">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-white">Department Compliance Management</h1>
            <p className="text-xs text-slate-400">
              Departmental breakdown, compliance health ratings, assigned permit counts, and annual renewal budgets.
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {departments.map((dept) => (
          <motion.div
            key={dept.id}
            whileHover={{ y: -2 }}
            className="bg-slate-900 border border-slate-800 rounded-lg p-5 shadow-xl space-y-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono text-[10px] font-bold text-blue-400">{dept.code}</span>
                <h3 className="text-sm font-bold text-white">{dept.name}</h3>
                <p className="text-xs text-slate-400">Head of Dept: <strong className="text-slate-200">{dept.head}</strong></p>
              </div>

              <div className="text-right">
                <span className="text-xl font-black text-emerald-400">{dept.complianceHealth}%</span>
                <p className="text-[10px] text-slate-500 uppercase font-bold">Health Score</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 font-medium">Active Permits</span>
                <div className="text-lg font-bold text-white">{dept.recordCount} Records</div>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-500 font-medium">Allocated Budget</span>
                <div className="text-lg font-bold text-blue-400">{dept.budget}</div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
