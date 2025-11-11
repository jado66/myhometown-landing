"use client";
import * as React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Variable,
  Plus,
  X,
  TestTube,
  Play,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export interface ReportVariable {
  name: string;
  type: "string" | "number" | "date" | "boolean";
  defaultValue?: string;
  description?: string;
}

interface VariablesCardProps {
  variables: ReportVariable[];
  setVariables: (
    variables: ReportVariable[] | ((prev: ReportVariable[]) => ReportVariable[])
  ) => void;
  testValues: Record<string, string>;
  setTestValues: (
    values:
      | Record<string, string>
      | ((prev: Record<string, string>) => Record<string, string>)
  ) => void;
  onTestVariables?: (testValues: Record<string, string>) => Promise<boolean>;
}

type Mode = "add" | "test" | null;

export function VariablesCard({
  variables,
  setVariables,
  testValues,
  setTestValues,
  onTestVariables,
}: VariablesCardProps) {
  const [mode, setMode] = React.useState<Mode>(null);
  const [testing, setTesting] = React.useState(false);
  const [testResults, setTestResults] = React.useState<{
    status: "success" | "error" | null;
    message?: string;
  }>({ status: null });

  // Form state for adding variables
  const [newVarName, setNewVarName] = React.useState("");
  const [newVarType, setNewVarType] =
    React.useState<ReportVariable["type"]>("string");
  const [newVarDefaultValue, setNewVarDefaultValue] = React.useState("");
  const [newVarDescription, setNewVarDescription] = React.useState("");

  // Validate variable name (param format: param1, param2, etc.)
  const validateVariableName = (name: string): boolean => {
    const pattern = /^param\d+$/;
    return pattern.test(name) && !variables.some((v) => v.name === name);
  };

  const handleAddVariable = () => {
    if (!newVarName.trim()) {
      toast.error("Variable name is required");
      return;
    }

    if (!validateVariableName(newVarName)) {
      toast.error(
        "Variable name must be in format 'param1', 'param2', etc. and must be unique"
      );
      return;
    }

    const newVariable: ReportVariable = {
      name: newVarName.trim(),
      type: newVarType,
      defaultValue: newVarDefaultValue.trim() || undefined,
      description: newVarDescription.trim() || undefined,
    };

    setVariables((prev) => [...prev, newVariable]);

    // Initialize test value with default value
    if (newVariable.defaultValue) {
      setTestValues((prev) => ({
        ...prev,
        [newVariable.name]: newVariable.defaultValue!,
      }));
    }

    // Reset form
    setNewVarName("");
    setNewVarType("string");
    setNewVarDefaultValue("");
    setNewVarDescription("");
    setMode(null);

    toast.success(`Variable ${newVariable.name} added successfully`);
  };

  const removeVariable = (name: string) => {
    setVariables((prev) => prev.filter((v) => v.name !== name));
    setTestValues((prev) => {
      const newValues = { ...prev };
      delete newValues[name];
      return newValues;
    });
    toast.success(`Variable ${name} removed`);
  };

  const handleTestVariables = async () => {
    if (!onTestVariables) {
      toast.error("Test function not available");
      return;
    }

    setTesting(true);
    setTestResults({ status: null });

    try {
      const success = await onTestVariables(testValues);
      setTestResults({
        status: success ? "success" : "error",
        message: success
          ? "All variables resolved successfully!"
          : "Some variables failed to resolve properly",
      });

      if (success) {
        toast.success("Variable test completed successfully!");
      } else {
        toast.error("Variable test failed");
      }
    } catch (error) {
      setTestResults({
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Test failed with unknown error",
      });
      toast.error("Variable test failed");
    } finally {
      setTesting(false);
    }
  };

  const getInputForType = (
    type: ReportVariable["type"],
    value: string,
    onChange: (value: string) => void,
    placeholder: string,
    id?: string
  ) => {
    switch (type) {
      case "boolean":
        return (
          <Select value={value} onValueChange={onChange}>
            <SelectTrigger
              id={id}
              className="h-10 bg-background border-border/50"
            >
              <SelectValue placeholder={placeholder} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        );
      case "date":
        return (
          <Input
            id={id}
            type="date"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 bg-background border-border/50"
            placeholder={placeholder}
          />
        );
      case "number":
        return (
          <Input
            id={id}
            type="number"
            step="any"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 bg-background border-border/50"
            placeholder={placeholder}
          />
        );
      default: // string
        return (
          <Input
            id={id}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 bg-background border-border/50"
            placeholder={placeholder}
          />
        );
    }
  };

  const getNextParamName = (): string => {
    const existingNumbers = variables
      .map((v) => v.name.match(/^param(\d+)$/))
      .filter((match) => match)
      .map((match) => parseInt(match![1]))
      .sort((a, b) => a - b);

    let nextNumber = 1;
    for (const num of existingNumbers) {
      if (num === nextNumber) {
        nextNumber++;
      } else {
        break;
      }
    }

    return `param${nextNumber}`;
  };

  // Auto-suggest next parameter name when opening add form
  React.useEffect(() => {
    if (mode === "add" && !newVarName) {
      setNewVarName(getNextParamName());
    }
  }, [mode]);

  return (
    <Card className="col-span-1 border-border/50 shadow-md hover:shadow-lg transition-shadow">
      <CardHeader className="border-b border-border/50">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3 text-lg">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/10">
                <Variable className="h-4.5 w-4.5 text-secondary-foreground" />
              </div>
              Report Variables
            </CardTitle>
            <CardDescription className="mt-2">
              Define reusable parameters for dynamic reports
            </CardDescription>
          </div>
          <ButtonGroup>
            <Button
              variant={mode === "add" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode(mode === "add" ? null : "add")}
              className="h-9 px-3 hover:text-white"
            >
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Add
            </Button>
            <Button
              variant={mode === "test" ? "default" : "outline"}
              size="sm"
              onClick={() => setMode(mode === "test" ? null : "test")}
              disabled={variables.length === 0}
              className="h-9 px-3 hover:text-white"
            >
              <TestTube className="h-3.5 w-3.5 mr-1.5" />
              Test
            </Button>
          </ButtonGroup>
        </div>
      </CardHeader>
      <CardContent className="space-y-5 pt-6">
        {/* Add Variable Form */}
        {mode === "add" && (
          <div className="space-y-4 p-5 border border-border/50 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <Variable className="h-4 w-4 text-secondary-foreground" />
              <Label className="text-sm font-semibold">Add New Variable</Label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="var-name"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Parameter Name
                </Label>
                <Input
                  id="var-name"
                  placeholder="param1, param2, etc."
                  value={newVarName}
                  onChange={(e) => setNewVarName(e.target.value)}
                  className="h-10 bg-background border-border/50"
                />
                <p className="text-xs text-muted-foreground">
                  Must be in format: param1, param2, param3, etc.
                </p>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="var-type"
                  className="text-xs font-medium text-muted-foreground"
                >
                  Data Type
                </Label>
                <Select
                  value={newVarType}
                  onValueChange={(v) =>
                    setNewVarType(v as ReportVariable["type"])
                  }
                >
                  <SelectTrigger
                    id="var-type"
                    className="h-10 bg-background border-border/50"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="string">Text</SelectItem>
                    <SelectItem value="number">Number</SelectItem>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="boolean">True/False</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="var-default"
                className="text-xs font-medium text-muted-foreground"
              >
                Default Value (Optional)
              </Label>
              {getInputForType(
                newVarType,
                newVarDefaultValue,
                setNewVarDefaultValue,
                "Enter default value",
                "var-default"
              )}
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="var-description"
                className="text-xs font-medium text-muted-foreground"
              >
                Description (Optional)
              </Label>
              <Textarea
                id="var-description"
                placeholder="Describe what this variable is used for..."
                value={newVarDescription}
                onChange={(e) => setNewVarDescription(e.target.value)}
                className="min-h-[60px] bg-background border-border/50 resize-none"
              />
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMode(null)}
                className="h-9 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAddVariable}
                disabled={!newVarName.trim()}
                className="h-9 bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 hover:text-white"
              >
                Add Variable
              </Button>
            </div>
          </div>
        )}

        {/* Test Variables Form */}
        {mode === "test" && (
          <div className="space-y-4 p-5 border border-border/50 rounded-xl bg-gradient-to-br from-muted/50 to-muted/30 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TestTube className="h-4 w-4 text-secondary-foreground" />
              <Label className="text-sm font-semibold">
                Test Variable Values
              </Label>
            </div>

            <div className="space-y-3">
              {variables.map((variable) => (
                <div key={variable.name} className="space-y-2">
                  <Label
                    htmlFor={`test-${variable.name}`}
                    className="text-xs font-medium text-muted-foreground flex items-center gap-2"
                  >
                    {variable.name} ({variable.type})
                    {variable.description && (
                      <span className="text-xs text-muted-foreground/70">
                        - {variable.description}
                      </span>
                    )}
                  </Label>
                  {getInputForType(
                    variable.type,
                    testValues[variable.name] || variable.defaultValue || "",
                    (value) =>
                      setTestValues((prev) => ({
                        ...prev,
                        [variable.name]: value,
                      })),
                    `Enter value for ${variable.name}`,
                    `test-${variable.name}`
                  )}
                </div>
              ))}
            </div>

            {/* Test Results */}
            {testResults.status && (
              <div
                className={`p-3 rounded-lg flex items-center gap-2 ${
                  testResults.status === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {testResults.status === "success" ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <span className="text-sm">{testResults.message}</span>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setMode(null)}
                className="h-9 hover:text-white"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleTestVariables}
                disabled={testing || variables.length === 0}
                className="h-9 bg-gradient-to-r from-secondary to-secondary/80 hover:from-secondary/90 hover:to-secondary/70 hover:text-white"
              >
                {testing ? (
                  <>
                    <AlertCircle className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Play className="h-3.5 w-3.5 mr-1.5" />
                    Run Test
                  </>
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Active Variables */}
        {variables.length > 0 && !mode && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold flex items-center gap-2">
                <Variable className="h-4 w-4 text-secondary-foreground" />
                Defined Variables ({variables.length})
              </Label>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setVariables([]);
                  setTestValues({});
                }}
                className="h-8 px-3 text-xs hover:text-white"
              >
                Clear all
              </Button>
            </div>
            <div className="space-y-2">
              {variables.map((variable) => (
                <div
                  key={variable.name}
                  className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/30"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-xs font-mono bg-background/50"
                      >
                        {variable.name}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {variable.type}
                      </Badge>
                      {variable.defaultValue && (
                        <Badge
                          variant="outline"
                          className="text-xs text-muted-foreground"
                        >
                          default: {variable.defaultValue}
                        </Badge>
                      )}
                    </div>
                    {variable.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {variable.description}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeVariable(variable.name)}
                    className="h-8 w-8 p-0 hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {variables.length === 0 && !mode && (
          <div className="flex items-center justify-center h-[400px] text-center">
            <div className="space-y-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted mx-auto">
                <Variable className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground max-w-[250px]">
                  No variables defined yet
                </p>
                <p className="text-xs text-muted-foreground max-w-[250px] mt-1">
                  Add parameters like param1, param2 to make dynamic reports
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
