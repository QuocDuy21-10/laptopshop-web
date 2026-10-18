const config = {
  extends: ["stylelint-config-standard-scss"],
  rules: {
    // colours come from tokens only (DESIGN.md: no random hex across modules)
    "color-no-hex": true,
    "color-named": "never",
    "selector-class-pattern": null,
    "scss/at-mixin-pattern": null,
    // two-line title clamp still needs the -webkit-box trio
    "value-no-vendor-prefix": [true, { ignoreValues: ["box"] }],
    "property-no-vendor-prefix": [true, { ignoreProperties: ["box-orient", "line-clamp"] }],
  },
  overrides: [{ files: ["src/styles/_tokens.scss"], rules: { "color-no-hex": null } }],
};

export default config;
