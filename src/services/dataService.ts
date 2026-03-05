import { bitable } from "@lark-base-open/js-sdk";
import type { Aggregation } from '../types';

export async function fetchData(
  tableId: string,
  fieldId: string,
  aggregation: Aggregation
): Promise<number | null> {
  if (!tableId || !fieldId) return null;

  const table = await bitable.base.getTableById(tableId);
  const recordIds = await table.getRecordIdList();

  const values: number[] = [];
  for (const recordId of recordIds) {
    try {
      const raw = await table.getCellValue(fieldId, recordId);
      const value = parseCellValue(raw);
      if (typeof value === 'number' && !isNaN(value)) {
        values.push(value);
      }
    } catch (e) {
      console.warn('跳过记录', recordId, e);
    }
  }

  if (values.length === 0) return null;

  switch (aggregation) {
    case 'sum':  return values.reduce((a, b) => a + b, 0);
    case 'avg':  return values.reduce((a, b) => a + b, 0) / values.length;
    case 'max':  return Math.max(...values);
    case 'min':  return Math.min(...values);
    case 'last': return values[values.length - 1];
    default:     return null;
  }
}

function parseCellValue(raw: any): number | null {
  if (raw === null || raw === undefined) return null;
  if (typeof raw === 'number') return raw;
  if (typeof raw === 'string') {
    const n = parseFloat(raw);
    return isNaN(n) ? null : n;
  }
  if (Array.isArray(raw) && raw[0]?.text !== undefined) {
    const n = parseFloat(raw[0].text);
    return isNaN(n) ? null : n;
  }
  return null;
}

export async function getTableList() {
  return await bitable.base.getTableMetaList();
}

export async function getFieldMetas(tableId: string) {
  const table = await bitable.base.getTableById(tableId);
  return await table.getFieldMetaList();
}
