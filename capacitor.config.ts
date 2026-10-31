import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "in.radioverse.app",
  appName: "RadioVerse India",
  webDir: "out",
  server: {
    androidScheme: "https",
    cleartext: true,
  },
  android: {
    allowMixedContent: true,
    backgroundColor: "#0b0e14",
  },
};

export default config;
