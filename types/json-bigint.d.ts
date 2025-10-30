declare module 'json-bigint' {
  type ProtoAction = 'error' | 'ignore' | 'preserve';
  type ConstructorAction = 'error' | 'ignore' | 'preserve';

  interface JSONBigOptions {
    storeAsString?: boolean;
    strict?: boolean;
    useNativeBigInt?: boolean;
    protoAction?: ProtoAction;
    constructorAction?: ConstructorAction;
  }

  interface JSONBigParser {
    parse: (text: string) => any;
    stringify: (value: any) => string;
  }

  interface JSONBigFactory extends JSONBigParser {
    (options?: JSONBigOptions): JSONBigParser;
  }

  const JSONbig: JSONBigFactory;
  export default JSONbig;
}


