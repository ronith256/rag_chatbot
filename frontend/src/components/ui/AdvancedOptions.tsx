import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronRight, Settings2, Database, Cloud, Brain } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {SectionKey, LLMAdvancedConfig, EmbeddingsAdvancedConfig, SQLAdvancedConfig, S3AdvancedConfig, AdvancedConfig} from '@/types/types'

interface AdvancedOptionsProps {
  showAdvanced: boolean;
  setShowAdvanced: (show: boolean) => void;
  advancedConfig: AdvancedConfig;
  handleConfigChange: (section: SectionKey, field: keyof any, value: any) => void;
}

interface SectionConfig {
  id: SectionKey;
  title: string;
  icon: React.FC<{ className?: string }>;
}

export const AdvancedOptions: React.FC<AdvancedOptionsProps> = ({
  showAdvanced,
  setShowAdvanced,
  advancedConfig,
  handleConfigChange
}) => {
  const [activeSection, setActiveSection] = useState<SectionKey>('llm');

  const sections: SectionConfig[] = [
    { id: 'llm', title: 'Language Model', icon: Brain },
    { id: 'embeddings', title: 'Embeddings', icon: Settings2 },
    { id: 'sql', title: 'Database', icon: Database },
    { id: 's3', title: 'Storage', icon: Cloud }
  ];

  const renderPromptField = (section: SectionKey, field: string, label: string, placeholder: string) => {
    const config = advancedConfig[section];
    const value = config[field as keyof typeof config] || '';

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        <textarea
          value={value as string}
          onChange={(e) => handleConfigChange(section, field, e.target.value)}
          className="w-full p-3 border rounded-md min-h-24 font-mono text-sm resize-vertical"
          placeholder={placeholder}
        />
        <p className="text-sm text-gray-500 mt-1">
          This prompt will guide the {section === 'llm' ? 'model\'s behavior' : section === 'embeddings' ? 'embedding process' : 'database schema creation'}.
        </p>
      </div>
    );
  };

  const renderSectionContent = (section: SectionKey) => {
    switch (section) {
      case 'llm': {
        const config = advancedConfig[section] as LLMAdvancedConfig; 
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Model</label>
                <input
                  type="text"
                  value={config.model}
                  onChange={(e) => handleConfigChange(section, 'model', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter model name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Temperature</label>
                <input
                  type="number"
                  value={config.temperature}
                  onChange={(e) => handleConfigChange(section, 'temperature', parseFloat(e.target.value))}
                  className="w-full p-2 border rounded-md"
                  step="0.1"
                  min="0"
                  max="1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Base URL</label>
              <input
                type="text"
                value={config.baseUrl}
                onChange={(e) => handleConfigChange(section, 'baseUrl', e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="API endpoint URL"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">API Key</label>
              <input
                type="password"
                value={config.apiKey}
                onChange={(e) => handleConfigChange(section, 'apiKey', e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Enter API key"
              />
            </div>
            {renderPromptField(section, 'systemPrompt', 'System Prompt', 'Enter the system prompt that will guide the model\'s behavior...')}
          </>
        );}

      case 'embeddings': {
        const config = advancedConfig[section] as EmbeddingsAdvancedConfig; 
        return (
          <>
            <Alert className="bg-blue-50 border-blue-200">
              <AlertDescription>
                Configure custom embedding models for improved semantic search capabilities.
              </AlertDescription>
            </Alert>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Model</label>
                <input
                  type="text"
                  value={config.model}
                  onChange={(e) => handleConfigChange(section, 'model', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter embedding model name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Base URL</label>
                <input
                  type="text"
                  value={config.baseUrl}
                  onChange={(e) => handleConfigChange(section, 'baseUrl', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Base URL for embeddings API"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">API Key</label>
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={(e) => handleConfigChange(section, 'apiKey', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="API key for embeddings"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Hugging Face Model</label>
                <input
                  type="text"
                  value={config.huggingface_model}
                  onChange={(e) => handleConfigChange(section, 'huggingface_model', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Hugging Face model name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Embedding Type</label>
                <select
                  value={config.embedding_type}
                  onChange={(e) => handleConfigChange(section, 'embedding_type', e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="OpenAI">OpenAI</option>
                  <option value="Huggingface">Huggingface</option>
                </select>
              </div>
              {renderPromptField(section, 'contextPrompt', 'Contextualization Prompt', 'Enter the prompt that will guide the embedding process...')}
            </div>
          </>
        );
      }
      case 'sql': {
        const config = advancedConfig[section] as SQLAdvancedConfig
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Username</label>
                <input
                  type="text"
                  value={config.username}
                  onChange={(e) => handleConfigChange(section, 'username', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Database username"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <input
                  type="password"
                  value={config.password}
                  onChange={(e) => handleConfigChange(section, 'password', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="Database password"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Database URL</label>
              <input
                type="text"
                value={config.url}
                onChange={(e) => handleConfigChange(section, 'url', e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Database connection URL"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Database Name</label>
              <input
                type="text"
                value={config.dbName}
                onChange={(e) => handleConfigChange(section, 'dbName', e.target.value)}
                className="w-full p-2 border rounded-md"
                placeholder="Database name"
              />
            </div>
            {renderPromptField(section, 'sqlPrompt', 'SQL Creation Prompt', 'Enter the prompt that will guide the database schema creation...')}
          </div>
        );
      }
      case 's3': {
        const config = advancedConfig[section] as S3AdvancedConfig;
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Bucket Name</label>
                <input
                  type="text"
                  value={config.bucketName}
                  onChange={(e) => handleConfigChange(section, 'bucketName', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="S3 bucket name"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Region</label>
                <input
                  type="text"
                  value={config.regionName}
                  onChange={(e) => handleConfigChange(section, 'regionName', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="AWS region"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">AWS Access Key</label>
                <input
                  type="text"
                  value={config.awsAccessKey}
                  onChange={(e) => handleConfigChange(section, 'awsAccessKey', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="AWS access key"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">AWS Secret Key</label>
                <input
                  type="password"
                  value={config.awsSecretKey}
                  onChange={(e) => handleConfigChange(section, 'awsSecretKey', e.target.value)}
                  className="w-full p-2 border rounded-md"
                  placeholder="AWS secret key"
                />
              </div>
            </div>
          </div>
        );
      }
    }
  };

  return (
    <div>
      <button
        onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        {showAdvanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        Advanced Options
      </button>

      {showAdvanced && (
        <div className="space-y-6 mt-4">
          <div className="flex gap-4">
            <div className="w-1/4">
              <div className="space-y-2">
                {sections.map(({ id, title, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setActiveSection(id)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                      activeSection === id
                        ? 'bg-blue-50 text-blue-700 font-medium'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{title}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">
                      {sections.find(s => s.id === activeSection)?.title} Settings
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500">Enable</span>
                      <input
                        type="checkbox"
                        checked={advancedConfig[activeSection].enabled}
                        onChange={(e) => handleConfigChange(activeSection, 'enabled', e.target.checked)}
                        className="rounded border-gray-300"
                      />
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {advancedConfig[activeSection].enabled ? (
                    renderSectionContent(activeSection)
                  ) : (
                    <div className="text-center py-6 text-gray-500">
                      Enable this section to configure {sections.find(s => s.id === activeSection)?.title.toLowerCase()} settings
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdvancedOptions;