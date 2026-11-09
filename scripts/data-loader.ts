import { readFileSync } from 'node:fs';
import Ajv from 'ajv';
import type { Data } from '../src/domain/types.ts';

const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });

function readJson(path: string): unknown {
  try {
    return JSON.parse(readFileSync(new URL(`../data/${path}`, import.meta.url), 'utf8'));
  } catch (error) {
    throw new Error(
      `data/${path}: gültiges JSON erwartet, gefunden: ${String(error)}. JSON-Syntax und Pfad prüfen.`,
    );
  }
}

function load<K extends keyof Data>(name: K): Data[K] {
  const value = readJson(`${name}.json`);
  const validate = ajv.compile<Data[K]>(readJson(`schema/${name}.schema.json`) as object);
  if (validate(value)) return value;

  const issues = validate.errors?.map(({ instancePath, message, params }) => {
    const actual = instancePath
      .split('/')
      .slice(1)
      .reduce<unknown>((entry, key) => {
        const decoded = key.replaceAll('~1', '/').replaceAll('~0', '~');
        return typeof entry === 'object' && entry !== null
          ? Reflect.get(entry, decoded)
          : undefined;
      }, value);
    const index = instancePath.match(/^\/(\d+)(?:\/|$)/)?.[1];
    const entry: unknown =
      Array.isArray(value) && index !== undefined ? value[Number(index)] : actual;
    const id =
      entry && typeof entry === 'object' && 'id' in entry ? String(entry.id) : String(index ?? '-');
    return `data/${name}.json [${id}] ${instancePath || '/'}: erwartet ${message} ${JSON.stringify(params)}, gefunden ${JSON.stringify(actual)}. Feld nach data/schema/${name}.schema.json korrigieren.`;
  });
  throw new Error(issues?.join('\n'));
}

export function loadData(): Data {
  return {
    categories: load('categories'),
    groups: load('groups'),
    modules: load('modules'),
    plan: load('plan'),
    meta: load('meta'),
  };
}
