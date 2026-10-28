const { getDefaultConfig } = require("expo/metro-config");
const { withNativewind } = require("nativewind/metro");

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);
const defaultResolve = config.resolver?.resolveRequest;

const nativewindConfig = withNativewind(config);
const nativewindResolve = nativewindConfig.resolver.resolveRequest;

// Workaround: NativeWind 5.0.0-rc.0 (react-native-css 3.1.0-rc.0) redirects every
// `import ... from "react-native"` to its own wrapper, and that wrapper does not
// re-export AssetRegistry (new public export in React Native 0.88). These packages
// need the real AssetRegistry, so let them import the real react-native.
// Remove this once a NativeWind release adds AssetRegistry to its wrapper.
const NEEDS_REAL_REACT_NATIVE =
  /[\\/]node_modules[\\/](expo-asset|expo-image|@react-native[\\/]assets-registry)[\\/]/;

nativewindConfig.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    moduleName === "react-native" &&
    NEEDS_REAL_REACT_NATIVE.test(context.originModulePath)
  ) {
    return (defaultResolve ?? context.resolveRequest)(
      context,
      moduleName,
      platform,
    );
  }
  return nativewindResolve(context, moduleName, platform);
};

module.exports = nativewindConfig;
