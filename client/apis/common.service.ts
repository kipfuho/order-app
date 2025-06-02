export const getEndpointWithCursor = ({
  cursor,
  endpoint,
}: {
  cursor?: string;
  endpoint: string;
}) => {
  const query = new URLSearchParams();
  if (cursor) query.append("cursor", cursor);
  const queryString = query.toString();

  return `${endpoint}${queryString ? `?${queryString}` : ""}`;
};
