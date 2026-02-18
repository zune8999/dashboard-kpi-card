import { bitable } from "@lark-base-open/js-sdk";

export async function fetchData(tableId: string, fieldId: string): Promise<number[]> {
  if (!tableId || !fieldId) return [];
  
  const table = await bitable.base.getTableById(tableId);
  const recordIdList = await table.getRecordIdList();

  const results: number[] = [];
  for (const recordId of recordIdList) {
    try {
      const raw = await table.getCellValue(fieldId, recordId);
      const value = parseCellValue(raw);
      if (typeof value === 'number') {
        results.push(value);
      }
    } catch (e) {
      console.warn("跳过记录", recordId, e);
    }
  }
  return results;
}

// 字段值类型处理
function parseCellValue(raw: any): any {
  if (raw === null || raw === undefined) return null;
  // 数字字段：直接返回
  if (typeof raw === "number") return raw;
  // 单选字段：返回 {id, text} 对象
  if (typeof raw === "object" && !Array.isArray(raw) && raw.text) return raw.text;
  // 多选字段：返回 [{text:"..."}, ...] 数组
  if (Array.isArray(raw)) {
    if (raw[0]?.text !== undefined) return raw[0].text;
    return raw;
  }
  // 文本字段：尝试解析为数字
  if (typeof raw === "string") {
    const num = parseFloat(raw);
    return isNaN(num) ? raw : num;
  }
  return String(raw);
}

// 获取表格列表
export async function getTableList() {
  return await bitable.base.getTableMetaList();
}

// 获取字段元数据
export async function getFieldMetas(tableId: string) {
  const table = await bitable.base.getTableById(tableId);
  return await table.getFieldMetaList();
}