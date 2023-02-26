const ignoreKeyCustomizer = (ignoredKeys: string[]): _.IsEqualCustomizer => {
  return (_1, _2, key) => {
    if (typeof key === "string" && ignoredKeys.includes(key)) {
      return true;
    }
    return undefined;
  };
};

export default ignoreKeyCustomizer;
