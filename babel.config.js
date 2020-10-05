module.exports = {
    plugins: [
        ["@babel/plugin-proposal-class-properties", { loose: true }],
        "@babel/plugin-transform-typescript",
    ],
    presets: [
        ['@babel/preset-env', { targets: { node: 'current' } }],
        ['@babel/preset-typescript', { targets: { node: 'current' } }],
    ],

};