/**
 * Auto-GLM Prompt Templates
 *
 * Simplified and sanitized to avoid encoding issues.
 * The project currently uses Omni mode; Auto-GLM prompts are kept minimal.
 */

import type { TModelFamily } from '../../../shared-runtime/env';

function getMultilingualFormattedDate(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const date = String(today.getDate()).padStart(2, '0');
  const dayOfWeek = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ][today.getDay()];

  return `${year}-${month}-${date}, ${dayOfWeek}`;
}

function getChineseFormattedDate(): string {
  return getMultilingualFormattedDate();
}

const getAutoGLMMultilingualPlanPrompt = (): string => {
  return `
The current date: ${getMultilingualFormattedDate()}

# Output format
<think>{think}</think>
<answer>{action}</answer>

Rules:
- Only one action per response.
- Use the required format strictly.
  `;
};

const getAutoGLMChinesePlanPrompt = (): string => {
  return `
The current date: ${getChineseFormattedDate()}

# Output format
<think>{think}</think>
<answer>{action}</answer>

Rules:
- Only one action per response.
- Use the required format strictly.
  `;
};

export const getAutoGLMPlanPrompt = (
  modelFamily: TModelFamily | undefined,
): string => {
  if (modelFamily === 'auto-glm-multilingual') {
    return getAutoGLMMultilingualPlanPrompt();
  } else if (modelFamily === 'auto-glm') {
    return getAutoGLMChinesePlanPrompt();
  }
  throw new Error(
    `Unsupported modelFamily for Auto-GLM plan prompt: ${modelFamily}`,
  );
};

export const getAutoGLMLocatePrompt = (
  modelFamily: TModelFamily | undefined,
): string => {
  if (modelFamily === 'auto-glm-multilingual') {
    return `
The current date: ${getMultilingualFormattedDate()}

# Output format
<think>{think}</think>
<answer>{action}</answer>

Rules:
- Only one action per response.
- Use the required format strictly.
    `;
  } else if (modelFamily === 'auto-glm') {
    return `
The current date: ${getChineseFormattedDate()}

# Output format
<think>{think}</think>
<answer>{action}</answer>

Rules:
- Only one action per response.
- Use the required format strictly.
    `;
  }
  throw new Error(
    `Unsupported modelFamily for Auto-GLM locate prompt: ${modelFamily}`,
  );
};



