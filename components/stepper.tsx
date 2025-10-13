"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
}

export function Stepper({ steps, currentStep }: StepperProps) {
  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = currentStep > stepNumber;
          const isCurrent = currentStep === stepNumber;
          const isUpcoming = currentStep < stepNumber;

          return (
            <div key={index} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className="flex items-center w-full">
                  {/* Step Circle */}
                  <div
                    className={cn(
                      "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-colors",
                      isCompleted && "bg-primary text-primary-foreground",
                      isCurrent &&
                        "bg-primary text-primary-foreground ring-4 ring-primary/20",
                      isUpcoming && "bg-muted text-muted-foreground"
                    )}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
                  </div>

                  {/* Connector Line */}
                  {index < steps.length - 1 && (
                    <div
                      className={cn(
                        "h-0.5 flex-1 mx-2 transition-colors",
                        currentStep > stepNumber ? "bg-primary" : "bg-muted"
                      )}
                    />
                  )}
                </div>

                {/* Step Label - Hidden on mobile */}
                <div className="mt-2 text-center hidden md:block">
                  <p
                    className={cn(
                      "text-sm font-medium",
                      isCurrent && "text-foreground",
                      !isCurrent && "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile Step Label */}
      <div className="mt-4 text-center md:hidden">
        <p className="text-sm font-medium text-foreground">
          {steps[currentStep - 1]?.title}
        </p>
        {steps[currentStep - 1]?.description && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {steps[currentStep - 1]?.description}
          </p>
        )}
      </div>
    </div>
  );
}
