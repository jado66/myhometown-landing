import type { AdvancedFilter } from "@/app/actions/schema";
import type { ReportVariable } from "@/components/admin/variables-card";

/**
 * Replaces variables in a string with provided values
 * Variables should be in format {{param1}}, {{param2}}, etc.
 */
export function replaceVariables(
  text: string,
  variables: Record<string, string>
): string {
  if (!text) return text;

  return text.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
    return variables[varName] !== undefined ? variables[varName] : match;
  });
}

/**
 * Processes filters to replace variable placeholders with actual values
 */
export function processFiltersWithVariables(
  filters: AdvancedFilter[],
  variables: Record<string, string>
): AdvancedFilter[] {
  return filters.map((filter) => ({
    ...filter,
    value: replaceVariables(filter.value, variables),
    valueTo: filter.valueTo
      ? replaceVariables(filter.valueTo, variables)
      : undefined,
  }));
}

/**
 * Processes report metadata to replace variable placeholders with actual values
 */
export function processMetadataWithVariables(
  metadata: {
    title: string;
    header: string;
    description: string;
  },
  variables: Record<string, string>
): {
  title: string;
  header: string;
  description: string;
} {
  return {
    title: replaceVariables(metadata.title, variables),
    header: replaceVariables(metadata.header, variables),
    description: replaceVariables(metadata.description, variables),
  };
}

/**
 * Finds all variable references in a string
 * Returns array of variable names found (without the {{}} syntax)
 */
export function findVariableReferences(text: string): string[] {
  if (!text) return [];

  const matches = text.match(/\{\{(\w+)\}\}/g);
  if (!matches) return [];

  return matches.map((match) => match.replace(/\{\{|\}\}/g, ""));
}

/**
 * Validates that all variable references in filters and metadata
 * have corresponding variable definitions
 */
export function validateVariableReferences(
  filters: AdvancedFilter[],
  metadata: {
    title: string;
    header: string;
    description: string;
  },
  definedVariables: ReportVariable[]
): {
  isValid: boolean;
  missingVariables: string[];
  foundReferences: string[];
} {
  const definedVarNames = new Set(definedVariables.map((v) => v.name));
  const allReferences = new Set<string>();

  // Check filters
  filters.forEach((filter) => {
    findVariableReferences(filter.value).forEach((ref) =>
      allReferences.add(ref)
    );
    if (filter.valueTo) {
      findVariableReferences(filter.valueTo).forEach((ref) =>
        allReferences.add(ref)
      );
    }
  });

  // Check metadata
  findVariableReferences(metadata.title).forEach((ref) =>
    allReferences.add(ref)
  );
  findVariableReferences(metadata.header).forEach((ref) =>
    allReferences.add(ref)
  );
  findVariableReferences(metadata.description).forEach((ref) =>
    allReferences.add(ref)
  );

  const foundReferences = Array.from(allReferences);
  const missingVariables = foundReferences.filter(
    (ref) => !definedVarNames.has(ref)
  );

  return {
    isValid: missingVariables.length === 0,
    missingVariables,
    foundReferences,
  };
}

/**
 * Converts a ReportVariable to a default test value based on its type
 */
export function getDefaultTestValue(variable: ReportVariable): string {
  if (variable.defaultValue) {
    return variable.defaultValue;
  }

  switch (variable.type) {
    case "string":
      return `test_${variable.name}`;
    case "number":
      return "123";
    case "date":
      return new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    case "boolean":
      return "true";
    default:
      return "";
  }
}

/**
 * Creates a test values object from variable definitions
 */
export function createTestValues(
  variables: ReportVariable[]
): Record<string, string> {
  const testValues: Record<string, string> = {};

  variables.forEach((variable) => {
    testValues[variable.name] = getDefaultTestValue(variable);
  });

  return testValues;
}

/**
 * Validates that test values match variable type constraints
 */
export function validateTestValue(
  value: string,
  variable: ReportVariable
): {
  isValid: boolean;
  error?: string;
} {
  if (!value && !variable.defaultValue) {
    return { isValid: false, error: "Value is required" };
  }

  switch (variable.type) {
    case "number":
      if (isNaN(Number(value))) {
        return { isValid: false, error: "Must be a valid number" };
      }
      break;
    case "date":
      if (value && isNaN(Date.parse(value))) {
        return { isValid: false, error: "Must be a valid date" };
      }
      break;
    case "boolean":
      if (value && value !== "true" && value !== "false") {
        return { isValid: false, error: "Must be true or false" };
      }
      break;
  }

  return { isValid: true };
}

/**
 * Validates all test values against their corresponding variable definitions
 */
export function validateAllTestValues(
  testValues: Record<string, string>,
  variables: ReportVariable[]
): {
  isValid: boolean;
  errors: Record<string, string>;
} {
  const errors: Record<string, string> = {};

  variables.forEach((variable) => {
    const value = testValues[variable.name] || "";
    const validation = validateTestValue(value, variable);

    if (!validation.isValid) {
      errors[variable.name] = validation.error || "Invalid value";
    }
  });

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
