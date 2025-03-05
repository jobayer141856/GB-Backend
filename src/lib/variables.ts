import { asc, desc, or, sql } from 'drizzle-orm';
import { char, decimal, timestamp } from 'drizzle-orm/pg-core';

import type { ColumnProps } from './types';

export function defaultUUID(column = 'uuid') {
  return char(column, {
    length: 21,
  });
}

export const uuid_primary = defaultUUID().primaryKey();

export function DateTime(column: ColumnProps['datetime']) {
  return timestamp(column, {
    mode: 'string',
    withTimezone: false,
  });
}

export function PG_DECIMAL(column: ColumnProps['default']) {
  return decimal(column, {
    precision: 20,
    scale: 4,
  }).notNull();
}

export function PG_DECIMAL_TO_FLOAT(column: any) {
  return sql`coalesce(${sql.raw(column.name)}, 0)::float8`;
}

export function constructSelectAllQuery(
  baseQuery: any,
  params: any,
  defaultSortField = 'created_at',
  additionalSearchFields: string[] = [],
) {
  const { q, page, limit, sort, orderby } = params;

  // Get search fields from the main table
  const searchFields = Object.keys(baseQuery.config.table[Symbol.for('drizzle:Columns')]).filter(
    field =>
      field !== 'uuid'
      && field !== 'id'
      && field !== 'created_at'
      && field !== 'updated_at'
      && field !== 'department_head'
      && field !== 'appointment_date'
      && field !== 'resign_date'
      && field !== 'deadline'
      && field !== 'published_date'
      && field !== 'file'
      && field !== 'cover_image'
      && field !== 'documents'
      && field !== 'image'
      && field !== 'table_name'
      && field !== 'page_name'
      && field !== 'programs'
      && field !== 'type'
      && field !== 'is_global',
  );

  // Get table name from baseQuery
  const tableNameSymbol = Object.getOwnPropertySymbols(baseQuery.config.table).find(symbol =>
    symbol.toString().includes('OriginalName'),
  );
  const tableName = tableNameSymbol ? baseQuery.config.table[tableNameSymbol] : '';

  // Include table name with fields for the main table
  const searchFieldsWithTable = searchFields.map(field => `"${tableName}"."${field}"`);

  // Include additional search fields from joined tables
  const joinedTables = baseQuery.config.joins || [];
  joinedTables.forEach((join: any) => {
    const joinTableNameSymbol = Object.getOwnPropertySymbols(join.table).find(symbol =>
      symbol.toString().includes('OriginalName'),
    );

    const joinTableName = joinTableNameSymbol ? join.table[joinTableNameSymbol] : '';

    const joinTableFields = Object.keys(join.table[Symbol.for('drizzle:Columns')]).filter(
      field =>
        field !== 'uuid'
        && field !== 'id'
        && field !== 'created_at'
        && field !== 'updated_at'
        && field !== 'department_head'
        && field !== 'appointment_date'
        && field !== 'resign_date'
        && field !== 'deadline',
    ).filter(field => additionalSearchFields.includes(field));

    const joinFieldsWithTable = joinTableFields.map(field => joinTableName ? `"${joinTableName}"."${field}"` : `"${field}"`);

    searchFieldsWithTable.push(...joinFieldsWithTable);
  });

  // Include additional search fields from joined tables
  const allSearchFields = [...searchFieldsWithTable];

  // Apply search filter
  if (q) {
    const searchConditions = allSearchFields.map((field) => {
      return sql`LOWER(${sql.raw(field)}) LIKE LOWER(${`%${q}%`})`;
    });

    if (searchConditions.length > 0) {
      baseQuery = baseQuery.where(sql`${or(...searchConditions)}`);
    }
  }

  // Apply sorting
  if (sort) {
    const order = orderby === 'asc' ? asc : desc;
    baseQuery = baseQuery.orderBy(
      order(baseQuery.config.table[Symbol.for('drizzle:Columns')][sort]),
    );
  }
  else {
    baseQuery = baseQuery.orderBy(
      desc(
        baseQuery.config.table[Symbol.for('drizzle:Columns')][
          defaultSortField
        ],
      ),
    );
  }

  // Apply pagination
  if (page && limit) {
    const limitValue = Number(limit); // Set your desired limit per page
    const offset = (Number(page) - 1) * limitValue;
    baseQuery = baseQuery.limit(limitValue).offset(offset);
  }

  return baseQuery;
}
