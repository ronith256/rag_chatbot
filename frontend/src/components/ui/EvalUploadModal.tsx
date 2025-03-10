import React, { useState } from 'react';
import axios from 'axios';
import { Upload, Loader2 } from 'lucide-react';
import type { Agent } from '../../types/types';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import ConversationEvalForm from './ConversationEvalForm';

interface UploadModalProps {
  agents: Agent[];
  selectedAgent: string | null;
  onAgentSelect: (agentId: string) => void;
  onClose: () => void;
  onSubmit: (jobId: string) => void;  
}

export const UploadModal: React.FC<UploadModalProps> = ({
  agents,
  selectedAgent,
  onAgentSelect,
  onClose,
  onSubmit,
}) => {
  const [evaluationType, setEvaluationType] = useState<'standard' | 'conversation'>('standard');
  const [evaluationFile, setEvaluationFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const baseURL = import.meta.env.VITE_BACKEND_BASE_URL || '';

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setEvaluationFile(event.target.files[0]);
      setError(null);
    }
  };

  const validateFile = (file: File): boolean => {
    if (!file.name.endsWith('.json')) {
      setError('Please upload a JSON file');
      return false;
    }
    return true;
  };

  const handleConversationSubmit = async (config: {
    initial_message: string;
    max_depth: number;
    user_system_prompt?: string;
  }) => {
    if (!selectedAgent) {
      setError('Please select an agent');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${baseURL}/api/agents/${selectedAgent}/evaluate_conversation`,
        config
      );
      onSubmit(response.data.job_id);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.detail || 'Error submitting evaluation');
      } else {
        setError('An unexpected error occurred');
      }
      console.error('Error submitting evaluation:', error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleStandardSubmit = async () => {
    if (!selectedAgent) {
      setError('Please select an agent');
      return;
    }

    if (!evaluationFile) {
      setError('Please upload a file');
      return;
    }

    if (!validateFile(evaluationFile)) {
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('evaluation_set', evaluationFile);
      
      const response = await axios.post(
        `${baseURL}/api/agents/${selectedAgent}/evaluate`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      onSubmit(response.data.job_id);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setError(error.response?.data?.detail || 'Error submitting evaluation');
      } else {
        setError('An unexpected error occurred');
      }
      console.error('Error submitting evaluation:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Create New Evaluation</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-4">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">
              Select Agent
            </Label>
            <select
              value={selectedAgent || ''}
              onChange={(e) => onAgentSelect(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Select an agent</option>
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.config.collection}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label className="block text-sm font-medium text-gray-700">
              Evaluation Type
            </Label>
            <RadioGroup
              value={evaluationType}
              onValueChange={(value) => setEvaluationType(value as 'standard' | 'conversation')}
              className="flex gap-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="standard" id="standard" />
                <Label htmlFor="standard">Standard Evaluation</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="conversation" id="conversation" />
                <Label htmlFor="conversation">Conversation Evaluation</Label>
              </div>
            </RadioGroup>
          </div>

          {evaluationType === 'standard' ? (
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Evaluation Set
              </Label>
              <div className="flex items-center justify-center border-2 border-dashed rounded-lg p-6">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="evaluation-file"
                />
                <label
                  htmlFor="evaluation-file"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="mt-2 text-sm text-gray-500">
                    {evaluationFile ? evaluationFile.name : 'Select JSON file'}
                  </span>
                </label>
              </div>
              {error && (
                <div className="text-red-600 text-sm mt-2">
                  {error}
                </div>
              )}
              <div className="flex justify-end gap-4 mt-6">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStandardSubmit}
                  disabled={!selectedAgent || isUploading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    'Start Evaluation'
                  )}
                </button>
              </div>
            </div>
          ) : (
            <ConversationEvalForm
              onSubmit={handleConversationSubmit}
              onCancel={onClose}
              isSubmitting={isUploading}
              error={error}
            />
          )}
        </div>
      </div>
    </div>
  );
};