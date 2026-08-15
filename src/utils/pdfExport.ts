import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { ComplianceRecord } from '../types';
import { format } from 'date-fns';

export const exportRecordsToPDF = (records: ComplianceRecord[], title: string, filename: string) => {
  const doc = new jsPDF('landscape');

  // Add Company Logo or Header
  doc.setFontSize(22);
  doc.setTextColor(30, 58, 138); // Tailwind blue-900
  doc.text('ComplianceFlow', 14, 20);

  doc.setFontSize(14);
  doc.setTextColor(51, 65, 85); // Tailwind slate-700
  doc.text(title, 14, 30);
  
  doc.setFontSize(10);
  doc.text(`Generated on: ${format(new Date(), 'MMM dd, yyyy')}`, 14, 36);
  doc.text(`Total Records: ${records.length}`, 14, 42);

  const tableColumn = ["Title", "Code", "Department", "Authority", "Status", "Priority", "Expiry Date"];
  const tableRows: any[] = [];

  records.forEach(record => {
    const recordData = [
      record.title,
      record.code,
      record.department || 'N/A',
      record.issuingAuthority || 'N/A',
      record.status,
      record.priority || record.riskLevel || 'N/A',
      record.expiryDate ? format(new Date(record.expiryDate), 'MMM dd, yyyy') : 'N/A'
    ];
    tableRows.push(recordData);
  });

  (doc as any).autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 50,
    theme: 'striped',
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255] }, // blue-600
    alternateRowStyles: { fillColor: [248, 250, 252] }, // slate-50
    didParseCell: function (data: any) {
      if (data.section === 'body' && data.column.index === 4) { // Status column
        const status = data.cell.raw;
        if (status === 'ACTIVE') {
          data.cell.styles.textColor = [5, 150, 105]; // emerald-600
          data.cell.styles.fontStyle = 'bold';
        } else if (status === 'EXPIRING_SOON') {
          data.cell.styles.textColor = [217, 119, 6]; // amber-600
          data.cell.styles.fontStyle = 'bold';
        } else if (status === 'EXPIRED') {
          data.cell.styles.textColor = [225, 29, 72]; // rose-600
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });

  doc.save(`${filename}.pdf`);
};
