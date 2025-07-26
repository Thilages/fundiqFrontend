// pitchdeck/app/applications/[id]/components/FullScreenLoader.tsx

import React from "react";
import { ProcessingAction } from "../lib/types";

const messages: { [key in ProcessingAction]: string } = {
  extract: "Extracting latest data from source...",
  enhance: "Enhancing data with external sources...",
  evaluate: "Running evaluation models...",
};

export function FullScreenLoader({ action }: { action: ProcessingAction }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white p-8 rounded-lg shadow-xl flex flex-col items-center space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        <h3 className="text-lg font-semibold">Processing Request</h3>
        <p className="text-sm text-muted-foreground">{messages[action]}</p>
      </div>
    </div>
  );
}
