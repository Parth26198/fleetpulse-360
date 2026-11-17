import { prisma } from '../lib/prisma';
import PDFDocument from 'pdfkit';

export class InvoiceService {
  static async listInvoices(companyId: string, status?: string) {
    const where: any = { companyId };
    if (status) where.status = status;

    return prisma.invoice.findMany({
      where,
      include: {
        client: true,
        items: true,
      },
      orderBy: { invoiceDate: 'desc' },
    });
  }

  static async getInvoiceById(companyId: string, id: string) {
    const invoice = await prisma.invoice.findFirst({
      where: { id, companyId },
      include: {
        client: true,
        items: true,
        company: true,
      },
    });
    if (!invoice) throw new Error('Invoice not found.');
    return invoice;
  }

  static async createInvoice(companyId: string, data: any) {
    const subtotal = Number(data.subtotal || 0);
    const taxRate = Number(data.taxRate || 0.05); // 5% GST
    const taxAmount = Number((subtotal * taxRate).toFixed(2));
    const totalAmount = Number((subtotal + taxAmount).toFixed(2));

    const invoice = await prisma.invoice.create({
      data: {
        companyId,
        clientId: data.clientId,
        invoiceNumber: data.invoiceNumber || `INV-${Date.now()}`,
        invoiceDate: data.invoiceDate ? new Date(data.invoiceDate) : new Date(),
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        subtotal,
        taxAmount,
        totalAmount,
        paidAmount: 0,
        balanceAmount: totalAmount,
        status: data.status || 'SENT',
        notes: data.notes || null,
      },
    });

    if (data.items && Array.isArray(data.items)) {
      for (const item of data.items) {
        await prisma.invoiceItem.create({
          data: {
            invoiceId: invoice.id,
            description: item.description,
            vehicleType: item.vehicleType || null,
            tripCount: item.tripCount || 1,
            rate: Number(item.rate),
            amount: Number(item.amount),
          },
        });
      }
    }

    return invoice;
  }

  static async recordPayment(companyId: string, id: string, amount: number) {
    const invoice = await this.getInvoiceById(companyId, id);
    const newPaid = invoice.paidAmount + amount;
    const newBalance = Math.max(0, invoice.totalAmount - newPaid);
    const newStatus = newBalance === 0 ? 'PAID' : (newPaid > 0 ? 'PARTIAL' : invoice.status);

    return prisma.invoice.update({
      where: { id },
      data: {
        paidAmount: newPaid,
        balanceAmount: newBalance,
        status: newStatus,
      },
    });
  }

  static async generateInvoicePDF(companyId: string, id: string): Promise<Buffer> {
    const invoice = await this.getInvoiceById(companyId, id);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 40 });
      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', reject);

      // Header
      doc.fontSize(22).fillColor('#0F172A').text('FLEETPULSE 360', 40, 40);
      doc.fontSize(10).fillColor('#64748B').text('Transport & Fleet Operations SaaS', 40, 68);
      doc.fontSize(16).fillColor('#F97316').text('TAX INVOICE', 450, 40, { align: 'right' });
      doc.fontSize(10).fillColor('#334155').text(`Invoice #: ${invoice.invoiceNumber}`, 350, 65, { align: 'right' });
      doc.text(`Date: ${invoice.invoiceDate.toISOString().split('T')[0]}`, 350, 80, { align: 'right' });
      doc.text(`Status: ${invoice.status}`, 350, 95, { align: 'right' });

      doc.moveTo(40, 115).lineTo(570, 115).strokeColor('#E2E8F0').stroke();

      // Billed To & Service Provider
      doc.fontSize(11).fillColor('#0F172A').text('SERVICE PROVIDER:', 40, 130);
      doc.fontSize(10).fillColor('#475569').text(invoice.company.name, 40, 145);
      doc.text(invoice.company.address || 'Pune, Maharashtra', 40, 160);
      doc.text(`GSTIN: ${invoice.company.gstNumber || '27AAECP1234F1Z8'}`, 40, 175);

      doc.fontSize(11).fillColor('#0F172A').text('BILLED TO (CLIENT):', 320, 130);
      doc.fontSize(10).fillColor('#475569').text(invoice.client.name, 320, 145);
      doc.text(invoice.client.address || 'Corporate Park, Pune', 320, 160);
      doc.text(`Contact: ${invoice.client.billingContact || invoice.client.officeContact || 'N/A'}`, 320, 175);

      doc.moveTo(40, 200).lineTo(570, 200).strokeColor('#E2E8F0').stroke();

      // Table Header
      let y = 215;
      doc.rect(40, y, 530, 24).fill('#F1F5F9');
      doc.fontSize(10).fillColor('#1E293B').text('Description', 50, y + 7);
      doc.text('Vehicle', 260, y + 7);
      doc.text('Trips', 350, y + 7, { align: 'center', width: 50 });
      doc.text('Rate (INR)', 420, y + 7, { align: 'right', width: 60 });
      doc.text('Amount (INR)', 490, y + 7, { align: 'right', width: 70 });

      y += 30;
      doc.fillColor('#334155');

      if (invoice.items.length === 0) {
        doc.text(invoice.notes || 'Monthly employee transportation service package', 50, y);
        doc.text('Fleet', 260, y);
        doc.text('1', 350, y, { align: 'center', width: 50 });
        doc.text(invoice.subtotal.toFixed(2), 420, y, { align: 'right', width: 60 });
        doc.text(invoice.subtotal.toFixed(2), 490, y, { align: 'right', width: 70 });
        y += 24;
      } else {
        for (const item of invoice.items) {
          doc.text(item.description, 50, y);
          doc.text(item.vehicleType || 'Sedan/SUV', 260, y);
          doc.text(String(item.tripCount), 350, y, { align: 'center', width: 50 });
          doc.text(item.rate.toFixed(2), 420, y, { align: 'right', width: 60 });
          doc.text(item.amount.toFixed(2), 490, y, { align: 'right', width: 70 });
          y += 20;
        }
      }

      // Summary lines
      doc.moveTo(40, y + 10).lineTo(570, y + 10).strokeColor('#E2E8F0').stroke();
      y += 20;
      doc.fontSize(10).text('Subtotal:', 380, y, { align: 'right', width: 100 });
      doc.text(`INR ${invoice.subtotal.toFixed(2)}`, 490, y, { align: 'right', width: 70 });
      y += 18;
      doc.text('GST (5%):', 380, y, { align: 'right', width: 100 });
      doc.text(`INR ${invoice.taxAmount.toFixed(2)}`, 490, y, { align: 'right', width: 70 });
      y += 18;
      doc.fontSize(11).fillColor('#0F172A').text('Total Payable:', 380, y, { align: 'right', width: 100 });
      doc.text(`INR ${invoice.totalAmount.toFixed(2)}`, 490, y, { align: 'right', width: 70 });

      y += 25;
      doc.fontSize(10).fillColor('#16A34A').text(`Paid: INR ${invoice.paidAmount.toFixed(2)}`, 380, y, { align: 'right', width: 100 });
      y += 16;
      doc.fillColor('#DC2626').text(`Balance Due: INR ${invoice.balanceAmount.toFixed(2)}`, 380, y, { align: 'right', width: 100 });

      // Footer
      doc.fontSize(9).fillColor('#94A3B8').text(
        'Thank you for your business. For billing queries, contact billing@shreejlogistics.com.',
        40,
        720,
        { align: 'center', width: 530 }
      );

      doc.end();
    });
  }
}
