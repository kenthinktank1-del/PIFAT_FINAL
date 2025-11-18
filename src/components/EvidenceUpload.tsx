import { useState, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { DEVICE_CATEGORIES } from '../lib/constants';
import { generateSHA256 } from '../lib/utils/hash';
import { createLog, createChainOfCustodyEntry } from '../lib/services/logger';
import { Upload, File, CheckCircle, AlertCircle, Loader } from 'lucide-react';

interface UploadState {
  file: File | null;
  deviceCategory: string;
  caseId: string;
  serialNumber: string;
  manufacturer: string;
  model: string;
  status: 'idle' | 'hashing' | 'uploading' | 'success' | 'error';
  message: string;
  hash: string;
}

export default function EvidenceUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>({
    file: null,
    deviceCategory: '',
    caseId: '',
    serialNumber: '',
    manufacturer: '',
    model: '',
    status: 'idle',
    message: '',
    hash: '',
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setState(prev => ({ ...prev, file, status: 'idle', message: '' }));
    }
  };

  const handleUpload = async () => {
    if (!state.file || !state.deviceCategory || !state.caseId) {
      setState(prev => ({
        ...prev,
        status: 'error',
        message: 'Please fill in all required fields'
      }));
      return;
    }

    try {
      setState(prev => ({ ...prev, status: 'hashing', message: 'Generating hash...' }));
      const sha256Hash = await generateSHA256(state.file);

      setState(prev => ({
        ...prev,
        hash: sha256Hash,
        status: 'uploading',
        message: 'Creating evidence record...'
      }));

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const deviceData = {
        case_id: state.caseId,
        device_category: state.deviceCategory,
        manufacturer: state.manufacturer || null,
        model: state.model || null,
        serial_number: state.serialNumber || null,
        metadata_json: {
          original_filename: state.file.name,
          file_size: state.file.size,
          upload_timestamp: new Date().toISOString(),
        },
      };

      const { data: device, error: deviceError } = await supabase
        .from('devices')
        .insert(deviceData)
        .select()
        .single();

      if (deviceError) throw deviceError;

      const evidenceData = {
        case_id: state.caseId,
        device_id: device.device_id,
        file_path: `/evidence/${state.caseId}/${sha256Hash}_${state.file.name}`,
        size: state.file.size,
        sha256_hash: sha256Hash,
        uploaded_by: user.id,
        ai_status: 'pending' as const,
      };

      const { data: evidence, error: evidenceError } = await supabase
        .from('evidence')
        .insert(evidenceData)
        .select()
        .single();

      if (evidenceError) throw evidenceError;

      await createChainOfCustodyEntry(
        evidence.evidence_id,
        'Evidence Uploaded',
        {
          filename: state.file.name,
          size: state.file.size,
          hash: sha256Hash,
          device_category: state.deviceCategory,
        }
      );

      await createLog({
        case_id: state.caseId,
        action: 'Evidence Uploaded',
        details: {
          evidence_id: evidence.evidence_id,
          device_id: device.device_id,
          filename: state.file.name,
          hash: sha256Hash,
        },
      });

      setState(prev => ({
        ...prev,
        status: 'success',
        message: 'Evidence uploaded successfully!'
      }));

      setTimeout(() => {
        setState({
          file: null,
          deviceCategory: '',
          caseId: '',
          serialNumber: '',
          manufacturer: '',
          model: '',
          status: 'idle',
          message: '',
          hash: '',
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }, 3000);

    } catch (error) {
      console.error('Upload failed:', error);
      setState(prev => ({
        ...prev,
        status: 'error',
        message: error instanceof Error ? error.message : 'Upload failed'
      }));
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Upload Evidence</h1>
        <p className="mt-2 text-gray-600">Capture and upload forensic evidence</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Case ID *
            </label>
            <input
              type="text"
              value={state.caseId}
              onChange={(e) => setState(prev => ({ ...prev, caseId: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter case ID"
              disabled={state.status === 'hashing' || state.status === 'uploading'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Device Category *
            </label>
            <select
              value={state.deviceCategory}
              onChange={(e) => setState(prev => ({ ...prev, deviceCategory: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={state.status === 'hashing' || state.status === 'uploading'}
            >
              <option value="">Select device category</option>
              {DEVICE_CATEGORIES.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Manufacturer
              </label>
              <input
                type="text"
                value={state.manufacturer}
                onChange={(e) => setState(prev => ({ ...prev, manufacturer: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Apple"
                disabled={state.status === 'hashing' || state.status === 'uploading'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Model
              </label>
              <input
                type="text"
                value={state.model}
                onChange={(e) => setState(prev => ({ ...prev, model: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., iPhone 13"
                disabled={state.status === 'hashing' || state.status === 'uploading'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Serial Number
              </label>
              <input
                type="text"
                value={state.serialNumber}
                onChange={(e) => setState(prev => ({ ...prev, serialNumber: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Optional"
                disabled={state.status === 'hashing' || state.status === 'uploading'}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Evidence File *
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
                disabled={state.status === 'hashing' || state.status === 'uploading'}
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-gray-600">
                  {state.file ? state.file.name : 'Click to upload or drag and drop'}
                </p>
                {state.file && (
                  <p className="mt-1 text-xs text-gray-500">
                    Size: {(state.file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </label>
            </div>
          </div>

          {state.hash && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-1">SHA-256 Hash:</p>
              <p className="text-xs font-mono text-gray-600 break-all">{state.hash}</p>
            </div>
          )}

          {state.message && (
            <div className={`flex items-center gap-2 p-4 rounded-lg ${
              state.status === 'success' ? 'bg-green-50 text-green-800' :
              state.status === 'error' ? 'bg-red-50 text-red-800' :
              'bg-blue-50 text-blue-800'
            }`}>
              {state.status === 'success' && <CheckCircle className="h-5 w-5" />}
              {state.status === 'error' && <AlertCircle className="h-5 w-5" />}
              {(state.status === 'hashing' || state.status === 'uploading') && (
                <Loader className="h-5 w-5 animate-spin" />
              )}
              <span className="text-sm font-medium">{state.message}</span>
            </div>
          )}

          <button
            onClick={handleUpload}
            disabled={!state.file || !state.deviceCategory || !state.caseId ||
                     state.status === 'hashing' || state.status === 'uploading'}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700
                     disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {state.status === 'hashing' || state.status === 'uploading' ?
              'Processing...' : 'Upload Evidence'}
          </button>
        </div>
      </div>
    </div>
  );
}
