import type { Principal } from '@dfinity/principal';
export interface Blogger { 'id' : Principal, 'name' : string }
export interface Message { 'text' : string, 'time' : Time, 'author' : string }
export interface ParamRecord {
  'value' : bigint,
  'time' : Time,
  'author' : Principal,
  'credit' : bigint,
  'income' : bigint,
  'commet' : string,
  'isValid' : boolean,
}
export interface ReturnRecord {
  'value' : bigint,
  'time' : Time,
  'author' : Principal,
  'credit' : bigint,
  'income' : bigint,
  'commet' : string,
  'isValid' : boolean,
}
export type Shape = { 'dot' : null } |
  { 'rectangle' : { 'height' : number, 'width' : number } } |
  { 'circle' : number } |
  { _2669435721_ : string };
export type Time = bigint;
export interface _SERVICE {
  'clearFollows' : () => Promise<undefined>,
  'follow' : (arg_0: Principal) => Promise<undefined>,
  'follows' : () => Promise<Array<Blogger>>,
  'get_name' : () => Promise<[] | [string]>,
  'post' : (arg_0: string) => Promise<undefined>,
  'posts' : (arg_0: Time) => Promise<Array<Message>>,
  'set_name' : (arg_0: string) => Promise<undefined>,
  'testArray' : (arg_0: Array<ParamRecord>) => Promise<bigint>,
  'testInput' : (arg_0: ParamRecord) => Promise<ReturnRecord>,
  'testOpt' : (arg_0: [] | [ParamRecord]) => Promise<bigint>,
  'testPrimitiveArray' : (arg_0: Array<bigint>) => Promise<bigint>,
  'testVariant' : (arg_0: Shape) => Promise<string>,
  'timeline' : (arg_0: Time) => Promise<Array<Message>>,
  'unfollow' : (arg_0: Principal) => Promise<undefined>,
}
