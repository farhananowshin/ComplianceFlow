import { ComplianceRecord, RenewalItem } from '../types';

/**
 * Utility function to convert JSON objects into downloadable CSV string
 */
export function exportToCSV(filename: string, headers: string[], rows: (string | number | boolean)[][]) {
  const escapeCSV = (val: string | number | boolean) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const csvContent = [
    headers.map(escapeCSV).join(','),
    ...rows.map((row) => row.map(escapeCSV).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export Compliance Summary CSV
 */
export function exportComplianceSummaryCSV(records: ComplianceRecord[]) {
  const headers = [
    'Record Code',
    'Title',
    'Category',
    'Issuing Authority',
    'Issue Date',
    'Expiry Date',
    'Status',
    'Risk Level',
    'Estimated Cost (BDT)',
    'Tags',
  ];

  const rows = records.map((r) => [
    r.code,
    r.title,
    r.category,
    r.issuingAuthority || 'N/A',
    r.issueDate,
    r.expiryDate,
    r.status,
    r.riskLevel,
    r.estimatedCost || 0,
    (r.tags || []).join('; '),
  ]);

  exportToCSV('Compliance_Summary_Report', headers, rows);
}

/**
 * Export Expired Documents CSV
 */
export function exportExpiredDocumentsCSV(records: ComplianceRecord[]) {
  const nowMs = Date.now();
  const expired = records.filter((r) => {
    const daysLeft = Math.ceil((new Date(r.expiryDate).getTime() - nowMs) / 86400000);
    return daysLeft < 0 || r.status === 'expired';
  });

  const headers = [
    'Record Code',
    'Title',
    'Category',
    'Issuing Authority',
    'Expiry Date',
    'Days Overdue',
    'Risk Level',
    'Estimated Cost (BDT)',
  ];

  const rows = expired.map((r) => {
    const daysLeft = Math.ceil((new Date(r.expiryDate).getTime() - nowMs) / 86400000);
    return [
      r.code,
      r.title,
      r.category,
      r.issuingAuthority || 'N/A',
      r.expiryDate,
      Math.abs(daysLeft),
      r.riskLevel,
      r.estimatedCost || 0,
    ];
  });

  exportToCSV('Expired_Compliance_Documents', headers, rows);
}

/**
 * Export Renewal History Logs CSV
 */
export function exportRenewalHistoryCSV(renewals: RenewalItem[]) {
  const headers = [
    'Renewal ID',
    'Record Code',
    'Document Title',
    'Current Stage',
    'Target Expiry Date',
    'Vendor Name',
    'Estimated Cost (BDT)',
    'Requested Date',
    'Completed Date',
  ];

  const rows = renewals.map((rn) => [
    rn.id,
    rn.recordCode,
    rn.title,
    rn.currentStage,
    rn.targetExpiryDate,
    rn.vendorName || 'Unassigned',
    rn.estimatedCost || 0,
    rn.requestedAt,
    rn.completedAt || 'N/A',
  ]);

  exportToCSV('Renewal_History_Logs', headers, rows);
}
