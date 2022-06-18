export const idlFactory = ({ IDL }) => {
  const Blogger = IDL.Record({ 'id' : IDL.Principal, 'name' : IDL.Text });
  const Time = IDL.Int;
  const Message = IDL.Record({
    'text' : IDL.Text,
    'time' : Time,
    'author' : IDL.Text,
  });
  const ParamRecord = IDL.Record({
    'value' : IDL.Nat,
    'time' : Time,
    'author' : IDL.Principal,
    'credit' : IDL.Int,
    'income' : IDL.Nat,
    'commet' : IDL.Text,
    'isValid' : IDL.Bool,
  });
  const ReturnRecord = IDL.Record({
    'value' : IDL.Nat,
    'time' : Time,
    'author' : IDL.Principal,
    'credit' : IDL.Int,
    'income' : IDL.Nat,
    'commet' : IDL.Text,
    'isValid' : IDL.Bool,
  });
  const Shape = IDL.Variant({
    'dot' : IDL.Null,
    'rectangle' : IDL.Record({ 'height' : IDL.Float64, 'width' : IDL.Float64 }),
    'circle' : IDL.Float64,
    _2669435721_ : IDL.Text,
  });
  return IDL.Service({
    'clearFollows' : IDL.Func([], [], ['oneway']),
    'follow' : IDL.Func([IDL.Principal], [], ['oneway']),
    'follows' : IDL.Func([], [IDL.Vec(Blogger)], []),
    'get_name' : IDL.Func([], [IDL.Opt(IDL.Text)], ['query']),
    'post' : IDL.Func([IDL.Text], [], []),
    'posts' : IDL.Func([Time], [IDL.Vec(Message)], ['query']),
    'set_name' : IDL.Func([IDL.Text], [], []),
    'testArray' : IDL.Func([IDL.Vec(ParamRecord)], [IDL.Nat], []),
    'testInput' : IDL.Func([ParamRecord], [ReturnRecord], []),
    'testOpt' : IDL.Func([IDL.Opt(ParamRecord)], [IDL.Nat], []),
    'testPrimitiveArray' : IDL.Func([IDL.Vec(IDL.Nat)], [IDL.Nat], []),
    'testVariant' : IDL.Func([Shape], [IDL.Text], []),
    'timeline' : IDL.Func([Time], [IDL.Vec(Message)], []),
    'unfollow' : IDL.Func([IDL.Principal], [], ['oneway']),
  });
};
export const init = ({ IDL }) => { return []; };
