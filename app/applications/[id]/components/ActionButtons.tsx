// pitchdeck/app/applications/[id]/components/ActionButtons.tsx

import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Sparkles, BarChart3 } from "lucide-react";
import { ProcessingAction } from "../lib/types";

interface ActionButtonsProps {
  onTriggerAction: (action: ProcessingAction) => void;
  processingAction: ProcessingAction | null;
}

export function ActionButtons({
  onTriggerAction,
  processingAction,
}: ActionButtonsProps) {
  const isProcessing = !!processingAction;

  return (
    <div className="flex space-x-2">
      <Button
        onClick={() => onTriggerAction("extract")}
        variant="outline"
        disabled={isProcessing}
      >
        {processingAction === "extract" ? (
          <>
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            Extracting...
          </>
        ) : (
          <>
            <RefreshCw className="mr-2 h-4 w-4" />
            Trigger Data Extract
          </>
        )}
      </Button>
      <Button
        onClick={() => onTriggerAction("enhance")}
        variant="outline"
        disabled={isProcessing}
      >
        {processingAction === "enhance" ? (
          <>
            <Sparkles className="mr-2 h-4 w-4 animate-spin" />
            Enhancing...
          </>
        ) : (
          <>
            <Sparkles className="mr-2 h-4 w-4" />
            Trigger Data Enhancement
          </>
        )}
      </Button>
      <Button
        onClick={() => onTriggerAction("evaluate")}
        variant="outline"
        disabled={isProcessing}
      >
        {processingAction === "evaluate" ? (
          <>
            <BarChart3 className="mr-2 h-4 w-4 animate-spin" />
            Evaluating...
          </>
        ) : (
          <>
            <BarChart3 className="mr-2 h-4 w-4" />
            Trigger Evaluation
          </>
        )}
      </Button>
    </div>
  );
}
