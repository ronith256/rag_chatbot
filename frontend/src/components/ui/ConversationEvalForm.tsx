import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileUp, Loader2 } from 'lucide-react';

interface ConversationConfig {
  initial_message: string;
  max_depth: number;
  user_system_prompt?: string;
}

interface ConversationEvalFormProps {
  onSubmit: (config: ConversationConfig) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  error: string | null;
}

const ConversationEvalForm: React.FC<ConversationEvalFormProps> = ({ 
  onSubmit, 
  onCancel, 
  isSubmitting,
  error 
}) => {
  const [initialMessage, setInitialMessage] = React.useState(
    'Hi! I run a yoga studio and I\'m interested in expanding my business. Can you help?'
  );
  const [maxDepth, setMaxDepth] = React.useState(5);
  const [systemPrompt, setSystemPrompt] = React.useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      initial_message: initialMessage,
      max_depth: maxDepth,
      user_system_prompt: systemPrompt || undefined
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>New Conversation Evaluation</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="initial-message">Initial Message</Label>
            <Textarea
              id="initial-message"
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              placeholder="Enter the initial message to start the conversation..."
              className="mt-1"
              rows={3}
            />
            <p className="text-sm text-gray-500 mt-1">
              This message will start the conversation with the bot
            </p>
          </div>

          <div>
            <Label htmlFor="max-depth">Maximum Conversation Depth</Label>
            <Input
              id="max-depth"
              type="number"
              min={1}
              max={10}
              value={maxDepth}
              onChange={(e) => setMaxDepth(parseInt(e.target.value, 10))}
              className="mt-1"
            />
            <p className="text-sm text-gray-500 mt-1">
              Maximum number of back-and-forth interactions (1-10)
            </p>
          </div>

          <div>
            <Label htmlFor="system-prompt">System Prompt (Optional)</Label>
            <Textarea
              id="system-prompt"
              value={systemPrompt}
              onChange={(e) => setSystemPrompt(e.target.value)}
              placeholder="Enter custom system prompt for the evaluator..."
              className="mt-1"
              rows={3}
            />
            <p className="text-sm text-gray-500 mt-1">
              Optional prompt to define the evaluator's persona and context
            </p>
          </div>

          {error && (
            <div className="text-red-600 text-sm">
              {error}
            </div>
          )}

          <div className="flex justify-end gap-4 mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <FileUp className="w-4 h-4" />
                  Start Evaluation
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default ConversationEvalForm;