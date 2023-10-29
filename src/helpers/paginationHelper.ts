import { IPaginationOptions } from '../interfaces/pagination';

type IOptionsResult = Required<IPaginationOptions> & {
  skip: number;
};
const calculatePagination = (options: IPaginationOptions): IOptionsResult => {
  const page = +(options.page || 1);
  const limit = +(options.limit || 10);
  const skip = (page - 1) * limit;

  const sortBy = options?.sortBy || 'createdAt';
  const sortOrder = options?.sortOrder || 'desc';

  return {
    page,
    limit,
    skip,
    sortBy,
    sortOrder,
  };
};

export const paginationHelpers = {
  calculatePagination,
};
