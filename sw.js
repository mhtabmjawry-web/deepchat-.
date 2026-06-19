const CACHE_NAME = 'deepchat-v1';
const PRECACHE_ASSETS = [
    './index.html',
    './manifest.json',
    './icon-192.png',
    './icon-512.png'
];

// نصب Service Worker و کش اولیه
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('در حال کش کردن فایل‌های اصلی...');
            return cache.addAll(PRECACHE_ASSETS);
        })
    );
});

// استراتژی Cache First: ابتدا از کش سرو کنید، در غیر این صورت شبکه و سپس کش
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((cachedResponse) => {
            // اگر در کش بود، همان را برگردان
            if (cachedResponse) {
                return cachedResponse;
            }
            // در غیر این صورت از شبکه بگیر و کش کن (مخصوص دارایی‌های اصلی)
            return fetch(event.request).then((networkResponse) => {
                // فقط درخواست‌های موفق را کش کن
                if (networkResponse && networkResponse.status === 200) {
                    const responseToCache = networkResponse.clone();
                    caches.open(CACHE_NAME).then((cache) => {
                        cache.put(event.request, responseToCache);
                    });
                }
                return networkResponse;
            }).catch(() => {
                // در صورت خطا در شبکه (آفلاین) می‌توانید یک پاسخ fallback بدهید
                return new Response('شما آفلاین هستید.', { status: 503 });
            });
        })
    );
});

// پاکسازی کش‌های قدیمی
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((name) => {
                    if (name !== CACHE_NAME) {
                        console.log('حذف کش قدیمی:', name);
                        return caches.delete(name);
                    }
                })
            );
        })
    );
});
