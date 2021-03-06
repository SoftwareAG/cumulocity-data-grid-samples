import { Injectable } from '@angular/core';

import { IResultList, IMeasurement, QueriesUtil } from '@c8y/client';
import { Column, DataSourceModifier, Pagination, ServerSideDataResult } from '@c8y/ngx-components';
import { MeasurementService } from '@c8y/ngx-components/api';

@Injectable({ providedIn: 'root' })
export class MeasurementsDatasourceService {
  private readonly queriesUtil = new QueriesUtil();

  constructor(private measurementService: MeasurementService) {}

  async reload(
    dataSourceModifier: DataSourceModifier,
    baseQuery: object
  ): Promise<ServerSideDataResult> {
    const filterQuery = this.createQueryFilter(dataSourceModifier.columns);
    const allQuery = this.createQueryFilter([]);

    const mosForPage = this.fetchMeasurementObjectsForPage(
      baseQuery,
      filterQuery,
      dataSourceModifier.pagination
    );
    const filtered = this.fetchMeasurementObjectsCount(baseQuery, filterQuery);
    const total = this.fetchMeasurementObjectsCount(baseQuery, allQuery);
    const [managedObjects, filteredSize, size] = await Promise.all([mosForPage, filtered, total]);

    const result: ServerSideDataResult = {
      size,
      filteredSize,
      ...managedObjects,
    };

    return result;
  }

  fetchMeasurementObjectsForPage(
    baseQuery: object,
    query: object,
    pagination: Pagination
  ): Promise<IResultList<IMeasurement>> {
    const filters = {
      ...baseQuery,
      ...query,
      withParents: true,
      pageSize: pagination.pageSize,
      currentPage: pagination.currentPage,
      withTotalPages: false,
    };
    return this.measurementService.list(filters);
  }

  /**
   * Returns the complete count of items. Use wisely ond only if really necessary as the calculation of the count is expensive on server-side.
   * @param query
   */
  fetchMeasurementObjectsCount(baseQuery: object, query: object): Promise<number> {
    const filters = {
      ...baseQuery,
      ...query,
      pageSize: 1,
      currentPage: 1,
      withTotalPages: true,
    };
    return this.measurementService
      .list(filters)
      .then((result) => (result.paging !== undefined ? result.paging.totalPages : 0));
  }

  createQueryFilter(columns: Column[]): { query: string } | {} {
    const query = columns.reduce(this.extendQueryByColumn, {
      __filter: {},
      __orderby: [],
    });

    const queryString = this.queriesUtil.buildQuery(query);
    if (queryString.length) {
      return { query: queryString };
    } else {
      return {};
    }
  }

  extendQueryByColumn = (query: any, column: Column) => {
    if (!column.path) {
      return query;
    }

    if (column.filterable && column.filterPredicate) {
      const queryObj: any = {};
      queryObj[column.path] = column.filterPredicate;
      query.__filter = { ...query.__filter, ...queryObj };
    }

    if (column.filterable && column.externalFilterQuery) {
      query.__filter = { ...query.__filter, ...column.externalFilterQuery };
    }

    if (column.sortable && column.sortOrder) {
      const cs: any = {};
      cs[column.path] = column.sortOrder === 'asc' ? 1 : -1;
      query.__orderby.push(cs);
    }

    return query;
  };
}
