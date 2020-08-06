module.exports = {
    plugins: [
        ["@babel/plugin-proposal-class-properties", { loose: true }],
        "transform-class-properties",
    ],
    presets: [
        '@babel/preset-env',
        '@babel/preset-typescript',
    ],
};