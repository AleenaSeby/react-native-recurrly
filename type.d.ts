import type { ImageSourcePropType } from "react-native";

declare global {
  interface TableIconProps {
    focused: boolean;
    icon: ImageSourcePropType;
  }
}
export { };

// This file is used to declare global types and interfaces for the project.
//  It allows you to define custom types that can be used throughout your
//  TypeScript codebase.
// In this case, we are declaring a global interface called `TableIconProps`
//  that has two properties: `focused`, which is a boolean, and `icon`,
//  which is of type `ImageSourcePropType` from React Native.
