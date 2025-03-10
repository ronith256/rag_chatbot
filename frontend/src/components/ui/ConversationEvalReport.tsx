import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { ConversationEvaluation } from '../../types/types';

interface ConversationEvalReportProps {
  evaluation: ConversationEvaluation;
}

const ConversationEvalReport: React.FC<ConversationEvalReportProps> = ({ evaluation }) => {
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString();
  };

  if (evaluation.status === 'processing') {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <Clock className="w-6 h-6 text-blue-500 animate-spin" />
            <div className="flex-1">
              <h3 className="font-medium">Processing Evaluation</h3>
              <p className="text-sm text-gray-500">Started {formatDate(evaluation.timestamp)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (evaluation.status === 'failed') {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center gap-4 text-red-600">
            <XCircle className="w-6 h-6" />
            <div className="flex-1">
              <h3 className="font-medium">Evaluation Failed</h3>
              <p className="text-sm mt-2">{evaluation.error}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Conversation Evaluation</span>
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm ${
              evaluation.score >= 7 
                ? 'bg-green-100 text-green-800' 
                : evaluation.score >= 5 
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
            }`}>
              Score: {evaluation.score}/10
            </span>
            {evaluation.success ? (
              <CheckCircle className="w-5 h-5 text-green-500" />
            ) : (
              <XCircle className="w-5 h-5 text-red-500" />
            )}
          </div>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-2">Evaluation Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Timestamp:</span>
                  <span>{formatDate(evaluation.timestamp)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Max Depth:</span>
                  <span>{evaluation.max_depth}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Final Depth:</span>
                  <span>{evaluation.final_depth}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600">Success:</span>
                  <span className={evaluation.success ? 'text-green-600' : 'text-red-600'}>
                    {evaluation.success ? 'Yes' : 'No'}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium mb-2">Results</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-700">{evaluation.feedback}</p>
                <div className="mt-4">
                  <span className="text-sm font-medium text-gray-600">Outcome:</span>
                  <p className="text-sm text-gray-700 mt-1">{evaluation.reason}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-4">Conversation History</h3>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {evaluation.conversation.map((message, index: number) => (
                <div 
                  key={index}
                  className={`flex gap-3 ${message.role === 'assistant' ? 'justify-end' : ''}`}
                >
                  <div className={`flex gap-2 max-w-[80%] ${
                    message.role === 'assistant' 
                      ? 'bg-blue-50 rounded-lg p-3' 
                      : 'bg-gray-50 rounded-lg p-3'
                  }`}>
                    <MessageCircle className={`w-5 h-5 flex-shrink-0 ${
                      message.role === 'assistant' ? 'text-blue-500' : 'text-gray-500'
                    }`} />
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-500">
                        {message.role === 'assistant' ? 'Bot' : 'User'}
                      </p>
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationEvalReport;