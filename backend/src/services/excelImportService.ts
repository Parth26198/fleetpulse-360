import ExcelJS from 'exceljs';
import { prisma } from '../lib/prisma';

export class ExcelImportService {
  static async inspectWorkbook(buffer: Buffer) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);

    const sheets = workbook.worksheets.map((ws) => {
      const rowCount = ws.actualRowCount;
      const colCount = ws.actualColumnCount;

      const previewRows: any[] = [];
      ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
        if (rowNumber <= 6) {
          const cells: string[] = [];
          row.eachCell({ includeEmpty: true }, (cell) => {
            cells.push(cell.value ? String(cell.value).substring(0, 50) : '');
          });
          previewRows.push({ rowNumber, cells: cells.slice(0, 15) });
        }
      });

      return {
        name: ws.name,
        rowCount,
        colCount,
        previewRows,
      };
    });

    return { sheets };
  }

  static async importWorksheet(
    companyId: string,
    buffer: Buffer,
    sheetName: string,
    targetModule: string,
    createdBy = 'System Admin'
  ) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);

    const ws = workbook.getWorksheet(sheetName);
    if (!ws) {
      throw new Error(`Sheet "${sheetName}" not found in uploaded file.`);
    }

    const job = await prisma.importJob.create({
      data: {
        companyId,
        fileName: 'upload.xlsx',
        sheetName,
        status: 'PROCESSING',
        createdBy,
      },
    });

    let importedCount = 0;
    let failedCount = 0;
    const errors: string[] = [];

    if (targetModule === 'VEHICLES') {
      // Expecting columns similar to vehicels complince or standard vehicle list
      ws.eachRow({ includeEmpty: false }, async (row, rowNumber) => {
        if (rowNumber < 2) return;
        try {
          const regNo = row.getCell(9).value || row.getCell(1).value;
          if (!regNo) return;
          const regClean = String(regNo).trim().toUpperCase();

          await prisma.vehicle.upsert({
            where: { companyId_registrationNumber: { companyId, registrationNumber: regClean } },
            update: {},
            create: {
              companyId,
              registrationNumber: regClean,
              vehicleType: String(row.getCell(5).value || 'Sedan'),
              make: String(row.getCell(6).value || 'Maruti Suzuki'),
              model: String(row.getCell(7).value || 'Swift Dzire'),
              capacity: String(row.getCell(8).value || '4+1'),
              status: 'ACTIVE',
            },
          });
          importedCount++;
        } catch (err: any) {
          failedCount++;
          errors.push(`Row ${rowNumber}: ${err.message}`);
        }
      });
    } else if (targetModule === 'EXPENSES') {
      ws.eachRow({ includeEmpty: false }, async (row, rowNumber) => {
        if (rowNumber < 2) return;
        try {
          const amt = row.getCell(9).value || row.getCell(3).value;
          if (!amt || isNaN(Number(amt))) return;

          await prisma.expense.create({
            data: {
              companyId,
              expenseDate: new Date(),
              category: String(row.getCell(12).value || 'OTHER'),
              amount: Number(amt),
              paymentMode: String(row.getCell(8).value || 'ONLINE'),
              paidBy: String(row.getCell(11).value || 'Admin'),
              beneficiary: String(row.getCell(13).value || ''),
              approvalStatus: 'DONE',
              recoveryStatus: 'UNRECOVER',
            },
          });
          importedCount++;
        } catch (err: any) {
          failedCount++;
          errors.push(`Row ${rowNumber}: ${err.message}`);
        }
      });
    }

    await prisma.importJob.update({
      where: { id: job.id },
      data: {
        status: failedCount > 0 && importedCount === 0 ? 'FAILED' : 'COMPLETED',
        importedRows: importedCount,
        failedRows: failedCount,
        totalRows: importedCount + failedCount,
        errorLog: errors.length > 0 ? errors.slice(0, 10).join('\n') : null,
      },
    });

    return {
      jobId: job.id,
      importedCount,
      failedCount,
      errors: errors.slice(0, 10),
    };
  }

  static async listImportJobs(companyId: string) {
    return prisma.importJob.findMany({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }
}
