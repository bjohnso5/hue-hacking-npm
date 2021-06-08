export default {
  babel: {
    compileEnhancements: true,
  },
  files: ["src/**/*.spec.ts"],
  require: ["ts-node/register"],
  extensions: ["ts"],
};
