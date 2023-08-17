/* eslint-disable */

import * as md5 from "md5";

export const createSign = (
  params: Record<string, any>,
  key: string
): Record<string, any> => {
  const sortedParams = params
    ? Object.keys(params)
        .filter((key) => params[key] !== "")
        .sort()
        .reduce((result, key) => {
          (result as any)[key] = params[key];
          return result;
        }, {})
    : null;

  const stringA = sortedParams
    ? Object.entries(sortedParams)
        .map(([key, value]) => {
          if (Array.isArray(value)) {
            return `${key}=${JSON.stringify(value)}`;
          } else {
            return `${key}=${value}`;
          }
        })
        .join("&")
    : null;

  const stringSignTemp = String(
    (stringA && stringA + "&key=" + key) || "key=" + key
  );

  const signValue = md5(stringSignTemp).toUpperCase();

  return signValue as any;
};
