export {};

declare global {
  interface String {
    // encode to base64
    base64(): string;
    // decode to base64
    base64d(): string;
  }
}
