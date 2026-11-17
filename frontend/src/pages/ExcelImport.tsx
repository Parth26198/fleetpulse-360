import React, { useState, useEffect } from 'react';
import { UploadCloud, FileSpreadsheet, CheckCircle2, AlertTriangle, ArrowRight, RefreshCw, Layers } from 'lucide-react';
import { Api } from '../services/api';

export const ExcelImport: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [inspecting, setInspecting] = useState(false);
  const [sheets, setSheets] = useState<any[]>([]);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [targetModule, setTargetModule] = useState<'VEHICLES' | 'EXPENSES'>('VEHICLES');
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [importJobs, setImportJobs] = useState<any[]>([]);

  const loadJobs = () => {
    Api.listImportJobs()
      .then((res) => {
        if (res.data.success) setImportJobs(res.data.jobs);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setImportResult(null);

      // Automatically inspect sheets
      const formData = new FormData();
      formData.append('file', selected);

      setInspecting(true);
      try {
        const res = await Api.inspectExcel(formData);
        if (res.data.success) {
          setSheets(res.data.sheets);
          if (res.data.sheets.length > 0) {
            setSelectedSheet(res.data.sheets[0].name);
          }
        }
      } catch (err: any) {
        alert(err.response?.data?.message || 'Failed to inspect workbook.');
      } finally {
        setInspecting(false);
      }
    }
  };

  const handleExecuteImport = async () => {
    if (!file || !selectedSheet) {
      alert('Please choose a file and sheet.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('sheetName', selectedSheet);
    formData.append('targetModule', targetModule);

    setImporting(true);
    try {
      const res = await Api.importExcelSheet(formData);
      if (res.data.success) {
        setImportResult(res.data);
        loadJobs();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Import execution failed.');
    } finally {
      setImporting(false);
    }
  };

  const activeSheetObj = sheets.find((s) => s.name === selectedSheet);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          EXCEL IMPORT WIZARD & RECONCILIATION ENGINE
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Dynamic multi-worksheet XLSX parser, row validator, schema reconciliation, and batch database synchronizer
        </p>
      </div>

      {/* Upload & Configuration Container */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Step 1 & 2: Upload and Sheet Selection */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-5">
          <div>
            <span className="text-[10px] font-bold text-brand-orange uppercase tracking-wider block mb-1">
              STEP 1: UPLOAD WORKBOOK
            </span>
            <label className="border-2 border-dashed border-slate-300 hover:border-brand-orange rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition bg-slate-50 hover:bg-orange-50/20">
              <UploadCloud className="w-8 h-8 text-brand-orange mb-2" />
              <span className="text-xs font-bold text-slate-700">
                {file ? file.name : 'Select or drop SHREEJ_DAILY REPORT.xlsx'}
              </span>
              <span className="text-[10px] text-slate-400 mt-1">Supports XLSX up to 15MB</span>
              <input type="file" accept=".xlsx" onChange={handleFileChange} className="hidden" />
            </label>
          </div>

          {inspecting && (
            <div className="flex items-center space-x-2 text-xs text-slate-500 font-medium">
              <div className="w-4 h-4 border-2 border-brand-orange border-t-transparent rounded-full animate-spin" />
              <span>Scanning worksheets, column headers, and records...</span>
            </div>
          )}

          {sheets.length > 0 && (
            <div className="space-y-4 pt-2 border-t border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-brand-orange uppercase tracking-wider block mb-1">
                  STEP 2: SELECT WORKSHEET ({sheets.length} DETECTED)
                </span>
                <select
                  value={selectedSheet}
                  onChange={(e) => setSelectedSheet(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-brand-orange"
                >
                  {sheets.map((s) => (
                    <option key={s.name} value={s.name}>
                      {s.name} ({s.rowCount} rows)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <span className="text-[10px] font-bold text-brand-orange uppercase tracking-wider block mb-1">
                  STEP 3: TARGET DATABASE MODULE
                </span>
                <select
                  value={targetModule}
                  onChange={(e) => setTargetModule(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 outline-none focus:ring-1 focus:ring-brand-orange"
                >
                  <option value="VEHICLES">Fleet Vehicles & Documents Module</option>
                  <option value="EXPENSES">Daily Expenses & Cash Settlements</option>
                </select>
              </div>

              <button
                onClick={handleExecuteImport}
                disabled={importing}
                className="w-full flex justify-center items-center py-2.5 px-4 rounded-xl shadow-lg shadow-brand-orange/20 text-xs font-bold text-white bg-brand-orange hover:bg-brand-orangeHover transition disabled:opacity-50"
              >
                {importing ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Execute Batch Import & Validate</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                  </>
                )}
              </button>
            </div>
          )}

          {/* Import Result Notification */}
          {importResult && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1">
              <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Import Finished!</span>
              </div>
              <p className="text-emerald-700">
                Successfully imported <b>{importResult.importedCount}</b> rows. Failed: <b>{importResult.failedCount}</b>.
              </p>
              {importResult.errors && importResult.errors.length > 0 && (
                <div className="mt-2 text-[10px] text-rose-600 bg-white p-2 rounded border border-rose-100">
                  {importResult.errors.join(', ')}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Live Preview Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900">LIVE WORKSHEET PREVIEW</h2>
                <p className="text-[11px] text-slate-400">
                  {activeSheetObj ? `${activeSheetObj.name} • ${activeSheetObj.rowCount} rows detected` : 'No sheet selected'}
                </p>
              </div>
              <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded">
                Pre-Validation
              </span>
            </div>

            {activeSheetObj && activeSheetObj.previewRows ? (
              <div className="overflow-x-auto max-h-96">
                <table className="w-full text-left border-collapse text-[10px] font-mono">
                  <tbody>
                    {activeSheetObj.previewRows.map((pr: any) => (
                      <tr key={pr.rowNumber} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="py-1.5 px-2 font-bold text-slate-400 w-8">{pr.rowNumber}</td>
                        {pr.cells.map((c: string, ci: number) => (
                          <td key={ci} className="py-1.5 px-2 text-slate-700 whitespace-nowrap max-w-[120px] truncate">
                            {c || '—'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-xs">
                <FileSpreadsheet className="w-10 h-10 mb-2 stroke-1" />
                <span>Upload a spreadsheet to preview worksheet records and structure</span>
              </div>
            )}
          </div>

          {/* Audit Reconciliation Notice */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Original Excel file preserved intact. System uses safe staging tables.</span>
            <span className="font-semibold text-brand-orange">Zod & Prisma Validated</span>
          </div>
        </div>
      </div>

      {/* Import History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden p-4">
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
          Recent Import Jobs & Audit Reconciliation
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Sheet Name</th>
                <th className="py-2.5 px-3 text-center">Imported</th>
                <th className="py-2.5 px-3 text-center">Failed</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Initiated By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {importJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-4 text-center text-slate-400 text-xs">
                    No recent import logs found.
                  </td>
                </tr>
              ) : (
                importJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50">
                    <td className="py-2 px-3 font-mono text-slate-600">{job.createdAt.split('T')[0]}</td>
                    <td className="py-2 px-3 font-bold text-slate-800">{job.sheetName}</td>
                    <td className="py-2 px-3 text-center font-bold text-emerald-600">{job.importedRows}</td>
                    <td className="py-2 px-3 text-center font-bold text-rose-600">{job.failedRows}</td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                        {job.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-600">{job.createdBy || 'Admin'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
