import React, { useState } from 'react';
import axios from 'axios';
import { Trash2 } from 'lucide-react';
import { Agent, RAGConfig, AdvancedConfig, SectionKey } from '@/types/types';
import { useAuth } from '@/context/AuthContext';
import { AdvancedOptions } from './AdvancedOptions';

interface AgentConfigEditorProps {
  agent: Agent;
  models: Record<string, string>;
  onUpdate: (config: RAGConfig) => void;
}

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentName: string;
  onConfirm: () => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, onClose, agentName, onConfirm }) => {
  const [confirmText, setConfirmText] = useState('');
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <h3 className="text-xl font-semibold mb-4">Delete Agent</h3>
        <p className="text-gray-600 mb-4">
          This action cannot be undone. Please type <span className="font-bold">{agentName}</span> to confirm.
        </p>
        <input
          type="text"
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="Type agent name to confirm"
          className="w-full p-2 border rounded-md mb-4"
        />
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-md"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={confirmText !== agentName}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Delete Agent
          </button>
        </div>
      </div>
    </div>
  );
};

const AdvancedConfigEditor = ({ agent, models, onUpdate }: AgentConfigEditorProps) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [advancedConfig, setAdvancedConfig] = useState<AdvancedConfig>({
    llm: {
      enabled: !!agent.config.advancedLLMConfig,
      model: agent.config.advancedLLMConfig?.model || '',
      baseUrl: agent.config.advancedLLMConfig?.base_url || '',
      apiKey: agent.config.advancedLLMConfig?.api_key || '',
      temperature: agent.config.advancedLLMConfig?.temperature || 0.7,
      apiType: agent.config.advancedLLMConfig?.api_type || 'OpenAI',
      systemPrompt: agent.config.system_prompt || ''
    },
    embeddings: {
      enabled: !!agent.config.advancedEmbeddingsConfig,
      model: agent.config.advancedEmbeddingsConfig?.model || 'text-embedding-ada-002',
      baseUrl: agent.config.advancedEmbeddingsConfig?.base_url || '',
      apiKey: agent.config.advancedEmbeddingsConfig?.api_key || '',
      huggingface_model: agent.config.advancedEmbeddingsConfig?.huggingface_model || '',
      embedding_type: agent.config.advancedEmbeddingsConfig?.embedding_type || 'OpenAI',
      contextPrompt: agent.config.contextualization_prompt || ''
    },
    sql: {
      enabled: !!agent.config.sql_config,
      url: agent.config.sql_config?.url || '',
      username: agent.config.sql_config?.username || '',
      password: agent.config.sql_config?.password || '',
      dbName: agent.config.sql_config?.db_name || '',
      sqlPrompt: agent.config.sql_config?.sql_prompt || ''
    },
    s3: {
      enabled: !!agent.config.s3_config,
      bucketName: agent.config.s3_config?.bucket_name || '',
      regionName: agent.config.s3_config?.region_name || '',
      awsAccessKey: agent.config.s3_config?.aws_access_key || '',
      awsSecretKey: agent.config.s3_config?.aws_secret_key || ''
    }
  });

  const { user } = useAuth();
  const baseURL = import.meta.env.VITE_BACKEND_BASE_URL || '';

  const handleDeleteAgent = async () => {
    try {
      await axios.delete(`${baseURL}/api/agents/${agent.id}`, {
        params: { user_id: user?.uid }
      });
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting agent:', error);
    }
  };

  const handleConfigChange = (section: SectionKey, field: keyof any, value: any) => {
    setAdvancedConfig(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSubmit = () => {
    const updatedConfig: RAGConfig = {
      ...agent.config,
      collection: agent.config.collection,
      llm: advancedConfig.llm.enabled ? advancedConfig.llm.model : agent.config.llm,
      embeddings_model: "text-embedding-ada-002"
    };

    if (advancedConfig.llm.enabled) {
      updatedConfig.advancedLLMConfig = {
        model: advancedConfig.llm.model,
        base_url: advancedConfig.llm.baseUrl,
        api_key: advancedConfig.llm.apiKey,
        temperature: advancedConfig.llm.temperature,
        api_type: advancedConfig.llm.apiType
      };
      updatedConfig.system_prompt = advancedConfig.llm.systemPrompt;
    }

    if (advancedConfig.embeddings.enabled) {
      updatedConfig.advancedEmbeddingsConfig = {
        model: advancedConfig.embeddings.model,
        base_url: advancedConfig.embeddings.baseUrl,
        api_key: advancedConfig.embeddings.apiKey,
        huggingface_model: advancedConfig.embeddings.huggingface_model,
        embedding_type: advancedConfig.embeddings.embedding_type
      };
      updatedConfig.contextualization_prompt = advancedConfig.embeddings.contextPrompt;
    }

    if (advancedConfig.sql.enabled) {
      updatedConfig.sql_config = {
        url: advancedConfig.sql.url,
        username: advancedConfig.sql.username,
        password: advancedConfig.sql.password,
        db_name: advancedConfig.sql.dbName,
        sql_prompt: advancedConfig.sql.sqlPrompt
      };
    }

    if (advancedConfig.s3.enabled) {
      updatedConfig.s3_config = {
        bucket_name: advancedConfig.s3.bucketName,
        region_name: advancedConfig.s3.regionName,
        aws_access_key: advancedConfig.s3.awsAccessKey,
        aws_secret_key: advancedConfig.s3.awsSecretKey
      };
    }

    onUpdate(updatedConfig);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Fixed header section */}
      <div className="flex-none mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name
        </label>
        <input
          type="text"
          value={agent.config.collection}
          disabled
          className="w-full p-2 border rounded-md bg-gray-50"
        />
      </div>

      {/* Scrollable content section */}
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-4">
          {!advancedConfig.llm.enabled && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Model
              </label>
              <select
                value={agent.config.llm}
                onChange={(e) => onUpdate({ ...agent.config, llm: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                {Object.entries(models).map(([id, name]) => (
                  <option key={id} value={id}>{name}</option>
                ))}
              </select>
            </div>
          )}

          <AdvancedOptions
            showAdvanced={showAdvanced}
            setShowAdvanced={setShowAdvanced}
            advancedConfig={advancedConfig}
            handleConfigChange={handleConfigChange}
          />
        </div>
      </div>

      {/* Fixed footer section */}
      <div className="flex-none mt-8 space-y-4">
        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          Update Agent
        </button>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-full bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 flex items-center justify-center gap-2"
        >
          <Trash2 className="w-4 h-4" />
          Delete Agent
        </button>
      </div>

      <DeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        agentName={agent.config.collection}
        onConfirm={handleDeleteAgent}
      />
    </div>
  );
};

export default AdvancedConfigEditor;