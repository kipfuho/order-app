import { TypedUseQuery } from "@reduxjs/toolkit/query/react";
import { useCallback, useState } from "react";

export function useInfiniteScrollingQuery(
  shopId: string,
  useQuery: TypedUseQuery<any, any, any>,
  additionalData?: any,
) {
  const [cursor, setCursor] = useState<string>();

  const { data, error, isLoading, isFetching, refetch } = useQuery({
    shopId,
    cursor,
    ...additionalData,
  });

  const hasNextPage = !!data?.nextCursor;
  const isFetchingNextPage = isFetching && !!cursor;

  const fetchNextPage = useCallback(() => {
    if (data?.nextCursor && !isFetching) {
      setCursor(data.nextCursor);
    }
  }, [data?.nextCursor, isFetching]);

  const reset = useCallback(() => {
    setCursor(undefined);
    refetch();
  }, [refetch]);

  return {
    data: data?.items || [],
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    isLoading,
    error,
    reset,
  };
}
