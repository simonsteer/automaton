module.exports = {
    plugins: [
        ["@babel/plugin-proposal-class-properties", { loose: true }]
    ],
    presets: [
        ['@babel/pre -cset-env', { targets: { node: 'current' } }],
        ['@babel/preset-typescript', { targets: { node: 'current' } }],
    ],

};