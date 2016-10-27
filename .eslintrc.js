module.exports = {
    "extends": "airbnb",
    "plugins": [
        "react",
        "jsx-a11y",
        "import"
    ],
    "rules": {
        "linebreak-style": ["error", "windows"],
        "indent": ["error", 4, { "SwitchCase": 1 }],
        "comma-dangle": ["error", "never"],
        "one-var": ["error", "always"],
        "eol-last": ["error", "never"],
        "func-names": ["error", "never"],
        "object-shorthand": [2, "consistent"],
        "import/no-extraneous-dependencies": "off"
    },
    "globals": {
        "window": true
    }
};