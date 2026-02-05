import yaml from 'js-yaml';
import type {
  YamlScript,
  YamlScriptWebEnv,
  YamlTask,
} from '../types';

export function buildYaml(
  env: YamlScriptWebEnv,
  tasks: YamlTask[],
) {
  const result: YamlScript = {
    target: env,
    tasks,
  };

  return yaml.dump(result, {
    indent: 2,
  });
}



