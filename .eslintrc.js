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
        "import/no-extraneous-dependencies": "off", // revisit 
        "no-plusplus": ["error", { "allowForLoopAfterthoughts": true }],
        "no-console": "off",
        "no-use-before-define": ["error", "nofunc"],
        "no-param-reassign": ["error", { "props": false }],
        "no-unused-expressions": ["error", { "allowShortCircuit": true }],
        "consistent-return": "off",
        "no-underscore-dangle": "off"
    },
    "globals": {
        "window": true,
        "document": true,
        "Event": true
    },
    "settings": {
        "import/resolver": "webpack"
    }
};