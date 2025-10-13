import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  title: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  stepIcons?: React.ReactNode[];
}

export function Stepper({ steps, currentStep, stepIcons }: StepperProps) {
  return (
    <div className="w-full">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <React.Fragment key={index}>
              <div className="flex flex-col items-center gap-2 flex-1">
                <div
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300",
                    isCompleted &&
                      "bg-primary text-primary-foreground shadow-md",
                    isCurrent &&
                      "bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-lg scale-110",
                    isUpcoming &&
                      "bg-muted text-muted-foreground border-2 border-border"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 text-white" />
                  ) : stepIcons && stepIcons[index] ? (
                    React.cloneElement(stepIcons[index] as React.ReactElement, {
                      className: cn(
                        "w-5 h-5",
                        (isCompleted || isCurrent) && "text-white"
                      ),
                    })
                  ) : (
                    stepNumber
                  )}
                </div>
                <div className="text-center hidden sm:block">
                  <div
                    className={cn(
                      "text-sm font-semibold transition-colors",
                      isCurrent && "text-foreground",
                      (isCompleted || isUpcoming) && "text-muted-foreground"
                    )}
                  >
                    {step.title}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {step.description}
                  </div>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className="flex-1 h-[2px] mx-2 mb-8 hidden sm:block">
                  <div
                    className={cn(
                      "h-full transition-all duration-500",
                      stepNumber < currentStep ? "bg-primary" : "bg-border"
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
