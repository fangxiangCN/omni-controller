import type { TUserPrompt } from './common';
import type { AndroidDeviceOpt, IOSDeviceOpt } from './device';
import type { AgentOpt, LocateResultElement, Rect } from './types';
import type { UIContext } from './types';

export interface LocateOption {
  prompt?: TUserPrompt;
  deepThink?: boolean; // only available in vl model
  cacheable?: boolean; // user can set this param to false to disable the cache for a single agent api
  xpath?: string; // only available in web
  uiContext?: UIContext;
  fileChooserAccept?: string | string[]; // file path(s) to upload when tapping triggers a file chooser
}

export interface ServiceExtractOption {
  domIncluded?: boolean | 'visible-only';
  screenshotIncluded?: boolean;
  [key: string]: unknown;
}

export interface DetailedLocateParam extends LocateOption {
  prompt: TUserPrompt;
}

export type ScrollType =
  | 'singleAction'
  | 'scrollToBottom'
  | 'scrollToTop'
  | 'scrollToRight'
  | 'scrollToLeft'
  // Legacy aliases kept for backward compatibility
  | 'once'
  | 'untilBottom'
  | 'untilTop'
  | 'untilRight'
  | 'untilLeft';

export type ActionScrollParam = {
  direction?: 'down' | 'up' | 'right' | 'left';
  scrollType?: ScrollType;
  distance?: number | null;
  locate?: LocateResultElement;
};

export type ScrollParam = Omit<ActionScrollParam, 'locate'>;

export interface YamlScript {
  // @deprecated
  target?: YamlScriptWebEnv;

  web?: YamlScriptWebEnv;
  android?: YamlScriptAndroidEnv;
  ios?: YamlScriptIOSEnv;
  computer?: YamlScriptComputerEnv;

  interface?: YamlScriptEnvGeneralInterface;
  config?: YamlScriptConfig;
  agent?: YamlScriptAgentOpt;

  tasks: YamlTask[];
}

export interface YamlTask {
  name: string;
  flow: YamlFlowItem[];
  continueOnError?: boolean;
}

/**
 * Agent configuration options that can be specified in YAML scripts.
 *
 * This type includes serializable fields from AgentOpt, excluding non-serializable
 * fields like functions and complex objects. All fields are optional.
 *
 * @remarks
 * - testId priority: CLI parameter > YAML agent.testId > filename
 * - These settings apply to all platforms (Web, Android, iOS, Generic Interface)
 * - modelConfig is configured through environment variables, not in YAML
 *
 * @example
 * ```yaml
 * agent:
 *   testId: "checkout-test"
 *   groupName: "E2E Test Suite"
 *   generateReport: true
 *   replanningCycleLimit: 30
 *   cache:
 *     id: "checkout-cache"
 *     strategy: "read-write"
 * ```
 */
export type YamlScriptAgentOpt = Pick<
  AgentOpt,
  | 'testId'
  | 'groupName'
  | 'groupDescription'
  | 'generateReport'
  | 'autoPrintReportMsg'
  | 'reportFileName'
  | 'replanningCycleLimit'
  | 'aiActContext'
  | 'aiActionContext'
  | 'cache'
>;

export interface YamlScriptConfig {
  output?: string;
  unstableLogContent?: boolean | string;
}

export interface YamlScriptEnvGeneralInterface {
  // this will work as `const {...} = import('...'); const interface = new ...(param)`
  module: string;
  export?: string;
  param?: Record<string, any>;
}

export interface YamlScriptWebEnv
  extends YamlScriptConfig,
    YamlScriptAgentOpt {
  // for web only
  serve?: string;
  url: string;

  // puppeteer only
  userAgent?: string;
  acceptInsecureCerts?: boolean;
  viewportWidth?: number;
  viewportHeight?: number;
  viewportScale?: number;
  waitForNetworkIdle?: {
    timeout?: number;
    continueOnNetworkIdleError?: boolean; // should continue if failed to wait for network idle, true for default
  };
  cookie?: string;
  forceSameTabNavigation?: boolean; // if track the newly opened tab, true for default in yaml script

  /**
   * Custom Chrome launch arguments (Puppeteer only, not supported in bridge mode).
   *
   * Allows passing custom command-line arguments to Chrome/Chromium when launching the browser.
   * This is useful for testing scenarios that require specific browser configurations.
   *
   * 鈿狅笍 Security Warning: Some arguments (e.g., --no-sandbox, --disable-web-security) may
   * reduce browser security. Use only in controlled testing environments.
   *
   * @example
   * ```yaml
   * web:
   *   url: https://example.com
   *   chromeArgs:
   *     - '--disable-features=ThirdPartyCookiePhaseout'
   *     - '--disable-features=SameSiteByDefaultCookies'
   *     - '--window-size=1920,1080'
   * ```
   */
  chromeArgs?: string[];

  // bridge mode config
  bridgeMode?: false | 'newTabWithUrl' | 'currentTab';
  closeNewTabsAfterDisconnect?: boolean;
}

export interface YamlScriptAndroidEnv
  extends YamlScriptConfig,
    Omit<AndroidDeviceOpt, 'customActions'> {
  // The Android device ID to connect to, optional, will use the first device if not specified
  deviceId?: string;

  // The URL or app package to launch, optional, will use the current screen if not specified
  launch?: string;
}

export interface YamlScriptIOSEnv
  extends YamlScriptConfig,
    Omit<IOSDeviceOpt, 'customActions'> {
  // The URL or app bundle ID to launch, optional, will use the current screen if not specified
  launch?: string;
}

export interface YamlScriptComputerEnv
  extends YamlScriptConfig {
  // The display ID to use, optional, will use the primary display if not specified
  displayId?: string;
}

export type YamlScriptEnv =
  | YamlScriptWebEnv
  | YamlScriptAndroidEnv
  | YamlScriptIOSEnv
  | YamlScriptComputerEnv;

export interface YamlFlowItemAIAction {
  // defined as aiAction for backward compatibility
  aiAction?: string;
  ai?: string; // this is the shortcut for aiAct
  aiAct?: string;
  aiActionProgressTips?: string[];
  cacheable?: boolean;
  [key: string]: unknown;
}

export interface YamlFlowItemAIAssert extends ServiceExtractOption {
  aiAssert: string;
  errorMessage?: string;
  name?: string;
}

export interface YamlFlowItemAIWaitFor extends ServiceExtractOption {
  aiWaitFor: string;
  timeout?: number;
}

export interface YamlFlowItemEvaluateJavaScript {
  javascript: string;
  name?: string;
}

export interface YamlFlowItemSleep {
  sleep: number;
}

export interface YamlFlowItemLogScreenshot {
  logScreenshot?: string; // optional, the title of the screenshot
  recordToReport?: string; // preferred key for record title
  content?: string;
}

export type YamlFlowItem =
  | YamlFlowItemAIAction
  | YamlFlowItemAIAssert
  | YamlFlowItemAIWaitFor
  | YamlFlowItemEvaluateJavaScript
  | YamlFlowItemSleep
  | YamlFlowItemLogScreenshot;

export interface FreeFn {
  name: string;
  fn: () => void;
}

export interface ScriptPlayerTaskStatus extends YamlTask {
  status: ScriptPlayerStatusValue;
  currentStep?: number;
  totalSteps: number;
  error?: Error;
}

export type ScriptPlayerStatusValue = 'init' | 'running' | 'done' | 'error';

// Index YAML file types for batch execution
export interface YamlConfig {
  concurrent?: number;
  continueOnError?: boolean;
  summary?: string;
  shareBrowserContext?: boolean;
  web?: YamlScriptWebEnv;
  android?: YamlScriptAndroidEnv;
  ios?: YamlScriptIOSEnv;
  files: string[];
  headed?: boolean;
  keepWindow?: boolean;
  dotenvOverride?: boolean;
  dotenvDebug?: boolean;
}

export interface YamlConfigOutput {
  format?: 'json';
  path?: string;
}

export interface YamlConfigResult {
  file: string;
  success: boolean;
  executed: boolean;
  output?: string | null;
  report?: string | null;
  error?: string;
  duration?: number;
  /**
   * Type of result:
   * - 'success': All tasks completed successfully
   * - 'failed': Execution failed (player error)
   * - 'partialFailed': Some tasks failed but execution continued (continueOnError)
   * - 'notExecuted': Not executed due to previous failures
   */
  resultType?: 'success' | 'failed' | 'partialFailed' | 'notExecuted';
}



