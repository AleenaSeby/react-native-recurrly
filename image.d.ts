// This file is used to declare the types for image files in TypeScript.
// It allows you to import image files (like PNG, JPG, JPEG, SVG, and GIF)
//  as modules in your TypeScript code without type errors.
// The `any` type is used here for simplicity,
// but you can replace it with more specific types if needed.
declare module "*.png" {
  const value: any;
  export default value;
}
declare module "*.jpg" {
  const value: any;
  export default value;
}
declare module "*.jpeg" {
  const value: any;
  export default value;
}
declare module "*.svg" {
  const value: any;
  export default value;
}
declare module "*.gif" {
  const value: any;
  export default value;
}
