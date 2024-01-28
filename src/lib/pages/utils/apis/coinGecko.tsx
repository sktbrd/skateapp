export const cache: {
    conversionRate?: { value: number; timestamp: number };
    hbdPrice?: { value: number; timestamp: number };
} = {};

const CACHE_THRESHOLD = 5 * 60 * 1000; // 5 minutes threshold for cache validity

export function resetCache() {
    cache.conversionRate = undefined;
    cache.hbdPrice = undefined;
    console.log("Cache reset");
}

function isCacheValid(cacheItem?: { timestamp: number }): boolean {
    return !!cacheItem && Date.now() - cacheItem.timestamp < CACHE_THRESHOLD;
}

export async function fetchHbdPrice() {
    try {
        if (isCacheValid(cache.hbdPrice)) {
            // Use the cached value if available and not stale
            return cache?.hbdPrice?.value;
        }

        const response = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=hive_dollar&vs_currencies=usd"
        );

        if (response.status !== 200) {
            // Set hbdPrice to 1.00 if the response status is not 200
            cache.hbdPrice = { value: 1.00, timestamp: Date.now() };
            return 1.00;
        }

        const data = await response.json();
        const hbdPrice = data.hive_dollar.usd;

        // Update the cache
        cache.hbdPrice = { value: hbdPrice, timestamp: Date.now() };
        return hbdPrice;
    } catch (error) {
        // Set hbdPrice to 1.00 in case of an error
        cache.hbdPrice = { value: 1.00, timestamp: Date.now() };
        return 1.00;
    }
}

export async function fetchConversionRate() {
    try {
        if (isCacheValid(cache.conversionRate)) {
            // Use the cached value if available and not stale
            return cache?.conversionRate?.value;
        }

        const response = await fetch(
            "https://api.coingecko.com/api/v3/simple/price?ids=hive&vs_currencies=usd"
        );

        if (response.status !== 200) {
            // Set conversionRate to 0.35 if the response status is not 200
            cache.conversionRate = { value: 0.350, timestamp: Date.now() };
            return 0.350;
        }

        const data = await response.json();
        const conversionRate = data.hive.usd;

        // Update the cache
        cache.conversionRate = { value: conversionRate, timestamp: Date.now() };
        return conversionRate;
    } catch (error) {
        // Set conversionRate to 0.00 in case of an error
        cache.conversionRate = { value: 0.350, timestamp: Date.now() };
        return 0.350;
    }
}
