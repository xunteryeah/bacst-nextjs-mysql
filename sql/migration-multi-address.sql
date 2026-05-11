-- ============================================================
-- Migration: addressData -> 支持多公司地址
--   - rename adddress (typo) -> factoryAddress
--   - convert address TEXT -> JSON (array of strings)
-- 幂等:重复执行不会报错也不会损坏数据,CI 每次部署都会跑。
-- ============================================================

USE bacst;

-- 1. 仅在 adddress 仍存在时重命名为 factoryAddress
SET @rename_sql := IF(
  EXISTS(
    SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = 'bacst' AND TABLE_NAME = 'addressData' AND COLUMN_NAME = 'adddress'
  ),
  'ALTER TABLE addressData CHANGE adddress factoryAddress TEXT',
  'SELECT "factoryAddress already in place" AS note'
);
PREPARE stmt FROM @rename_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 2. 当前 address 列类型
SET @addr_type := (
  SELECT DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS
  WHERE TABLE_SCHEMA = 'bacst' AND TABLE_NAME = 'addressData' AND COLUMN_NAME = 'address'
);

-- 3. 若还不是 JSON 列,先把现存字符串包成 JSON 数组(避免 ALTER 时数据格式不合法)
SET @wrap_sql := IF(
  @addr_type <> 'json',
  'UPDATE addressData SET address = JSON_ARRAY(address) WHERE address IS NOT NULL AND (JSON_VALID(address) = 0 OR JSON_TYPE(address) <> ''ARRAY'')',
  'SELECT "address already JSON, skip wrap" AS note'
);
PREPARE stmt FROM @wrap_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 4. 再把列类型改成 JSON
SET @alter_sql := IF(
  @addr_type <> 'json',
  'ALTER TABLE addressData MODIFY address JSON',
  'SELECT "address column type unchanged" AS note'
);
PREPARE stmt FROM @alter_sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;
