import { defineChain } from "viem";

export const snowball = defineChain({
    id: 6697108108115,
    name: 'Snowball',
    network: 'Snowball',
    nativeCurrency: {
        decimals: 7,
        name: 'BALLS',
        symbol: 'BALLS',
    },
    rpcUrls: {
        default: {
            http: ['http://127.0.0.1:9650/ext/bc/oz2H4xaoMoHng74iMcxDJ3nTKWVHDYcTF6n6wF83ETKzPXdPZ/rpc']
        },
    },
    blockExplorers: {
        default: { name: 'Explorer', url: 'https://subnets-test.avax.network/dispatch' },
    },
});