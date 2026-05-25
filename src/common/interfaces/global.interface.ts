/*eslint-disable @typescript-eslint/no-unsafe-function-type*/
type BaseDataValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | GenericObjectType
  | DataValueArray
  // | BaseDataValue
  | Function;

type DataValueArray = BaseDataValue[];

export type GenericObjectType = {
  [key: string]: BaseDataValue;
};
