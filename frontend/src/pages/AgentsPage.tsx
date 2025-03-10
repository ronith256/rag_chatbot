import React, { useState, useEffect } from "react";
import axios from "axios";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { File, Upload, Plus, Settings } from "lucide-react";
import { Agent, RAGConfig } from "@/types/types";
import AgentConfigEditor from "@/components/ui/AdvancedConfgEditor";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import ChatInterface from "../components/ui/ChatInterface";
import ApiPopup from "../components/ui/ApiPopup";
import {v4 as uuidv4} from 'uuid';

const getRandomEmoji = () => {
  const emojis = ["🤖", "🎯", "🎮", "🎪", "🎨", "🎭", "🎪", "🎯", "🎲"];
  return emojis[Math.floor(Math.random() * emojis.length)];
};

const AgentsPage = () => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [models, setModels] = useState<Record<string, string>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [showApiPopup, setShowApiPopup] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const userId = user?.uid;
  const baseURL = import.meta.env.VITE_BACKEND_BASE_URL || "";
  const uid = uuidv4()

  useEffect(() => {
    fetchAgents();
    fetchModels();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/agents/user/${userId}`);
      setAgents(response.data);
    } catch (error) {
      console.error("Error fetching agents:", error);
    }
  };

  const fetchModels = async () => {
    try {
      const response = await axios.get(`${baseURL}/api/agents/models`);
      setModels(response.data);
    } catch (error) {
      console.error("Error fetching models:", error);
    }
  };

  const getModelDisplayName = (agent: Agent) => {
    if (agent.config.advancedLLMConfig) {
      return agent.config.advancedLLMConfig.model;
    }
    return models[agent.config.llm] || agent.config.llm;
  };

  const handleAgentSelect = (agent: Agent) => {
    setSelectedAgent(agent);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFiles((prevFiles) => [
        ...prevFiles,
        ...Array.from(event.target.files || []),
      ]);
    }
  };

  const handleSubmitFiles = async () => {
    if (!selectedAgent || files.length === 0) return;

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    try {
      await axios.post(
        `${baseURL}/api/agents/${selectedAgent.id}/documents/bulk`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setFiles([]);
    } catch (error) {
      console.error("Error uploading files:", error);
    }
  };

  const handleUpdateAgent = async (updatedConfig: RAGConfig) => {
    if (!selectedAgent) return;

    try {
      await axios.patch(`${baseURL}/api/agents/${selectedAgent.id}`, {
        user_id: userId,
        config: updatedConfig,
      });

      fetchAgents();
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating agent:", error);
    }
  };

  const formatFileSize = (bytes: number): string => {
    const kb = bytes / 1024;
    if (kb < 1024) {
      return `${kb.toFixed(2)} KB`;
    }
    const mb = kb / 1024;
    return `${mb.toFixed(2)} MB`;
  };

  return (
    <div className="flex h-full">
      <div className="w-64 p-6 border-r overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">My Agents</h2>
          <button
            onClick={() => navigate("/create")}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          {agents.map((agent) => (
            <div
              key={agent.id}
              onClick={() => handleAgentSelect(agent)}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                selectedAgent?.id === agent.id
                  ? "border-blue-500 bg-blue-50"
                  : "hover:border-gray-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{getRandomEmoji()}</div>
                <div className="flex-1">
                  <h3 className="font-medium">{agent.config.collection}</h3>
                  <p className="text-sm text-gray-500">
                    {getModelDisplayName(agent)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side - Agent Interface */}
      {selectedAgent && (
        <div className="flex-1">
          <PanelGroup direction="horizontal">
            {/* Agent Config Panel - Add overflow handling here */}
            <Panel defaultSize={40} minSize={30}>
              <div className="h-full flex flex-col overflow-hidden">
                <div className="flex items-center justify-between p-8 pb-4">
                  <h1 className="text-2xl font-bold">Agent Configuration</h1>
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="p-2 rounded-full hover:bg-gray-100"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                </div>

                {/* Make this div scrollable */}
                <div className="flex-1 overflow-y-auto px-8 pb-8">
                  <div className="bg-white p-6 rounded-lg shadow">
                    {isEditing ? (
                      <AgentConfigEditor
                        agent={selectedAgent}
                        models={models}
                        onUpdate={handleUpdateAgent}
                      />
                    ) : (
                      <div className="space-y-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Name
                          </label>
                          <input
                            type="text"
                            value={selectedAgent.config.collection}
                            disabled
                            className="w-full p-2 border rounded-md disabled:bg-gray-50"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Model
                          </label>
                          <input
                            type="text"
                            value={getModelDisplayName(selectedAgent)}
                            disabled
                            className="w-full p-2 border rounded-md disabled:bg-gray-50"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* File Upload Section */}
                  <div className="mt-8">
                    <h2 className="text-xl font-semibold mb-4">Upload Files</h2>

                    {files.length === 0 ? (
                      <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg">
                        <input
                          type="file"
                          multiple
                          onChange={handleFileSelect}
                          className="hidden"
                          id="file-upload"
                        />
                        <label
                          htmlFor="file-upload"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white cursor-pointer hover:bg-blue-700"
                        >
                          <Upload className="w-5 h-5" />
                          Select Files
                        </label>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {files.map((file, index) => (
                          <div
                            key={index}
                            className="bg-white rounded-lg shadow-md p-4"
                          >
                            <div className="flex items-start gap-3">
                              <File className="w-8 h-8 text-gray-400" />
                              <div className="flex-1">
                                <h3 className="font-medium">{file.name}</h3>
                                <p className="text-sm text-gray-500">
                                  {formatFileSize(file.size)}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}

                        <div className="flex gap-4">
                          <input
                            type="file"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                            id="add-more-files"
                          />
                          <label
                            htmlFor="add-more-files"
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            Add Files
                          </label>
                          <button
                            onClick={handleSubmitFiles}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                          >
                            Upload Files
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Panel>

            <PanelResizeHandle className="w-2 bg-gray-200 hover:bg-gray-300 transition-colors" />

            {/* Chat Interface Panel */}
            <Panel defaultSize={60} minSize={30}>
              <ChatInterface
                selectedAgent={selectedAgent}
                baseURL={baseURL}
                getModelDisplayName={getModelDisplayName}
                setShowApiPopup={setShowApiPopup}
              />
            </Panel>
          </PanelGroup>
        </div>
      )}

      {/* API Popup */}
      {showApiPopup && selectedAgent && (
        <ApiPopup
          baseURL={baseURL}
          agentId={selectedAgent.id}
          uid={uid}
          onClose={() => setShowApiPopup(false)}
        />
      )}
    </div>
  );
};

export default AgentsPage;
