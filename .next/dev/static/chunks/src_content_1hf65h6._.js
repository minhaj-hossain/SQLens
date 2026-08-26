(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/content/curriculum-index.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "ALL_MODULES",
    ()=>ALL_MODULES,
    "getModuleByDay",
    ()=>getModuleByDay,
    "getModuleById",
    ()=>getModuleById
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$curriculum$2d$schedule$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/config/curriculum-schedule.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$modules$2f$day01$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/content/modules/day01.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$modules$2f$day02$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/content/modules/day02.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$modules$2f$day03$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/content/modules/day03.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$modules$2f$day04to08$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/content/modules/day04to08.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$modules$2f$day09to16$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/content/modules/day09to16.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$modules$2f$day17to25$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/content/modules/day17to25.ts [app-client] (ecmascript)");
;
;
;
;
;
;
;
/** Raw module definitions before schedule overrides are applied. */ const RAW_MODULES = [
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$modules$2f$day01$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DAY_01_MODULE"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$modules$2f$day02$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DAY_02_MODULE"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$modules$2f$day03$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DAY_03_MODULE"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$modules$2f$day04to08$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DAY_04_MODULE"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$modules$2f$day04to08$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DAY_05_MODULE"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$modules$2f$day04to08$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DAY_06_MODULE"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$modules$2f$day04to08$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DAY_07_MODULE"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$modules$2f$day04to08$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DAY_08_MODULE"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$modules$2f$day09to16$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DAY_09_MODULE"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$modules$2f$day09to16$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DAY_10_MODULE"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$modules$2f$day09to16$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DAY_11_MODULE"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$modules$2f$day09to16$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DAY_12_MODULE"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$modules$2f$day09to16$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DAY_13_MODULE"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$modules$2f$day09to16$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DAY_14_MODULE"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$modules$2f$day09to16$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DAY_15_MODULE"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$modules$2f$day09to16$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DAY_16_MODULE"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$modules$2f$day17to25$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DAY_17_MODULE"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$modules$2f$day17to25$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DAY_18_MODULE"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$modules$2f$day17to25$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DAY_19_MODULE"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$modules$2f$day17to25$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DAY_20_MODULE"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$modules$2f$day17to25$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DAY_21_MODULE"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$modules$2f$day17to25$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DAY_22_MODULE"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$modules$2f$day17to25$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DAY_23_MODULE"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$modules$2f$day17to25$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DAY_24_MODULE"],
    __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$content$2f$modules$2f$day17to25$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DAY_25_MODULE"]
];
const ALL_MODULES = RAW_MODULES.map(_c = (m)=>({
        ...m,
        scheduledPublishDate: __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$config$2f$curriculum$2d$schedule$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MODULE_PUBLISH_SCHEDULE"][m.id] ?? m.scheduledPublishDate
    }));
_c1 = ALL_MODULES;
function getModuleById(id) {
    return ALL_MODULES.find((m)=>m.id === id);
}
function getModuleByDay(day) {
    return ALL_MODULES.find((m)=>m.day === day);
}
var _c, _c1;
__turbopack_context__.k.register(_c, "ALL_MODULES$RAW_MODULES.map");
__turbopack_context__.k.register(_c1, "ALL_MODULES");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/content/database/schema.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DATABASE_SCHEMAS",
    ()=>DATABASE_SCHEMAS
]);
const DATABASE_SCHEMAS = {
    categories: {
        name: 'categories',
        displayName: 'Categories',
        description: 'Product categorization groups',
        columns: [
            {
                name: 'category_id',
                type: 'number',
                primaryKey: true,
                description: 'Unique category identifier'
            },
            {
                name: 'name',
                type: 'string',
                description: 'Category name (e.g. Electronics, Office Supplies)'
            }
        ]
    },
    suppliers: {
        name: 'suppliers',
        displayName: 'Suppliers',
        description: 'Third-party vendors and item suppliers',
        columns: [
            {
                name: 'supplier_id',
                type: 'number',
                primaryKey: true,
                description: 'Unique supplier identifier'
            },
            {
                name: 'name',
                type: 'string',
                description: 'Company or supplier business name'
            },
            {
                name: 'contact_email',
                type: 'string',
                nullable: true,
                description: 'Primary contact email address'
            }
        ]
    },
    products: {
        name: 'products',
        displayName: 'Products',
        description: 'Catalog items with stock levels, reorder thresholds, and pricing',
        columns: [
            {
                name: 'product_id',
                type: 'number',
                primaryKey: true,
                description: 'Unique product identifier'
            },
            {
                name: 'name',
                type: 'string',
                description: 'Product title / model'
            },
            {
                name: 'category_id',
                type: 'number',
                nullable: true,
                foreignKey: {
                    table: 'categories',
                    column: 'category_id'
                }
            },
            {
                name: 'supplier_id',
                type: 'number',
                nullable: true,
                foreignKey: {
                    table: 'suppliers',
                    column: 'supplier_id'
                }
            },
            {
                name: 'price',
                type: 'decimal',
                description: 'Retail unit price in USD'
            },
            {
                name: 'quantity_in_stock',
                type: 'number',
                description: 'Current warehouse inventory count'
            },
            {
                name: 'reorder_level',
                type: 'number',
                description: 'Minimum stock count before reordering'
            }
        ]
    },
    customers: {
        name: 'customers',
        displayName: 'Customers',
        description: 'Registered users with geographic location and join dates',
        columns: [
            {
                name: 'customer_id',
                type: 'number',
                primaryKey: true,
                description: 'Unique customer identifier'
            },
            {
                name: 'name',
                type: 'string',
                description: 'Full customer name'
            },
            {
                name: 'email',
                type: 'string',
                nullable: true,
                description: 'Customer email address'
            },
            {
                name: 'city',
                type: 'string',
                description: 'Primary residential city'
            },
            {
                name: 'signup_date',
                type: 'date',
                description: 'Date the account was created (YYYY-MM-DD)'
            }
        ]
    },
    orders: {
        name: 'orders',
        displayName: 'Orders',
        description: 'Purchase orders placed by customers',
        columns: [
            {
                name: 'order_id',
                type: 'number',
                primaryKey: true,
                description: 'Unique order identifier'
            },
            {
                name: 'customer_id',
                type: 'number',
                foreignKey: {
                    table: 'customers',
                    column: 'customer_id'
                }
            },
            {
                name: 'order_date',
                type: 'date',
                description: 'Date of order placement'
            },
            {
                name: 'status',
                type: 'string',
                description: 'Order status: pending, shipped, cancelled, delivered'
            }
        ]
    },
    order_items: {
        name: 'order_items',
        displayName: 'Order Items',
        description: 'Line items within each order specifying quantity and price at purchase',
        columns: [
            {
                name: 'order_item_id',
                type: 'number',
                primaryKey: true,
                description: 'Unique line item identifier'
            },
            {
                name: 'order_id',
                type: 'number',
                foreignKey: {
                    table: 'orders',
                    column: 'order_id'
                }
            },
            {
                name: 'product_id',
                type: 'number',
                foreignKey: {
                    table: 'products',
                    column: 'product_id'
                }
            },
            {
                name: 'quantity',
                type: 'number',
                description: 'Number of units purchased'
            },
            {
                name: 'unit_price',
                type: 'decimal',
                description: 'Price per unit at order time'
            }
        ]
    },
    payments: {
        name: 'payments',
        displayName: 'Payments',
        description: 'Financial transactions recorded for orders',
        columns: [
            {
                name: 'payment_id',
                type: 'number',
                primaryKey: true,
                description: 'Unique payment identifier'
            },
            {
                name: 'order_id',
                type: 'number',
                foreignKey: {
                    table: 'orders',
                    column: 'order_id'
                }
            },
            {
                name: 'amount',
                type: 'decimal',
                description: 'Payment amount received'
            },
            {
                name: 'payment_date',
                type: 'date',
                description: 'Transaction date'
            },
            {
                name: 'method',
                type: 'string',
                description: 'Payment method (Credit Card, PayPal, Wire, Stripe)'
            }
        ]
    },
    students: {
        name: 'students',
        displayName: 'Students',
        description: 'Enrolled university students dataset',
        columns: [
            {
                name: 'id',
                type: 'number',
                primaryKey: true,
                description: 'Unique student identification number'
            },
            {
                name: 'name',
                type: 'string',
                description: 'Full name of the student'
            },
            {
                name: 'age',
                type: 'number',
                description: 'Age in years'
            },
            {
                name: 'department',
                type: 'string',
                description: 'Academic department (e.g. CSE, EEE, BBA)'
            },
            {
                name: 'city',
                type: 'string',
                description: 'Home town / city'
            }
        ]
    },
    student_records: {
        name: 'student_records',
        displayName: 'Student Records',
        description: 'Legacy raw database table with abbreviated technical columns',
        columns: [
            {
                name: 'std_id',
                type: 'number',
                primaryKey: true,
                description: 'Legacy raw ID column'
            },
            {
                name: 'std_nm',
                type: 'string',
                description: 'Legacy raw name column'
            },
            {
                name: 'std_age',
                type: 'number',
                description: 'Legacy raw age column'
            },
            {
                name: 'dept',
                type: 'string',
                description: 'Legacy raw department column'
            }
        ]
    },
    reviews: {
        name: 'reviews',
        displayName: 'Reviews',
        description: 'Customer product ratings and feedback reviews',
        columns: [
            {
                name: 'review_id',
                type: 'number',
                primaryKey: true,
                description: 'Unique review identifier'
            },
            {
                name: 'product_id',
                type: 'number',
                foreignKey: {
                    table: 'products',
                    column: 'product_id'
                }
            },
            {
                name: 'customer_id',
                type: 'number',
                foreignKey: {
                    table: 'customers',
                    column: 'customer_id'
                }
            },
            {
                name: 'rating',
                type: 'number',
                description: 'Score rating from 1 to 5'
            },
            {
                name: 'comment',
                type: 'string',
                nullable: true,
                description: 'Customer written review text'
            },
            {
                name: 'created_at',
                type: 'date',
                description: 'Date review was submitted'
            }
        ]
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/content/database/tables.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "INITIAL_TABLES",
    ()=>INITIAL_TABLES
]);
const INITIAL_TABLES = {
    categories: [
        {
            category_id: 1,
            name: 'Electronics'
        },
        {
            category_id: 2,
            name: 'Kitchen & Dining'
        },
        {
            category_id: 3,
            name: 'Office Supplies'
        },
        {
            category_id: 4,
            name: 'Sporting Goods'
        },
        {
            category_id: 5,
            name: 'Home & Garden'
        },
        {
            category_id: 6,
            name: 'Books & Stationery'
        }
    ],
    suppliers: [
        {
            supplier_id: 1,
            name: 'TechSource Ltd',
            contact_email: 'contact@techsource.com'
        },
        {
            supplier_id: 2,
            name: 'Global Kitchenware Co',
            contact_email: 'sales@globalkitchen.com'
        },
        {
            supplier_id: 3,
            name: 'OfficeMax Wholesale',
            contact_email: 'orders@officemaxwholesale.com'
        },
        {
            supplier_id: 4,
            name: 'ProSport Distributors',
            contact_email: 'info@prosportdist.com'
        },
        {
            supplier_id: 5,
            name: 'GreenLeaf Home Supplies',
            contact_email: 'hello@greenleafhome.com'
        },
        {
            supplier_id: 6,
            name: 'Unity Traders BD',
            contact_email: 'contact@unitytraders.bd'
        }
    ],
    products: [
        {
            product_id: 1,
            name: 'Wireless Mouse',
            category_id: 1,
            supplier_id: 1,
            price: 15.99,
            quantity_in_stock: 40,
            reorder_level: 10
        },
        {
            product_id: 2,
            name: 'Bluetooth Speaker',
            category_id: 1,
            supplier_id: 1,
            price: 45.50,
            quantity_in_stock: 3,
            reorder_level: 10
        },
        {
            product_id: 3,
            name: 'USB-C Charging Cable',
            category_id: 1,
            supplier_id: 1,
            price: 9.99,
            quantity_in_stock: 0,
            reorder_level: 20
        },
        {
            product_id: 4,
            name: 'Mechanical Keyboard',
            category_id: 1,
            supplier_id: 1,
            price: 65.00,
            quantity_in_stock: 12,
            reorder_level: 5
        },
        {
            product_id: 5,
            name: 'Laptop Stand',
            category_id: 1,
            supplier_id: 1,
            price: 28.75,
            quantity_in_stock: 8,
            reorder_level: 10
        },
        {
            product_id: 6,
            name: 'Stainless Steel Pan Set',
            category_id: 2,
            supplier_id: 2,
            price: 55.00,
            quantity_in_stock: 15,
            reorder_level: 5
        },
        {
            product_id: 7,
            name: 'Ceramic Mixing Bowls',
            category_id: 2,
            supplier_id: 2,
            price: 22.30,
            quantity_in_stock: 30,
            reorder_level: 8
        },
        {
            product_id: 8,
            name: 'Electric Kettle',
            category_id: 2,
            supplier_id: 2,
            price: 34.99,
            quantity_in_stock: 2,
            reorder_level: 5
        },
        {
            product_id: 9,
            name: 'Cutting Board Set',
            category_id: 2,
            supplier_id: 2,
            price: 18.00,
            quantity_in_stock: 0,
            reorder_level: 6
        },
        {
            product_id: 10,
            name: 'Knife Sharpener',
            category_id: 2,
            supplier_id: 2,
            price: 12.50,
            quantity_in_stock: 25,
            reorder_level: 5
        },
        {
            product_id: 11,
            name: 'Desk Organizer',
            category_id: 3,
            supplier_id: 3,
            price: 14.25,
            quantity_in_stock: 18,
            reorder_level: 5
        },
        {
            product_id: 12,
            name: 'Sticky Notes Pack',
            category_id: 3,
            supplier_id: 3,
            price: 4.99,
            quantity_in_stock: 100,
            reorder_level: 20
        },
        {
            product_id: 13,
            name: 'Ballpoint Pen Box',
            category_id: 3,
            supplier_id: 3,
            price: 6.50,
            quantity_in_stock: 60,
            reorder_level: 15
        },
        {
            product_id: 14,
            name: 'Office Chair',
            category_id: 3,
            supplier_id: 3,
            price: 120.00,
            quantity_in_stock: 5,
            reorder_level: 3
        },
        {
            product_id: 15,
            name: 'Filing Cabinet',
            category_id: 3,
            supplier_id: 3,
            price: 89.99,
            quantity_in_stock: 4,
            reorder_level: 5
        },
        {
            product_id: 16,
            name: 'Yoga Mat',
            category_id: 4,
            supplier_id: 4,
            price: 19.99,
            quantity_in_stock: 22,
            reorder_level: 8
        },
        {
            product_id: 17,
            name: 'Dumbbell Set 10kg',
            category_id: 4,
            supplier_id: 4,
            price: 42.00,
            quantity_in_stock: 6,
            reorder_level: 5
        },
        {
            product_id: 18,
            name: 'Resistance Bands',
            category_id: 4,
            supplier_id: 4,
            price: 11.99,
            quantity_in_stock: 35,
            reorder_level: 10
        },
        {
            product_id: 19,
            name: 'Football',
            category_id: 4,
            supplier_id: 4,
            price: 16.50,
            quantity_in_stock: 0,
            reorder_level: 10
        },
        {
            product_id: 20,
            name: 'Tennis Racket',
            category_id: 4,
            supplier_id: 4,
            price: 55.00,
            quantity_in_stock: 9,
            reorder_level: 4
        },
        {
            product_id: 21,
            name: 'Garden Hose 50ft',
            category_id: 5,
            supplier_id: 5,
            price: 24.99,
            quantity_in_stock: 14,
            reorder_level: 5
        },
        {
            product_id: 22,
            name: 'Pruning Shears',
            category_id: 5,
            supplier_id: 5,
            price: 13.75,
            quantity_in_stock: 20,
            reorder_level: 6
        },
        {
            product_id: 23,
            name: 'Planter Pot Set',
            category_id: 5,
            supplier_id: 5,
            price: 17.50,
            quantity_in_stock: 3,
            reorder_level: 5
        },
        {
            product_id: 24,
            name: 'LED String Lights',
            category_id: 5,
            supplier_id: 5,
            price: 9.50,
            quantity_in_stock: 45,
            reorder_level: 15
        },
        {
            product_id: 25,
            name: 'Wireless Doorbell',
            category_id: 5,
            supplier_id: 6,
            price: 38.00,
            quantity_in_stock: 10,
            reorder_level: 4
        },
        {
            product_id: 26,
            name: 'Wireless Earbuds',
            category_id: 1,
            supplier_id: 1,
            price: 32.00,
            quantity_in_stock: 20,
            reorder_level: 8
        },
        {
            product_id: 27,
            name: 'Portable Charger',
            category_id: 1,
            supplier_id: 1,
            price: 21.99,
            quantity_in_stock: 16,
            reorder_level: 6
        },
        {
            product_id: 28,
            name: 'Miscellaneous Clearance Item',
            category_id: null,
            supplier_id: null,
            price: 4.99,
            quantity_in_stock: 7,
            reorder_level: 2
        }
    ],
    customers: [
        {
            customer_id: 1,
            name: 'Rafiul Islam',
            email: 'rafiul@example.com',
            city: 'Dhaka',
            signup_date: '2025-11-10'
        },
        {
            customer_id: 2,
            name: 'Priya Akter',
            email: 'priya.akter@example.com',
            city: 'Dhaka',
            signup_date: '2026-08-05'
        },
        {
            customer_id: 3,
            name: 'Tanvir Ahmed',
            email: null,
            city: 'Chittagong',
            signup_date: '2026-01-15'
        },
        {
            customer_id: 4,
            name: 'Nusrat Jahan',
            email: 'nusrat.j@example.com',
            city: 'Chittagong',
            signup_date: '2026-08-15'
        },
        {
            customer_id: 5,
            name: 'Kamal Hossain',
            email: 'kamal.h@example.com',
            city: 'Sylhet',
            signup_date: '2025-09-20'
        },
        {
            customer_id: 6,
            name: 'Farhana Rahman',
            email: 'farhana.r@example.com',
            city: 'Dhaka',
            signup_date: '2026-02-28'
        },
        {
            customer_id: 7,
            name: 'Shakil Ahmed',
            email: null,
            city: 'Khulna',
            signup_date: '2026-08-10'
        },
        {
            customer_id: 8,
            name: 'Mim Akter',
            email: 'mim.akter@example.com',
            city: 'Dhaka',
            signup_date: '2025-12-01'
        },
        {
            customer_id: 9,
            name: 'Rasel Khan',
            email: 'rasel.khan@example.com',
            city: 'Chittagong',
            signup_date: '2026-03-18'
        },
        {
            customer_id: 10,
            name: 'Sabrina Yasmin',
            email: 'sabrina.y@example.com',
            city: 'Sylhet',
            signup_date: '2026-07-01'
        },
        {
            customer_id: 11,
            name: 'Imran Hossain',
            email: 'imran.h@example.com',
            city: 'Dhaka',
            signup_date: '2026-08-20'
        },
        {
            customer_id: 12,
            name: 'Lubna Sultana',
            email: 'lubna.s@example.com',
            city: 'Khulna',
            signup_date: '2026-04-12'
        },
        // FIX 1 & FIX 2: Zero-order customers & recency anchors
        {
            customer_id: 13,
            name: 'Arif Chowdhury',
            email: 'arif.c@example.com',
            city: 'Rajshahi',
            signup_date: '2025-10-05'
        },
        {
            customer_id: 14,
            name: 'Nadia Islam',
            email: 'nadia.islam@example.com',
            city: 'Barisal',
            signup_date: '2026-08-20'
        },
        {
            customer_id: 15,
            name: 'Jahid Karim',
            email: 'jahid.karim@example.com',
            city: 'Dhaka',
            signup_date: '2026-07-11'
        }
    ],
    orders: [
        {
            order_id: 1,
            customer_id: 1,
            order_date: '2026-06-10',
            status: 'delivered'
        },
        {
            order_id: 2,
            customer_id: 2,
            order_date: '2026-08-01',
            status: 'pending'
        },
        {
            order_id: 3,
            customer_id: 3,
            order_date: '2026-05-15',
            status: 'delivered'
        },
        {
            order_id: 4,
            customer_id: 4,
            order_date: '2026-08-10',
            status: 'shipped'
        },
        {
            order_id: 5,
            customer_id: 5,
            order_date: '2026-04-02',
            status: 'delivered'
        },
        {
            order_id: 6,
            customer_id: 5,
            order_date: '2026-06-18',
            status: 'cancelled'
        },
        {
            order_id: 7,
            customer_id: 6,
            order_date: '2026-07-05',
            status: 'delivered'
        },
        {
            order_id: 8,
            customer_id: 7,
            order_date: '2026-08-12',
            status: 'pending'
        },
        {
            order_id: 9,
            customer_id: 8,
            order_date: '2026-03-20',
            status: 'delivered'
        },
        {
            order_id: 10,
            customer_id: 9,
            order_date: '2026-05-28',
            status: 'delivered'
        },
        {
            order_id: 11,
            customer_id: 9,
            order_date: '2026-07-30',
            status: 'delivered'
        },
        {
            order_id: 12,
            customer_id: 10,
            order_date: '2026-06-25',
            status: 'delivered'
        },
        {
            order_id: 13,
            customer_id: 11,
            order_date: '2026-08-21',
            status: 'pending'
        },
        {
            order_id: 14,
            customer_id: 1,
            order_date: '2026-08-02',
            status: 'delivered'
        },
        {
            order_id: 15,
            customer_id: 12,
            order_date: '2026-02-14',
            status: 'delivered'
        },
        {
            order_id: 16,
            customer_id: 6,
            order_date: '2026-08-18',
            status: 'shipped'
        },
        {
            order_id: 17,
            customer_id: 3,
            order_date: '2026-07-10',
            status: 'delivered'
        },
        // FIX 4: Disposable order for safe testing
        {
            order_id: 18,
            customer_id: 1,
            order_date: '2026-08-23',
            status: 'pending'
        }
    ],
    order_items: [
        {
            order_item_id: 1,
            order_id: 1,
            product_id: 1,
            quantity: 2,
            unit_price: 15.99
        },
        {
            order_item_id: 2,
            order_id: 1,
            product_id: 4,
            quantity: 1,
            unit_price: 65.00
        },
        {
            order_item_id: 3,
            order_id: 2,
            product_id: 6,
            quantity: 1,
            unit_price: 55.00
        },
        {
            order_item_id: 4,
            order_id: 3,
            product_id: 7,
            quantity: 2,
            unit_price: 22.30
        },
        {
            order_item_id: 5,
            order_id: 3,
            product_id: 10,
            quantity: 1,
            unit_price: 12.50
        },
        {
            order_item_id: 6,
            order_id: 4,
            product_id: 16,
            quantity: 1,
            unit_price: 19.99
        },
        {
            order_item_id: 7,
            order_id: 4,
            product_id: 18,
            quantity: 2,
            unit_price: 11.99
        },
        {
            order_item_id: 8,
            order_id: 5,
            product_id: 21,
            quantity: 1,
            unit_price: 24.99
        },
        {
            order_item_id: 9,
            order_id: 6,
            product_id: 17,
            quantity: 1,
            unit_price: 42.00
        },
        {
            order_item_id: 10,
            order_id: 7,
            product_id: 11,
            quantity: 3,
            unit_price: 14.25
        },
        {
            order_item_id: 11,
            order_id: 7,
            product_id: 12,
            quantity: 2,
            unit_price: 4.99
        },
        {
            order_item_id: 12,
            order_id: 7,
            product_id: 13,
            quantity: 1,
            unit_price: 6.50
        },
        {
            order_item_id: 13,
            order_id: 8,
            product_id: 22,
            quantity: 2,
            unit_price: 13.75
        },
        {
            order_item_id: 14,
            order_id: 9,
            product_id: 14,
            quantity: 1,
            unit_price: 120.00
        },
        {
            order_item_id: 15,
            order_id: 10,
            product_id: 1,
            quantity: 1,
            unit_price: 15.99
        },
        {
            order_item_id: 16,
            order_id: 10,
            product_id: 5,
            quantity: 1,
            unit_price: 28.75
        },
        {
            order_item_id: 17,
            order_id: 11,
            product_id: 1,
            quantity: 3,
            unit_price: 15.99
        },
        {
            order_item_id: 18,
            order_id: 11,
            product_id: 4,
            quantity: 1,
            unit_price: 65.00
        },
        {
            order_item_id: 19,
            order_id: 11,
            product_id: 26,
            quantity: 1,
            unit_price: 32.00
        },
        {
            order_item_id: 20,
            order_id: 12,
            product_id: 23,
            quantity: 2,
            unit_price: 17.50
        },
        {
            order_item_id: 21,
            order_id: 13,
            product_id: 24,
            quantity: 4,
            unit_price: 9.50
        },
        {
            order_item_id: 22,
            order_id: 14,
            product_id: 2,
            quantity: 1,
            unit_price: 45.50
        },
        {
            order_item_id: 23,
            order_id: 14,
            product_id: 6,
            quantity: 1,
            unit_price: 55.00
        },
        {
            order_item_id: 24,
            order_id: 14,
            product_id: 4,
            quantity: 1,
            unit_price: 65.00
        },
        {
            order_item_id: 25,
            order_id: 15,
            product_id: 15,
            quantity: 1,
            unit_price: 89.99
        },
        {
            order_item_id: 26,
            order_id: 16,
            product_id: 20,
            quantity: 1,
            unit_price: 55.00
        },
        {
            order_item_id: 27,
            order_id: 17,
            product_id: 8,
            quantity: 1,
            unit_price: 34.99
        },
        {
            order_item_id: 28,
            order_id: 17,
            product_id: 10,
            quantity: 2,
            unit_price: 12.50
        },
        {
            order_item_id: 29,
            order_id: 18,
            product_id: 5,
            quantity: 1,
            unit_price: 28.75
        }
    ],
    payments: [
        {
            payment_id: 1,
            order_id: 1,
            amount: 96.98,
            payment_date: '2026-06-11',
            method: 'card'
        },
        {
            payment_id: 2,
            order_id: 3,
            amount: 57.10,
            payment_date: '2026-05-16',
            method: 'mobile banking'
        },
        {
            payment_id: 3,
            order_id: 4,
            amount: 43.97,
            payment_date: '2026-08-11',
            method: 'card'
        },
        {
            payment_id: 4,
            order_id: 5,
            amount: 24.99,
            payment_date: '2026-04-03',
            method: 'cash'
        },
        {
            payment_id: 5,
            order_id: 7,
            amount: 59.23,
            payment_date: '2026-07-06',
            method: 'card'
        },
        {
            payment_id: 6,
            order_id: 9,
            amount: 120.00,
            payment_date: '2026-03-21',
            method: 'mobile banking'
        },
        {
            payment_id: 7,
            order_id: 10,
            amount: 44.74,
            payment_date: '2026-05-29',
            method: 'card'
        },
        {
            payment_id: 8,
            order_id: 11,
            amount: 144.97,
            payment_date: '2026-07-31',
            method: 'card'
        },
        {
            payment_id: 9,
            order_id: 12,
            amount: 35.00,
            payment_date: '2026-06-26',
            method: 'cash'
        },
        {
            payment_id: 10,
            order_id: 14,
            amount: 165.50,
            payment_date: '2026-08-03',
            method: 'card'
        },
        {
            payment_id: 11,
            order_id: 15,
            amount: 89.99,
            payment_date: '2026-02-15',
            method: 'mobile banking'
        },
        {
            payment_id: 12,
            order_id: 16,
            amount: 55.00,
            payment_date: '2026-08-19',
            method: 'card'
        },
        {
            payment_id: 13,
            order_id: 17,
            amount: 59.99,
            payment_date: '2026-07-11',
            method: 'cash'
        }
    ],
    // Pedagogical tables for introductory concepts (Day 1)
    students: [
        {
            id: 1,
            name: 'Rahim',
            age: 21,
            department: 'CSE',
            city: 'Dhaka'
        },
        {
            id: 2,
            name: 'Karim',
            age: 22,
            department: 'EEE',
            city: 'Gazipur'
        },
        {
            id: 3,
            name: 'Ayesha',
            age: 20,
            department: 'CSE',
            city: 'Dhaka'
        },
        {
            id: 4,
            name: 'Sumaiya',
            age: 23,
            department: 'BBA',
            city: 'Chattogram'
        },
        {
            id: 5,
            name: 'Tanvir',
            age: 21,
            department: 'CSE',
            city: 'Rajshahi'
        }
    ],
    student_records: [
        {
            std_id: 1,
            std_nm: 'Rahim',
            std_age: 21,
            dept: 'CSE'
        },
        {
            std_id: 2,
            std_nm: 'Karim',
            std_age: 22,
            dept: 'EEE'
        },
        {
            std_id: 3,
            std_nm: 'Ayesha',
            std_age: 20,
            dept: 'CSE'
        },
        {
            std_id: 4,
            std_nm: 'Sumaiya',
            std_age: 23,
            dept: 'BBA'
        },
        {
            std_id: 5,
            std_nm: 'Tanvir',
            std_age: 21,
            dept: 'CSE'
        }
    ],
    reviews: [
        {
            review_id: 1,
            product_id: 1,
            customer_id: 1,
            rating: 5,
            comment: 'Great mouse, very comfortable to use.',
            created_at: '2026-07-15'
        },
        {
            review_id: 2,
            product_id: 2,
            customer_id: 2,
            rating: 4,
            comment: 'Solid sound quality for the price.',
            created_at: '2026-08-02'
        },
        {
            review_id: 3,
            product_id: 4,
            customer_id: 1,
            rating: 5,
            comment: 'The tactile feel on this keyboard is amazing.',
            created_at: '2026-06-20'
        },
        {
            review_id: 4,
            product_id: 6,
            customer_id: 3,
            rating: 5,
            comment: 'Heats up quickly and evenly.',
            created_at: '2026-07-11'
        },
        {
            review_id: 5,
            product_id: 7,
            customer_id: 4,
            rating: 4,
            comment: 'Beautiful mixing bowls, great finish.',
            created_at: '2026-08-12'
        },
        {
            review_id: 6,
            product_id: 10,
            customer_id: 3,
            rating: 4,
            comment: 'Very easy to use and keep knives sharp.',
            created_at: '2026-07-12'
        },
        {
            review_id: 7,
            product_id: 11,
            customer_id: 6,
            rating: 5,
            comment: 'Cleaned up my entire desk clutter.',
            created_at: '2026-07-08'
        },
        {
            review_id: 8,
            product_id: 14,
            customer_id: 8,
            rating: 5,
            comment: 'Extremely comfortable ergonomic chair.',
            created_at: '2026-03-25'
        },
        {
            review_id: 9,
            product_id: 16,
            customer_id: 4,
            rating: 4,
            comment: 'Good grip and cushioning for workouts.',
            created_at: '2026-08-14'
        },
        {
            review_id: 10,
            product_id: 18,
            customer_id: 4,
            rating: 5,
            comment: 'Durable resistance bands with good elasticity.',
            created_at: '2026-08-14'
        },
        {
            review_id: 11,
            product_id: 21,
            customer_id: 5,
            rating: 4,
            comment: 'Flexible and sturdy garden hose.',
            created_at: '2026-04-05'
        },
        {
            review_id: 12,
            product_id: 26,
            customer_id: 9,
            rating: 5,
            comment: 'Crisp audio and long battery life.',
            created_at: '2026-08-01'
        }
    ]
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/content/modules/day01.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DAY_01_MODULE",
    ()=>DAY_01_MODULE
]);
const DAY_01_MODULE = {
    id: 'day-01',
    slug: 'retrieving-data',
    day: 1,
    title: 'Day 1 — SELECT queries 101',
    shortTitle: 'SELECT queries 101',
    type: 'module',
    milestoneId: 'milestone-1',
    description: 'Master the fundamentals of SQL queries: SELECT, FROM, selecting multiple columns, SELECT *, and column aliasing with AS using intuitive mental models.',
    estimatedMinutes: 45,
    completionLearnings: [
        'Understand how FROM identifies the source table and SELECT picks the columns',
        'Select single and multiple specific columns from tables',
        'Retrieve all columns at once using the asterisk (*) wildcard',
        'Rename output columns cleanly in result sets using the AS keyword',
        'Understand that SELECT controls columns, while WHERE controls rows'
    ],
    concepts: [
        // =========================================================================
        // CONCEPT 1: SELECT and FROM
        // =========================================================================
        {
            id: 'select-and-from',
            order: 1,
            title: 'SELECT and FROM',
            shortDescription: 'The foundational building blocks of every SQL query.',
            theory: {
                summary: 'Imagine we have a database containing a table called students:',
                introTable: {
                    tableName: 'students',
                    description: 'This table is already stored in the database.',
                    columns: [
                        'id',
                        'name',
                        'age',
                        'department',
                        'city'
                    ],
                    rows: [
                        [
                            1,
                            'Rahim',
                            21,
                            'CSE',
                            'Dhaka'
                        ],
                        [
                            2,
                            'Karim',
                            22,
                            'EEE',
                            'Gazipur'
                        ],
                        [
                            3,
                            'Ayesha',
                            20,
                            'CSE',
                            'Dhaka'
                        ],
                        [
                            4,
                            'Sumaiya',
                            23,
                            'BBA',
                            'Chattogram'
                        ],
                        [
                            5,
                            'Tanvir',
                            21,
                            'CSE',
                            'Rajshahi'
                        ]
                    ]
                },
                explanation: [
                    'When you write a basic SQL query, you answer two simple questions:',
                    'QUESTION_BLOCK::FROM::Where should I get the data from?',
                    'QUESTION_BLOCK::SELECT::What columns do I want to see?',
                    'Let\'s see how SQL processes a query that asks for only the student names.'
                ],
                targetQuery: {
                    sql: 'SELECT name\nFROM students;',
                    explanation: 'From the students table, retrieve only the name column.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: FROM students (Find the source table)',
                        sqlSnippet: 'FROM students',
                        explanation: 'SQL begins by finding the students table. At this stage, all 5 rows and all 5 columns are available.',
                        tableData: {
                            tableName: 'students (Source Table)',
                            columns: [
                                'id',
                                'name',
                                'age',
                                'department',
                                'city'
                            ],
                            rows: [
                                [
                                    1,
                                    'Rahim',
                                    21,
                                    'CSE',
                                    'Dhaka'
                                ],
                                [
                                    2,
                                    'Karim',
                                    22,
                                    'EEE',
                                    'Gazipur'
                                ],
                                [
                                    3,
                                    'Ayesha',
                                    20,
                                    'CSE',
                                    'Dhaka'
                                ],
                                [
                                    4,
                                    'Sumaiya',
                                    23,
                                    'BBA',
                                    'Chattogram'
                                ],
                                [
                                    5,
                                    'Tanvir',
                                    21,
                                    'CSE',
                                    'Rajshahi'
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: 'Step 2: SELECT name (Extract the column)',
                        sqlSnippet: 'SELECT name',
                        explanation: 'Next, SQL extracts only the name column from each row.',
                        tableData: {
                            tableName: 'Final Query Result',
                            columns: [
                                'name'
                            ],
                            highlightedColumns: [
                                'name'
                            ],
                            rows: [
                                [
                                    'Rahim'
                                ],
                                [
                                    'Karim'
                                ],
                                [
                                    'Ayesha'
                                ],
                                [
                                    'Sumaiya'
                                ],
                                [
                                    'Tanvir'
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'Meaning of the query',
                        sql: 'SELECT name\nFROM students;',
                        description: 'Means: From the students table, retrieve the name column.'
                    }
                ],
                keyTakeaway: 'FROM identifies the data source, and SELECT chooses which column to extract. Every row in that column is returned.',
                exampleQuery: 'SELECT name FROM students;',
                exampleQueryExplanation: 'From the students table, retrieve only the name column.',
                liveDemoSql: 'SELECT name FROM students;',
                liveDemoNotes: 'Executes `SELECT name FROM students;` and retrieves only the name column for all 5 students.',
                mcqs: [
                    {
                        question: 'What does this query do?\nSELECT age\nFROM students;',
                        options: [
                            'A. Selects students whose age is something',
                            'B. Shows the age column from the students table',
                            'C. Deletes the age column',
                            'D. Shows all student information'
                        ],
                        correctIndex: 1,
                        explanation: '`SELECT age FROM students;` retrieves the age column from the students table.'
                    }
                ]
            },
            masteryPoints: [
                'Understand that FROM designates the source table',
                'Understand that SELECT specifies the desired column',
                'Know how to end queries with a semicolon (;)'
            ],
            tasks: [
                {
                    id: 'day01-c1-t1',
                    title: 'Task 1: Show only name',
                    description: 'Show only the name column from the students table.',
                    instructions: [
                        'Write a query to retrieve only the `name` column from `students`.',
                        'End your query with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'students',
                    initialSql: '-- Write your SQL query here\n',
                    solutionSql: 'SELECT name FROM students;',
                    solutionExplanation: '`SELECT name FROM students;` retrieves the name column for every row.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `SELECT name FROM students;`'
                        },
                        {
                            level: 2,
                            text: 'Write `SELECT name FROM students;` and click Submit.'
                        }
                    ],
                    validation: {
                        targetTable: 'students',
                        requiredColumns: [
                            'name'
                        ],
                        forbiddenColumns: [
                            'id',
                            'age',
                            'department',
                            'city'
                        ],
                        expectedRowCount: 5
                    },
                    successMessage: 'Great job! You retrieved only the student names.'
                },
                {
                    id: 'day01-c1-t2',
                    title: 'Task 2: Show only city',
                    description: 'Show only the city column from the students table.',
                    instructions: [
                        'Write a query to retrieve only the `city` column from `students`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'independent',
                    primaryTable: 'students',
                    initialSql: '-- Show only city from students\n',
                    solutionSql: 'SELECT city FROM students;',
                    solutionExplanation: '`SELECT city FROM students;` extracts the city column.',
                    hints: [
                        {
                            level: 1,
                            text: 'Start with `SELECT city FROM students;`'
                        }
                    ],
                    validation: {
                        targetTable: 'students',
                        requiredColumns: [
                            'city'
                        ],
                        forbiddenColumns: [
                            'id',
                            'name',
                            'age',
                            'department'
                        ],
                        expectedRowCount: 5
                    },
                    successMessage: 'Well done! You extracted the city column from the students table.'
                }
            ]
        },
        // =========================================================================
        // CONCEPT 2: Selecting Multiple Columns
        // =========================================================================
        {
            id: 'selecting-multiple-columns',
            order: 2,
            title: '2. Selecting Multiple Columns',
            shortDescription: 'How to retrieve two or more columns simultaneously.',
            theory: {
                summary: 'What if you want both name and age?',
                introTable: {
                    tableName: 'students',
                    description: 'Original table (5 columns: id | name | age | department | city)',
                    columns: [
                        'id',
                        'name',
                        'age',
                        'department',
                        'city'
                    ],
                    rows: [
                        [
                            1,
                            'Rahim',
                            21,
                            'CSE',
                            'Dhaka'
                        ],
                        [
                            2,
                            'Karim',
                            22,
                            'EEE',
                            'Gazipur'
                        ],
                        [
                            3,
                            'Ayesha',
                            20,
                            'CSE',
                            'Dhaka'
                        ],
                        [
                            4,
                            'Sumaiya',
                            23,
                            'BBA',
                            'Chattogram'
                        ],
                        [
                            5,
                            'Tanvir',
                            21,
                            'CSE',
                            'Rajshahi'
                        ]
                    ]
                },
                explanation: [
                    'To retrieve more than one column from a table, separate the column names with a comma in your `SELECT` statement.',
                    '### Notice how SELECT shapes columns:\n• **Original table:** 5 columns (`id`, `name`, `age`, `department`, `city`)\n• **Query result:** 2 columns (`name`, `age`)\n\n**SELECT decides which columns appear in the result.** The table in the database remains unchanged.'
                ],
                targetQuery: {
                    sql: 'SELECT name, age\nFROM students;',
                    explanation: 'From the students table, retrieve both the name and age columns.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: FROM students (Read all columns)',
                        sqlSnippet: 'FROM students',
                        explanation: 'SQL visits the students table with all 5 columns.',
                        tableData: {
                            tableName: 'students (Full Table)',
                            columns: [
                                'id',
                                'name',
                                'age',
                                'department',
                                'city'
                            ],
                            rows: [
                                [
                                    1,
                                    'Rahim',
                                    21,
                                    'CSE',
                                    'Dhaka'
                                ],
                                [
                                    2,
                                    'Karim',
                                    22,
                                    'EEE',
                                    'Gazipur'
                                ],
                                [
                                    3,
                                    'Ayesha',
                                    20,
                                    'CSE',
                                    'Dhaka'
                                ],
                                [
                                    4,
                                    'Sumaiya',
                                    23,
                                    'BBA',
                                    'Chattogram'
                                ],
                                [
                                    5,
                                    'Tanvir',
                                    21,
                                    'CSE',
                                    'Rajshahi'
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: 'Step 2: SELECT name, age (Shape columns)',
                        sqlSnippet: 'SELECT name, age',
                        explanation: 'SQL projects only the name and age columns into the output result.',
                        tableData: {
                            tableName: 'Final Query Result',
                            columns: [
                                'name',
                                'age'
                            ],
                            highlightedColumns: [
                                'name',
                                'age'
                            ],
                            rows: [
                                [
                                    'Rahim',
                                    21
                                ],
                                [
                                    'Karim',
                                    22
                                ],
                                [
                                    'Ayesha',
                                    20
                                ],
                                [
                                    'Sumaiya',
                                    23
                                ],
                                [
                                    'Tanvir',
                                    21
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'Selecting multiple columns',
                        sql: 'SELECT name, age\nFROM students;',
                        description: 'Returns only the `name` and `age` columns for each student.'
                    }
                ],
                keyTakeaway: 'Separate column names with commas in the SELECT list. The order in SELECT dictates the order in the output.',
                exampleQuery: 'SELECT name, age FROM students;',
                exampleQueryExplanation: 'Retrieves `name` and `age` columns from `students`.',
                liveDemoSql: 'SELECT name, age FROM students;',
                liveDemoNotes: 'Notice that only the 2 requested columns appear in the output table.',
                mcqs: [
                    {
                        question: 'What will be returned by:\nSELECT name, city\nFROM students;',
                        options: [
                            'A. Only names and cities',
                            'B. Only students from a city',
                            'C. All columns',
                            'D. Names of cities'
                        ],
                        correctIndex: 0,
                        explanation: '`SELECT name, city` asks the database for only the name and city columns.'
                    }
                ]
            },
            masteryPoints: [
                'List multiple columns separated by commas in the SELECT clause',
                'Understand that SELECT controls which columns are projected',
                'Avoid trailing commas before FROM'
            ],
            tasks: [
                {
                    id: 'day01-c2-t1',
                    title: 'Task 1: Show name and department',
                    description: 'Show name and department from the students table.',
                    instructions: [
                        'Select `name` and `department` from `students`.'
                    ],
                    type: 'guided',
                    primaryTable: 'students',
                    initialSql: '-- Write your SQL query here\n',
                    solutionSql: 'SELECT name, department FROM students;',
                    solutionExplanation: '`SELECT name, department FROM students;` extracts both columns.',
                    hints: [
                        {
                            level: 1,
                            text: 'Add `department` after `name,` in the SELECT clause.'
                        },
                        {
                            level: 2,
                            text: 'Write `SELECT name, department FROM students;`'
                        }
                    ],
                    validation: {
                        targetTable: 'students',
                        requiredColumns: [
                            'name',
                            'department'
                        ],
                        forbiddenColumns: [
                            'id',
                            'age',
                            'city'
                        ],
                        expectedRowCount: 5
                    },
                    successMessage: 'Great job! You retrieved name and department.'
                },
                {
                    id: 'day01-c2-t2',
                    title: 'Task 2: Show id, name, and city',
                    description: 'Show id, name, and city from the students table.',
                    instructions: [
                        'Select `id`, `name`, and `city` from `students`.'
                    ],
                    type: 'independent',
                    primaryTable: 'students',
                    initialSql: '-- Show id, name, and city from students\n',
                    solutionSql: 'SELECT id, name, city FROM students;',
                    solutionExplanation: '`SELECT id, name, city FROM students;` projects the three requested columns.',
                    hints: [
                        {
                            level: 1,
                            text: 'List the 3 columns: `id, name, city`.'
                        }
                    ],
                    validation: {
                        targetTable: 'students',
                        requiredColumns: [
                            'id',
                            'name',
                            'city'
                        ],
                        forbiddenColumns: [
                            'age',
                            'department'
                        ],
                        expectedRowCount: 5
                    },
                    successMessage: 'Perfect! You projected id, name, and city from the table.'
                }
            ]
        },
        // =========================================================================
        // CONCEPT 3: SELECT *
        // =========================================================================
        {
            id: 'select-all',
            order: 3,
            title: '3. SELECT *',
            shortDescription: 'The asterisk (*) shorthand to retrieve all columns at once.',
            theory: {
                summary: 'The * means: Select all columns.',
                introTable: {
                    tableName: 'students',
                    description: 'Full table in database (5 columns)',
                    columns: [
                        'id',
                        'name',
                        'age',
                        'department',
                        'city'
                    ],
                    rows: [
                        [
                            1,
                            'Rahim',
                            21,
                            'CSE',
                            'Dhaka'
                        ],
                        [
                            2,
                            'Karim',
                            22,
                            'EEE',
                            'Gazipur'
                        ],
                        [
                            3,
                            'Ayesha',
                            20,
                            'CSE',
                            'Dhaka'
                        ],
                        [
                            4,
                            'Sumaiya',
                            23,
                            'BBA',
                            'Chattogram'
                        ],
                        [
                            5,
                            'Tanvir',
                            21,
                            'CSE',
                            'Rajshahi'
                        ]
                    ]
                },
                explanation: [
                    'The `*` (asterisk) is SQL\'s shorthand for **all columns**.',
                    'Instead of typing out every column name manually, `SELECT *` tells SQL: *"Give me every column stored in this table."*',
                    '### When to use SELECT * vs Specific Columns:\n• Use `SELECT *` when you are first exploring a table to see what columns exist.\n• In production apps and reports, prefer naming specific columns (like `SELECT name, city`) to keep queries fast and clean.'
                ],
                targetQuery: {
                    sql: 'SELECT *\nFROM students;',
                    explanation: 'The * wildcard retrieves every column and every row stored in the students table.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: FROM students (Open table)',
                        sqlSnippet: 'FROM students',
                        explanation: 'SQL visits the students table in the database.',
                        tableData: {
                            tableName: 'students (Source Table)',
                            columns: [
                                'id',
                                'name',
                                'age',
                                'department',
                                'city'
                            ],
                            rows: [
                                [
                                    1,
                                    'Rahim',
                                    21,
                                    'CSE',
                                    'Dhaka'
                                ],
                                [
                                    2,
                                    'Karim',
                                    22,
                                    'EEE',
                                    'Gazipur'
                                ],
                                [
                                    3,
                                    'Ayesha',
                                    20,
                                    'CSE',
                                    'Dhaka'
                                ],
                                [
                                    4,
                                    'Sumaiya',
                                    23,
                                    'BBA',
                                    'Chattogram'
                                ],
                                [
                                    5,
                                    'Tanvir',
                                    21,
                                    'CSE',
                                    'Rajshahi'
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: 'Step 2: SELECT * (Include all 5 columns)',
                        sqlSnippet: 'SELECT *',
                        explanation: 'Because * means all columns, the final result keeps every column without removing anything.',
                        tableData: {
                            tableName: 'Final Query Result (All Columns)',
                            columns: [
                                'id',
                                'name',
                                'age',
                                'department',
                                'city'
                            ],
                            highlightedColumns: [
                                'id',
                                'name',
                                'age',
                                'department',
                                'city'
                            ],
                            rows: [
                                [
                                    1,
                                    'Rahim',
                                    21,
                                    'CSE',
                                    'Dhaka'
                                ],
                                [
                                    2,
                                    'Karim',
                                    22,
                                    'EEE',
                                    'Gazipur'
                                ],
                                [
                                    3,
                                    'Ayesha',
                                    20,
                                    'CSE',
                                    'Dhaka'
                                ],
                                [
                                    4,
                                    'Sumaiya',
                                    23,
                                    'BBA',
                                    'Chattogram'
                                ],
                                [
                                    5,
                                    'Tanvir',
                                    21,
                                    'CSE',
                                    'Rajshahi'
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'Select all columns shorthand',
                        sql: 'SELECT *\nFROM students;',
                        description: 'Returns all columns and all rows from the table.'
                    }
                ],
                keyTakeaway: '* is a shorthand for all columns. Use it to inspect tables quickly.',
                exampleQuery: 'SELECT * FROM students;',
                exampleQueryExplanation: 'Returns every column and every row stored in students.',
                liveDemoSql: 'SELECT * FROM students;',
                liveDemoNotes: 'Dumps the complete table structure and data.',
                mcqs: [
                    {
                        question: 'What does * mean here?\nSELECT *\nFROM students;',
                        options: [
                            'A. Multiply everything',
                            'B. Select all rows only',
                            'C. Select all columns',
                            'D. Select the first column'
                        ],
                        correctIndex: 2,
                        explanation: 'The asterisk (*) represents the wildcard for ALL columns.'
                    }
                ]
            },
            masteryPoints: [
                'Use * to quickly inspect any table',
                'Understand the difference between SELECT * and selective projection'
            ],
            tasks: [
                {
                    id: 'day01-c3-t1',
                    title: 'Task 1: Show everything from the table',
                    description: 'Show everything from the students table.',
                    instructions: [
                        'Write a query to retrieve all columns and all rows from `students`.',
                        'Use the `*` wildcard.'
                    ],
                    type: 'guided',
                    primaryTable: 'students',
                    initialSql: '-- Write your SQL query here\n',
                    solutionSql: 'SELECT * FROM students;',
                    solutionExplanation: '`SELECT * FROM students;` dumps all columns.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `*` after `SELECT`.'
                        },
                        {
                            level: 2,
                            text: '`SELECT * FROM students;`'
                        }
                    ],
                    validation: {
                        targetTable: 'students',
                        requiredColumns: [
                            'id',
                            'name',
                            'age',
                            'department',
                            'city'
                        ],
                        expectedRowCount: 5
                    },
                    successMessage: 'Great job! You retrieved all columns from students.'
                },
                {
                    id: 'day01-c3-t2',
                    title: 'Task 2: Show name, age, and city',
                    description: 'Show name, age, and city from the students table.',
                    instructions: [
                        'Select `name`, `age`, and `city` from `students`.'
                    ],
                    type: 'independent',
                    primaryTable: 'students',
                    initialSql: '-- Show name, age, and city\n',
                    solutionSql: 'SELECT name, age, city FROM students;',
                    solutionExplanation: 'Projects `name, age, city` specifically.',
                    hints: [
                        {
                            level: 1,
                            text: 'Write `SELECT name, age, city FROM students;`'
                        }
                    ],
                    validation: {
                        targetTable: 'students',
                        requiredColumns: [
                            'name',
                            'age',
                            'city'
                        ],
                        forbiddenColumns: [
                            'id',
                            'department'
                        ],
                        expectedRowCount: 5
                    },
                    successMessage: 'Awesome! You mastered column selection.'
                }
            ]
        },
        // =========================================================================
        // CONCEPT 4: AS: Renaming Columns in the Output
        // =========================================================================
        {
            id: 'column-aliasing',
            order: 4,
            title: 'AS: Renaming Columns in the Output',
            shortDescription: 'Change how column names appear in the result without modifying the database.',
            theory: {
                summary: 'We still have our students table:',
                introTable: {
                    tableName: 'students',
                    columns: [
                        'id',
                        'name',
                        'age',
                        'department',
                        'city'
                    ],
                    rows: [
                        [
                            1,
                            'Rahim',
                            21,
                            'CSE',
                            'Dhaka'
                        ],
                        [
                            2,
                            'Karim',
                            22,
                            'EEE',
                            'Gazipur'
                        ],
                        [
                            3,
                            'Ayesha',
                            20,
                            'CSE',
                            'Dhaka'
                        ],
                        [
                            4,
                            'Sumaiya',
                            23,
                            'BBA',
                            'Chattogram'
                        ],
                        [
                            5,
                            'Tanvir',
                            21,
                            'CSE',
                            'Rajshahi'
                        ]
                    ]
                },
                explanation: [
                    '### 1. What problem does AS solve?',
                    'Sometimes raw database column names look technical or cryptic (like `std_nm` or `dob`).',
                    'With **AS**, you can give columns friendly, readable labels in your output without changing anything in the database.',
                    '### 2. Notice this golden rule:\n**AS only renames the presentation header in the query result.** The actual database column names remain unchanged.'
                ],
                targetQuery: {
                    sql: 'SELECT name AS student_name, age AS student_age\nFROM students;',
                    explanation: 'Rename the name and age column headers in the output result.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: FROM students (Find rows)',
                        sqlSnippet: 'FROM students',
                        explanation: 'SQL visits the students table with all 5 records.',
                        tableData: {
                            tableName: 'students (Source Table)',
                            columns: [
                                'id',
                                'name',
                                'age',
                                'department',
                                'city'
                            ],
                            rows: [
                                [
                                    1,
                                    'Rahim',
                                    21,
                                    'CSE',
                                    'Dhaka'
                                ],
                                [
                                    2,
                                    'Karim',
                                    22,
                                    'EEE',
                                    'Gazipur'
                                ],
                                [
                                    3,
                                    'Ayesha',
                                    20,
                                    'CSE',
                                    'Dhaka'
                                ],
                                [
                                    4,
                                    'Sumaiya',
                                    23,
                                    'BBA',
                                    'Chattogram'
                                ],
                                [
                                    5,
                                    'Tanvir',
                                    21,
                                    'CSE',
                                    'Rajshahi'
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: 'Step 2: SELECT name AS student_name, age AS student_age (Rename headers)',
                        sqlSnippet: 'SELECT name AS student_name, age AS student_age',
                        explanation: 'SQL extracts the name and age columns and applies your new custom header labels.',
                        tableData: {
                            tableName: 'Final Query Result (Aliased Headers)',
                            columns: [
                                'student_name',
                                'student_age'
                            ],
                            highlightedColumns: [
                                'student_name',
                                'student_age'
                            ],
                            rows: [
                                [
                                    'Rahim',
                                    21
                                ],
                                [
                                    'Karim',
                                    22
                                ],
                                [
                                    'Ayesha',
                                    20
                                ],
                                [
                                    'Sumaiya',
                                    23
                                ],
                                [
                                    'Tanvir',
                                    21
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'Column Aliasing Syntax',
                        sql: 'SELECT name AS student_name, age AS student_age\nFROM students;',
                        description: 'Gives custom display labels to output columns while leaving the underlying table unchanged.'
                    },
                    {
                        title: 'Aliases with Spaces',
                        sql: 'SELECT name AS "Student Name"\nFROM students;',
                        description: 'Double quotes allow aliases with spaces or special formatting.'
                    }
                ],
                keyTakeaway: 'AS provides temporary output names for the query result. It NEVER modifies the underlying database table.',
                exampleQuery: 'SELECT name AS student_name, age AS student_age FROM students;',
                exampleQueryExplanation: 'Renames name to student_name and age to student_age in the output.',
                liveDemoSql: 'SELECT name AS student_name, age AS student_age, city AS student_city FROM students;',
                liveDemoNotes: 'Notice how the table headers change in the result view without altering the students table.',
                mcqs: [
                    {
                        question: 'What does this query do?\nSELECT name AS student_name\nFROM students;',
                        options: [
                            'A. Changes the actual column name permanently',
                            'B. Creates a new table',
                            'C. Shows the name column with student_name as its output name',
                            'D. Deletes the name column'
                        ],
                        correctIndex: 2,
                        explanation: 'AS only renames the column label in the output result set.'
                    },
                    {
                        question: 'What will the output column name be?\nSELECT city AS location\nFROM students;',
                        options: [
                            'A. city',
                            'B. location',
                            'C. students',
                            'D. Both city and location'
                        ],
                        correctIndex: 1,
                        explanation: 'The alias `location` replaces `city` as the header in the output.'
                    },
                    {
                        question: 'Does this permanently rename the age column in the database?\nSELECT age AS student_age\nFROM students;',
                        options: [
                            'A. Yes',
                            'B. No'
                        ],
                        correctIndex: 1,
                        explanation: 'No. AS is purely a presentation-layer temporary rename.'
                    }
                ]
            },
            masteryPoints: [
                'Use AS to rename output column headers',
                'Understand that AS does not mutate the database',
                'Use quotes when an alias includes spaces'
            ],
            tasks: [
                {
                    id: 'day01-c4-t1',
                    title: 'Task 1: Show name as student_name',
                    description: 'Show name, but the output column should be called student_name.',
                    instructions: [
                        'Select `name` from `students`.',
                        'Alias it as `student_name`.'
                    ],
                    type: 'guided',
                    primaryTable: 'students',
                    initialSql: '-- Write your SQL query here\n',
                    solutionSql: 'SELECT name AS student_name FROM students;',
                    solutionExplanation: '`SELECT name AS student_name FROM students;` assigns the output alias.',
                    hints: [
                        {
                            level: 1,
                            text: 'Add `student_name` after the `AS` keyword.'
                        }
                    ],
                    validation: {
                        targetTable: 'students',
                        requiredColumns: [
                            'student_name'
                        ],
                        requiredAliases: {
                            name: 'student_name'
                        },
                        expectedRowCount: 5
                    },
                    successMessage: 'Great job! Column aliased as student_name.'
                },
                {
                    id: 'day01-c4-t2',
                    title: 'Task 2: Show name and department renamed',
                    description: 'Show name and department, renamed as student_name and student_department.',
                    instructions: [
                        'Select `name` AS `student_name`.',
                        'Select `department` AS `student_department`.',
                        'From the `students` table.'
                    ],
                    type: 'independent',
                    primaryTable: 'students',
                    initialSql: '-- Rename name and department\n',
                    solutionSql: 'SELECT name AS student_name, department AS student_department FROM students;',
                    solutionExplanation: 'Renames both projected columns using AS.',
                    hints: [
                        {
                            level: 1,
                            text: '`SELECT name AS student_name, department AS student_department FROM students;`'
                        }
                    ],
                    validation: {
                        targetTable: 'students',
                        requiredColumns: [
                            'student_name',
                            'student_department'
                        ],
                        requiredAliases: {
                            name: 'student_name',
                            department: 'student_department'
                        },
                        expectedRowCount: 5
                    },
                    successMessage: 'Awesome! Both columns aliased cleanly.'
                },
                {
                    id: 'day01-c4-t3',
                    title: 'Task 3: Show id, name, and age renamed',
                    description: 'Show id, name, and age, renamed as student_id, student_name, and student_age.',
                    instructions: [
                        'Select `id` AS `student_id`.',
                        'Select `name` AS `student_name`.',
                        'Select `age` AS `student_age`.',
                        'From `students`.'
                    ],
                    type: 'independent',
                    primaryTable: 'students',
                    initialSql: '-- Rename id, name, and age\n',
                    solutionSql: 'SELECT id AS student_id, name AS student_name, age AS student_age FROM students;',
                    solutionExplanation: 'Projects three aliased columns.',
                    hints: [
                        {
                            level: 1,
                            text: '`SELECT id AS student_id, name AS student_name, age AS student_age FROM students;`'
                        }
                    ],
                    validation: {
                        targetTable: 'students',
                        requiredColumns: [
                            'student_id',
                            'student_name',
                            'student_age'
                        ],
                        requiredAliases: {
                            id: 'student_id',
                            name: 'student_name',
                            age: 'student_age'
                        },
                        expectedRowCount: 5
                    },
                    successMessage: 'Spot on! All three columns aliased properly.'
                },
                {
                    id: 'day01-c4-t4',
                    title: 'Task 4: Principal Report Challenge',
                    description: 'Imagine you are creating a report for a school principal. Convert std_id, std_nm, std_age, dept into Student ID, Student Name, Age, Department.',
                    instructions: [
                        'Query the `student_records` table.',
                        'Alias `std_id` AS "Student ID" (or `Student_ID`).',
                        'Alias `std_nm` AS "Student Name" (or `Student_Name`).',
                        'Alias `std_age` AS `Age` (or `Student_Age`).',
                        'Alias `dept` AS `Department`.'
                    ],
                    type: 'challenge',
                    primaryTable: 'student_records',
                    initialSql: '-- Principal Report: format technical column names\n',
                    solutionSql: 'SELECT std_id AS "Student ID", std_nm AS "Student Name", std_age AS "Age", dept AS "Department" FROM student_records;',
                    solutionExplanation: 'Formats all four technical columns into readable report headers.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use quotes for names with spaces like `"Student ID"` and `"Student Name"`.'
                        },
                        {
                            level: 2,
                            text: '`SELECT std_id AS "Student ID", std_nm AS "Student Name", std_age AS "Age", dept AS "Department" FROM student_records;`'
                        }
                    ],
                    validation: {
                        targetTable: 'student_records',
                        expectedRowCount: 5,
                        customValidator: (_ast, result)=>{
                            if (!result || !result.columns || result.columns.length < 4) {
                                return {
                                    valid: false,
                                    feedback: 'Query must return all 4 columns with human-readable aliases.'
                                };
                            }
                            const cols = result.columns.map((c)=>c.toLowerCase().replace(/[\s_"]/g, ''));
                            const hasId = cols.some((c)=>c.includes('studentid') || c.includes('id'));
                            const hasName = cols.some((c)=>c.includes('studentname') || c.includes('name'));
                            const hasAge = cols.some((c)=>c.includes('age'));
                            const hasDept = cols.some((c)=>c.includes('dept') || c.includes('department'));
                            if (hasId && hasName && hasAge && hasDept && result.rows.length === 5) {
                                return {
                                    valid: true
                                };
                            }
                            return {
                                valid: false,
                                feedback: 'Ensure you alias std_id, std_nm, std_age, dept to Student ID, Student Name, Age, Department.'
                            };
                        }
                    },
                    successMessage: 'Masterpiece! You produced a formatted report for the school principal.'
                }
            ]
        }
    ],
    challenge: {
        id: 'day-01-homework',
        title: 'Day 1 — Retrieving Data (Homework)',
        scenario: 'In Workbench, with inventory_system selected, practice fundamental retrieval operations:',
        tasks: [
            {
                id: 'day01-hw-1',
                title: 'Task 1: Display name, price, quantity_in_stock from products',
                description: 'Display name, price, and quantity_in_stock from the products table.',
                instructions: [
                    'Select name, price, and quantity_in_stock from the products table.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'products',
                initialSql: '',
                solutionSql: 'SELECT name, price, quantity_in_stock FROM products;',
                solutionExplanation: 'Retrieves the three specified columns from products table.',
                hints: [
                    {
                        level: 1,
                        text: 'Use SELECT name, price, quantity_in_stock FROM products;'
                    }
                ],
                validation: {
                    targetTable: 'products',
                    requiredColumns: [
                        'name',
                        'price',
                        'quantity_in_stock'
                    ],
                    expectedRowCount: 28
                },
                successMessage: 'Task 1 completed! Product columns displayed.'
            },
            {
                id: 'day01-hw-2',
                title: 'Task 2: Display name and email from customers',
                description: 'Display name and email from customers (any order).',
                instructions: [
                    'Select name and email from the customers table.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'customers',
                initialSql: '',
                solutionSql: 'SELECT name, email FROM customers;',
                solutionExplanation: 'Retrieves customer names and email addresses.',
                hints: [
                    {
                        level: 1,
                        text: 'Use SELECT name, email FROM customers;'
                    }
                ],
                validation: {
                    targetTable: 'customers',
                    requiredColumns: [
                        'name',
                        'email'
                    ],
                    expectedRowCount: 15
                },
                successMessage: 'Task 2 completed! Customer names and emails displayed.'
            },
            {
                id: 'day01-hw-3',
                title: 'Task 3: Display with column aliases',
                description: 'Repeat Task 1, aliasing columns as product_name, unit_price, stock.',
                instructions: [
                    'Select name AS product_name, price AS unit_price, quantity_in_stock AS stock from products.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'products',
                initialSql: '',
                solutionSql: 'SELECT name AS product_name, price AS unit_price, quantity_in_stock AS stock FROM products;',
                solutionExplanation: 'Uses AS to rename the 3 output columns in the query result.',
                hints: [
                    {
                        level: 1,
                        text: 'SELECT name AS product_name, price AS unit_price, quantity_in_stock AS stock FROM products;'
                    }
                ],
                validation: {
                    targetTable: 'products',
                    requiredColumns: [
                        'product_name',
                        'unit_price',
                        'stock'
                    ],
                    requiredAliases: {
                        name: 'product_name',
                        price: 'unit_price',
                        quantity_in_stock: 'stock'
                    },
                    expectedRowCount: 28
                },
                successMessage: 'Task 3 completed! Columns cleanly aliased.'
            }
        ]
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/content/modules/day02.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DAY_02_MODULE",
    ()=>DAY_02_MODULE
]);
const DAY_02_MODULE = {
    id: 'day-02',
    slug: 'core-filtering',
    day: 2,
    title: 'Day 2 — WHERE & Core Filtering',
    shortTitle: 'WHERE & Core Filtering',
    type: 'module',
    milestoneId: 'milestone-1',
    description: 'Master single-condition row filtering using WHERE, exact equality (=), inequality (!= / <>), numeric range comparisons (<, >, <=, >=), and string filtering with single quotes.',
    estimatedMinutes: 45,
    completionLearnings: [
        'Understand how WHERE filters rows before SELECT picks columns',
        'Test exact equality using = on numeric and primary key fields',
        'Filter out unwanted values using the inequality operator != (<>)',
        'Apply strict comparisons (<, >) that exclude boundary threshold values',
        'Apply inclusive comparisons (<=, >=) that explicitly include boundary threshold values',
        'Filter text and strings safely using single quotes (\'value\')'
    ],
    concepts: [
        // =========================================================================
        // CONCEPT 1a: The WHERE Clause & Exact Equality (=)
        // =========================================================================
        {
            id: 'where-exact-equality',
            order: 1,
            title: '1. Filtering Rows with WHERE and Exact Equality (=)',
            shortDescription: 'How SQL filters specific rows based on exact matches.',
            theory: {
                summary: 'Imagine we have our database table called:',
                introTable: {
                    tableName: 'students',
                    description: 'Original table stored in the database (5 rows × 5 columns)',
                    columns: [
                        'id',
                        'name',
                        'age',
                        'department',
                        'city'
                    ],
                    rows: [
                        [
                            1,
                            'Rahim',
                            21,
                            'CSE',
                            'Dhaka'
                        ],
                        [
                            2,
                            'Karim',
                            22,
                            'EEE',
                            'Gazipur'
                        ],
                        [
                            3,
                            'Ayesha',
                            20,
                            'CSE',
                            'Dhaka'
                        ],
                        [
                            4,
                            'Sumaiya',
                            23,
                            'BBA',
                            'Chattogram'
                        ],
                        [
                            5,
                            'Tanvir',
                            21,
                            'CSE',
                            'Rajshahi'
                        ]
                    ]
                },
                explanation: [
                    'In Day 1, we learned that `SELECT` controls which **columns** appear in the output.',
                    'Now, what if we do not want every single student? What if we only want students whose age is **exactly 21**? That is what **WHERE** is for.',
                    '### 1. The Three Questions of SQL\nWhen writing a filtered query, you answer three questions in order:',
                    'QUESTION_BLOCK::FROM::Where should I get the data from?',
                    'QUESTION_BLOCK::WHERE::Which rows meet my criteria?',
                    'QUESTION_BLOCK::SELECT::What columns do I want to see in the result?',
                    '### 2. The Golden Rule of Row Filtering\n**SELECT controls columns. WHERE controls rows.**\nSQL first evaluates the `WHERE` condition row-by-row to decide which rows survive, and only then extracts the columns requested in `SELECT`.'
                ],
                targetQuery: {
                    sql: 'SELECT name, age\nFROM students\nWHERE age = 21;',
                    explanation: 'From students, find students whose age is exactly 21 and show their name and age.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: FROM students (Find all rows)',
                        sqlSnippet: 'FROM students',
                        explanation: 'SQL visits the students table containing all 5 rows.',
                        tableData: {
                            tableName: 'students (Source Table)',
                            columns: [
                                'id',
                                'name',
                                'age',
                                'department',
                                'city'
                            ],
                            rows: [
                                [
                                    1,
                                    'Rahim',
                                    21,
                                    'CSE',
                                    'Dhaka'
                                ],
                                [
                                    2,
                                    'Karim',
                                    22,
                                    'EEE',
                                    'Gazipur'
                                ],
                                [
                                    3,
                                    'Ayesha',
                                    20,
                                    'CSE',
                                    'Dhaka'
                                ],
                                [
                                    4,
                                    'Sumaiya',
                                    23,
                                    'BBA',
                                    'Chattogram'
                                ],
                                [
                                    5,
                                    'Tanvir',
                                    21,
                                    'CSE',
                                    'Rajshahi'
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: 'Step 2: WHERE age = 21 (Row-by-Row check)',
                        sqlSnippet: 'WHERE age = 21',
                        explanation: 'Row 1 (21 = 21): TRUE ✅\nRow 2 (22 = 21): FALSE ❌\nRow 3 (20 = 21): FALSE ❌\nRow 4 (23 = 21): FALSE ❌\nRow 5 (21 = 21): TRUE ✅',
                        tableData: {
                            tableName: 'Surviving Rows (age = 21)',
                            columns: [
                                'id',
                                'name',
                                'age',
                                'department',
                                'city'
                            ],
                            highlightedRows: [
                                0,
                                1
                            ],
                            rows: [
                                [
                                    1,
                                    'Rahim',
                                    21,
                                    'CSE',
                                    'Dhaka'
                                ],
                                [
                                    5,
                                    'Tanvir',
                                    21,
                                    'CSE',
                                    'Rajshahi'
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 3,
                        stepTitle: 'Step 3: SELECT name, age (Extract requested columns)',
                        sqlSnippet: 'SELECT name, age',
                        explanation: 'Only the requested columns (name and age) are extracted from the surviving rows:',
                        tableData: {
                            tableName: 'Final Query Result',
                            columns: [
                                'name',
                                'age'
                            ],
                            highlightedColumns: [
                                'name',
                                'age'
                            ],
                            rows: [
                                [
                                    'Rahim',
                                    21
                                ],
                                [
                                    'Tanvir',
                                    21
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'Basic WHERE equality syntax',
                        sql: 'SELECT column1, column2\nFROM table_name\nWHERE numeric_column = value;',
                        description: 'Only rows where numeric_column equals the value are returned.'
                    }
                ],
                keyTakeaway: 'WHERE filters rows before SELECT chooses columns. The = operator tests exact equality.',
                exampleQuery: 'SELECT name, age FROM students WHERE age = 21;',
                exampleQueryExplanation: 'From students, keeps rows where age is exactly 21, displaying name and age.',
                liveDemoSql: 'SELECT name, age FROM students WHERE age = 21;',
                liveDemoNotes: 'Executes row filtering: Rahim and Tanvir pass the age = 21 test.',
                mcqs: [
                    {
                        question: 'What does the WHERE clause do in a SQL query?\nSELECT name FROM students WHERE age = 21;',
                        options: [
                            'A. Selects which columns to show in the output',
                            'B. Evaluates each row and keeps only those where age is 21',
                            'C. Changes the student age to 21 in the database',
                            'D. Sorts the table by age'
                        ],
                        correctIndex: 1,
                        explanation: 'WHERE acts as a row filter: it evaluates each row and retains only rows where the condition is TRUE.'
                    },
                    {
                        question: 'How many rows will this query return on our students table?\nSELECT * FROM students WHERE id = 3;',
                        options: [
                            'A. 5 rows (all students)',
                            'B. 3 rows',
                            'C. Exactly 1 row (Ayesha)',
                            'D. 0 rows'
                        ],
                        correctIndex: 2,
                        explanation: 'Since id is a unique identifier, id = 3 matches exactly one record (Ayesha).'
                    }
                ]
            },
            masteryPoints: [
                'Understand that WHERE filters rows while SELECT picks columns',
                'Use = for exact equality matching on numeric values',
                'Remember that numeric values do not require quotes in SQL'
            ],
            tasks: [
                {
                    id: 'day02-c1a-t1',
                    title: 'Task 1: Students aged exactly 22',
                    description: 'Show the name and age of students whose age is exactly 22.',
                    instructions: [
                        'Write a query to select `name` and `age` from the `students` table.',
                        'Filter rows where `age = 22`.',
                        'End your query with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'students',
                    initialSql: '-- Write your SQL query here\n',
                    solutionSql: 'SELECT name, age FROM students WHERE age = 22;',
                    solutionExplanation: '`WHERE age = 22` isolates Karim (the only student who is 22).',
                    hints: [
                        {
                            level: 1,
                            text: 'Add `22` after `age =` in the WHERE clause.'
                        },
                        {
                            level: 2,
                            text: 'Write `SELECT name, age FROM students WHERE age = 22;` and click Submit.'
                        }
                    ],
                    validation: {
                        targetTable: 'students',
                        requiredColumns: [
                            'name',
                            'age'
                        ],
                        forbiddenColumns: [
                            'id',
                            'department',
                            'city'
                        ],
                        requireWhere: true,
                        whereContainsTerms: [
                            'age',
                            '=',
                            '22'
                        ],
                        expectedRowCount: 1
                    },
                    successMessage: 'Great job! You filtered rows by exact numeric equality.'
                },
                {
                    id: 'day02-c1a-t2',
                    title: 'Task 2: Lookup Product by ID',
                    description: 'Lookup product details for product_id 4 from the products table.',
                    instructions: [
                        'Query the `products` table.',
                        'Select `product_id`, `name`, and `price`.',
                        'Filter where `product_id = 4`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'independent',
                    primaryTable: 'products',
                    initialSql: '-- Lookup product #4\n',
                    solutionSql: 'SELECT product_id, name, price FROM products WHERE product_id = 4;',
                    solutionExplanation: '`SELECT product_id, name, price FROM products WHERE product_id = 4;` retrieves the Mechanical Keyboard record.',
                    hints: [
                        {
                            level: 1,
                            text: 'Start with `SELECT product_id, name, price FROM products WHERE product_id = 4;`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requiredColumns: [
                            'product_id',
                            'name',
                            'price'
                        ],
                        requireWhere: true,
                        whereContainsTerms: [
                            'product_id',
                            '=',
                            '4'
                        ],
                        expectedRowCount: 1
                    },
                    successMessage: 'Well done! You performed an exact numeric lookup on the products table.'
                }
            ]
        },
        // =========================================================================
        // CONCEPT 1b: Inequality Filtering (!= / <>)
        // =========================================================================
        {
            id: 'where-inequality',
            order: 2,
            title: '2. Excluding Values with Inequality (!= / <>)',
            shortDescription: 'How to filter rows that do NOT match a specific value.',
            theory: {
                summary: 'What if we want every student EXCEPT those in a specific department?',
                introTable: {
                    tableName: 'students',
                    description: 'Original students table in database',
                    columns: [
                        'id',
                        'name',
                        'age',
                        'department',
                        'city'
                    ],
                    rows: [
                        [
                            1,
                            'Rahim',
                            21,
                            'CSE',
                            'Dhaka'
                        ],
                        [
                            2,
                            'Karim',
                            22,
                            'EEE',
                            'Gazipur'
                        ],
                        [
                            3,
                            'Ayesha',
                            20,
                            'CSE',
                            'Dhaka'
                        ],
                        [
                            4,
                            'Sumaiya',
                            23,
                            'BBA',
                            'Chattogram'
                        ],
                        [
                            5,
                            'Tanvir',
                            21,
                            'CSE',
                            'Rajshahi'
                        ]
                    ]
                },
                explanation: [
                    'The inequality operators **`!=`** and **`<>`** construct the exact opposite condition of equality.',
                    'They keep every row where the column value does **NOT** equal the specified value.',
                    '### 1. SQL Dialect Note: != vs <>\n• `<>` is the official **SQL-standard** inequality operator.\n• `!=` is supported by virtually all modern relational databases (PostgreSQL, MySQL, SQLite).\nBoth operators perform the exact same filtering.'
                ],
                targetQuery: {
                    sql: "SELECT name, department\nFROM students\nWHERE department != 'EEE';",
                    explanation: "From students, find all students whose department is NOT 'EEE' and show their name and department.",
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: FROM students (Load candidate rows)',
                        sqlSnippet: 'FROM students',
                        explanation: 'SQL scans the students table with all 5 records.',
                        tableData: {
                            tableName: 'students (Source Table)',
                            columns: [
                                'id',
                                'name',
                                'department'
                            ],
                            rows: [
                                [
                                    1,
                                    'Rahim',
                                    'CSE'
                                ],
                                [
                                    2,
                                    'Karim',
                                    'EEE'
                                ],
                                [
                                    3,
                                    'Ayesha',
                                    'CSE'
                                ],
                                [
                                    4,
                                    'Sumaiya',
                                    'BBA'
                                ],
                                [
                                    5,
                                    'Tanvir',
                                    'CSE'
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: "Step 2: WHERE department != 'EEE' (Exclude EEE)",
                        sqlSnippet: "WHERE department != 'EEE'",
                        explanation: "Rahim ('CSE' != 'EEE'): TRUE ✅\nKarim ('EEE' != 'EEE'): FALSE ❌\nAyesha ('CSE' != 'EEE'): TRUE ✅\nSumaiya ('BBA' != 'EEE'): TRUE ✅\nTanvir ('CSE' != 'EEE'): TRUE ✅",
                        tableData: {
                            tableName: 'Surviving Rows (department != EEE)',
                            columns: [
                                'id',
                                'name',
                                'department'
                            ],
                            highlightedRows: [
                                0,
                                1,
                                2,
                                3
                            ],
                            rows: [
                                [
                                    1,
                                    'Rahim',
                                    'CSE'
                                ],
                                [
                                    3,
                                    'Ayesha',
                                    'CSE'
                                ],
                                [
                                    4,
                                    'Sumaiya',
                                    'BBA'
                                ],
                                [
                                    5,
                                    'Tanvir',
                                    'CSE'
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 3,
                        stepTitle: 'Step 3: SELECT name, department (Final result)',
                        sqlSnippet: 'SELECT name, department',
                        explanation: 'Returns the name and department of all 4 non-EEE students.',
                        tableData: {
                            tableName: 'Final Query Result',
                            columns: [
                                'name',
                                'department'
                            ],
                            highlightedColumns: [
                                'name',
                                'department'
                            ],
                            rows: [
                                [
                                    'Rahim',
                                    'CSE'
                                ],
                                [
                                    'Ayesha',
                                    'CSE'
                                ],
                                [
                                    'Sumaiya',
                                    'BBA'
                                ],
                                [
                                    'Tanvir',
                                    'CSE'
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'Inequality filtering syntax',
                        sql: "SELECT name, department\nFROM students\nWHERE department != 'EEE';",
                        description: "Returns all students whose department is NOT 'EEE'."
                    }
                ],
                keyTakeaway: 'Use != or <> to exclude specific values from your result set.',
                exampleQuery: "SELECT name, department FROM students WHERE department != 'EEE';",
                exampleQueryExplanation: 'Returns Rahim, Ayesha, Sumaiya, and Tanvir, excluding Karim.',
                liveDemoSql: "SELECT name, department FROM students WHERE department != 'EEE';",
                liveDemoNotes: 'Excludes the EEE department record.',
                mcqs: [
                    {
                        question: "The students table has 5 rows: 3 in 'CSE', 1 in 'EEE', and 1 in 'BBA'. How many rows does `WHERE department != 'EEE'` return?",
                        options: [
                            'A. 1 row',
                            'B. 4 rows',
                            'C. 5 rows',
                            'D. 0 rows'
                        ],
                        correctIndex: 1,
                        explanation: 'It excludes only the 1 student in EEE, leaving the 3 CSE and 1 BBA students (4 total).'
                    }
                ]
            },
            masteryPoints: [
                'Use != or <> to exclude values',
                'Recognize <> as the SQL-standard form of !='
            ],
            tasks: [
                {
                    id: 'day02-c1b-t1',
                    title: 'Task 1: Exclude EEE department students',
                    description: 'Show name and department of all students who are NOT in the EEE department.',
                    instructions: [
                        'Select `name` and `department` from `students`.',
                        "Filter for rows where `department != 'EEE'` (or `department <> 'EEE'`).",
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'students',
                    initialSql: '-- Exclude EEE department\n',
                    solutionSql: "SELECT name, department FROM students WHERE department != 'EEE';",
                    solutionExplanation: '`WHERE department != \'EEE\'` retains the 4 students who are not in EEE.',
                    hints: [
                        {
                            level: 1,
                            text: "Write `WHERE department != 'EEE';`"
                        }
                    ],
                    validation: {
                        targetTable: 'students',
                        requiredColumns: [
                            'name',
                            'department'
                        ],
                        requireWhere: true,
                        whereContainsTerms: [
                            'department',
                            'EEE'
                        ],
                        expectedRowCount: 4
                    },
                    successMessage: 'Great job! You excluded specific rows using inequality.'
                },
                {
                    id: 'day02-c1b-t2',
                    title: 'Task 2: Products other than Product #1',
                    description: 'Select name and price of all products except product_id 1.',
                    instructions: [
                        'Query the `products` table.',
                        'Select `name` and `price`.',
                        'Filter where `product_id != 1`.'
                    ],
                    type: 'independent',
                    primaryTable: 'products',
                    initialSql: '-- Show all products except product 1\n',
                    solutionSql: 'SELECT name, price FROM products WHERE product_id != 1;',
                    solutionExplanation: '`WHERE product_id != 1` retrieves all 27 catalog items except product #1.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `SELECT name, price FROM products WHERE product_id != 1;`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requiredColumns: [
                            'name',
                            'price'
                        ],
                        requireWhere: true,
                        whereContainsTerms: [
                            'product_id',
                            '1'
                        ],
                        expectedRowCount: 27
                    },
                    successMessage: 'Excellent! You filtered out a specific item by ID.'
                }
            ]
        },
        // =========================================================================
        // CONCEPT 2a: Strict Comparisons (> and <)
        // =========================================================================
        {
            id: 'where-strict-comparisons',
            order: 3,
            title: '3. Strict Range Comparisons (> and <)',
            shortDescription: 'Filter numeric columns strictly above or below a threshold.',
            theory: {
                summary: 'Now let\'s explore filtering data with strict comparison thresholds:',
                introTable: {
                    tableName: 'products',
                    description: 'Sample inventory items',
                    columns: [
                        'product_id',
                        'name',
                        'price',
                        'quantity_in_stock'
                    ],
                    rows: [
                        [
                            1,
                            'Wireless Mouse',
                            15.99,
                            40
                        ],
                        [
                            2,
                            'Bluetooth Speaker',
                            45.50,
                            3
                        ],
                        [
                            3,
                            'USB-C Charging Cable',
                            9.99,
                            0
                        ],
                        [
                            4,
                            'Mechanical Keyboard',
                            65.00,
                            12
                        ],
                        [
                            14,
                            'Office Chair',
                            120.00,
                            5
                        ]
                    ]
                },
                explanation: [
                    'In many queries, we want threshold filters: premium items costing more than $50, or budget items under $20.',
                    '### 1. Strict Inequalities: > and <\n• `>` means **strictly greater than**.\n• `<` means **strictly less than**.',
                    '### 2. The Boundary Rule (Strict)\n**Strict comparisons exclude the exact boundary number.**',
                    'For example, in `WHERE price > 50.00`:\n• An item priced at $50.01 is **included**.\n• An item priced at exactly $50.00 is **EXCLUDED**.'
                ],
                targetQuery: {
                    sql: 'SELECT name, price\nFROM products\nWHERE price > 50.00;',
                    explanation: 'Find all products costing strictly more than $50.00 (excluding exactly $50.00).',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: FROM products (Scan rows)',
                        sqlSnippet: 'FROM products',
                        explanation: 'SQL visits the products table.',
                        tableData: {
                            tableName: 'products (Sample Items)',
                            columns: [
                                'product_id',
                                'name',
                                'price'
                            ],
                            rows: [
                                [
                                    1,
                                    'Wireless Mouse',
                                    15.99
                                ],
                                [
                                    2,
                                    'Bluetooth Speaker',
                                    45.50
                                ],
                                [
                                    4,
                                    'Mechanical Keyboard',
                                    65.00
                                ],
                                [
                                    14,
                                    'Office Chair',
                                    120.00
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: 'Step 2: WHERE price > 50.00 (Strict Boundary Check)',
                        sqlSnippet: 'WHERE price > 50.00',
                        explanation: 'Wireless Mouse ($15.99 > 50.00): FALSE ❌\nBluetooth Speaker ($45.50 > 50.00): FALSE ❌\nMechanical Keyboard ($65.00 > 50.00): TRUE ✅\nOffice Chair ($120.00 > 50.00): TRUE ✅',
                        tableData: {
                            tableName: 'Surviving Rows (price > 50.00)',
                            columns: [
                                'product_id',
                                'name',
                                'price'
                            ],
                            highlightedRows: [
                                0,
                                1
                            ],
                            rows: [
                                [
                                    4,
                                    'Mechanical Keyboard',
                                    65.00
                                ],
                                [
                                    14,
                                    'Office Chair',
                                    120.00
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 3,
                        stepTitle: 'Step 3: SELECT name, price (Final result)',
                        sqlSnippet: 'SELECT name, price',
                        explanation: 'Extracts the name and price of items passing the threshold.',
                        tableData: {
                            tableName: 'Final Query Result',
                            columns: [
                                'name',
                                'price'
                            ],
                            highlightedColumns: [
                                'name',
                                'price'
                            ],
                            rows: [
                                [
                                    'Mechanical Keyboard',
                                    65.00
                                ],
                                [
                                    'Office Chair',
                                    120.00
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'Strict greater-than syntax',
                        sql: 'SELECT name, price\nFROM products\nWHERE price > 50.00;',
                        description: 'Returns products costing strictly more than $50.00.'
                    }
                ],
                keyTakeaway: 'Strict operators (> and <) exclude the exact threshold value.',
                exampleQuery: 'SELECT name, price FROM products WHERE price > 50.00;',
                exampleQueryExplanation: 'Finds all products costing strictly more than $50.00.',
                liveDemoSql: 'SELECT name, price FROM products WHERE price > 50.00;',
                liveDemoNotes: 'Returns items like Mechanical Keyboard ($65) and Office Chair ($120).',
                mcqs: [
                    {
                        question: 'Does an item with `price = 50.00` survive the filter `WHERE price > 50.00`?',
                        options: [
                            'A. Yes, because 50 is on the boundary',
                            'B. No, because > is strict and excludes the boundary value',
                            'C. Only if the item is in stock',
                            'D. Yes, SQL automatically rounds numbers up'
                        ],
                        correctIndex: 1,
                        explanation: '> is a strict inequality. 50.00 is not greater than 50.00, so it evaluates to FALSE.'
                    }
                ]
            },
            masteryPoints: [
                'Use > for strictly greater than',
                'Use < for strictly less than',
                'Remember that strict comparisons exclude the boundary value'
            ],
            tasks: [
                {
                    id: 'day02-c2a-t1',
                    title: 'Task 1: Products priced strictly over $50',
                    description: 'Show name and price of products costing strictly more than $50.00.',
                    instructions: [
                        'Select `name` and `price` from `products`.',
                        'Filter rows where `price > 50.00`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'products',
                    initialSql: '-- Products strictly over $50\n',
                    solutionSql: 'SELECT name, price FROM products WHERE price > 50.00;',
                    solutionExplanation: '`WHERE price > 50.00` selects all items costing strictly more than $50 (5 items).',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `SELECT name, price FROM products WHERE price > 50.00;`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requiredColumns: [
                            'name',
                            'price'
                        ],
                        requireWhere: true,
                        whereContainsTerms: [
                            'price',
                            '>',
                            '50'
                        ],
                        expectedRowCount: 5
                    },
                    successMessage: 'Great job! You applied a strict greater-than threshold.'
                },
                {
                    id: 'day02-c2a-t2',
                    title: 'Task 2: Students strictly under 22 years old',
                    description: 'Show name and age of students who are strictly younger than 22.',
                    instructions: [
                        'Query the `students` table.',
                        'Select `name` and `age`.',
                        'Filter where `age < 22`.'
                    ],
                    type: 'independent',
                    primaryTable: 'students',
                    initialSql: '-- Students under 22\n',
                    solutionSql: 'SELECT name, age FROM students WHERE age < 22;',
                    solutionExplanation: '`WHERE age < 22` returns Rahim (21), Ayesha (20), and Tanvir (21).',
                    hints: [
                        {
                            level: 1,
                            text: 'Write `SELECT name, age FROM students WHERE age < 22;`'
                        }
                    ],
                    validation: {
                        targetTable: 'students',
                        requiredColumns: [
                            'name',
                            'age'
                        ],
                        requireWhere: true,
                        whereContainsTerms: [
                            'age',
                            '<',
                            '22'
                        ],
                        expectedRowCount: 3
                    },
                    successMessage: 'Perfect! You applied a strict less-than comparison.'
                }
            ]
        },
        // =========================================================================
        // CONCEPT 2b: Inclusive Comparisons (>= and <=)
        // =========================================================================
        {
            id: 'where-inclusive-comparisons',
            order: 4,
            title: '4. Inclusive Range Comparisons (>= and <=)',
            shortDescription: 'Filter numeric columns with inclusive boundary thresholds.',
            theory: {
                summary: 'Now let\'s explore inclusive threshold comparisons:',
                introTable: {
                    tableName: 'products',
                    description: 'Sample products snapshot',
                    columns: [
                        'product_id',
                        'name',
                        'price',
                        'quantity_in_stock'
                    ],
                    rows: [
                        [
                            4,
                            'Mechanical Keyboard',
                            65.00,
                            12
                        ],
                        [
                            6,
                            'Stainless Steel Pan Set',
                            55.00,
                            15
                        ],
                        [
                            14,
                            'Office Chair',
                            120.00,
                            5
                        ],
                        [
                            20,
                            'Tennis Racket',
                            55.00,
                            9
                        ]
                    ]
                },
                explanation: [
                    'When business requirements state **"$55.00 or more"** or **"at most 15 units"**, we need inclusive operators:',
                    '• `>=` means **greater than or equal to**.\n• `<=` means **less than or equal to**.',
                    '### The Boundary Rule (Inclusive)\n**Inclusive comparisons explicitly INCLUDE the boundary number.**',
                    'For example, in `WHERE price >= 55.00`:\n• Items priced at $65.00 and $120.00 are included.\n• Items priced at **exactly $55.00** (like the Pan Set and Tennis Racket) are **INCLUDED**.'
                ],
                targetQuery: {
                    sql: 'SELECT name, price\nFROM products\nWHERE price >= 55.00;',
                    explanation: 'Find all products priced at $55.00 or higher (including products that cost exactly $55.00).',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: FROM products (Scan rows)',
                        sqlSnippet: 'FROM products',
                        explanation: 'SQL scans the products table.',
                        tableData: {
                            tableName: 'products (Candidate Rows)',
                            columns: [
                                'product_id',
                                'name',
                                'price'
                            ],
                            rows: [
                                [
                                    4,
                                    'Mechanical Keyboard',
                                    65.00
                                ],
                                [
                                    6,
                                    'Stainless Steel Pan Set',
                                    55.00
                                ],
                                [
                                    20,
                                    'Tennis Racket',
                                    55.00
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: 'Step 2: WHERE price >= 55.00 (Inclusive Boundary Check)',
                        sqlSnippet: 'WHERE price >= 55.00',
                        explanation: 'Mechanical Keyboard ($65.00 >= 55.00): TRUE ✅\nStainless Steel Pan Set ($55.00 >= 55.00): TRUE ✅ (Boundary included)\nTennis Racket ($55.00 >= 55.00): TRUE ✅ (Boundary included)',
                        tableData: {
                            tableName: 'Surviving Rows (price >= 55.00)',
                            columns: [
                                'product_id',
                                'name',
                                'price'
                            ],
                            highlightedRows: [
                                0,
                                1,
                                2
                            ],
                            rows: [
                                [
                                    4,
                                    'Mechanical Keyboard',
                                    65.00
                                ],
                                [
                                    6,
                                    'Stainless Steel Pan Set',
                                    55.00
                                ],
                                [
                                    20,
                                    'Tennis Racket',
                                    55.00
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 3,
                        stepTitle: 'Step 3: SELECT name, price (Final result)',
                        sqlSnippet: 'SELECT name, price',
                        explanation: 'Returns name and price for all items qualifying under the inclusive threshold.',
                        tableData: {
                            tableName: 'Final Query Result',
                            columns: [
                                'name',
                                'price'
                            ],
                            highlightedColumns: [
                                'name',
                                'price'
                            ],
                            rows: [
                                [
                                    'Mechanical Keyboard',
                                    65.00
                                ],
                                [
                                    'Stainless Steel Pan Set',
                                    55.00
                                ],
                                [
                                    'Tennis Racket',
                                    55.00
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'Inclusive greater-than-or-equal syntax',
                        sql: 'SELECT name, price\nFROM products\nWHERE price >= 55.00;',
                        description: 'Returns products with a price of $55.00 or higher.'
                    },
                    {
                        title: 'Inclusive less-than-or-equal syntax',
                        sql: 'SELECT name, quantity_in_stock\nFROM products\nWHERE quantity_in_stock <= 15;',
                        description: 'Returns products with 15 or fewer units in stock.'
                    }
                ],
                keyTakeaway: 'Use >= and <= when the threshold value itself must be included in the result.',
                exampleQuery: 'SELECT name, price FROM products WHERE price >= 55.00;',
                exampleQueryExplanation: 'Finds products priced at $55.00 or higher (including $55.00 items).',
                liveDemoSql: 'SELECT name, price FROM products WHERE price >= 55.00;',
                liveDemoNotes: 'Includes products priced at exactly $55.00.',
                mcqs: [
                    {
                        question: 'Which query finds all products with 15 or fewer units in stock?',
                        options: [
                            'A. SELECT * FROM products WHERE quantity_in_stock < 15;',
                            'B. SELECT * FROM products WHERE quantity_in_stock <= 15;',
                            'C. SELECT * FROM products WHERE quantity_in_stock = 15;',
                            'D. SELECT * FROM products WHERE quantity_in_stock >= 15;'
                        ],
                        correctIndex: 1,
                        explanation: '"15 or fewer" means less than or equal to 15, which uses the <= operator.'
                    }
                ]
            },
            masteryPoints: [
                'Use >= for greater than or equal to',
                'Use <= for less than or equal to',
                'Verify that boundary values are included in the output'
            ],
            tasks: [
                {
                    id: 'day02-c2b-t1',
                    title: 'Task 1: Items priced at $50.00 or more (>=)',
                    description: 'Show name and price for products priced at $50.00 or higher.',
                    instructions: [
                        'Select `name` and `price` from `products`.',
                        'Filter with `WHERE price >= 50.00`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'products',
                    initialSql: '-- Products priced $50 or more (>=)\n',
                    solutionSql: 'SELECT name, price FROM products WHERE price >= 50.00;',
                    solutionExplanation: '`WHERE price >= 50.00` selects all items costing $50.00 or higher (5 items).',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `WHERE price >= 50.00;`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requiredColumns: [
                            'name',
                            'price'
                        ],
                        requireWhere: true,
                        whereContainsTerms: [
                            'price',
                            '>=',
                            '50'
                        ],
                        expectedRowCount: 5
                    },
                    successMessage: 'Great job! You tested an inclusive greater-than-or-equal condition.'
                },
                {
                    id: 'day02-c2b-t2',
                    title: 'Task 2: Students aged 21 or younger (<=)',
                    description: 'Show name and age of students who are 21 years old or younger.',
                    instructions: [
                        'Query the `students` table.',
                        'Select `name` and `age`.',
                        'Filter where `age <= 21`.'
                    ],
                    type: 'independent',
                    primaryTable: 'students',
                    initialSql: '-- Students aged 21 or younger (<=)\n',
                    solutionSql: 'SELECT name, age FROM students WHERE age <= 21;',
                    solutionExplanation: '`WHERE age <= 21` returns Rahim (21), Ayesha (20), and Tanvir (21).',
                    hints: [
                        {
                            level: 1,
                            text: 'Write `SELECT name, age FROM students WHERE age <= 21;`'
                        }
                    ],
                    validation: {
                        targetTable: 'students',
                        requiredColumns: [
                            'name',
                            'age'
                        ],
                        requireWhere: true,
                        whereContainsTerms: [
                            'age',
                            '<=',
                            '21'
                        ],
                        expectedRowCount: 3
                    },
                    successMessage: 'Well done! You tested an inclusive less-than-or-equal condition.'
                },
                {
                    id: 'day02-c2b-t3',
                    title: 'Task 3: Boundary Confirmation (Stock <= 15)',
                    description: 'Find all products with quantity_in_stock of 15 or fewer. Confirm that products with exactly 15 units appear in the result.',
                    instructions: [
                        'Query the `products` table.',
                        'Select `name`, `price`, and `quantity_in_stock`.',
                        'Filter where `quantity_in_stock <= 15`.'
                    ],
                    type: 'independent',
                    primaryTable: 'products',
                    initialSql: '-- Low stock items (15 or fewer)\n',
                    solutionSql: 'SELECT name, price, quantity_in_stock FROM products WHERE quantity_in_stock <= 15;',
                    solutionExplanation: '`WHERE quantity_in_stock <= 15` includes items with exactly 15 units in stock (such as Stainless Steel Pan Set and Mechanical Keyboard).',
                    hints: [
                        {
                            level: 1,
                            text: 'Write `SELECT name, price, quantity_in_stock FROM products WHERE quantity_in_stock <= 15;`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requiredColumns: [
                            'name',
                            'price',
                            'quantity_in_stock'
                        ],
                        requireWhere: true,
                        whereContainsTerms: [
                            'quantity_in_stock',
                            '<=',
                            '15'
                        ],
                        expectedRowCount: 16
                    },
                    successMessage: 'Spot on! You verified that boundary values are included by <=.'
                }
            ]
        },
        // =========================================================================
        // CONCEPT 3: Filtering Text and Strings with Single Quotes
        // =========================================================================
        {
            id: 'where-text-strings',
            order: 5,
            title: '5. Filtering Text with Single Quotes',
            shortDescription: 'How to filter rows by string and text values safely.',
            theory: {
                summary: 'Now let\'s look at filtering text columns like city or department:',
                introTable: {
                    tableName: 'students',
                    description: 'Full table in database (5 students across Dhaka, Gazipur, Chattogram, Rajshahi)',
                    columns: [
                        'id',
                        'name',
                        'age',
                        'department',
                        'city'
                    ],
                    rows: [
                        [
                            1,
                            'Rahim',
                            21,
                            'CSE',
                            'Dhaka'
                        ],
                        [
                            2,
                            'Karim',
                            22,
                            'EEE',
                            'Gazipur'
                        ],
                        [
                            3,
                            'Ayesha',
                            20,
                            'CSE',
                            'Dhaka'
                        ],
                        [
                            4,
                            'Sumaiya',
                            23,
                            'BBA',
                            'Chattogram'
                        ],
                        [
                            5,
                            'Tanvir',
                            21,
                            'CSE',
                            'Rajshahi'
                        ]
                    ]
                },
                explanation: [
                    'In SQL, numbers are written directly, but **text values (strings) MUST ALWAYS be enclosed in single quotes (\'...\')**.',
                    '### 1. Column Names vs. String Literals\nIf you write `WHERE city = Dhaka` without quotes, SQL assumes `Dhaka` is the name of another **column**!\n\nBecause no column named `Dhaka` exists in `students`, SQL stops with an error (`Unknown column \'Dhaka\'`).',
                    '| Identifier Type | Quoting Rule | Example | Status |\n|---|---|---|---|\n| Column Name | **Never quoted** | `name`, `city`, `age` | ✅ Valid column reference |\n| String Value | **Always single quotes** | `\'Dhaka\'`, `\'CSE\'`, `\'Electronics\'` | ✅ Valid text literal |\n| Number Value | **Never quoted** | `21`, `50.00`, `100` | ✅ Valid numeric literal |',
                    '### Notice: The Golden Rule for Text\nAlways use **single quotes** (`\'...\'`) for text literals in SQL.'
                ],
                targetQuery: {
                    sql: "SELECT name, city\nFROM students\nWHERE city = 'Dhaka';",
                    explanation: "Find all students who live in Dhaka and show their name and city.",
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: FROM students (Find all students)',
                        sqlSnippet: 'FROM students',
                        explanation: 'SQL loads the entire students table.',
                        tableData: {
                            tableName: 'students (Source Table)',
                            columns: [
                                'id',
                                'name',
                                'age',
                                'department',
                                'city'
                            ],
                            rows: [
                                [
                                    1,
                                    'Rahim',
                                    21,
                                    'CSE',
                                    'Dhaka'
                                ],
                                [
                                    2,
                                    'Karim',
                                    22,
                                    'EEE',
                                    'Gazipur'
                                ],
                                [
                                    3,
                                    'Ayesha',
                                    20,
                                    'CSE',
                                    'Dhaka'
                                ],
                                [
                                    4,
                                    'Sumaiya',
                                    23,
                                    'BBA',
                                    'Chattogram'
                                ],
                                [
                                    5,
                                    'Tanvir',
                                    21,
                                    'CSE',
                                    'Rajshahi'
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: "Step 2: WHERE city = 'Dhaka' (Check text matches)",
                        sqlSnippet: "WHERE city = 'Dhaka'",
                        explanation: "Rahim ('Dhaka' = 'Dhaka'): TRUE ✅\nKarim ('Gazipur' = 'Dhaka'): FALSE ❌\nAyesha ('Dhaka' = 'Dhaka'): TRUE ✅\nSumaiya ('Chattogram' = 'Dhaka'): FALSE ❌\nTanvir ('Rajshahi' = 'Dhaka'): FALSE ❌",
                        tableData: {
                            tableName: 'Surviving Rows (city = Dhaka)',
                            columns: [
                                'id',
                                'name',
                                'age',
                                'department',
                                'city'
                            ],
                            highlightedRows: [
                                0,
                                1
                            ],
                            rows: [
                                [
                                    1,
                                    'Rahim',
                                    21,
                                    'CSE',
                                    'Dhaka'
                                ],
                                [
                                    3,
                                    'Ayesha',
                                    20,
                                    'CSE',
                                    'Dhaka'
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 3,
                        stepTitle: 'Step 3: SELECT name, city (Final result)',
                        sqlSnippet: 'SELECT name, city',
                        explanation: 'Extracts only the name and city columns for Dhaka students:',
                        tableData: {
                            tableName: 'Final Query Result',
                            columns: [
                                'name',
                                'city'
                            ],
                            highlightedColumns: [
                                'name',
                                'city'
                            ],
                            rows: [
                                [
                                    'Rahim',
                                    'Dhaka'
                                ],
                                [
                                    'Ayesha',
                                    'Dhaka'
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'Exact string matching',
                        sql: "SELECT name, city\nFROM students\nWHERE city = 'Dhaka';",
                        description: "Matches rows where the city column exactly equals 'Dhaka'."
                    }
                ],
                keyTakeaway: "Always enclose string literals in single quotes ('...'). Never quote column names.",
                exampleQuery: "SELECT name, city FROM students WHERE city = 'Dhaka';",
                exampleQueryExplanation: "Retrieves only students who live in Dhaka.",
                liveDemoSql: "SELECT name, department, city FROM students WHERE city = 'Dhaka';",
                liveDemoNotes: "Returns Rahim and Ayesha, both residing in Dhaka.",
                mcqs: [
                    {
                        question: "Why does `SELECT * FROM students WHERE city = Dhaka;` cause an error?",
                        options: [
                            "A. Because WHERE cannot be used on cities",
                            "B. Because Dhaka lacks single quotes, so SQL looks for a column named Dhaka",
                            "C. Because SELECT * is not allowed with WHERE",
                            "D. Because SQL requires double quotes around table names"
                        ],
                        correctIndex: 1,
                        explanation: "Without single quotes, SQL interprets Dhaka as a column identifier rather than a string literal."
                    }
                ]
            },
            masteryPoints: [
                "Wrap text literals in single quotes ('...')",
                "Distinguish column identifiers from string literals"
            ],
            tasks: [
                {
                    id: 'day02-c3-t1',
                    title: 'Task 1: Dhaka students only',
                    description: 'Show the name and city of students who live in Dhaka.',
                    instructions: [
                        'Select `name` and `city` from `students`.',
                        "Filter for rows where `city = 'Dhaka'`.",
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'students',
                    initialSql: '-- Write your SQL query here\n',
                    solutionSql: "SELECT name, city FROM students WHERE city = 'Dhaka';",
                    solutionExplanation: "`WHERE city = 'Dhaka'` retrieves all students whose city is Dhaka (Rahim and Ayesha).",
                    hints: [
                        {
                            level: 1,
                            text: "Complete the single quote: `WHERE city = 'Dhaka';`"
                        },
                        {
                            level: 2,
                            text: "`SELECT name, city FROM students WHERE city = 'Dhaka';`"
                        }
                    ],
                    validation: {
                        targetTable: 'students',
                        requiredColumns: [
                            'name',
                            'city'
                        ],
                        requireWhere: true,
                        whereContainsTerms: [
                            'city',
                            '=',
                            'Dhaka'
                        ],
                        expectedRowCount: 2
                    },
                    successMessage: 'Great job! You filtered strings using single quotes.'
                },
                {
                    id: 'day02-c3-t2',
                    title: 'Task 2: Find Chittagong customers',
                    description: 'The sales team needs a list of all customers located in Chittagong.',
                    instructions: [
                        'Query the `customers` table.',
                        'Select `name`, `email`, and `city`.',
                        "Filter for customers where `city = 'Chittagong'`."
                    ],
                    type: 'independent',
                    primaryTable: 'customers',
                    initialSql: '-- Find all customers in Chittagong\n',
                    solutionSql: "SELECT name, email, city FROM customers WHERE city = 'Chittagong';",
                    solutionExplanation: "`WHERE city = 'Chittagong'` returns all Chittagong customer records.",
                    hints: [
                        {
                            level: 1,
                            text: "`SELECT name, email, city FROM customers WHERE city = 'Chittagong';`"
                        }
                    ],
                    validation: {
                        targetTable: 'customers',
                        requiredColumns: [
                            'name',
                            'email',
                            'city'
                        ],
                        requireWhere: true,
                        whereContainsTerms: [
                            'city',
                            '=',
                            'Chittagong'
                        ],
                        expectedRowCount: 3
                    },
                    successMessage: 'Spot on! All Chittagong customer records retrieved.'
                }
            ]
        }
    ],
    // ===========================================================================
    // DAY 2 HOMEWORK / INDEPENDENT CHALLENGES
    // ===========================================================================
    challenge: {
        id: 'day-02-homework',
        title: 'Day 2 — Core Filtering (Homework Challenges)',
        scenario: 'In Workbench, with inventory_system selected, practice row filtering queries against our production tables:',
        tasks: [
            {
                id: 'day02-hw-1',
                title: 'Task 1: Products priced strictly under $50',
                description: 'Find all products priced strictly under $50.00.',
                instructions: [
                    'Select `name` and `price` from `products` where `price < 50`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'products',
                initialSql: '-- Task 1: Products priced under $50\n',
                solutionSql: 'SELECT name, price FROM products WHERE price < 50;',
                solutionExplanation: '`WHERE price < 50` selects all products priced strictly under $50.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `SELECT name, price FROM products WHERE price < 50;`'
                    }
                ],
                validation: {
                    targetTable: 'products',
                    requiredColumns: [
                        'name',
                        'price'
                    ],
                    requireWhere: true,
                    whereContainsTerms: [
                        'price',
                        '<',
                        '50'
                    ],
                    expectedRowCount: 23
                },
                successMessage: 'Task 1 completed! Products under $50 retrieved.'
            },
            {
                id: 'day02-hw-2',
                title: 'Task 2: High-stock products (Stock > 20)',
                description: 'Find all products with quantity_in_stock greater than 20.',
                instructions: [
                    'Select `name` and `quantity_in_stock` from `products` where `quantity_in_stock > 20`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'products',
                initialSql: '-- Task 2: Products with quantity_in_stock greater than 20\n',
                solutionSql: 'SELECT name, quantity_in_stock FROM products WHERE quantity_in_stock > 20;',
                solutionExplanation: '`WHERE quantity_in_stock > 20` retrieves well-stocked items.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `SELECT name, quantity_in_stock FROM products WHERE quantity_in_stock > 20;`'
                    }
                ],
                validation: {
                    targetTable: 'products',
                    requiredColumns: [
                        'name',
                        'quantity_in_stock'
                    ],
                    requireWhere: true,
                    whereContainsTerms: [
                        'quantity_in_stock',
                        '>',
                        '20'
                    ],
                    expectedRowCount: 8
                },
                successMessage: 'Task 2 completed! Well-stocked items found.'
            },
            {
                id: 'day02-hw-3',
                title: 'Task 3: Products that are completely out of stock',
                description: 'Find all products that are completely out of stock (`quantity_in_stock = 0`).',
                instructions: [
                    'Select `name`, `price`, and `quantity_in_stock` from `products` where `quantity_in_stock = 0`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'products',
                initialSql: '-- Task 3: Products that are completely out of stock\n',
                solutionSql: 'SELECT name, price, quantity_in_stock FROM products WHERE quantity_in_stock = 0;',
                solutionExplanation: '`WHERE quantity_in_stock = 0` identifies products with zero inventory.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `SELECT name, price, quantity_in_stock FROM products WHERE quantity_in_stock = 0;`'
                    }
                ],
                validation: {
                    targetTable: 'products',
                    requiredColumns: [
                        'name',
                        'price',
                        'quantity_in_stock'
                    ],
                    requireWhere: true,
                    whereContainsTerms: [
                        'quantity_in_stock',
                        '=',
                        '0'
                    ],
                    expectedRowCount: 3
                },
                successMessage: 'Task 3 completed! Out-of-stock items flagged.'
            },
            {
                id: 'day02-hw-4',
                title: 'Task 4: Find all customers in Chittagong',
                description: 'Retrieve name, email, and city of all customers residing in Chittagong.',
                instructions: [
                    'Select `name`, `email`, and `city` from `customers`.',
                    "Filter where `city = 'Chittagong'`.",
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'customers',
                initialSql: '-- Task 4: Customers in Chittagong\n',
                solutionSql: "SELECT name, email, city FROM customers WHERE city = 'Chittagong';",
                solutionExplanation: "`WHERE city = 'Chittagong'` selects all Chittagong customers.",
                hints: [
                    {
                        level: 1,
                        text: "Write `SELECT name, email, city FROM customers WHERE city = 'Chittagong';`"
                    }
                ],
                validation: {
                    targetTable: 'customers',
                    requiredColumns: [
                        'name',
                        'email',
                        'city'
                    ],
                    requireWhere: true,
                    whereContainsTerms: [
                        'city',
                        '=',
                        'Chittagong'
                    ],
                    expectedRowCount: 3
                },
                successMessage: 'Task 4 completed! Chittagong customer records retrieved.'
            },
            {
                id: 'day02-hw-5',
                title: 'Task 5: Premium products ($50 or more)',
                description: 'Find all premium items in the catalog priced at $50.00 or higher.',
                instructions: [
                    'Select `name`, `price`, and `quantity_in_stock` from `products`.',
                    'Filter where `price >= 50.00`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'products',
                initialSql: '-- Task 5: Premium items ($50+)\n',
                solutionSql: 'SELECT name, price, quantity_in_stock FROM products WHERE price >= 50.00;',
                solutionExplanation: '`WHERE price >= 50.00` finds the highest tier catalog items.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `WHERE price >= 50.00;`'
                    }
                ],
                validation: {
                    targetTable: 'products',
                    requiredColumns: [
                        'name',
                        'price',
                        'quantity_in_stock'
                    ],
                    requireWhere: true,
                    whereContainsTerms: [
                        'price',
                        '>=',
                        '50'
                    ],
                    expectedRowCount: 5
                },
                successMessage: 'Task 5 completed! Premium items identified.'
            }
        ]
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/content/modules/day03.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DAY_03_MODULE",
    ()=>DAY_03_MODULE
]);
const DAY_03_MODULE = {
    id: "day-03",
    slug: "specialized-filtering",
    day: 3,
    title: "Day 3 — Specialized Filtering",
    shortTitle: "Specialized Filtering",
    type: "module",
    milestoneId: "milestone-1",
    description: "Master advanced filtering: compound logic (AND, OR, NOT, Parentheses), discrete sets (IN), continuous intervals (BETWEEN), wildcard patterns (LIKE with % and _), and NULL safety (IS NULL / IS NOT NULL).",
    estimatedMinutes: 60,
    completionLearnings: [
        "Narrow down query results using AND intersection logic",
        "Expand candidate results using OR union logic",
        "Invert boolean conditions safely using NOT (condition)",
        "Enforce evaluation order and avoid operator precedence bugs with parentheses",
        "Filter inclusive intervals on numbers and dates using BETWEEN ... AND ...",
        "Replace verbose chained OR equality checks with clean IN (...) lists",
        "Perform partial string searches using LIKE with % (any length) and _ (single character)",
        "Safely detect missing data with IS NULL and IS NOT NULL without = NULL failures"
    ],
    concepts: [
        // =========================================================================
        // CONCEPT 1a: Combining Conditions with AND (Intersection)
        // =========================================================================
        {
            id: "where-and-intersection",
            order: 1,
            title: "1. Combining Conditions with AND (Intersection)",
            shortDescription: "How to require multiple conditions to be TRUE simultaneously.",
            theory: {
                summary: "In real applications, decisions depend on multiple conditions simultaneously. What if we want CSE students who are also 21 years old?",
                introTable: {
                    tableName: "students",
                    description: "Original students table stored in database (5 records)",
                    columns: [
                        "id",
                        "name",
                        "age",
                        "department",
                        "city"
                    ],
                    rows: [
                        [
                            1,
                            "Rahim",
                            21,
                            "CSE",
                            "Dhaka"
                        ],
                        [
                            2,
                            "Karim",
                            22,
                            "EEE",
                            "Gazipur"
                        ],
                        [
                            3,
                            "Ayesha",
                            20,
                            "CSE",
                            "Dhaka"
                        ],
                        [
                            4,
                            "Sumaiya",
                            23,
                            "BBA",
                            "Chattogram"
                        ],
                        [
                            5,
                            "Tanvir",
                            21,
                            "CSE",
                            "Rajshahi"
                        ]
                    ]
                },
                explanation: [
                    "`AND` narrows down your results. A row survives only if **every condition** evaluates to `TRUE`.",
                    "### 1. AND Logic Table\n• `TRUE AND TRUE` ---> **TRUE** ✅\n• `TRUE AND FALSE` ---> **FALSE** ❌\n• `FALSE AND TRUE` ---> **FALSE** ❌\n• `FALSE AND FALSE` ---> **FALSE** ❌",
                    "Let's see how SQL checks each student against both criteria simultaneously."
                ],
                targetQuery: {
                    sql: "SELECT name, age, department\nFROM students\nWHERE department = 'CSE' AND age = 21;",
                    explanation: "Find students who are BOTH in the CSE department AND 21 years old.",
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: "Step 1: FROM students (Find all students)",
                        sqlSnippet: "FROM students",
                        explanation: "SQL visits the students table containing 5 records.",
                        tableData: {
                            tableName: "students (Source Table)",
                            columns: [
                                "id",
                                "name",
                                "age",
                                "department"
                            ],
                            rows: [
                                [
                                    1,
                                    "Rahim",
                                    21,
                                    "CSE"
                                ],
                                [
                                    2,
                                    "Karim",
                                    22,
                                    "EEE"
                                ],
                                [
                                    3,
                                    "Ayesha",
                                    20,
                                    "CSE"
                                ],
                                [
                                    4,
                                    "Sumaiya",
                                    23,
                                    "BBA"
                                ],
                                [
                                    5,
                                    "Tanvir",
                                    21,
                                    "CSE"
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: "Step 2: WHERE department = 'CSE' AND age = 21",
                        sqlSnippet: "WHERE department = 'CSE' AND age = 21",
                        explanation: "1. Rahim: (CSE = TRUE) AND (21 = TRUE) ➔ TRUE ✅\n2. Karim: (EEE = FALSE) ➔ FALSE ❌\n3. Ayesha: (CSE = TRUE) AND (20 = FALSE) ➔ FALSE ❌\n4. Sumaiya: (BBA = FALSE) ➔ FALSE ❌\n5. Tanvir: (CSE = TRUE) AND (21 = TRUE) ➔ TRUE ✅",
                        tableData: {
                            tableName: "Surviving Rows (CSE & 21)",
                            columns: [
                                "name",
                                "age",
                                "department"
                            ],
                            highlightedRows: [
                                0,
                                1
                            ],
                            rows: [
                                [
                                    "Rahim",
                                    21,
                                    "CSE"
                                ],
                                [
                                    "Tanvir",
                                    21,
                                    "CSE"
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: "AND syntax",
                        sql: "SELECT name, age, department\nFROM students\nWHERE department = 'CSE' AND age = 21;",
                        description: "Returns rows where both department equals CSE and age equals 21."
                    }
                ],
                keyTakeaway: "AND requires all specified conditions to evaluate to TRUE.",
                exampleQuery: "SELECT name, age, department FROM students WHERE department = 'CSE' AND age = 21;",
                exampleQueryExplanation: "Returns students who are both in CSE and aged 21.",
                liveDemoSql: "SELECT name, age, department FROM students WHERE department = 'CSE' AND age = 21;",
                liveDemoNotes: "Returns Rahim and Tanvir.",
                mcqs: [
                    {
                        question: "A table has 4 students: 2 in CSE, 3 aged >= 21, and only 1 student who is BOTH in CSE and aged >= 21. How many rows does `WHERE department = 'CSE' AND age >= 21` return?",
                        options: [
                            "A. 1 row",
                            "B. 2 rows",
                            "C. 3 rows",
                            "D. 4 rows"
                        ],
                        correctIndex: 0,
                        explanation: "AND requires both conditions to be TRUE simultaneously, matching only the 1 student who meets both criteria."
                    }
                ]
            },
            masteryPoints: [
                "Use AND when all criteria must be TRUE",
                "Understand that adding AND conditions narrows down the result set"
            ],
            tasks: [
                {
                    id: "day03-c1a-t1",
                    title: "Task 1: CSE Students Aged 21",
                    description: "Show name, age, and department for students in CSE who are exactly 21 years old.",
                    instructions: [
                        "Select `name`, `age`, and `department` from `students`.",
                        "Filter where `department = 'CSE' AND age = 21`.",
                        "End with a semicolon (;)."
                    ],
                    type: "guided",
                    primaryTable: "students",
                    initialSql: "-- Write your SQL query here\n",
                    solutionSql: "SELECT name, age, department FROM students WHERE department = 'CSE' AND age = 21;",
                    solutionExplanation: "Returns Rahim and Tanvir (both in CSE and 21 years old).",
                    hints: [
                        {
                            level: 1,
                            text: "Add `21` after `age =`."
                        },
                        {
                            level: 2,
                            text: "`SELECT name, age, department FROM students WHERE department = 'CSE' AND age = 21;`"
                        }
                    ],
                    validation: {
                        targetTable: "students",
                        requiredColumns: [
                            "name",
                            "age",
                            "department"
                        ],
                        requireWhere: true,
                        whereContainsTerms: [
                            "department",
                            "CSE",
                            "AND",
                            "age",
                            "21"
                        ],
                        expectedRowCount: 2
                    },
                    successMessage: "Great job! You combined conditions using AND."
                },
                {
                    id: "day03-c1a-t2",
                    title: "Task 2: High-Price & High-Stock Items",
                    description: "Find products priced over $50.00 with quantity_in_stock greater than 10.",
                    instructions: [
                        "Query the `products` table.",
                        "Select `name`, `price`, and `quantity_in_stock`.",
                        "Filter where `price > 50 AND quantity_in_stock > 10`."
                    ],
                    type: "independent",
                    primaryTable: "products",
                    initialSql: "-- High price and high stock items\n",
                    solutionSql: "SELECT name, price, quantity_in_stock FROM products WHERE price > 50 AND quantity_in_stock > 10;",
                    solutionExplanation: "Extracts Mechanical Keyboard ($65.00, stock 12) and Stainless Steel Pan Set ($55.00, stock 15).",
                    hints: [
                        {
                            level: 1,
                            text: "Use `WHERE price > 50 AND quantity_in_stock > 10;`"
                        }
                    ],
                    validation: {
                        targetTable: "products",
                        requiredColumns: [
                            "name",
                            "price",
                            "quantity_in_stock"
                        ],
                        requireWhere: true,
                        whereContainsTerms: [
                            "price",
                            ">",
                            "50",
                            "AND",
                            "quantity_in_stock",
                            ">",
                            "10"
                        ],
                        expectedRowCount: 2
                    },
                    successMessage: "Perfect! You applied multi-attribute filtering on the catalog."
                }
            ]
        },
        // =========================================================================
        // CONCEPT 1b: Combining Conditions with OR (Union)
        // =========================================================================
        {
            id: "where-or-union",
            order: 2,
            title: "2. Combining Conditions with OR (Union)",
            shortDescription: "How to retrieve rows where at least one condition is TRUE.",
            theory: {
                summary: "What if we want students from Dhaka OR Gazipur? Either location is acceptable.",
                introTable: {
                    tableName: "students",
                    description: "Students snapshot across cities",
                    columns: [
                        "id",
                        "name",
                        "age",
                        "department",
                        "city"
                    ],
                    rows: [
                        [
                            1,
                            "Rahim",
                            21,
                            "CSE",
                            "Dhaka"
                        ],
                        [
                            2,
                            "Karim",
                            22,
                            "EEE",
                            "Gazipur"
                        ],
                        [
                            3,
                            "Ayesha",
                            20,
                            "CSE",
                            "Dhaka"
                        ],
                        [
                            4,
                            "Sumaiya",
                            23,
                            "BBA",
                            "Chattogram"
                        ],
                        [
                            5,
                            "Tanvir",
                            21,
                            "CSE",
                            "Rajshahi"
                        ]
                    ]
                },
                explanation: [
                    "`OR` broadens your results. A row survives if **at least one** condition passes (either condition 1, condition 2, or both).",
                    "### 1. OR Logic Table\n• `TRUE OR TRUE` ---> **TRUE** ✅\n• `TRUE OR FALSE` ---> **TRUE** ✅\n• `FALSE OR TRUE` ---> **TRUE** ✅\n• `FALSE OR FALSE` ---> **FALSE** ❌"
                ],
                targetQuery: {
                    sql: "SELECT name, city\nFROM students\nWHERE city = 'Dhaka' OR city = 'Gazipur';",
                    explanation: "Find students who live in Dhaka OR Gazipur (either location is acceptable).",
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: "Step 1: FROM students (Find all students)",
                        sqlSnippet: "FROM students",
                        explanation: "SQL scans the students table.",
                        tableData: {
                            tableName: "students (Source Table)",
                            columns: [
                                "name",
                                "city"
                            ],
                            rows: [
                                [
                                    "Rahim",
                                    "Dhaka"
                                ],
                                [
                                    "Karim",
                                    "Gazipur"
                                ],
                                [
                                    "Ayesha",
                                    "Dhaka"
                                ],
                                [
                                    "Sumaiya",
                                    "Chattogram"
                                ],
                                [
                                    "Tanvir",
                                    "Rajshahi"
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: "Step 2: WHERE city = 'Dhaka' OR city = 'Gazipur' (Evaluate either location)",
                        sqlSnippet: "WHERE city = 'Dhaka' OR city = 'Gazipur'",
                        explanation: "1. Rahim: ('Dhaka' = TRUE) ➔ TRUE ✅\n2. Karim: ('Gazipur' = TRUE) ➔ TRUE ✅\n3. Ayesha: ('Dhaka' = TRUE) ➔ TRUE ✅\n4. Sumaiya: ('Chattogram' = FALSE) ➔ FALSE ❌\n5. Tanvir: ('Rajshahi' = FALSE) ➔ FALSE ❌",
                        tableData: {
                            tableName: "Surviving Rows (Dhaka or Gazipur)",
                            columns: [
                                "name",
                                "city"
                            ],
                            highlightedRows: [
                                0,
                                1,
                                2
                            ],
                            rows: [
                                [
                                    "Rahim",
                                    "Dhaka"
                                ],
                                [
                                    "Karim",
                                    "Gazipur"
                                ],
                                [
                                    "Ayesha",
                                    "Dhaka"
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: "OR syntax",
                        sql: "SELECT name, city\nFROM students\nWHERE city = 'Dhaka' OR city = 'Gazipur';",
                        description: "Returns rows where city is either Dhaka or Gazipur."
                    }
                ],
                keyTakeaway: "OR returns rows matching any of the specified conditions.",
                exampleQuery: "SELECT name, city FROM students WHERE city = 'Dhaka' OR city = 'Gazipur';",
                exampleQueryExplanation: "Finds students living in Dhaka or Gazipur.",
                liveDemoSql: "SELECT name, city FROM students WHERE city = 'Dhaka' OR city = 'Gazipur';",
                liveDemoNotes: "Returns Rahim, Karim, and Ayesha.",
                mcqs: [
                    {
                        question: "A table has 5 students: 2 in Dhaka, 2 in Sylhet, and 1 in Chittagong. How many rows does `WHERE city = 'Dhaka' OR city = 'Sylhet'` return?",
                        options: [
                            "A. 2 rows",
                            "B. 4 rows",
                            "C. 5 rows",
                            "D. 0 rows"
                        ],
                        correctIndex: 1,
                        explanation: "OR combines both sets (2 Dhaka + 2 Sylhet = 4 total rows)."
                    }
                ]
            },
            masteryPoints: [
                "Use OR when at least one condition must be TRUE",
                "Understand that adding OR conditions expands the result set"
            ],
            tasks: [
                {
                    id: "day03-c1b-t1",
                    title: "Task 1: Students in Dhaka or Gazipur",
                    description: "Show name and city of students who live in Dhaka or Gazipur.",
                    instructions: [
                        "Select `name` and `city` from `students`.",
                        "Filter where `city = 'Dhaka' OR city = 'Gazipur'`.",
                        "End with a semicolon (;)."
                    ],
                    type: "guided",
                    primaryTable: "students",
                    initialSql: "-- Students in Dhaka or Gazipur\n",
                    solutionSql: "SELECT name, city FROM students WHERE city = 'Dhaka' OR city = 'Gazipur';",
                    solutionExplanation: "Returns Rahim, Karim, and Ayesha.",
                    hints: [
                        {
                            level: 1,
                            text: "Write `WHERE city = 'Dhaka' OR city = 'Gazipur';`"
                        }
                    ],
                    validation: {
                        targetTable: "students",
                        requiredColumns: [
                            "name",
                            "city"
                        ],
                        requireWhere: true,
                        whereContainsTerms: [
                            "city",
                            "Dhaka",
                            "OR",
                            "Gazipur"
                        ],
                        expectedRowCount: 3
                    },
                    successMessage: "Great job! You expanded query candidates with OR."
                },
                {
                    id: "day03-c1b-t2",
                    title: "Task 2: Bargain Items or High-Stock Items",
                    description: "Find products priced under $10.00 OR with quantity_in_stock greater than 50.",
                    instructions: [
                        "Query the `products` table.",
                        "Select `name`, `price`, and `quantity_in_stock`.",
                        "Filter where `price < 10 OR quantity_in_stock > 50`."
                    ],
                    type: "independent",
                    primaryTable: "products",
                    initialSql: "-- Products under $10 OR stock over 50\n",
                    solutionSql: "SELECT name, price, quantity_in_stock FROM products WHERE price < 10 OR quantity_in_stock > 50;",
                    solutionExplanation: "Captures bargain accessories under $10 and surplus stock items over 50 units (5 items).",
                    hints: [
                        {
                            level: 1,
                            text: "Use `WHERE price < 10 OR quantity_in_stock > 50;`"
                        }
                    ],
                    validation: {
                        targetTable: "products",
                        requiredColumns: [
                            "name",
                            "price",
                            "quantity_in_stock"
                        ],
                        requireWhere: true,
                        whereContainsTerms: [
                            "price",
                            "<",
                            "10",
                            "OR",
                            "quantity_in_stock",
                            ">",
                            "50"
                        ],
                        expectedRowCount: 5
                    },
                    successMessage: "Well done! You filtered rows matching either condition."
                }
            ]
        },
        // =========================================================================
        // CONCEPT 1c: Negating Conditions with NOT
        // =========================================================================
        {
            id: "where-not-negation",
            order: 3,
            title: "3. Negating Conditions with NOT",
            shortDescription: "How to invert boolean evaluations using NOT (condition).",
            theory: {
                summary: "How do we select all rows that do NOT satisfy a given condition?",
                introTable: {
                    tableName: "students",
                    description: "Students snapshot",
                    columns: [
                        "id",
                        "name",
                        "department",
                        "city"
                    ],
                    rows: [
                        [
                            1,
                            "Rahim",
                            "CSE",
                            "Dhaka"
                        ],
                        [
                            2,
                            "Karim",
                            "EEE",
                            "Gazipur"
                        ],
                        [
                            3,
                            "Ayesha",
                            "CSE",
                            "Dhaka"
                        ],
                        [
                            4,
                            "Sumaiya",
                            "BBA",
                            "Chattogram"
                        ],
                        [
                            5,
                            "Tanvir",
                            "CSE",
                            "Rajshahi"
                        ]
                    ]
                },
                explanation: [
                    "The `NOT` operator inverts the boolean evaluation of a condition.",
                    "### 1. The Parenthesized NOT Pattern\nWriting `WHERE NOT (condition)` makes the mental model explicit:\n1. First, SQL evaluates the inner condition: `(city = 'Dhaka')` ---> `TRUE` or `FALSE`.\n2. Second, `NOT` inverts that result: `NOT (TRUE)` becomes `FALSE`, and `NOT (FALSE)` becomes `TRUE`."
                ],
                targetQuery: {
                    sql: "SELECT name, city\nFROM students\nWHERE NOT (city = 'Dhaka');",
                    explanation: "Find all students who do NOT live in Dhaka.",
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: "Step 1: FROM students (Find all students)",
                        sqlSnippet: "FROM students",
                        explanation: "SQL visits the students table.",
                        tableData: {
                            tableName: "students (Source Table)",
                            columns: [
                                "name",
                                "city"
                            ],
                            rows: [
                                [
                                    "Rahim",
                                    "Dhaka"
                                ],
                                [
                                    "Karim",
                                    "Gazipur"
                                ],
                                [
                                    "Ayesha",
                                    "Dhaka"
                                ],
                                [
                                    "Sumaiya",
                                    "Chattogram"
                                ],
                                [
                                    "Tanvir",
                                    "Rajshahi"
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: "Step 2: WHERE NOT (city = 'Dhaka') (Invert matches)",
                        sqlSnippet: "WHERE NOT (city = 'Dhaka')",
                        explanation: "1. Rahim: NOT ('Dhaka' = 'Dhaka') ➔ NOT (TRUE) ➔ FALSE ❌\n2. Karim: NOT ('Gazipur' = 'Dhaka') ➔ NOT (FALSE) ➔ TRUE ✅\n3. Ayesha: NOT ('Dhaka' = 'Dhaka') ➔ NOT (TRUE) ➔ FALSE ❌\n4. Sumaiya: NOT ('Chattogram' = 'Dhaka') ➔ NOT (FALSE) ➔ TRUE ✅\n5. Tanvir: NOT ('Rajshahi' = 'Dhaka') ➔ NOT (FALSE) ➔ TRUE ✅",
                        tableData: {
                            tableName: "Surviving Rows (city NOT Dhaka)",
                            columns: [
                                "name",
                                "city"
                            ],
                            highlightedRows: [
                                0,
                                1,
                                2
                            ],
                            rows: [
                                [
                                    "Karim",
                                    "Gazipur"
                                ],
                                [
                                    "Sumaiya",
                                    "Chattogram"
                                ],
                                [
                                    "Tanvir",
                                    "Rajshahi"
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: "NOT negation syntax",
                        sql: "SELECT name, city\nFROM students\nWHERE NOT (city = 'Dhaka');",
                        description: "Returns rows where city is not Dhaka."
                    }
                ],
                keyTakeaway: "NOT inverts boolean results. Parenthesizing NOT (condition) makes the scope crystal clear.",
                exampleQuery: "SELECT name, city FROM students WHERE NOT (city = 'Dhaka');",
                exampleQueryExplanation: "Retrieves all students who do not reside in Dhaka.",
                liveDemoSql: "SELECT name, city FROM students WHERE NOT (city = 'Dhaka');",
                liveDemoNotes: "Returns Karim, Sumaiya, and Tanvir.",
                mcqs: [
                    {
                        question: "What does `WHERE NOT (price < 50)` evaluate to?",
                        options: [
                            "A. WHERE price = 50",
                            "B. WHERE price > 50",
                            "C. WHERE price >= 50",
                            "D. WHERE price <= 50"
                        ],
                        correctIndex: 2,
                        explanation: "The logical inverse of strictly less than (< 50) is greater than or equal to (>= 50)."
                    }
                ]
            },
            masteryPoints: [
                "Use NOT (condition) to invert boolean evaluations",
                "Recognize that NOT (A < B) is equivalent to A >= B"
            ],
            tasks: [
                {
                    id: "day03-c1c-t1",
                    title: "Task 1: Students not living in Dhaka",
                    description: "Show name and city of all students who do not live in Dhaka using NOT.",
                    instructions: [
                        "Select `name` and `city` from `students`.",
                        "Filter where `NOT (city = 'Dhaka')`.",
                        "End with a semicolon (;)."
                    ],
                    type: "guided",
                    primaryTable: "students",
                    initialSql: "-- Students not in Dhaka\n",
                    solutionSql: "SELECT name, city FROM students WHERE NOT (city = 'Dhaka');",
                    solutionExplanation: "Returns Karim (Gazipur), Sumaiya (Chattogram), and Tanvir (Rajshahi).",
                    hints: [
                        {
                            level: 1,
                            text: "Write `WHERE NOT (city = 'Dhaka');`"
                        }
                    ],
                    validation: {
                        targetTable: "students",
                        requiredColumns: [
                            "name",
                            "city"
                        ],
                        requireWhere: true,
                        whereContainsTerms: [
                            "NOT",
                            "city",
                            "Dhaka"
                        ],
                        expectedRowCount: 3
                    },
                    successMessage: "Great job! You inverted conditions using NOT."
                },
                {
                    id: "day03-c1c-t2",
                    title: "Task 2: Products outside Category 1",
                    description: "Select name and category_id for all products not in category 1 (Electronics).",
                    instructions: [
                        "Query the `products` table.",
                        "Select `name` and `category_id`.",
                        "Filter where `NOT (category_id = 1)`."
                    ],
                    type: "independent",
                    primaryTable: "products",
                    initialSql: "-- Products outside category 1\n",
                    solutionSql: "SELECT name, category_id FROM products WHERE NOT (category_id = 1);",
                    solutionExplanation: "Returns all 22 catalog products in categories other than 1.",
                    hints: [
                        {
                            level: 1,
                            text: "Use `WHERE NOT (category_id = 1);`"
                        }
                    ],
                    validation: {
                        targetTable: "products",
                        requiredColumns: [
                            "name",
                            "category_id"
                        ],
                        requireWhere: true,
                        whereContainsTerms: [
                            "NOT",
                            "category_id",
                            "1"
                        ],
                        expectedRowCount: 21
                    },
                    successMessage: "Well done! You applied boolean negation to category filtering."
                }
            ]
        },
        // =========================================================================
        // CONCEPT 1d: Evaluation Order & Parentheses
        // =========================================================================
        {
            id: "where-parentheses-precedence",
            order: 4,
            title: "4. Evaluation Order & Parentheses",
            shortDescription: "How to control operator precedence when combining AND and OR.",
            theory: {
                summary: "In SQL, AND has higher precedence than OR. Mixing them without parentheses causes subtle bugs.",
                introTable: {
                    tableName: "products",
                    description: "Products snapshot",
                    columns: [
                        "product_id",
                        "name",
                        "category_id",
                        "price"
                    ],
                    rows: [
                        [
                            4,
                            "Mechanical Keyboard",
                            1,
                            65.0
                        ],
                        [
                            6,
                            "Stainless Steel Pan Set",
                            2,
                            55.0
                        ],
                        [
                            7,
                            "Ceramic Mixing Bowls",
                            2,
                            22.3
                        ],
                        [
                            14,
                            "Office Chair",
                            3,
                            120.0
                        ]
                    ]
                },
                explanation: [
                    "Just like multiplication comes before addition in math, **`AND` is evaluated before `OR` in SQL**.",
                    "### 1. The Precedence Trap\nConsider this query without parentheses:\n`WHERE price > 50 AND category_id = 1 OR category_id = 2`\nBecause `AND` binds first, SQL accidentally includes **every** product in category 2 regardless of its price!",
                    "### 2. The Solution: Explicit Parentheses\nWrap your `OR` clauses in parentheses to force SQL to evaluate the union first:\n`WHERE price > 50 AND (category_id = 1 OR category_id = 2)`"
                ],
                targetQuery: {
                    sql: "SELECT name, category_id, price\nFROM products\nWHERE price > 50 AND (category_id = 1 OR category_id = 2);",
                    explanation: "Find products priced over $50 that belong to category 1 or category 2.",
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: "Step 1: Without Parentheses (Precedence Bug)",
                        sqlSnippet: "WHERE price > 50 AND category_id = 1 OR category_id = 2",
                        explanation: "Binds category 2 without price filter: returns cheap category 2 items by mistake.",
                        tableData: {
                            tableName: "Buggy Output (Without Parentheses)",
                            columns: [
                                "name",
                                "category_id",
                                "price"
                            ],
                            rows: [
                                [
                                    "Mechanical Keyboard",
                                    1,
                                    65.0
                                ],
                                [
                                    "Stainless Steel Pan Set",
                                    2,
                                    55.0
                                ],
                                [
                                    "Ceramic Mixing Bowls",
                                    2,
                                    22.3
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: "Step 2: With Parentheses (Correct Logic)",
                        sqlSnippet: "WHERE price > 50 AND (category_id = 1 OR category_id = 2)",
                        explanation: "Forces price > 50 across both categories: excludes cheap mixing bowls.",
                        tableData: {
                            tableName: "Correct Output (With Parentheses)",
                            columns: [
                                "name",
                                "category_id",
                                "price"
                            ],
                            highlightedRows: [
                                0,
                                1
                            ],
                            rows: [
                                [
                                    "Mechanical Keyboard",
                                    1,
                                    65.0
                                ],
                                [
                                    "Stainless Steel Pan Set",
                                    2,
                                    55.0
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: "Parenthesized compound condition",
                        sql: "SELECT name, category_id, price\nFROM products\nWHERE price > 50 AND (category_id = 1 OR category_id = 2);",
                        description: "Forces evaluation of the OR group before applying the price filter."
                    }
                ],
                keyTakeaway: "Always wrap OR conditions in parentheses when combining them with AND.",
                exampleQuery: "SELECT name, category_id, price FROM products WHERE price > 50 AND (category_id = 1 OR category_id = 2);",
                exampleQueryExplanation: "Filters for items priced above $50 in categories 1 or 2.",
                liveDemoSql: "SELECT name, category_id, price FROM products WHERE price > 50 AND (category_id = 1 OR category_id = 2);",
                liveDemoNotes: "Returns Keyboard ($65 in cat 1) and Pan Set ($55 in cat 2).",
                mcqs: [
                    {
                        question: "In the expression `WHERE a AND b OR c`, which part does SQL evaluate first by default?",
                        options: [
                            "A. b OR c",
                            "B. a AND b",
                            "C. It evaluates from right to left",
                            "D. It randomly chooses"
                        ],
                        correctIndex: 1,
                        explanation: "AND has higher operator precedence than OR, so `a AND b` is evaluated first."
                    }
                ]
            },
            masteryPoints: [
                "Remember that AND binds more tightly than OR",
                "Use parentheses to enforce explicit evaluation order"
            ],
            tasks: [
                {
                    id: "day03-c1d-t1",
                    title: "Task 1: Premium items in Category 1 or 2",
                    description: "Show name, category_id, and price for products priced over $50.00 that belong to category 1 or category 2.",
                    instructions: [
                        "Select `name`, `category_id`, and `price` from `products`.",
                        "Filter where `price > 50 AND (category_id = 1 OR category_id = 2)`.",
                        "End with a semicolon (;)."
                    ],
                    type: "guided",
                    primaryTable: "products",
                    initialSql: "-- Premium items in Category 1 or 2\n",
                    solutionSql: "SELECT name, category_id, price FROM products WHERE price > 50 AND (category_id = 1 OR category_id = 2);",
                    solutionExplanation: "Returns Mechanical Keyboard ($65) and Stainless Steel Pan Set ($55).",
                    hints: [
                        {
                            level: 1,
                            text: "Wrap `(category_id = 1 OR category_id = 2)` in parentheses."
                        }
                    ],
                    validation: {
                        targetTable: "products",
                        requiredColumns: [
                            "name",
                            "category_id",
                            "price"
                        ],
                        requireWhere: true,
                        whereContainsTerms: [
                            "price",
                            ">",
                            "50",
                            "category_id",
                            "1",
                            "OR",
                            "2"
                        ],
                        expectedRowCount: 2
                    },
                    successMessage: "Great job! You enforced operator precedence using parentheses."
                },
                {
                    id: "day03-c1d-t2",
                    title: "Task 2: Fix the Precedence Bug",
                    description: "Fix this buggy query so that it only returns products priced strictly under $20 that belong to category 1 or category 2.",
                    instructions: [
                        "Query the `products` table.",
                        "Select `name`, `category_id`, and `price`.",
                        "Add parentheses around the `OR` clause: `WHERE price < 20 AND (category_id = 1 OR category_id = 2)`."
                    ],
                    type: "independent",
                    primaryTable: "products",
                    initialSql: "SELECT name, category_id, price FROM products WHERE price < 20 AND category_id = 1 OR category_id = 2;\n",
                    solutionSql: "SELECT name, category_id, price FROM products WHERE price < 20 AND (category_id = 1 OR category_id = 2);",
                    solutionExplanation: "Parentheses restrict the search to products under $20 within categories 1 or 2 (USB-C Cable, Cutting Board Set, Knife Sharpener, Wireless Mouse).",
                    hints: [
                        {
                            level: 1,
                            text: "Wrap the OR condition in parentheses: `(category_id = 1 OR category_id = 2)`"
                        }
                    ],
                    validation: {
                        targetTable: "products",
                        requiredColumns: [
                            "name",
                            "category_id",
                            "price"
                        ],
                        requireWhere: true,
                        whereContainsTerms: [
                            "price",
                            "<",
                            "20",
                            "category_id",
                            "1",
                            "OR",
                            "2"
                        ],
                        expectedRowCount: 4
                    },
                    successMessage: "Spot on! You fixed the operator precedence bug."
                }
            ]
        },
        // =========================================================================
        // CONCEPT 2a: Range Shorthand with BETWEEN
        // =========================================================================
        {
            id: "where-between-range",
            order: 5,
            title: "5. Range Shorthand with BETWEEN",
            shortDescription: "How to filter inclusive intervals on numbers and dates.",
            theory: {
                summary: "To test if a number falls inside a range, SQL provides the clean BETWEEN operator.",
                introTable: {
                    tableName: "products",
                    description: "Sample products snapshot",
                    columns: [
                        "product_id",
                        "name",
                        "price"
                    ],
                    rows: [
                        [
                            1,
                            "Wireless Mouse",
                            15.99
                        ],
                        [
                            2,
                            "Bluetooth Speaker",
                            45.5
                        ],
                        [
                            4,
                            "Mechanical Keyboard",
                            65.0
                        ],
                        [
                            14,
                            "Office Chair",
                            120.0
                        ]
                    ]
                },
                explanation: [
                    "`BETWEEN min AND max` is clean shorthand for `col >= min AND col <= max`.",
                    "### 1. The Inclusivity Rule\n**BETWEEN is always inclusive.** Both the lower boundary and upper boundary values are included in the result.",
                    "An item priced at exactly $25.00 or $100.00 will be included in the output."
                ],
                targetQuery: {
                    sql: "SELECT name, price\nFROM products\nWHERE price BETWEEN 25.00 AND 100.00;",
                    explanation: "Find all products priced in the $25.00 to $100.00 inclusive range.",
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: "Step 1: FROM products (Scan candidates)",
                        sqlSnippet: "FROM products",
                        explanation: "SQL scans the products table.",
                        tableData: {
                            tableName: "products (Candidate Rows)",
                            columns: [
                                "name",
                                "price"
                            ],
                            rows: [
                                [
                                    "Wireless Mouse",
                                    15.99
                                ],
                                [
                                    "Bluetooth Speaker",
                                    45.5
                                ],
                                [
                                    "Mechanical Keyboard",
                                    65.0
                                ],
                                [
                                    "Office Chair",
                                    120.0
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: "Step 2: WHERE price BETWEEN 25.00 AND 100.00 (Inclusive check)",
                        sqlSnippet: "WHERE price BETWEEN 25.00 AND 100.00",
                        explanation: "Wireless Mouse ($15.99): FALSE ❌\nBluetooth Speaker ($45.50): TRUE ✅\nMechanical Keyboard ($65.00): TRUE ✅\nOffice Chair ($120.00): FALSE ❌",
                        tableData: {
                            tableName: "Final Query Result",
                            columns: [
                                "name",
                                "price"
                            ],
                            highlightedColumns: [
                                "name",
                                "price"
                            ],
                            highlightedRows: [
                                0,
                                1
                            ],
                            rows: [
                                [
                                    "Bluetooth Speaker",
                                    45.5
                                ],
                                [
                                    "Mechanical Keyboard",
                                    65.0
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: "BETWEEN syntax",
                        sql: "SELECT name, price\nFROM products\nWHERE price BETWEEN 25.00 AND 100.00;",
                        description: "Matches values greater than or equal to 25 and less than or equal to 100."
                    }
                ],
                keyTakeaway: "BETWEEN min AND max includes both min and max boundary endpoints.",
                exampleQuery: "SELECT name, price FROM products WHERE price BETWEEN 25.00 AND 100.00;",
                exampleQueryExplanation: "Finds products in the $25 to $100 inclusive price bracket.",
                liveDemoSql: "SELECT name, price FROM products WHERE price BETWEEN 25.00 AND 100.00;",
                liveDemoNotes: "Captures all products in that price band.",
                mcqs: [
                    {
                        question: "What does `WHERE price BETWEEN 10 AND 50` include in standard SQL?",
                        options: [
                            "A. Numbers strictly between 11 and 49 only",
                            "B. Both 10.00 and 50.00 as well as all values in between (inclusive)",
                            "C. Only integer numbers",
                            "D. Only 10 and 50 exactly"
                        ],
                        correctIndex: 1,
                        explanation: "BETWEEN in SQL is inclusive of both boundary endpoints."
                    }
                ]
            },
            masteryPoints: [
                "Use BETWEEN for continuous range filtering",
                "Remember that BETWEEN is inclusive on both ends"
            ],
            tasks: [
                {
                    id: "day03-c2a-t1",
                    title: "Task 1: Products in Price Band $25 to $100",
                    description: "Show name and price for products priced between $25.00 and $100.00 inclusive.",
                    instructions: [
                        "Select `name` and `price` from `products`.",
                        "Filter with `WHERE price BETWEEN 25.00 AND 100.00`.",
                        "End with a semicolon (;)."
                    ],
                    type: "guided",
                    primaryTable: "products",
                    initialSql: "-- Price between $25 and $100\n",
                    solutionSql: "SELECT name, price FROM products WHERE price BETWEEN 25.00 AND 100.00;",
                    solutionExplanation: "`BETWEEN 25.00 AND 100.00` captures all mid-tier products (12 items).",
                    hints: [
                        {
                            level: 1,
                            text: "Use `WHERE price BETWEEN 25.00 AND 100.00;`"
                        }
                    ],
                    validation: {
                        targetTable: "products",
                        requiredColumns: [
                            "name",
                            "price"
                        ],
                        requireWhere: true,
                        whereContainsTerms: [
                            "BETWEEN",
                            "25",
                            "100"
                        ],
                        expectedRowCount: 10
                    },
                    successMessage: "Great job! You executed an inclusive range query."
                },
                {
                    id: "day03-c2a-t2",
                    title: "Task 2: Students aged 20 to 22",
                    description: "Select name and age of students between 20 and 22 years old inclusive.",
                    instructions: [
                        "Query the `students` table.",
                        "Select `name` and `age`.",
                        "Filter where `age BETWEEN 20 AND 22`."
                    ],
                    type: "independent",
                    primaryTable: "students",
                    initialSql: "-- Students aged between 20 and 22\n",
                    solutionSql: "SELECT name, age FROM students WHERE age BETWEEN 20 AND 22;",
                    solutionExplanation: "Returns Rahim (21), Karim (22), Ayesha (20), and Tanvir (21).",
                    hints: [
                        {
                            level: 1,
                            text: "Write `SELECT name, age FROM students WHERE age BETWEEN 20 AND 22;`"
                        }
                    ],
                    validation: {
                        targetTable: "students",
                        requiredColumns: [
                            "name",
                            "age"
                        ],
                        requireWhere: true,
                        whereContainsTerms: [
                            "age",
                            "BETWEEN",
                            "20",
                            "22"
                        ],
                        expectedRowCount: 4
                    },
                    successMessage: "Well done! You filtered student ages with BETWEEN."
                },
                {
                    id: "day03-c2a-t3",
                    title: "Task 3: Boundary Confirmation ($15.99 to $65.00)",
                    description: "Select name and price for products priced between $15.99 and $65.00. Verify that items at both $15.99 and $65.00 appear in the result.",
                    instructions: [
                        "Query the `products` table.",
                        "Select `name` and `price`.",
                        "Filter where `price BETWEEN 15.99 AND 65.00`."
                    ],
                    type: "independent",
                    primaryTable: "products",
                    initialSql: "-- Verify boundary inclusion\n",
                    solutionSql: "SELECT name, price FROM products WHERE price BETWEEN 15.99 AND 65.00;",
                    solutionExplanation: "Includes boundary items: Wireless Mouse ($15.99) and Mechanical Keyboard ($65.00).",
                    hints: [
                        {
                            level: 1,
                            text: "Write `SELECT name, price FROM products WHERE price BETWEEN 15.99 AND 65.00;`"
                        }
                    ],
                    validation: {
                        targetTable: "products",
                        requiredColumns: [
                            "name",
                            "price"
                        ],
                        requireWhere: true,
                        whereContainsTerms: [
                            "price",
                            "BETWEEN",
                            "15.99",
                            "65"
                        ],
                        expectedRowCount: 17
                    },
                    successMessage: "Spot on! You verified that both boundary values are returned by BETWEEN."
                }
            ]
        },
        // =========================================================================
        // CONCEPT 2b: Set Membership with IN
        // =========================================================================
        {
            id: "where-in-set",
            order: 6,
            title: "6. Set Membership with IN",
            shortDescription: "How to check if a value exists within a discrete list.",
            theory: {
                summary: "Instead of writing long chains of OR equality checks, SQL gives us the clean IN operator:",
                introTable: {
                    tableName: "students",
                    description: "Students snapshot across cities",
                    columns: [
                        "id",
                        "name",
                        "department",
                        "city"
                    ],
                    rows: [
                        [
                            1,
                            "Rahim",
                            "CSE",
                            "Dhaka"
                        ],
                        [
                            2,
                            "Karim",
                            "EEE",
                            "Gazipur"
                        ],
                        [
                            3,
                            "Ayesha",
                            "CSE",
                            "Dhaka"
                        ],
                        [
                            4,
                            "Sumaiya",
                            "BBA",
                            "Chattogram"
                        ],
                        [
                            5,
                            "Tanvir",
                            "CSE",
                            "Rajshahi"
                        ]
                    ]
                },
                explanation: [
                    "Instead of writing repetitive OR chains:\n`WHERE city = 'Dhaka' OR city = 'Chattogram' OR city = 'Rajshahi'`\nYou can write the clean, readable equivalent:\n`WHERE city IN ('Dhaka', 'Chattogram', 'Rajshahi')`",
                    "### How IN Evaluates\n`IN (val1, val2, ...)` tests whether the column value is a member of the discrete set."
                ],
                targetQuery: {
                    sql: "SELECT name, department, city\nFROM students\nWHERE city IN ('Dhaka', 'Chattogram');",
                    explanation: "Find students located in any of the listed cities ('Dhaka' or 'Chattogram').",
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: "Step 1: FROM students (Find all students)",
                        sqlSnippet: "FROM students",
                        explanation: "SQL visits the students table.",
                        tableData: {
                            tableName: "students (Source Table)",
                            columns: [
                                "name",
                                "department",
                                "city"
                            ],
                            rows: [
                                [
                                    "Rahim",
                                    "CSE",
                                    "Dhaka"
                                ],
                                [
                                    "Karim",
                                    "EEE",
                                    "Gazipur"
                                ],
                                [
                                    "Ayesha",
                                    "CSE",
                                    "Dhaka"
                                ],
                                [
                                    "Sumaiya",
                                    "BBA",
                                    "Chattogram"
                                ],
                                [
                                    "Tanvir",
                                    "CSE",
                                    "Rajshahi"
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: "Step 2: WHERE city IN ('Dhaka', 'Chattogram') (Match set list)",
                        sqlSnippet: "WHERE city IN ('Dhaka', 'Chattogram')",
                        explanation: "Matches students located in Dhaka (Rahim, Ayesha) or Chattogram (Sumaiya).",
                        tableData: {
                            tableName: "Final Query Result",
                            columns: [
                                "name",
                                "department",
                                "city"
                            ],
                            highlightedColumns: [
                                "city"
                            ],
                            highlightedRows: [
                                0,
                                1,
                                2
                            ],
                            rows: [
                                [
                                    "Rahim",
                                    "CSE",
                                    "Dhaka"
                                ],
                                [
                                    "Ayesha",
                                    "CSE",
                                    "Dhaka"
                                ],
                                [
                                    "Sumaiya",
                                    "BBA",
                                    "Chattogram"
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: "IN syntax",
                        sql: "SELECT * FROM customers WHERE city IN ('Dhaka', 'Chittagong');",
                        description: "Matches rows where city equals any item in the list."
                    }
                ],
                keyTakeaway: "Use IN for discrete candidate lists instead of chained OR statements.",
                exampleQuery: "SELECT name, city FROM students WHERE city IN ('Dhaka', 'Chattogram');",
                exampleQueryExplanation: "Finds students located in Dhaka or Chattogram.",
                liveDemoSql: "SELECT name, city FROM students WHERE city IN ('Dhaka', 'Chattogram');",
                liveDemoNotes: "Returns Rahim, Ayesha, and Sumaiya.",
                mcqs: [
                    {
                        question: "Which query is equivalent to `WHERE id = 1 OR id = 3 OR id = 5`?",
                        options: [
                            "A. WHERE id BETWEEN 1 AND 5",
                            "B. WHERE id IN (1, 3, 5)",
                            "C. WHERE id = 1 AND id = 3 AND id = 5",
                            "D. WHERE id LIKE 135"
                        ],
                        correctIndex: 1,
                        explanation: "`IN (1, 3, 5)` tests if the column value equals any member in the discrete set."
                    }
                ]
            },
            masteryPoints: [
                "Use IN for discrete candidate lists",
                "Recognize IN as a clean replacement for chained OR equality checks"
            ],
            tasks: [
                {
                    id: "day03-c2b-t1",
                    title: "Task 1: Students in Dhaka or Chattogram",
                    description: "Show name, department, and city for students in Dhaka or Chattogram using IN.",
                    instructions: [
                        "Select `name`, `department`, and `city` from `students`.",
                        "Filter with `WHERE city IN ('Dhaka', 'Chattogram')`.",
                        "End with a semicolon (;)."
                    ],
                    type: "guided",
                    primaryTable: "students",
                    initialSql: "-- Filter with IN\n",
                    solutionSql: "SELECT name, department, city FROM students WHERE city IN ('Dhaka', 'Chattogram');",
                    solutionExplanation: "Returns Rahim, Ayesha, and Sumaiya.",
                    hints: [
                        {
                            level: 1,
                            text: "Write `WHERE city IN ('Dhaka', 'Chattogram');`"
                        }
                    ],
                    validation: {
                        targetTable: "students",
                        requiredColumns: [
                            "name",
                            "department",
                            "city"
                        ],
                        requireWhere: true,
                        whereContainsTerms: [
                            "city",
                            "IN",
                            "Dhaka",
                            "Chattogram"
                        ],
                        expectedRowCount: 3
                    },
                    successMessage: "Great job! You simplified set filtering with IN."
                },
                {
                    id: "day03-c2b-t2",
                    title: "Task 2: Products in Category 1 or 2",
                    description: "Select name, category_id, and price from products belonging to category 1 (Electronics) or category 2 (Kitchen & Dining) using IN.",
                    instructions: [
                        "Query the `products` table.",
                        "Select `name`, `category_id`, and `price`.",
                        "Filter where `category_id IN (1, 2)`."
                    ],
                    type: "independent",
                    primaryTable: "products",
                    initialSql: "-- Products in category 1 or 2\n",
                    solutionSql: "SELECT name, category_id, price FROM products WHERE category_id IN (1, 2);",
                    solutionExplanation: "Retrieves all 12 items in categories 1 and 2.",
                    hints: [
                        {
                            level: 1,
                            text: "Use `WHERE category_id IN (1, 2);`"
                        }
                    ],
                    validation: {
                        targetTable: "products",
                        requiredColumns: [
                            "name",
                            "category_id",
                            "price"
                        ],
                        requireWhere: true,
                        whereContainsTerms: [
                            "category_id",
                            "IN",
                            "1",
                            "2"
                        ],
                        expectedRowCount: 12
                    },
                    successMessage: "Perfect! You filtered integer categories with IN."
                }
            ]
        },
        // =========================================================================
        // CONCEPT 3a: Wildcard Pattern Matching with LIKE (% and _)
        // =========================================================================
        {
            id: "where-like-wildcards",
            order: 7,
            title: "7. Wildcard Pattern Matching with LIKE (% and _)",
            shortDescription: "How to search text using multi-character (%) and single-character (_) wildcards.",
            theory: {
                summary: "In real datasets, text searches are often partial: searching by domain, prefix, or character position.",
                introTable: {
                    tableName: "products",
                    description: "Sample products snapshot",
                    columns: [
                        "product_id",
                        "name",
                        "price"
                    ],
                    rows: [
                        [
                            1,
                            "Wireless Mouse",
                            15.99
                        ],
                        [
                            3,
                            "USB-C Charging Cable",
                            9.99
                        ],
                        [
                            4,
                            "Mechanical Keyboard",
                            65.0
                        ],
                        [
                            25,
                            "Wireless Doorbell",
                            38.0
                        ],
                        [
                            26,
                            "Wireless Earbuds",
                            32.0
                        ]
                    ]
                },
                explanation: [
                    "The `LIKE` operator matches text against a pattern containing special wildcard characters.",
                    "### 1. The Two Wildcards\n• **`%` (Percent sign)**: Matches **zero, one, or many** characters of any length.\n• **`_` (Underscore)**: Matches **exactly one character** at that specific index position.",
                    "### 2. Positional Matching Breakdown\nWhen searching with `_` and `%` together:\n`Pattern: _SB%`\n• `_` matches the 1st character (`U`).\n• `S` must be the 2nd character.\n• `B` must be the 3rd character.\n• `%` matches any remaining characters."
                ],
                targetQuery: {
                    sql: "SELECT name, price\nFROM products\nWHERE name LIKE 'Wireless%';",
                    explanation: "Find all products starting with the word 'Wireless' followed by any text.",
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: "Step 1: FROM products (Scan candidates)",
                        sqlSnippet: "FROM products",
                        explanation: "SQL scans the products table.",
                        tableData: {
                            tableName: "products (Sample Items)",
                            columns: [
                                "name",
                                "price"
                            ],
                            rows: [
                                [
                                    "Wireless Mouse",
                                    15.99
                                ],
                                [
                                    "USB-C Charging Cable",
                                    9.99
                                ],
                                [
                                    "Mechanical Keyboard",
                                    65.0
                                ],
                                [
                                    "Wireless Doorbell",
                                    38.0
                                ],
                                [
                                    "Wireless Earbuds",
                                    32.0
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: "Step 2: WHERE name LIKE 'Wireless%' (Match prefix)",
                        sqlSnippet: "WHERE name LIKE 'Wireless%'",
                        explanation: "Matches products beginning with 'Wireless' followed by any text.",
                        tableData: {
                            tableName: "Final Query Result",
                            columns: [
                                "name",
                                "price"
                            ],
                            highlightedColumns: [
                                "name"
                            ],
                            highlightedRows: [
                                0,
                                1,
                                2
                            ],
                            rows: [
                                [
                                    "Wireless Mouse",
                                    15.99
                                ],
                                [
                                    "Wireless Doorbell",
                                    38.0
                                ],
                                [
                                    "Wireless Earbuds",
                                    32.0
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: "LIKE wildcard search syntax",
                        sql: "SELECT name FROM customers WHERE email LIKE '%@example.com';\nSELECT name FROM products WHERE name LIKE '_SB%';",
                        description: "% matches any sequence; _ matches exactly one character."
                    }
                ],
                keyTakeaway: "% matches any length of characters; _ matches exactly one character at that position.",
                exampleQuery: "SELECT name, price FROM products WHERE name LIKE 'Wireless%';",
                exampleQueryExplanation: "Finds all products starting with the word Wireless.",
                liveDemoSql: "SELECT name, price FROM products WHERE name LIKE 'Wireless%';",
                liveDemoNotes: "Returns Wireless Mouse, Wireless Doorbell, and Wireless Earbuds.",
                mcqs: [
                    {
                        question: "Which query matches any product starting with the word 'Wireless'?",
                        options: [
                            "A. WHERE name LIKE '%Wireless'",
                            "B. WHERE name LIKE 'Wireless%'",
                            "C. WHERE name = 'Wireless*'",
                            "D. WHERE name IN ('Wireless')"
                        ],
                        correctIndex: 1,
                        explanation: "'Wireless%' matches strings beginning with Wireless followed by any characters."
                    }
                ]
            },
            masteryPoints: [
                "Use % to match any number of characters",
                "Use _ to match exactly one single character position"
            ],
            tasks: [
                {
                    id: "day03-c3a-t1",
                    title: "Task 1: Search emails ending with @example.com (%)",
                    description: 'Show name and email of all customers whose email address ends with "@example.com".',
                    instructions: [
                        "Select `name` and `email` from `customers`.",
                        "Filter with `WHERE email LIKE '%@example.com'`.",
                        "End with a semicolon (;)."
                    ],
                    type: "guided",
                    primaryTable: "customers",
                    initialSql: "-- Search emails with %\n",
                    solutionSql: "SELECT name, email FROM customers WHERE email LIKE '%@example.com';",
                    solutionExplanation: "Retrieves all 11 customers with standard @example.com email domains.",
                    hints: [
                        {
                            level: 1,
                            text: "Write `WHERE email LIKE '%@example.com';`"
                        }
                    ],
                    validation: {
                        targetTable: "customers",
                        requiredColumns: [
                            "name",
                            "email"
                        ],
                        requireWhere: true,
                        whereContainsTerms: [
                            "email",
                            "LIKE",
                            "%@example.com"
                        ],
                        expectedRowCount: 13
                    },
                    successMessage: "Great job! You executed a wildcard domain search with %."
                },
                {
                    id: "day03-c3a-t2",
                    title: "Task 2: Single-Character Positional Match (_)",
                    description: 'Find products where the second and third characters are "SB" using the single-character wildcard (_).',
                    instructions: [
                        "Query the `products` table.",
                        "Select `name` and `price`.",
                        "Filter where `name LIKE '_SB%'`."
                    ],
                    type: "independent",
                    primaryTable: "products",
                    initialSql: "-- Positional match with _\n",
                    solutionSql: "SELECT name, price FROM products WHERE name LIKE '_SB%';",
                    solutionExplanation: "Matches 'USB-C Charging Cable' (U is position 1, S is position 2, B is position 3).",
                    hints: [
                        {
                            level: 1,
                            text: "Use `WHERE name LIKE '_SB%';`"
                        }
                    ],
                    validation: {
                        targetTable: "products",
                        requiredColumns: [
                            "name",
                            "price"
                        ],
                        requireWhere: true,
                        whereContainsTerms: [
                            "name",
                            "LIKE",
                            "_SB%"
                        ],
                        expectedRowCount: 1
                    },
                    successMessage: "Spot on! You matched character positions using the underscore wildcard."
                }
            ]
        },
        // =========================================================================
        // CONCEPT 3b: NULL Safety (IS NULL and IS NOT NULL)
        // =========================================================================
        {
            id: "where-null-safety",
            order: 8,
            title: "8. NULL Safety (IS NULL and IS NOT NULL)",
            shortDescription: "How to safely handle missing data and avoid three-valued logic traps.",
            theory: {
                summary: "In SQL databases, missing or unrecorded data is represented as NULL. Testing NULL requires special syntax.",
                introTable: {
                    tableName: "customers",
                    description: "Customer profiles with optional email addresses",
                    columns: [
                        "customer_id",
                        "name",
                        "email",
                        "city"
                    ],
                    rows: [
                        [
                            1,
                            "Rafiul Islam",
                            "rafiul@example.com",
                            "Dhaka"
                        ],
                        [
                            3,
                            "Tanvir Ahmed",
                            null,
                            "Chittagong"
                        ],
                        [
                            4,
                            "Nusrat Jahan",
                            "nusrat.j@example.com",
                            "Chittagong"
                        ],
                        [
                            7,
                            "Shakil Ahmed",
                            null,
                            "Khulna"
                        ]
                    ]
                },
                explanation: [
                    "`NULL` represents unknown or missing data. It is **not** an empty string `''` and **not** zero `0`.",
                    "### 1. Three-Valued Logic: Why = NULL Always Fails Silently\nIn SQL, any direct comparison with NULL using `=` or `!=` evaluates to **UNKNOWN**, not `TRUE` or `FALSE`.\n\nBecause `WHERE` only retains rows where the condition evaluates to `TRUE`, writing `WHERE email = NULL` filters out **all** rows—returning 0 results even when NULLs exist!",
                    "### 2. The Safe Syntax: IS NULL and IS NOT NULL\nAlways use `IS NULL` to find missing values, and `IS NOT NULL` to find present values."
                ],
                targetQuery: {
                    sql: "SELECT name, city\nFROM customers\nWHERE email IS NULL;",
                    explanation: "Find all customer accounts that have a missing (NULL) email address.",
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: "Step 1: FROM customers (Find candidate accounts)",
                        sqlSnippet: "FROM customers",
                        explanation: "SQL visits the customers table.",
                        tableData: {
                            tableName: "customers (Sample Accounts)",
                            columns: [
                                "name",
                                "email",
                                "city"
                            ],
                            rows: [
                                [
                                    "Rafiul Islam",
                                    "rafiul@example.com",
                                    "Dhaka"
                                ],
                                [
                                    "Tanvir Ahmed",
                                    null,
                                    "Chittagong"
                                ],
                                [
                                    "Nusrat Jahan",
                                    "nusrat.j@example.com",
                                    "Chittagong"
                                ],
                                [
                                    "Shakil Ahmed",
                                    null,
                                    "Khulna"
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: "Step 2: WHERE email IS NULL (Isolate missing data)",
                        sqlSnippet: "WHERE email IS NULL",
                        explanation: "SQL identifies records where the email column holds NULL.",
                        tableData: {
                            tableName: "Final Query Result (Missing Email)",
                            columns: [
                                "name",
                                "city"
                            ],
                            highlightedColumns: [
                                "name",
                                "city"
                            ],
                            highlightedRows: [
                                0,
                                1
                            ],
                            rows: [
                                [
                                    "Tanvir Ahmed",
                                    "Chittagong"
                                ],
                                [
                                    "Shakil Ahmed",
                                    "Khulna"
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: "Safe NULL checks",
                        sql: "SELECT name FROM customers WHERE email IS NULL;\nSELECT name FROM customers WHERE email IS NOT NULL;",
                        description: "Always use IS NULL and IS NOT NULL. Never use = NULL."
                    }
                ],
                keyTakeaway: "Comparing with = NULL produces UNKNOWN. Always use IS NULL and IS NOT NULL.",
                exampleQuery: "SELECT name, city FROM customers WHERE email IS NULL;",
                exampleQueryExplanation: "Finds customer accounts missing an email address.",
                liveDemoSql: "SELECT name, city FROM customers WHERE email IS NULL;",
                liveDemoNotes: "Returns Tanvir Ahmed and Shakil Ahmed.",
                mcqs: [
                    {
                        question: "Why does `SELECT * FROM customers WHERE email = NULL;` fail to return rows with missing emails?",
                        options: [
                            "A. Because SQL syntax requires quotes around NULL",
                            "B. Because email = NULL evaluates to UNKNOWN, and WHERE only retains rows where the condition is TRUE",
                            "C. Because the table must be sorted first",
                            "D. Because NULL can only be checked on numeric columns"
                        ],
                        correctIndex: 1,
                        explanation: "In SQL three-valued logic, `= NULL` evaluates to UNKNOWN. WHERE only keeps TRUE rows."
                    }
                ]
            },
            masteryPoints: [
                "Understand that NULL compared with = evaluates to UNKNOWN",
                "Use IS NULL to detect missing values",
                "Use IS NOT NULL to detect existing values"
            ],
            tasks: [
                {
                    id: "day03-c3b-t1",
                    title: "Task 1: Customers Without Email (IS NULL)",
                    description: "Show name and city for customers who do not have an email address recorded.",
                    instructions: [
                        "Select `name` and `city` from `customers`.",
                        "Filter where `email IS NULL`.",
                        "End with a semicolon (;)."
                    ],
                    type: "guided",
                    primaryTable: "customers",
                    initialSql: "-- Find customers with missing emails\n",
                    solutionSql: "SELECT name, city FROM customers WHERE email IS NULL;",
                    solutionExplanation: "`WHERE email IS NULL` identifies Tanvir Ahmed and Shakil Ahmed (2 records).",
                    hints: [
                        {
                            level: 1,
                            text: "Use `WHERE email IS NULL;`"
                        }
                    ],
                    validation: {
                        targetTable: "customers",
                        requiredColumns: [
                            "name",
                            "city"
                        ],
                        requireWhere: true,
                        whereContainsTerms: [
                            "email",
                            "IS",
                            "NULL"
                        ],
                        expectedRowCount: 2
                    },
                    successMessage: "Great job! You detected missing records safely using IS NULL."
                },
                {
                    id: "day03-c3b-t2",
                    title: "Task 2: Suppliers with Valid Contact Email (IS NOT NULL)",
                    description: "Find all suppliers that have a recorded contact email address.",
                    instructions: [
                        "Query the `suppliers` table.",
                        "Select `name` and `contact_email`.",
                        "Filter where `contact_email IS NOT NULL`."
                    ],
                    type: "independent",
                    primaryTable: "suppliers",
                    initialSql: "-- Suppliers with valid email\n",
                    solutionSql: "SELECT name, contact_email FROM suppliers WHERE contact_email IS NOT NULL;",
                    solutionExplanation: "Retrieves all 6 active suppliers with recorded emails.",
                    hints: [
                        {
                            level: 1,
                            text: "Use `WHERE contact_email IS NOT NULL;`"
                        }
                    ],
                    validation: {
                        targetTable: "suppliers",
                        requiredColumns: [
                            "name",
                            "contact_email"
                        ],
                        requireWhere: true,
                        whereContainsTerms: [
                            "contact_email",
                            "IS",
                            "NOT",
                            "NULL"
                        ],
                        expectedRowCount: 6
                    },
                    successMessage: "Well done! You filtered non-null values with IS NOT NULL."
                },
                {
                    id: "day03-c3b-t3",
                    title: "Task 3: Fix the = NULL Bug",
                    description: "A junior developer wrote `SELECT name, city FROM customers WHERE email = NULL;` and got 0 rows. Fix the query so it properly returns customers with missing emails.",
                    instructions: [
                        "Query the `customers` table.",
                        "Select `name` and `city`.",
                        "Rewrite the filter to use `IS NULL` instead of `= NULL`."
                    ],
                    type: "independent",
                    primaryTable: "customers",
                    initialSql: "SELECT name, city FROM customers WHERE email = NULL;\n",
                    solutionSql: "SELECT name, city FROM customers WHERE email IS NULL;",
                    solutionExplanation: "Replacing `= NULL` with `IS NULL` correctly returns Tanvir Ahmed and Shakil Ahmed.",
                    hints: [
                        {
                            level: 1,
                            text: "Replace `= NULL` with `IS NULL`."
                        }
                    ],
                    validation: {
                        targetTable: "customers",
                        requiredColumns: [
                            "name",
                            "city"
                        ],
                        requireWhere: true,
                        whereContainsTerms: [
                            "email",
                            "IS",
                            "NULL"
                        ],
                        expectedRowCount: 2
                    },
                    successMessage: "Spot on! You fixed the classic three-valued logic = NULL gotcha."
                }
            ]
        }
    ],
    // ===========================================================================
    // DAY 3 HOMEWORK / INDEPENDENT CHALLENGES
    // ===========================================================================
    challenge: {
        id: "day-03-homework",
        title: "Day 3 — Specialized Filtering (Homework)",
        scenario: "Apply specialized filtering techniques across our production inventory and customer tables:",
        tasks: [
            {
                id: "day03-hw-1",
                title: "Task 1: Mid-tier products ($25 to $100)",
                description: "Find products priced between $25.00 and $100.00 using BETWEEN.",
                instructions: [
                    "Select `name` and `price` from `products`.",
                    "Filter where `price BETWEEN 25.00 AND 100.00`.",
                    "End with a semicolon (;)."
                ],
                type: "challenge",
                primaryTable: "products",
                initialSql: "-- Task 1: Products priced between $25 and $100 (BETWEEN)\n",
                solutionSql: "SELECT name, price FROM products WHERE price BETWEEN 25.00 AND 100.00;",
                solutionExplanation: "Retrieves all products in the $25 to $100 price range.",
                hints: [
                    {
                        level: 1,
                        text: "Use `WHERE price BETWEEN 25.00 AND 100.00;`"
                    }
                ],
                validation: {
                    targetTable: "products",
                    requiredColumns: [
                        "name",
                        "price"
                    ],
                    requireWhere: true,
                    whereContainsTerms: [
                        "BETWEEN",
                        "25",
                        "100"
                    ],
                    expectedRowCount: 10
                },
                successMessage: "Task 1 completed! Mid-tier catalog products retrieved."
            },
            {
                id: "day03-hw-2",
                title: "Task 2: Customers in Regional Hubs (IN)",
                description: "Find customers located in Dhaka, Chittagong, or Sylhet using IN.",
                instructions: [
                    "Select `name`, `email`, and `city` from `customers`.",
                    "Filter where `city IN ('Dhaka', 'Chittagong', 'Sylhet')`.",
                    "End with a semicolon (;)."
                ],
                type: "challenge",
                primaryTable: "customers",
                initialSql: "-- Task 2: Customers in Dhaka, Chittagong, or Sylhet (IN)\n",
                solutionSql: "SELECT name, email, city FROM customers WHERE city IN ('Dhaka', 'Chittagong', 'Sylhet');",
                solutionExplanation: "Returns customers in Dhaka, Chittagong, and Sylhet.",
                hints: [
                    {
                        level: 1,
                        text: "Write `WHERE city IN ('Dhaka', 'Chittagong', 'Sylhet');`"
                    }
                ],
                validation: {
                    targetTable: "customers",
                    requiredColumns: [
                        "name",
                        "email",
                        "city"
                    ],
                    requireWhere: true,
                    whereContainsTerms: [
                        "city",
                        "IN",
                        "Dhaka",
                        "Chittagong",
                        "Sylhet"
                    ],
                    expectedRowCount: 11
                },
                successMessage: "Task 2 completed! Multi-city customer audience selected."
            },
            {
                id: "day03-hw-3",
                title: "Task 3: Wireless Products Search (LIKE)",
                description: 'Find all products whose name starts with "Wireless" using the LIKE operator.',
                instructions: [
                    "Select `name`, `price`, and `quantity_in_stock` from `products`.",
                    "Filter where `name LIKE 'Wireless%'`.",
                    "End with a semicolon (;)."
                ],
                type: "challenge",
                primaryTable: "products",
                initialSql: "-- Task 3: Products starting with Wireless (LIKE)\n",
                solutionSql: "SELECT name, price, quantity_in_stock FROM products WHERE name LIKE 'Wireless%';",
                solutionExplanation: "Matches Wireless Mouse, Wireless Doorbell, and Wireless Earbuds.",
                hints: [
                    {
                        level: 1,
                        text: "Use `WHERE name LIKE 'Wireless%';`"
                    }
                ],
                validation: {
                    targetTable: "products",
                    requiredColumns: [
                        "name",
                        "price",
                        "quantity_in_stock"
                    ],
                    requireWhere: true,
                    whereContainsTerms: [
                        "LIKE",
                        "Wireless%"
                    ],
                    expectedRowCount: 3
                },
                successMessage: "Task 3 completed! Wireless product family retrieved."
            },
            {
                id: "day03-hw-4",
                title: "Task 4: Customers with Missing Emails (IS NULL)",
                description: "Find customers that do not have an email address recorded.",
                instructions: [
                    "Select `name`, `city` from `customers`.",
                    "Filter where `email IS NULL`.",
                    "End with a semicolon (;)."
                ],
                type: "challenge",
                primaryTable: "customers",
                initialSql: "-- Task 4: Customers missing email (IS NULL)\n",
                solutionSql: "SELECT name, city FROM customers WHERE email IS NULL;",
                solutionExplanation: "Identifies customers without recorded email (Tanvir Ahmed, Shakil Ahmed).",
                hints: [
                    {
                        level: 1,
                        text: "Use `WHERE email IS NULL;`"
                    }
                ],
                validation: {
                    targetTable: "customers",
                    requiredColumns: [
                        "name",
                        "city"
                    ],
                    requireWhere: true,
                    whereContainsTerms: [
                        "email",
                        "IS",
                        "NULL"
                    ],
                    expectedRowCount: 2
                },
                successMessage: "Task 4 completed! Customer missing contact details flagged."
            },
            {
                id: "day03-hw-5",
                title: "Task 5: Compound Filter with Parentheses",
                description: "Find products in categories 1 or 5 priced under $50 that are currently in stock (quantity_in_stock > 0).",
                instructions: [
                    "Select `name`, `category_id`, `price`, and `quantity_in_stock` from `products`.",
                    "Filter where `(category_id = 1 OR category_id = 5) AND price < 50 AND quantity_in_stock > 0`.",
                    "End with a semicolon (;)."
                ],
                type: "challenge",
                primaryTable: "products",
                initialSql: "-- Task 5: In-stock Electronics or Home under $50\n",
                solutionSql: "SELECT name, category_id, price, quantity_in_stock FROM products WHERE (category_id = 1 OR category_id = 5) AND price < 50 AND quantity_in_stock > 0;",
                solutionExplanation: "Returns all in-stock products in categories 1 and 5 priced under $50.",
                hints: [
                    {
                        level: 1,
                        text: "Wrap categories in parentheses: `(category_id = 1 OR category_id = 5) AND price < 50 AND quantity_in_stock > 0;`"
                    }
                ],
                validation: {
                    targetTable: "products",
                    requiredColumns: [
                        "name",
                        "category_id",
                        "price",
                        "quantity_in_stock"
                    ],
                    requireWhere: true,
                    whereContainsTerms: [
                        "category_id",
                        "1",
                        "OR",
                        "5",
                        "AND",
                        "price",
                        "50",
                        "quantity_in_stock"
                    ],
                    expectedRowCount: 10
                },
                successMessage: "Task 5 completed! You mastered multi-clause compound query filters."
            }
        ]
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/content/modules/day04to08.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DAY_04_MODULE",
    ()=>DAY_04_MODULE,
    "DAY_05_MODULE",
    ()=>DAY_05_MODULE,
    "DAY_06_MODULE",
    ()=>DAY_06_MODULE,
    "DAY_07_MODULE",
    ()=>DAY_07_MODULE,
    "DAY_08_MODULE",
    ()=>DAY_08_MODULE
]);
const DAY_04_MODULE = {
    id: 'day-04',
    slug: 'result-shaping',
    day: 4,
    title: 'Day 4 — Result Shaping',
    shortTitle: 'Result Shaping',
    type: 'module',
    milestoneId: 'milestone-1',
    description: 'Shape and organize output rows using DISTINCT to eliminate duplicates, ORDER BY for ascending and descending sorts, and LIMIT with OFFSET for pagination.',
    estimatedMinutes: 45,
    completionLearnings: [
        'Sort output records alphabetically, numerically, and chronologically with ORDER BY (ASC and DESC)',
        'Eliminate duplicate values from result sets using DISTINCT',
        'Cap output record counts using LIMIT',
        'Skip preceding rows for pagination using OFFSET'
    ],
    concepts: [
        // =========================================================================
        // CONCEPT 1a: Single-Column Sorting with ORDER BY (ASC & DESC)
        // =========================================================================
        {
            id: 'order-by-single-column',
            order: 1,
            title: '1. Single-Column Sorting (ASC & DESC)',
            shortDescription: 'Sort query results by a single column in ascending or descending order.',
            theory: {
                summary: 'Without an ORDER BY clause, relational databases return rows in arbitrary storage order. ORDER BY allows you to sort records explicitly.',
                introTable: {
                    tableName: 'products',
                    description: 'Inventory items with price and stock levels.',
                    columns: [
                        'product_id',
                        'name',
                        'price',
                        'quantity_in_stock'
                    ],
                    rows: [
                        [
                            1,
                            'Wireless Mouse',
                            15.99,
                            40
                        ],
                        [
                            2,
                            'Bluetooth Speaker',
                            45.50,
                            3
                        ],
                        [
                            3,
                            'USB-C Charging Cable',
                            9.99,
                            0
                        ],
                        [
                            4,
                            'Mechanical Keyboard',
                            65.00,
                            12
                        ],
                        [
                            14,
                            'Office Chair',
                            120.00,
                            5
                        ]
                    ]
                },
                explanation: [
                    '### 1. Ascending vs Descending Order',
                    '`ORDER BY price ASC` sorts from lowest to highest (`ASC` is the default direction).',
                    '`ORDER BY price DESC` sorts from highest to lowest (useful for "top expensive" or "newest").',
                    'ORDER BY is always placed at the end of single-table queries after any WHERE conditions.'
                ],
                targetQuery: {
                    sql: 'SELECT name, price\nFROM products\nORDER BY price DESC;',
                    explanation: 'Sort all products by price starting from the highest price down to the lowest.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: FROM products (Unordered rows)',
                        sqlSnippet: 'FROM products',
                        explanation: 'SQL reads the products table in storage order.',
                        tableData: {
                            tableName: 'products (Source Rows)',
                            columns: [
                                'product_id',
                                'name',
                                'price'
                            ],
                            rows: [
                                [
                                    1,
                                    'Wireless Mouse',
                                    15.99
                                ],
                                [
                                    2,
                                    'Bluetooth Speaker',
                                    45.50
                                ],
                                [
                                    4,
                                    'Mechanical Keyboard',
                                    65.00
                                ],
                                [
                                    14,
                                    'Office Chair',
                                    120.00
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: 'Step 2: ORDER BY price DESC (Sort highest first)',
                        sqlSnippet: 'ORDER BY price DESC',
                        explanation: 'SQL arranges all rows starting from highest price ($120.00) down to lowest ($15.99).',
                        tableData: {
                            tableName: 'Final Sorted Result',
                            columns: [
                                'name',
                                'price'
                            ],
                            highlightedColumns: [
                                'price'
                            ],
                            highlightedRows: [
                                0,
                                1,
                                2,
                                3
                            ],
                            rows: [
                                [
                                    'Office Chair',
                                    120.00
                                ],
                                [
                                    'Mechanical Keyboard',
                                    65.00
                                ],
                                [
                                    'Bluetooth Speaker',
                                    45.50
                                ],
                                [
                                    'Wireless Mouse',
                                    15.99
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'Sorting descending by price',
                        sql: 'SELECT name, price\nFROM products\nORDER BY price DESC;',
                        description: 'Sorts output in descending order by price.'
                    },
                    {
                        title: 'Ascending alphabetical sort',
                        sql: 'SELECT name, city\nFROM customers\nORDER BY name ASC;',
                        description: 'Sorts names alphabetically from A to Z.'
                    }
                ],
                keyTakeaway: 'Use ORDER BY column ASC for lowest-to-highest and ORDER BY column DESC for highest-to-lowest.',
                exampleQuery: 'SELECT name, price FROM products ORDER BY price DESC;',
                exampleQueryExplanation: 'Sorts products by price highest first.',
                liveDemoSql: 'SELECT name, price FROM products ORDER BY price DESC LIMIT 5;',
                liveDemoNotes: 'Displays top 5 most expensive products.',
                mcqs: [
                    {
                        question: 'What is the default sort direction if neither ASC nor DESC is specified?',
                        options: [
                            'A. Descending (DESC)',
                            'B. Ascending (ASC)',
                            'C. Random order',
                            'D. Insertion order'
                        ],
                        correctIndex: 1,
                        explanation: 'In SQL, ASC (ascending) is the default sort order.'
                    }
                ],
                masteryPoints: [
                    'Use ORDER BY with ASC and DESC',
                    'Sort by numbers, dates, and text'
                ]
            },
            tasks: [
                {
                    id: 'day04-c1a-t1',
                    title: 'Task 1: Sort Products by Price Descending',
                    description: 'Sort all products by price starting with the highest price.',
                    instructions: [
                        'Select `name` and `price` from `products`.',
                        'Order by `price DESC`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'products',
                    initialSql: '-- Write your SQL query here\n',
                    solutionSql: 'SELECT name, price FROM products ORDER BY price DESC;',
                    solutionExplanation: '`ORDER BY price DESC` sorts output from highest price to lowest.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `ORDER BY price DESC;`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requiredColumns: [
                            'name',
                            'price'
                        ],
                        requireOrderBy: [
                            {
                                column: 'price',
                                direction: 'DESC'
                            }
                        ],
                        expectedRowCount: 28
                    },
                    successMessage: 'Products sorted by price descending!'
                },
                {
                    id: 'day04-c1a-t2',
                    title: 'Task 2: Customers Alphabetical Directory',
                    description: 'Show customer name and city, sorted alphabetically by name from A to Z.',
                    instructions: [
                        'Query the `customers` table.',
                        'Select `name` and `city`.',
                        'Order by `name ASC`.'
                    ],
                    type: 'independent',
                    primaryTable: 'customers',
                    initialSql: '-- Write your SQL query here\n',
                    solutionSql: 'SELECT name, city FROM customers ORDER BY name ASC;',
                    solutionExplanation: '`ORDER BY name ASC` lists customers from A to Z.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `ORDER BY name ASC;`'
                        }
                    ],
                    validation: {
                        targetTable: 'customers',
                        requiredColumns: [
                            'name',
                            'city'
                        ],
                        requireOrderBy: [
                            {
                                column: 'name',
                                direction: 'ASC'
                            }
                        ],
                        expectedRowCount: 15
                    },
                    successMessage: 'Perfect! Customer directory sorted alphabetically.'
                }
            ]
        },
        // =========================================================================
        // CONCEPT 1b: Multi-Column Sorting (Tie-Breaking)
        // =========================================================================
        {
            id: 'order-by-multi-column',
            order: 2,
            title: '2. Multi-Column Sorting (Tie-Breaking)',
            shortDescription: 'How to use secondary sort columns to resolve identical values.',
            theory: {
                summary: 'When multiple rows share the same value in the primary sort column, secondary sort columns resolve ties.',
                introTable: {
                    tableName: 'students',
                    description: 'Students table with shared ages',
                    columns: [
                        'id',
                        'name',
                        'age',
                        'department'
                    ],
                    rows: [
                        [
                            1,
                            'Rahim',
                            21,
                            'CSE'
                        ],
                        [
                            2,
                            'Karim',
                            22,
                            'EEE'
                        ],
                        [
                            3,
                            'Ayesha',
                            20,
                            'CSE'
                        ],
                        [
                            4,
                            'Sumaiya',
                            23,
                            'BBA'
                        ],
                        [
                            5,
                            'Tanvir',
                            21,
                            'CSE'
                        ]
                    ]
                },
                explanation: [
                    '### 1. Why Secondary Columns Matter',
                    'Notice that both Rahim and Tanvir are age 21. If we sort only by `age ASC`, SQL puts them in an arbitrary tie order.',
                    '### 2. Resolving Ties with Comma Separation',
                    'Adding a second column tells SQL: *"Sort by age first; whenever two students have the same age, sort them alphabetically by name"*:\n`ORDER BY age ASC, name ASC;`',
                    '### 3. Independent Directions per Column',
                    'Each column can have its own sort direction: `ORDER BY category_id ASC, price DESC` groups categories from 1 to 5, and shows the most expensive products first within each category.'
                ],
                targetQuery: {
                    sql: "SELECT name, age\nFROM students\nORDER BY age ASC, name ASC;",
                    explanation: "Sort students youngest first; when ages match, sort alphabetically by name.",
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: Primary Sort on age ASC',
                        sqlSnippet: 'ORDER BY age ASC',
                        explanation: 'Students ordered by age: Ayesha (20), then age 21 tie, Karim (22), Sumaiya (23).',
                        tableData: {
                            tableName: 'Primary Sort (Age Groups)',
                            columns: [
                                'name',
                                'age'
                            ],
                            rows: [
                                [
                                    'Ayesha',
                                    20
                                ],
                                [
                                    'Rahim',
                                    21
                                ],
                                [
                                    'Tanvir',
                                    21
                                ],
                                [
                                    'Karim',
                                    22
                                ],
                                [
                                    'Sumaiya',
                                    23
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: 'Step 2: Secondary Tiebreaker on name ASC',
                        sqlSnippet: 'ORDER BY age ASC, name ASC',
                        explanation: 'On the age 21 tie, Rahim (R) precedes Tanvir (T) alphabetically.',
                        tableData: {
                            tableName: 'Final Tiebroken Result',
                            columns: [
                                'name',
                                'age'
                            ],
                            highlightedColumns: [
                                'name',
                                'age'
                            ],
                            highlightedRows: [
                                1,
                                2
                            ],
                            rows: [
                                [
                                    'Ayesha',
                                    20
                                ],
                                [
                                    'Rahim',
                                    21
                                ],
                                [
                                    'Tanvir',
                                    21
                                ],
                                [
                                    'Karim',
                                    22
                                ],
                                [
                                    'Sumaiya',
                                    23
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'Multi-column sort syntax',
                        sql: 'SELECT name, category_id, price\nFROM products\nORDER BY category_id ASC, price DESC;',
                        description: 'Groups by category ascending, then sorts price descending within each category.'
                    }
                ],
                keyTakeaway: 'In ORDER BY col1, col2, col2 acts as a tiebreaker whenever col1 values are identical.',
                exampleQuery: 'SELECT name, age FROM students ORDER BY age ASC, name ASC;',
                exampleQueryExplanation: 'Sorts by age youngest first, breaking ties alphabetically.',
                liveDemoSql: 'SELECT name, category_id, price FROM products ORDER BY category_id ASC, price DESC LIMIT 6;',
                liveDemoNotes: 'Displays categories in order with highest priced items first.',
                mcqs: [
                    {
                        question: 'In `ORDER BY category_id ASC, price DESC`, which column resolves ties when two products have the same category_id?',
                        options: [
                            'A. category_id',
                            'B. price',
                            'C. product_id',
                            'D. name'
                        ],
                        correctIndex: 1,
                        explanation: 'The secondary column (`price`) acts as the tiebreaker when primary `category_id` values match.'
                    }
                ],
                masteryPoints: [
                    'Use comma-separated column lists in ORDER BY',
                    'Specify distinct ASC/DESC directions for each column'
                ]
            },
            tasks: [
                {
                    id: 'day04-c1b-t1',
                    title: 'Task 1: Students Sorted by Age and Name',
                    description: 'Show student name and age, sorted youngest first (age ASC), and alphabetically by name (name ASC) for any age ties.',
                    instructions: [
                        'Select `name` and `age` from `students`.',
                        'Order by `age ASC, name ASC`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'students',
                    initialSql: '-- Sort by age then name\n',
                    solutionSql: 'SELECT name, age FROM students ORDER BY age ASC, name ASC;',
                    solutionExplanation: '`ORDER BY age ASC, name ASC` sorts youngest first and alphabetically breaks ties (Rahim before Tanvir).',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `ORDER BY age ASC, name ASC;`'
                        }
                    ],
                    validation: {
                        targetTable: 'students',
                        requiredColumns: [
                            'name',
                            'age'
                        ],
                        requireOrderBy: [
                            {
                                column: 'age',
                                direction: 'ASC'
                            },
                            {
                                column: 'name',
                                direction: 'ASC'
                            }
                        ],
                        expectedRowCount: 5
                    },
                    successMessage: 'Great job! You resolved sorting ties with multi-column ORDER BY.'
                },
                {
                    id: 'day04-c1b-t2',
                    title: 'Task 2: Products by Category and Price',
                    description: 'Show name, category_id, and price from products, sorted by category_id ascending, and price descending within each category.',
                    instructions: [
                        'Query the `products` table.',
                        'Select `name`, `category_id`, and `price`.',
                        'Order by `category_id ASC, price DESC`.'
                    ],
                    type: 'independent',
                    primaryTable: 'products',
                    initialSql: '-- Sort by category then price descending\n',
                    solutionSql: 'SELECT name, category_id, price FROM products ORDER BY category_id ASC, price DESC;',
                    solutionExplanation: '`ORDER BY category_id ASC, price DESC` organizes products by category with highest price items first.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `ORDER BY category_id ASC, price DESC;`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requiredColumns: [
                            'name',
                            'category_id',
                            'price'
                        ],
                        requireOrderBy: [
                            {
                                column: 'category_id',
                                direction: 'ASC'
                            },
                            {
                                column: 'price',
                                direction: 'DESC'
                            }
                        ],
                        expectedRowCount: 28
                    },
                    successMessage: 'Well done! You applied multi-column sorting with mixed directions.'
                }
            ]
        },
        // =========================================================================
        // CONCEPT 2: Deduplication with DISTINCT
        // =========================================================================
        {
            id: 'distinct-deduplication',
            order: 3,
            title: '3. Deduplication with DISTINCT',
            shortDescription: 'Eliminate duplicate rows to discover unique values.',
            theory: {
                summary: 'When multiple rows contain the same value in a column (e.g. several customers residing in "Dhaka"), `DISTINCT` collapses duplicates into a single unique list.',
                introTable: {
                    tableName: 'customers',
                    description: 'Customer list with overlapping cities.',
                    columns: [
                        'customer_id',
                        'name',
                        'city'
                    ],
                    rows: [
                        [
                            1,
                            'Rafiul Islam',
                            'Dhaka'
                        ],
                        [
                            2,
                            'Priya Akter',
                            'Dhaka'
                        ],
                        [
                            3,
                            'Tanvir Ahmed',
                            'Chittagong'
                        ],
                        [
                            4,
                            'Nusrat Jahan',
                            'Chittagong'
                        ],
                        [
                            5,
                            'Kamal Hossain',
                            'Sylhet'
                        ]
                    ]
                },
                explanation: [
                    '### 1. Finding Unique Values',
                    '`SELECT DISTINCT city FROM customers;` examines all rows and discards duplicate values so each city appears only once.',
                    'Notice: DISTINCT is purely for row deduplication — it does not calculate totals or summaries.'
                ],
                targetQuery: {
                    sql: 'SELECT DISTINCT city\nFROM customers;',
                    explanation: 'Find all unique cities where customers live, discarding duplicate entries.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: FROM customers (Raw column values with duplicates)',
                        sqlSnippet: 'FROM customers',
                        explanation: 'SQL scans the city column for all customers.',
                        tableData: {
                            tableName: 'customers (Raw Cities)',
                            columns: [
                                'name',
                                'city'
                            ],
                            rows: [
                                [
                                    'Rafiul Islam',
                                    'Dhaka'
                                ],
                                [
                                    'Priya Akter',
                                    'Dhaka'
                                ],
                                [
                                    'Tanvir Ahmed',
                                    'Chittagong'
                                ],
                                [
                                    'Nusrat Jahan',
                                    'Chittagong'
                                ],
                                [
                                    'Kamal Hossain',
                                    'Sylhet'
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: 'Step 2: SELECT DISTINCT city (Collapse duplicates)',
                        sqlSnippet: 'SELECT DISTINCT city',
                        explanation: 'Duplicates of Dhaka and Chittagong are removed, producing unique city names.',
                        tableData: {
                            tableName: 'Final Unique Cities',
                            columns: [
                                'city'
                            ],
                            highlightedColumns: [
                                'city'
                            ],
                            highlightedRows: [
                                0,
                                1,
                                2
                            ],
                            rows: [
                                [
                                    'Dhaka'
                                ],
                                [
                                    'Chittagong'
                                ],
                                [
                                    'Sylhet'
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'Deduplicating rows with DISTINCT',
                        sql: 'SELECT DISTINCT column_name\nFROM table_name;',
                        description: 'Returns only unique values in the specified column.'
                    }
                ],
                keyTakeaway: 'DISTINCT removes duplicate output rows across the selected columns.',
                exampleQuery: 'SELECT DISTINCT city FROM customers;',
                exampleQueryExplanation: 'Lists every unique city where customers live.',
                liveDemoSql: 'SELECT DISTINCT city FROM customers ORDER BY city ASC;',
                liveDemoNotes: 'Returns alphabetical list of unique cities.',
                mcqs: [
                    {
                        question: 'Where must the DISTINCT keyword be placed in a SQL query?',
                        options: [
                            'A. At the very end after WHERE',
                            'B. Immediately following SELECT before column names',
                            'C. Inside the FROM clause',
                            'D. Before the database name'
                        ],
                        correctIndex: 1,
                        explanation: 'DISTINCT is written right after SELECT (e.g. `SELECT DISTINCT column FROM table`).'
                    }
                ],
                masteryPoints: [
                    'Use DISTINCT to extract unique categories and locations'
                ]
            },
            tasks: [
                {
                    id: 'day04-c2-t1',
                    title: 'Task 1: Distinct Customer Cities',
                    description: 'Get a unique list of all cities where customers are based.',
                    instructions: [
                        'Select `DISTINCT city` from `customers`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'customers',
                    initialSql: '-- Write your SQL query here\n',
                    solutionSql: 'SELECT DISTINCT city FROM customers;',
                    solutionExplanation: '`SELECT DISTINCT city FROM customers;` returns each city name once.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `SELECT DISTINCT city FROM customers;`'
                        }
                    ],
                    validation: {
                        targetTable: 'customers',
                        requiredColumns: [
                            'city'
                        ],
                        requireDistinct: true,
                        expectedRowCount: 6
                    },
                    successMessage: 'Distinct cities listed!'
                },
                {
                    id: 'day04-c2-t2',
                    title: 'Task 2: Distinct Product Categories',
                    description: 'Show a unique list of all category_id values present in the products table.',
                    instructions: [
                        'Query the `products` table.',
                        'Select `DISTINCT category_id`.'
                    ],
                    type: 'independent',
                    primaryTable: 'products',
                    initialSql: '-- Write your SQL query here\n',
                    solutionSql: 'SELECT DISTINCT category_id FROM products;',
                    solutionExplanation: 'Returns unique category IDs (1, 2, 3, 4, 5, and null).',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `SELECT DISTINCT category_id FROM products;`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requiredColumns: [
                            'category_id'
                        ],
                        requireDistinct: true,
                        expectedRowCount: 6
                    },
                    successMessage: 'Perfect! Unique categories identified.'
                }
            ]
        },
        // =========================================================================
        // CONCEPT 3: Pagination with LIMIT and OFFSET
        // =========================================================================
        {
            id: 'limit-and-offset',
            order: 4,
            title: '4. Pagination with LIMIT & OFFSET',
            shortDescription: 'Restrict row counts and skip rows for multi-page displays.',
            theory: {
                summary: 'Web applications rarely display thousands of records at once. `LIMIT` restricts how many rows to return, and `OFFSET` skips a specified number of rows before returning results.',
                introTable: {
                    tableName: 'products',
                    description: 'Product catalog rows 1 through 6',
                    columns: [
                        'product_id',
                        'name',
                        'price'
                    ],
                    rows: [
                        [
                            1,
                            'Wireless Mouse',
                            15.99
                        ],
                        [
                            2,
                            'Bluetooth Speaker',
                            45.50
                        ],
                        [
                            3,
                            'USB-C Charging Cable',
                            9.99
                        ],
                        [
                            4,
                            'Mechanical Keyboard',
                            65.00
                        ],
                        [
                            14,
                            'Office Chair',
                            120.00
                        ],
                        [
                            15,
                            'Filing Cabinet',
                            89.99
                        ]
                    ]
                },
                explanation: [
                    '### 1. LIMIT and OFFSET Syntax',
                    '`LIMIT 5` returns at most 5 rows.',
                    '`LIMIT 10 OFFSET 10` returns 10 rows starting from row 11 (Page 2).',
                    'Pagination Formula: Page $N$ with size $S$ is `LIMIT S OFFSET (N - 1) * S`.'
                ],
                targetQuery: {
                    sql: 'SELECT name, price\nFROM products\nORDER BY price DESC\nLIMIT 3 OFFSET 0;',
                    explanation: 'Retrieve the top 3 most expensive products (Page 1).',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: FROM products ORDER BY price DESC (Full sorted list)',
                        sqlSnippet: 'FROM products ORDER BY price DESC',
                        explanation: 'SQL sorts the catalog highest price first.',
                        tableData: {
                            tableName: 'Sorted Catalog',
                            columns: [
                                'name',
                                'price'
                            ],
                            rows: [
                                [
                                    'Office Chair',
                                    120.00
                                ],
                                [
                                    'Filing Cabinet',
                                    89.99
                                ],
                                [
                                    'Mechanical Keyboard',
                                    65.00
                                ],
                                [
                                    'Bluetooth Speaker',
                                    45.50
                                ],
                                [
                                    'Wireless Mouse',
                                    15.99
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: 'Step 2: LIMIT 3 OFFSET 0 (Slice Page 1)',
                        sqlSnippet: 'LIMIT 3 OFFSET 0',
                        explanation: 'Slices the first 3 most expensive products.',
                        tableData: {
                            tableName: 'Page 1 (Top 3 Items)',
                            columns: [
                                'name',
                                'price'
                            ],
                            highlightedColumns: [
                                'name',
                                'price'
                            ],
                            highlightedRows: [
                                0,
                                1,
                                2
                            ],
                            rows: [
                                [
                                    'Office Chair',
                                    120.00
                                ],
                                [
                                    'Filing Cabinet',
                                    89.99
                                ],
                                [
                                    'Mechanical Keyboard',
                                    65.00
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'Slicing and paginating results',
                        sql: 'SELECT * FROM products ORDER BY price DESC LIMIT 5 OFFSET 0;\nSELECT * FROM products ORDER BY price DESC LIMIT 5 OFFSET 5;',
                        description: 'Page 1 and Page 2 with 5 items per page.'
                    }
                ],
                keyTakeaway: 'LIMIT controls batch size; OFFSET specifies how many rows to skip.',
                exampleQuery: 'SELECT name, quantity_in_stock FROM products ORDER BY quantity_in_stock ASC LIMIT 5;',
                exampleQueryExplanation: 'Returns the 5 lowest stock items.',
                liveDemoSql: 'SELECT name, quantity_in_stock FROM products ORDER BY quantity_in_stock ASC LIMIT 5;',
                liveDemoNotes: 'Displays lowest-stock products.',
                mcqs: [
                    {
                        question: 'How do you query Page 3 of a table with 10 records per page?',
                        options: [
                            'A. LIMIT 10 OFFSET 30',
                            'B. LIMIT 10 OFFSET 20',
                            'C. OFFSET 10 LIMIT 3',
                            'D. LIMIT 30 OFFSET 10'
                        ],
                        correctIndex: 1,
                        explanation: 'Page 3 skips 20 rows (2 * 10) and takes 10: `LIMIT 10 OFFSET 20`.'
                    }
                ],
                masteryPoints: [
                    'Use LIMIT to cap result sizes',
                    'Use OFFSET for pagination'
                ]
            },
            tasks: [
                {
                    id: 'day04-c3-t1',
                    title: 'Task 1: Top 5 Lowest Stock Products',
                    description: 'Find the 5 products with the lowest stock quantities.',
                    instructions: [
                        'Select `name` and `quantity_in_stock` from `products`.',
                        'Order by `quantity_in_stock ASC` with `LIMIT 5`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'products',
                    initialSql: '-- Write your SQL query here\n',
                    solutionSql: 'SELECT name, quantity_in_stock FROM products ORDER BY quantity_in_stock ASC LIMIT 5;',
                    solutionExplanation: 'Sorts ascending by stock count and limits to the top 5.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `ORDER BY quantity_in_stock ASC LIMIT 5;`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requiredColumns: [
                            'name',
                            'quantity_in_stock'
                        ],
                        requireOrderBy: [
                            {
                                column: 'quantity_in_stock',
                                direction: 'ASC'
                            }
                        ],
                        requireLimit: 5,
                        expectedRowCount: 5
                    },
                    successMessage: 'Lowest stock products identified!'
                },
                {
                    id: 'day04-c3-t2',
                    title: 'Task 2: Page 2 of Customers (5 per page)',
                    description: 'Fetch page 2 of customer records (5 per page), sorted by customer_id ascending.',
                    instructions: [
                        'Query the `customers` table.',
                        'Select `customer_id`, `name`, and `city`.',
                        'Order by `customer_id ASC` with `LIMIT 5 OFFSET 5`.'
                    ],
                    type: 'independent',
                    primaryTable: 'customers',
                    initialSql: '-- Fetch Page 2 of customers (LIMIT 5 OFFSET 5)\n',
                    solutionSql: 'SELECT customer_id, name, city FROM customers ORDER BY customer_id ASC LIMIT 5 OFFSET 5;',
                    solutionExplanation: 'Skips the first 5 customers and returns customers 6 through 10.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `ORDER BY customer_id ASC LIMIT 5 OFFSET 5;`'
                        }
                    ],
                    validation: {
                        targetTable: 'customers',
                        requiredColumns: [
                            'customer_id',
                            'name',
                            'city'
                        ],
                        requireOrderBy: [
                            {
                                column: 'customer_id',
                                direction: 'ASC'
                            }
                        ],
                        requireLimit: 5,
                        requireOffset: 5,
                        expectedRowCount: 5
                    },
                    successMessage: 'Spot on! You paginated to Page 2 of customers.'
                }
            ]
        }
    ],
    // ===========================================================================
    // DAY 4 CHALLENGE (MASTER CURRICULUM ASSIGNMENT)
    // ===========================================================================
    challenge: {
        id: 'day-04-homework',
        title: 'Day 4 — Result Shaping (Homework)',
        scenario: 'Apply sorting, deduplication, and row slicing to real inventory queries:',
        tasks: [
            {
                id: 'day04-hw-1',
                title: 'Task 1: Products sorted by price, highest first',
                description: 'Products sorted by price, highest first.',
                instructions: [
                    'Select from `products` and sort by `price DESC`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'products',
                initialSql: '-- Task 1: Products sorted by price, highest first\n',
                solutionSql: 'SELECT * FROM products ORDER BY price DESC;',
                solutionExplanation: '`ORDER BY price DESC` sorts all products starting with the highest price.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `SELECT * FROM products ORDER BY price DESC;`'
                    }
                ],
                validation: {
                    targetTable: 'products',
                    requireOrderBy: [
                        {
                            column: 'price',
                            direction: 'DESC'
                        }
                    ],
                    expectedRowCount: 28
                },
                successMessage: 'Task 1 completed! Products sorted highest first.'
            },
            {
                id: 'day04-hw-2',
                title: 'Task 2: Distinct list of cities customers are based in',
                description: 'Distinct list of cities customers are based in.',
                instructions: [
                    'Select `DISTINCT city` from `customers`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'customers',
                initialSql: '-- Task 2: Distinct list of cities customers are based in\n',
                solutionSql: 'SELECT DISTINCT city FROM customers;',
                solutionExplanation: '`DISTINCT city` eliminates duplicate city names.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `SELECT DISTINCT city FROM customers;`'
                    }
                ],
                validation: {
                    targetTable: 'customers',
                    requiredColumns: [
                        'city'
                    ],
                    requireDistinct: true,
                    expectedRowCount: 6
                },
                successMessage: 'Task 2 completed! Distinct cities listed.'
            },
            {
                id: 'day04-hw-3',
                title: 'Task 3: The 5 lowest-stock products',
                description: 'The 5 lowest-stock products (ORDER BY + LIMIT).',
                instructions: [
                    'Select from `products` ordered by `quantity_in_stock ASC` with `LIMIT 5`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'products',
                initialSql: '-- Task 3: The 5 lowest-stock products\n',
                solutionSql: 'SELECT * FROM products ORDER BY quantity_in_stock ASC LIMIT 5;',
                solutionExplanation: '`ORDER BY quantity_in_stock ASC LIMIT 5` returns the 5 lowest stock items.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `ORDER BY quantity_in_stock ASC LIMIT 5;`'
                    }
                ],
                validation: {
                    targetTable: 'products',
                    requireOrderBy: [
                        {
                            column: 'quantity_in_stock',
                            direction: 'ASC'
                        }
                    ],
                    requireLimit: 5,
                    expectedRowCount: 5
                },
                successMessage: 'Task 3 completed! 5 lowest-stock products retrieved.'
            }
        ]
    }
};
const DAY_05_MODULE = {
    id: 'day-05',
    slug: 'practice-retrieval-filtering-shaping',
    day: 5,
    title: 'Day 5 — Guided Practice: Retrieval, Filtering & Shaping',
    shortTitle: 'Practice: Single-Table Pipelines',
    type: 'practice_day',
    milestoneId: 'milestone-1',
    description: 'Consolidate single-table query construction by combining condition filtering, multi-column sorting, and pagination across inventory and customer operational pipelines.',
    estimatedMinutes: 60,
    completionLearnings: [
        'Assemble complete single-table operational pipelines (SELECT ... FROM ... WHERE ... ORDER BY ... LIMIT ... OFFSET)',
        'Filter inventory with thresholds like quantity_in_stock = 0 and <= reorder_level',
        'Paginate multi-page catalog datasets using LIMIT and OFFSET calculations',
        'Filter null-safe records and sort chronologically with LIMIT'
    ],
    concepts: [
        {
            id: 'day-05-pipelines',
            order: 1,
            title: '1. Assembling Full Single-Table Query Pipelines',
            shortDescription: 'From isolated keywords to complete operational pipelines.',
            theory: {
                summary: 'In real applications, you do not write isolated clauses. You construct unified query pipelines that filter records on multiple business conditions, sort by priority, and paginate for UI displays.',
                introTable: {
                    tableName: 'products',
                    description: 'Full inventory snapshot for operations dashboard',
                    columns: [
                        'product_id',
                        'name',
                        'price',
                        'quantity_in_stock',
                        'reorder_level'
                    ],
                    rows: [
                        [
                            1,
                            'Wireless Mouse',
                            25.00,
                            42,
                            10
                        ],
                        [
                            9,
                            'Wireless Charging Pad',
                            19.99,
                            0,
                            15
                        ],
                        [
                            15,
                            'Steel Cable Management Tray',
                            22.00,
                            2,
                            8
                        ],
                        [
                            20,
                            'Steel Frame Footrest',
                            45.00,
                            0,
                            5
                        ]
                    ]
                },
                explanation: [
                    '### 1. The Anatomy of an Operational Pipeline',
                    'Every complete single-table query follows a predictable pipeline flow:',
                    '1. `SELECT [columns]` — Choose only the fields you need.',
                    '2. `FROM [table]` — Identify the source table.',
                    '3. `WHERE [conditions]` — Filter rows based on business rules.',
                    '4. `ORDER BY [column ASC|DESC]` — Organize the output rows.',
                    '5. `LIMIT [count] OFFSET [skip]` — Slice the specific page to display.'
                ],
                targetQuery: {
                    sql: 'SELECT name, price, quantity_in_stock, reorder_level\nFROM products\nWHERE quantity_in_stock <= reorder_level\nORDER BY quantity_in_stock ASC\nLIMIT 5;',
                    explanation: 'Find the 5 most urgently low-stock products (at or below reorder level), sorted lowest stock first.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: FROM products WHERE quantity_in_stock <= reorder_level',
                        sqlSnippet: 'FROM products WHERE quantity_in_stock <= reorder_level',
                        explanation: 'SQL visits products and isolates items at or below the reorder threshold.',
                        tableData: {
                            tableName: 'Low-Stock Candidates',
                            columns: [
                                'name',
                                'price',
                                'quantity_in_stock',
                                'reorder_level'
                            ],
                            rows: [
                                [
                                    'Wireless Charging Pad',
                                    19.99,
                                    0,
                                    15
                                ],
                                [
                                    'Steel Frame Footrest',
                                    45.00,
                                    0,
                                    5
                                ],
                                [
                                    'Steel Cable Management Tray',
                                    22.00,
                                    2,
                                    8
                                ],
                                [
                                    'Adjustable Standing Desk',
                                    420.00,
                                    3,
                                    5
                                ],
                                [
                                    '4K UltraHD Monitor (27-inch)',
                                    349.99,
                                    6,
                                    10
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: 'Step 2: ORDER BY quantity_in_stock ASC LIMIT 5',
                        sqlSnippet: 'ORDER BY quantity_in_stock ASC LIMIT 5',
                        explanation: 'Sorts lowest stock first and takes the top 5 urgent items.',
                        tableData: {
                            tableName: 'Priority Restock List',
                            columns: [
                                'name',
                                'price',
                                'quantity_in_stock',
                                'reorder_level'
                            ],
                            highlightedColumns: [
                                'name',
                                'quantity_in_stock'
                            ],
                            highlightedRows: [
                                0,
                                1,
                                2,
                                3,
                                4
                            ],
                            rows: [
                                [
                                    'Wireless Charging Pad',
                                    19.99,
                                    0,
                                    15
                                ],
                                [
                                    'Steel Frame Footrest',
                                    45.00,
                                    0,
                                    5
                                ],
                                [
                                    'Steel Cable Management Tray',
                                    22.00,
                                    2,
                                    8
                                ],
                                [
                                    'Adjustable Standing Desk',
                                    420.00,
                                    3,
                                    5
                                ],
                                [
                                    '4K UltraHD Monitor (27-inch)',
                                    349.99,
                                    6,
                                    10
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'Full single-table pipeline',
                        sql: 'SELECT name, price, quantity_in_stock\nFROM products\nWHERE quantity_in_stock <= reorder_level\nORDER BY quantity_in_stock ASC\nLIMIT 10 OFFSET 0;',
                        description: 'Integrated filter, sort, and slice.'
                    }
                ],
                keyTakeaway: 'Combine filtering conditions, sorting, and pagination into clean, multi-clause query pipelines.',
                exampleQuery: 'SELECT name, price FROM products WHERE quantity_in_stock = 0 ORDER BY price DESC;',
                exampleQueryExplanation: 'Finds all out-of-stock items sorted by price highest first.',
                liveDemoSql: 'SELECT name, price, quantity_in_stock FROM products WHERE quantity_in_stock <= reorder_level ORDER BY quantity_in_stock ASC LIMIT 5;',
                liveDemoNotes: 'Displays urgent low-stock items worst-first.',
                mcqs: [
                    {
                        question: 'What query retrieves Page 2 of a product catalog showing 10 products per page?',
                        options: [
                            'A. LIMIT 10 OFFSET 10',
                            'B. LIMIT 20 OFFSET 10',
                            'C. OFFSET 2 LIMIT 10',
                            'D. LIMIT 10 OFFSET 2'
                        ],
                        correctIndex: 0,
                        explanation: 'Page 2 skips the first 10 rows and takes the next 10: `LIMIT 10 OFFSET 10`.'
                    }
                ],
                masteryPoints: [
                    'Assemble full single-table query pipelines with progressive scaffolding'
                ]
            },
            tasks: [
                {
                    id: 'day05-c1-t1',
                    title: 'Task 1 (High Guidance): Products Needing Restock',
                    description: 'Find products where `quantity_in_stock <= reorder_level`, ordered by `quantity_in_stock ASC`.',
                    instructions: [
                        'Query the `products` table.',
                        'Select `name`, `quantity_in_stock`, and `reorder_level`.',
                        'Filter with `WHERE quantity_in_stock <= reorder_level`.',
                        'Order by `quantity_in_stock ASC`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'products',
                    initialSql: '-- Task 1: High Guidance - Low stock inventory worst-first\nSELECT name, quantity_in_stock, reorder_level\nFROM products\nWHERE quantity_in_stock <= reorder_level\nORDER BY quantity_in_stock ASC;',
                    solutionSql: 'SELECT name, quantity_in_stock, reorder_level FROM products WHERE quantity_in_stock <= reorder_level ORDER BY quantity_in_stock ASC;',
                    solutionExplanation: 'Filters for items at or below the reorder threshold and sorts lowest stock first.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `WHERE quantity_in_stock <= reorder_level` to find low stock items.'
                        },
                        {
                            level: 2,
                            text: 'Add `ORDER BY quantity_in_stock ASC;` to sort from lowest stock to highest.'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requiredColumns: [
                            'name',
                            'quantity_in_stock',
                            'reorder_level'
                        ],
                        requireWhere: true,
                        requireOrderBy: [
                            {
                                column: 'quantity_in_stock',
                                direction: 'ASC'
                            }
                        ],
                        expectedRowCount: 8
                    },
                    successMessage: 'Task 1 completed! Low-stock items identified worst-first.'
                },
                {
                    id: 'day05-c1-t2',
                    title: 'Task 2 (Partial Guidance): Active Customer Roster',
                    description: 'Select name, email, and city from customers where email is NOT NULL, ordered by name ASC and limited to 5.',
                    instructions: [
                        'Query the `customers` table.',
                        'Select `name`, `email`, and `city`.',
                        'Filter for customers with a verified email (`email IS NOT NULL`).',
                        'Sort alphabetically by `name ASC` and limit output to `5`.'
                    ],
                    type: 'independent',
                    primaryTable: 'customers',
                    initialSql: '-- Task 2: Partial Guidance - Active customer roster\n',
                    solutionSql: 'SELECT name, email, city FROM customers WHERE email IS NOT NULL ORDER BY name ASC LIMIT 5;',
                    solutionExplanation: 'Filters out null emails, sorts names alphabetically, and limits to 5.',
                    hints: [
                        {
                            level: 1,
                            text: 'Remember to use `IS NOT NULL` (not `!= NULL`) to check for valid emails.'
                        },
                        {
                            level: 2,
                            text: 'Use `WHERE email IS NOT NULL ORDER BY name ASC LIMIT 5;`'
                        }
                    ],
                    validation: {
                        targetTable: 'customers',
                        requiredColumns: [
                            'name',
                            'email',
                            'city'
                        ],
                        requireWhere: true,
                        requireOrderBy: [
                            {
                                column: 'name',
                                direction: 'ASC'
                            }
                        ],
                        requireLimit: 5,
                        expectedRowCount: 5
                    },
                    successMessage: 'Task 2 completed! Active customer roster retrieved.'
                },
                {
                    id: 'day05-c1-t3',
                    title: 'Task 3 (Goal Only): Product Catalog Page 2',
                    description: 'Retrieve Page 2 of the product catalog (10 items per page, sorted by product_id ASC).',
                    instructions: [
                        'Select all columns from `products`.',
                        'Sort by `product_id ASC`.',
                        'Use `LIMIT` and `OFFSET` to display items 11 through 20 (Page 2).'
                    ],
                    type: 'independent',
                    primaryTable: 'products',
                    initialSql: '-- Task 3: Goal Only - Catalog pagination Page 2\n',
                    solutionSql: 'SELECT * FROM products ORDER BY product_id ASC LIMIT 10 OFFSET 10;',
                    solutionExplanation: '`LIMIT 10 OFFSET 10` skips the first 10 products and returns products 11 through 20.',
                    hints: [
                        {
                            level: 1,
                            text: 'To get page 2 with 10 items per page, skip 10 items using `OFFSET 10` and take 10 with `LIMIT 10`.'
                        },
                        {
                            level: 2,
                            text: 'Use `ORDER BY product_id ASC LIMIT 10 OFFSET 10;`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requireOrderBy: [
                            {
                                column: 'product_id',
                                direction: 'ASC'
                            }
                        ],
                        requireLimit: 10,
                        requireOffset: 10,
                        expectedRowCount: 10
                    },
                    successMessage: 'Task 3 completed! Page 2 of product catalog retrieved.'
                }
            ]
        }
    ],
    // ===========================================================================
    // DAY 5 CHALLENGE: INDEPENDENT PIPELINE CHALLENGE (ENDING ACTIVITY)
    // ===========================================================================
    challenge: {
        id: 'day-05-homework',
        title: 'Day 5 — Independent Pipeline Challenge (Ending Activity)',
        scenario: 'Solve these 4 operational query pipelines independently (business requirements only):',
        tasks: [
            {
                id: 'day05-hw-1',
                title: 'Task 1: All Out-of-Stock Products',
                description: 'Retrieve all products that currently have 0 units in stock.',
                instructions: [
                    'Select all columns from `products` where `quantity_in_stock = 0`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'products',
                initialSql: '-- Challenge 1: All out-of-stock products\n',
                solutionSql: 'SELECT * FROM products WHERE quantity_in_stock = 0;',
                solutionExplanation: 'Filters for items where quantity_in_stock is exactly 0.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `WHERE quantity_in_stock = 0;`'
                    }
                ],
                validation: {
                    targetTable: 'products',
                    requireWhere: true,
                    whereContainsTerms: [
                        'quantity_in_stock',
                        '=',
                        '0'
                    ],
                    expectedRowCount: 3
                },
                successMessage: 'Challenge 1 completed! Out-of-stock products found.'
            },
            {
                id: 'day05-hw-2',
                title: 'Task 2: Priority Reorder Products',
                description: 'Find products at or below their reorder level, sorted from lowest stock to highest.',
                instructions: [
                    'Select `name`, `quantity_in_stock`, `reorder_level` from `products`.',
                    'Where `quantity_in_stock <= reorder_level` ordered by `quantity_in_stock ASC`.'
                ],
                type: 'challenge',
                primaryTable: 'products',
                initialSql: '-- Challenge 2: Products needing reorder\n',
                solutionSql: 'SELECT name, quantity_in_stock, reorder_level FROM products WHERE quantity_in_stock <= reorder_level ORDER BY quantity_in_stock ASC;',
                solutionExplanation: 'Identifies inventory at or below threshold ordered by urgency.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `WHERE quantity_in_stock <= reorder_level ORDER BY quantity_in_stock ASC;`'
                    }
                ],
                validation: {
                    targetTable: 'products',
                    requireWhere: true,
                    requireOrderBy: [
                        {
                            column: 'quantity_in_stock',
                            direction: 'ASC'
                        }
                    ],
                    expectedRowCount: 8
                },
                successMessage: 'Challenge 2 completed! Reorder items listed.'
            },
            {
                id: 'day05-hw-3',
                title: 'Task 3: Catalog Page 2 Pagination',
                description: 'Page 2 of the product catalog, 10 per page, sorted by product_id ASC.',
                instructions: [
                    'Select all columns from `products` ordered by `product_id ASC LIMIT 10 OFFSET 10`.'
                ],
                type: 'challenge',
                primaryTable: 'products',
                initialSql: '-- Challenge 3: Page 2 of product catalog\n',
                solutionSql: 'SELECT * FROM products ORDER BY product_id ASC LIMIT 10 OFFSET 10;',
                solutionExplanation: 'Paginates through products skipping the first 10 rows.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `ORDER BY product_id ASC LIMIT 10 OFFSET 10;`'
                    }
                ],
                validation: {
                    targetTable: 'products',
                    requireLimit: 10,
                    requireOffset: 10,
                    expectedRowCount: 10
                },
                successMessage: 'Challenge 3 completed! Page 2 of catalog retrieved.'
            },
            {
                id: 'day05-hw-4',
                title: 'Task 4: Newest Customer Signups (Top 5)',
                description: 'Retrieve the 5 most recently registered customers, sorted newest first.',
                instructions: [
                    'Select `customer_id`, `name`, `signup_date` from `customers`.',
                    'Order by `signup_date DESC LIMIT 5`.'
                ],
                type: 'challenge',
                primaryTable: 'customers',
                initialSql: '-- Challenge 4: Top 5 newest customer signups\n',
                solutionSql: 'SELECT customer_id, name, signup_date FROM customers ORDER BY signup_date DESC LIMIT 5;',
                solutionExplanation: 'Orders customers by signup date descending and limits to top 5.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `ORDER BY signup_date DESC LIMIT 5;`'
                    }
                ],
                validation: {
                    targetTable: 'customers',
                    requiredColumns: [
                        'customer_id',
                        'name',
                        'signup_date'
                    ],
                    requireOrderBy: [
                        {
                            column: 'signup_date',
                            direction: 'DESC'
                        }
                    ],
                    requireLimit: 5,
                    expectedRowCount: 5
                },
                successMessage: 'Challenge 4 completed! Top 5 newest customer signups retrieved.'
            }
        ]
    }
};
const DAY_06_MODULE = {
    id: 'day-06',
    slug: 'logical-query-processing-simple',
    day: 6,
    title: 'Day 6 — Visual Concept Lab: Logical Query Processing Order (Simple Pass)',
    shortTitle: 'Logical Query Processing (Simple)',
    type: 'conceptual_session',
    milestoneId: 'milestone-1',
    description: 'Understand the 5-step logical execution order: FROM → WHERE → SELECT → ORDER BY → LIMIT, and why WHERE cannot reference SELECT column aliases.',
    estimatedMinutes: 45,
    completionLearnings: [
        'Explain the 5-step simple logical query processing order: FROM → WHERE → SELECT → ORDER BY → LIMIT',
        'Understand why WHERE cannot reference aliases defined in SELECT',
        'Distinguish between the standard logical execution model and database-specific syntax extensions (like MySQL)'
    ],
    concepts: [
        {
            id: 'simple-logical-order',
            order: 1,
            title: '1. The 5-Step Evaluation Lifecycle & Alias Visibility',
            shortDescription: 'FROM → WHERE → SELECT → ORDER BY → LIMIT.',
            theory: {
                summary: 'SQL queries are written starting with SELECT, but the database engine evaluates them in a completely different logical order. Understanding this lifecycle explains why column aliases created in SELECT cannot be used in WHERE.',
                introTable: {
                    tableName: 'products',
                    description: 'Sample products for execution tracing',
                    columns: [
                        'product_id',
                        'name',
                        'price'
                    ],
                    rows: [
                        [
                            1,
                            'Wireless Mouse',
                            25.00
                        ],
                        [
                            2,
                            'Mechanical Keyboard',
                            89.99
                        ],
                        [
                            6,
                            '4K UltraHD Monitor',
                            349.99
                        ]
                    ]
                },
                explanation: [
                    '### 1. The Core Misconception',
                    'Why does this query fail with an error?',
                    '```sql\nSELECT name, price * 1.15 AS taxed_price\nFROM products\nWHERE taxed_price > 50;\n```',
                    'Because the database does not evaluate `SELECT` first! It evaluates `WHERE` before `SELECT`.',
                    '### 2. The 5-Step Evaluation Timeline',
                    '1. **Step 1: `FROM products`** — The engine identifies and loads the source table.',
                    '2. **Step 2: `WHERE ...`** — Individual rows are filtered. (*`taxed_price` does not exist yet!*)',
                    '3. **Step 3: `SELECT ...`** — Specific columns are extracted, calculated, and assigned aliases.',
                    '4. **Step 4: `ORDER BY ...`** — The resulting rows are sorted. (*Can see SELECT aliases!*)',
                    '5. **Step 5: `LIMIT / OFFSET`** — The sorted output is sliced.'
                ],
                targetQuery: {
                    sql: 'SELECT name, price * 1.15 AS taxed_price\nFROM products\nWHERE price * 1.15 > 50\nORDER BY taxed_price DESC\nLIMIT 5;',
                    explanation: 'Find products with a taxed price over $50, sort highest first, and return the top 5.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: FROM products',
                        sqlSnippet: 'FROM products',
                        explanation: 'SQL identifies the products table with all records.',
                        tableData: {
                            tableName: 'products (Source Table)',
                            columns: [
                                'name',
                                'price'
                            ],
                            rows: [
                                [
                                    'Wireless Mouse',
                                    25.00
                                ],
                                [
                                    'Mechanical Keyboard',
                                    89.99
                                ],
                                [
                                    '4K UltraHD Monitor',
                                    349.99
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: 'Step 2: WHERE price * 1.15 > 50 (Filter using raw expression)',
                        sqlSnippet: 'WHERE price * 1.15 > 50',
                        explanation: 'SQL filters rows using raw math (the alias taxed_price is not created yet).',
                        tableData: {
                            tableName: 'Filtered Surviving Rows',
                            columns: [
                                'name',
                                'price'
                            ],
                            rows: [
                                [
                                    'Mechanical Keyboard',
                                    89.99
                                ],
                                [
                                    '4K UltraHD Monitor',
                                    349.99
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 3,
                        stepTitle: 'Step 3: SELECT name, price * 1.15 AS taxed_price (Alias created)',
                        sqlSnippet: 'SELECT name, price * 1.15 AS taxed_price',
                        explanation: 'SQL computes the expression and assigns the alias taxed_price.',
                        tableData: {
                            tableName: 'Calculated Columns',
                            columns: [
                                'name',
                                'taxed_price'
                            ],
                            rows: [
                                [
                                    'Mechanical Keyboard',
                                    103.49
                                ],
                                [
                                    '4K UltraHD Monitor',
                                    402.49
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 4,
                        stepTitle: 'Step 4: ORDER BY taxed_price DESC (Alias is visible here)',
                        sqlSnippet: 'ORDER BY taxed_price DESC',
                        explanation: 'ORDER BY runs after SELECT, so it safely sees and sorts by taxed_price.',
                        tableData: {
                            tableName: 'Sorted Calculation',
                            columns: [
                                'name',
                                'taxed_price'
                            ],
                            highlightedColumns: [
                                'taxed_price'
                            ],
                            rows: [
                                [
                                    '4K UltraHD Monitor',
                                    402.49
                                ],
                                [
                                    'Mechanical Keyboard',
                                    103.49
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 5,
                        stepTitle: 'Step 5: LIMIT 5 (Slice final rows)',
                        sqlSnippet: 'LIMIT 5',
                        explanation: 'Takes the top 5 highest-priced rows.',
                        tableData: {
                            tableName: 'Final Query Result',
                            columns: [
                                'name',
                                'taxed_price'
                            ],
                            highlightedColumns: [
                                'name',
                                'taxed_price'
                            ],
                            highlightedRows: [
                                0,
                                1
                            ],
                            rows: [
                                [
                                    '4K UltraHD Monitor',
                                    402.49
                                ],
                                [
                                    'Mechanical Keyboard',
                                    103.49
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'Logical evaluation order',
                        sql: '1. FROM table_name\n2. WHERE filter_condition (raw expressions)\n3. SELECT column_list (aliases created)\n4. ORDER BY sort_expression (can use aliases)\n5. LIMIT row_count;',
                        description: 'The logical order of visibility across clauses.'
                    }
                ],
                keyTakeaway: 'WHERE executes before SELECT (so WHERE cannot see SELECT aliases), while ORDER BY executes after SELECT.',
                exampleQuery: 'SELECT name, price * 1.15 AS taxed_price FROM products WHERE price * 1.15 > 50 ORDER BY taxed_price DESC LIMIT 5;',
                exampleQueryExplanation: 'Uses raw math in WHERE and alias in ORDER BY.',
                liveDemoSql: 'SELECT name, price * 1.15 AS taxed_price FROM products WHERE price * 1.15 > 50 ORDER BY taxed_price DESC LIMIT 5;',
                liveDemoNotes: 'Observes the full logical sequence in action.',
                mcqs: [
                    {
                        question: 'Why does `SELECT name, price * 1.15 AS taxed_price FROM products WHERE taxed_price > 50;` cause an error in standard SQL?',
                        options: [
                            'A. Because 1.15 is not a valid decimal',
                            'B. Because the WHERE clause is evaluated at Step 2, before the SELECT clause creates the alias at Step 3',
                            'C. Because AS is not allowed on calculated columns',
                            'D. Because WHERE only accepts integer comparisons'
                        ],
                        correctIndex: 1,
                        explanation: 'Logically, WHERE filters rows before SELECT creates column aliases.'
                    }
                ],
                masteryPoints: [
                    'Explain the 5-step execution lifecycle',
                    'Place aliases correctly in ORDER BY rather than WHERE'
                ]
            },
            tasks: [
                {
                    id: 'day06-c1-t1',
                    title: 'Task 1 (Guided Fix): Fix the Alias in WHERE Error',
                    description: 'Repair the broken query by placing the raw calculation in `WHERE` and using the alias in `ORDER BY`.',
                    instructions: [
                        'Select `name` and `price * 1.15 AS taxed_price` from `products`.',
                        'Filter with `WHERE price * 1.15 > 50` (use raw math in WHERE).',
                        'Sort by `taxed_price DESC` (use the alias in ORDER BY).',
                        'Limit output to `5`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'products',
                    initialSql: '-- Fix the broken query below\nSELECT name, price * 1.15 AS taxed_price\nFROM products\nWHERE taxed_price > 50\nORDER BY taxed_price DESC\nLIMIT 5;',
                    solutionSql: 'SELECT name, price * 1.15 AS taxed_price FROM products WHERE price * 1.15 > 50 ORDER BY taxed_price DESC LIMIT 5;',
                    solutionExplanation: 'Raw expression is evaluated in WHERE at Step 2; the alias taxed_price is used in ORDER BY at Step 4.',
                    hints: [
                        {
                            level: 1,
                            text: 'Replace `WHERE taxed_price > 50` with `WHERE price * 1.15 > 50`.'
                        },
                        {
                            level: 2,
                            text: 'Keep `ORDER BY taxed_price DESC LIMIT 5;` since ORDER BY runs after SELECT.'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requireWhere: true,
                        requireOrderBy: [
                            {
                                column: 'taxed_price',
                                direction: 'DESC'
                            }
                        ],
                        requireLimit: 5,
                        expectedRowCount: 5
                    },
                    successMessage: 'Task 1 completed! Query repaired with correct clause visibility.'
                },
                {
                    id: 'day06-c1-t2',
                    title: 'Task 2 (Transfer): Customer Alias Sorting',
                    description: 'Select customer name aliased as customer_name and city from customers in Dhaka, sorted by customer_name ASC.',
                    instructions: [
                        'Query the `customers` table.',
                        'Select `name AS customer_name` and `city`.',
                        "Filter where `city = 'Dhaka'`.",
                        'Sort by `customer_name ASC`.'
                    ],
                    type: 'independent',
                    primaryTable: 'customers',
                    initialSql: '-- Select with alias in ORDER BY\n',
                    solutionSql: "SELECT name AS customer_name, city FROM customers WHERE city = 'Dhaka' ORDER BY customer_name ASC;",
                    solutionExplanation: 'WHERE uses actual column city; ORDER BY uses the created alias customer_name.',
                    hints: [
                        {
                            level: 1,
                            text: "Use `WHERE city = 'Dhaka'`."
                        },
                        {
                            level: 2,
                            text: "Add `ORDER BY customer_name ASC;`."
                        }
                    ],
                    validation: {
                        targetTable: 'customers',
                        requiredColumns: [
                            'customer_name',
                            'city'
                        ],
                        requiredAliases: {
                            name: 'customer_name'
                        },
                        requireWhere: true,
                        requireOrderBy: [
                            {
                                column: 'customer_name',
                                direction: 'ASC'
                            }
                        ],
                        expectedRowCount: 6
                    },
                    successMessage: 'Task 2 completed! Clause execution order verified.'
                }
            ]
        }
    ],
    // ===========================================================================
    // DAY 6 CHALLENGE: PREDICTION & ALIAS TRACING TEST (ENDING ACTIVITY)
    // ===========================================================================
    challenge: {
        id: 'day-06-homework',
        title: 'Day 6 — Prediction & Alias Tracing Test (Ending Activity)',
        scenario: 'Demonstrate your mastery of the 5-step query processing order:',
        tasks: [
            {
                id: 'day06-hw-1',
                title: 'Task 1: Trace execution order with WHERE and ORDER BY',
                description: 'Select products with price > 40, alias price as catalog_price, order by catalog_price DESC, limit 5.',
                instructions: [
                    'Select `name`, `price AS catalog_price` from `products` where `price > 40` order by `catalog_price DESC` limit 5.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'products',
                initialSql: '-- Task 1: Trace execution order with WHERE and ORDER BY\n',
                solutionSql: 'SELECT name, price AS catalog_price FROM products WHERE price > 40 ORDER BY catalog_price DESC LIMIT 5;',
                solutionExplanation: 'Uses raw column in WHERE and alias in ORDER BY.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `WHERE price > 40 ORDER BY catalog_price DESC LIMIT 5;`'
                    }
                ],
                validation: {
                    targetTable: 'products',
                    requireWhere: true,
                    requireOrderBy: [
                        {
                            column: 'catalog_price',
                            direction: 'DESC'
                        }
                    ],
                    requireLimit: 5,
                    expectedRowCount: 5
                },
                successMessage: 'Challenge completed! Execution lifecycle verified.'
            }
        ]
    }
};
const DAY_07_MODULE = {
    id: 'day-07',
    slug: 'project-part-1-explore-schema',
    day: 7,
    title: 'Day 7 — Applied Project: Full Schema Exploration',
    shortTitle: 'Project: Schema Exploration',
    type: 'project_part',
    milestoneId: 'milestone-1',
    description: 'Join the E-Commerce Data Team to audit and explore the full 6-table database schema (suppliers, categories, products, customers, orders, order_items) using single-table queries.',
    estimatedMinutes: 75,
    completionLearnings: [
        'Navigate the full 6-table e-commerce relational schema independently',
        'Query suppliers, products, and categories using targeted single-table audits',
        'Identify primary key and foreign key reference columns across entities'
    ],
    concepts: [
        {
            id: 'schema-navigation',
            order: 1,
            title: '1. E-Commerce Data Team Onboarding & Schema Audit',
            shortDescription: 'Hands-on exploration of the complete relational schema.',
            theory: {
                summary: 'Welcome to the data engineering team! Before running analytical joins or modifying records, your onboarding mission is to audit and inspect all tables in the production e-commerce database.',
                introTable: {
                    tableName: 'suppliers',
                    description: 'Suppliers directory table',
                    columns: [
                        'supplier_id',
                        'name',
                        'contact_email'
                    ],
                    rows: [
                        [
                            1,
                            'LogiTech Direct',
                            'supply@logitech-direct.com'
                        ],
                        [
                            2,
                            'KeyChron Components',
                            'orders@keychron-comp.com'
                        ],
                        [
                            3,
                            'Apex Cables & Hubs',
                            'sales@apexcables.io'
                        ]
                    ]
                },
                explanation: [
                    '### 1. The E-Commerce Schema Map',
                    'The platform stores data across 6 interconnected entities:',
                    '• **`suppliers`**: Directory of vendor partners (`supplier_id`, `name`, `contact_email`).',
                    '• **`categories`**: Catalog taxonomy labels (`category_id`, `name`).',
                    '• **`products`**: Inventory catalog (`product_id`, `name`, `supplier_id`, `category_id`, `price`, `quantity_in_stock`, `reorder_level`).',
                    '• **`customers`**: Registered shoppers (`customer_id`, `name`, `email`, `city`, `signup_date`).',
                    '• **`orders`**: Customer checkout records (`order_id`, `customer_id`, `order_date`, `status`).',
                    '• **`order_items`**: Individual line items (`order_item_id`, `order_id`, `product_id`, `quantity`, `unit_price`).'
                ],
                targetQuery: {
                    sql: 'SELECT supplier_id, name, contact_email\nFROM suppliers\nORDER BY supplier_id ASC;',
                    explanation: 'Audit all registered supplier partners in the directory ordered by ID.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: FROM suppliers (Scan directory table)',
                        sqlSnippet: 'FROM suppliers',
                        explanation: 'Loads all registered vendor partner records.',
                        tableData: {
                            tableName: 'suppliers',
                            columns: [
                                'supplier_id',
                                'name',
                                'contact_email'
                            ],
                            rows: [
                                [
                                    1,
                                    'LogiTech Direct',
                                    'supply@logitech-direct.com'
                                ],
                                [
                                    2,
                                    'KeyChron Components',
                                    'orders@keychron-comp.com'
                                ],
                                [
                                    3,
                                    'Apex Cables & Hubs',
                                    'sales@apexcables.io'
                                ],
                                [
                                    4,
                                    'ErgoComfort Workspace',
                                    'wholesale@ergocomfort.com'
                                ],
                                [
                                    5,
                                    'SoundWave Acoustic',
                                    'b2b@soundwave.net'
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: 'Step 2: SELECT supplier_id, name, contact_email ORDER BY supplier_id ASC',
                        sqlSnippet: 'SELECT supplier_id, name, contact_email ORDER BY supplier_id ASC',
                        explanation: 'Extracts supplier contact profiles in numeric ID order.',
                        tableData: {
                            tableName: 'Audited Supplier Directory',
                            columns: [
                                'supplier_id',
                                'name',
                                'contact_email'
                            ],
                            highlightedColumns: [
                                'supplier_id',
                                'name',
                                'contact_email'
                            ],
                            highlightedRows: [
                                0,
                                1,
                                2,
                                3,
                                4
                            ],
                            rows: [
                                [
                                    1,
                                    'LogiTech Direct',
                                    'supply@logitech-direct.com'
                                ],
                                [
                                    2,
                                    'KeyChron Components',
                                    'orders@keychron-comp.com'
                                ],
                                [
                                    3,
                                    'Apex Cables & Hubs',
                                    'sales@apexcables.io'
                                ],
                                [
                                    4,
                                    'ErgoComfort Workspace',
                                    'wholesale@ergocomfort.com'
                                ],
                                [
                                    5,
                                    'SoundWave Acoustic',
                                    'b2b@soundwave.net'
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'Inspecting individual tables',
                        sql: 'SELECT * FROM suppliers;\nSELECT * FROM categories;\nSELECT * FROM products;',
                        description: 'Explore the structural layout of each entity.'
                    }
                ],
                keyTakeaway: 'Audit all tables confidently using targeted single-table queries.',
                exampleQuery: 'SELECT * FROM suppliers;',
                exampleQueryExplanation: 'Lists all supplier partner records.',
                liveDemoSql: 'SELECT * FROM suppliers;',
                liveDemoNotes: 'Displays all suppliers in the database.',
                mcqs: [
                    {
                        question: 'Which table connects orders to products in this schema?',
                        options: [
                            'A. customers',
                            'B. order_items',
                            'C. categories',
                            'D. suppliers'
                        ],
                        correctIndex: 1,
                        explanation: '`order_items` stores individual line items for each order, referencing both order_id and product_id.'
                    }
                ],
                masteryPoints: [
                    'Explore any table in the schema using single-table queries'
                ]
            },
            tasks: [
                {
                    id: 'day07-c1-t1',
                    title: 'Mission 1 (Guided): Inspect Supplier Directory',
                    description: 'Retrieve all columns from the `suppliers` table.',
                    instructions: [
                        'Select all columns from `suppliers`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'suppliers',
                    initialSql: '-- Mission 1: List all supplier partners\n',
                    solutionSql: 'SELECT * FROM suppliers;',
                    solutionExplanation: 'Retrieves all registered vendor records.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `SELECT * FROM suppliers;`'
                        }
                    ],
                    validation: {
                        targetTable: 'suppliers',
                        expectedRowCount: 6
                    },
                    successMessage: 'Mission 1 complete! Supplier directory retrieved.'
                },
                {
                    id: 'day07-c1-t2',
                    title: 'Mission 2 (Semi-Guided): Audit Supplier #1 Catalog',
                    description: 'Find products supplied by supplier_id 1, sorted by price ascending.',
                    instructions: [
                        'Query the `products` table.',
                        'Select `name`, `price`, and `quantity_in_stock`.',
                        'Filter where `supplier_id = 1`.',
                        'Order by `price ASC`.'
                    ],
                    type: 'independent',
                    primaryTable: 'products',
                    initialSql: '-- Mission 2: Products from supplier #1\n',
                    solutionSql: 'SELECT name, price, quantity_in_stock FROM products WHERE supplier_id = 1 ORDER BY price ASC;',
                    solutionExplanation: 'Finds products from LogiTech Direct sorted by price.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `WHERE supplier_id = 1 ORDER BY price ASC;`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requiredColumns: [
                            'name',
                            'price',
                            'quantity_in_stock'
                        ],
                        requireWhere: true,
                        requireOrderBy: [
                            {
                                column: 'price',
                                direction: 'ASC'
                            }
                        ],
                        expectedRowCount: 7
                    },
                    successMessage: 'Mission 2 complete! Supplier catalog audited.'
                }
            ]
        }
    ],
    // ===========================================================================
    // DAY 7 CHALLENGE: SCHEMA EXPLORATION MISSION CHECKLIST (ENDING ACTIVITY)
    // ===========================================================================
    challenge: {
        id: 'day-07-homework',
        title: 'Day 7 — Schema Exploration Mission Checklist (Ending Activity)',
        scenario: 'Execute these 5 single-table audits across the e-commerce schema:',
        tasks: [
            {
                id: 'day07-hw-1',
                title: 'Task 1: List all suppliers',
                description: 'List all supplier records in the directory.',
                instructions: [
                    'Select all columns from `suppliers`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'suppliers',
                initialSql: '-- Task 1: List all suppliers\n',
                solutionSql: 'SELECT * FROM suppliers;',
                solutionExplanation: 'Lists all supplier records.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `SELECT * FROM suppliers;`'
                    }
                ],
                validation: {
                    targetTable: 'suppliers',
                    expectedRowCount: 6
                },
                successMessage: 'Task 1 completed! All suppliers listed.'
            },
            {
                id: 'day07-hw-2',
                title: 'Task 2: Products from Supplier #1 sorted by price',
                description: 'Products from supplier_id 1, sorted by price ascending.',
                instructions: [
                    'Select from `products` where `supplier_id = 1` order by `price ASC`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'products',
                initialSql: '-- Task 2: Products from supplier #1 sorted by price\n',
                solutionSql: 'SELECT * FROM products WHERE supplier_id = 1 ORDER BY price ASC;',
                solutionExplanation: 'Filters by supplier_id = 1 and sorts price ascending.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `WHERE supplier_id = 1 ORDER BY price ASC;`'
                    }
                ],
                validation: {
                    targetTable: 'products',
                    requireWhere: true,
                    requireOrderBy: [
                        {
                            column: 'price',
                            direction: 'ASC'
                        }
                    ],
                    expectedRowCount: 7
                },
                successMessage: 'Task 2 completed! Supplier products sorted by price.'
            },
            {
                id: 'day07-hw-3',
                title: 'Task 3: Distinct categories in the system',
                description: 'Distinct category names in the catalog taxonomy.',
                instructions: [
                    'Select distinct category names from `categories`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'categories',
                initialSql: '-- Task 3: Distinct categories in the system\n',
                solutionSql: 'SELECT DISTINCT name FROM categories;',
                solutionExplanation: 'Lists distinct category names.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `SELECT DISTINCT name FROM categories;`'
                    }
                ],
                validation: {
                    targetTable: 'categories',
                    requireDistinct: true,
                    expectedRowCount: 6
                },
                successMessage: 'Task 3 completed! Distinct categories retrieved.'
            },
            {
                id: 'day07-hw-4',
                title: 'Task 4: The 3 most expensive products',
                description: 'Retrieve the 3 highest priced products in the catalog.',
                instructions: [
                    'Select from `products` ordered by `price DESC LIMIT 3`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'products',
                initialSql: '-- Task 4: The 3 most expensive products\n',
                solutionSql: 'SELECT * FROM products ORDER BY price DESC LIMIT 3;',
                solutionExplanation: '`ORDER BY price DESC LIMIT 3` retrieves the 3 highest priced items.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `ORDER BY price DESC LIMIT 3;`'
                    }
                ],
                validation: {
                    targetTable: 'products',
                    requireOrderBy: [
                        {
                            column: 'price',
                            direction: 'DESC'
                        }
                    ],
                    requireLimit: 3,
                    expectedRowCount: 3
                },
                successMessage: 'Task 4 completed! Top 3 most expensive products retrieved.'
            },
            {
                id: 'day07-hw-5',
                title: 'Task 5: Page 2 of the full product catalog',
                description: 'Page 2 of the full product catalog (10 per page, sorted by product_id ASC).',
                instructions: [
                    'Select from `products` ordered by `product_id ASC LIMIT 10 OFFSET 10`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'products',
                initialSql: '-- Task 5: Page 2 of the full product catalog\n',
                solutionSql: 'SELECT * FROM products ORDER BY product_id ASC LIMIT 10 OFFSET 10;',
                solutionExplanation: 'Paginates to page 2 of the products table.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `LIMIT 10 OFFSET 10;`'
                    }
                ],
                validation: {
                    targetTable: 'products',
                    requireLimit: 10,
                    requireOffset: 10,
                    expectedRowCount: 10
                },
                successMessage: 'Task 5 completed! Page 2 of product catalog retrieved.'
            }
        ]
    }
};
const DAY_08_MODULE = {
    id: 'day-08',
    slug: 'milestone-1-assessment',
    day: 8,
    title: 'Day 8 — Milestone 1: Single-Table Mastery Checkpoint',
    shortTitle: 'Milestone 1 Checkpoint',
    type: 'assignment',
    milestoneId: 'milestone-1',
    description: 'Independent competency verification for Milestone 1: prove proficiency in retrieving, filtering, sorting, and paginating single-table datasets unaided.',
    estimatedMinutes: 75,
    completionLearnings: [
        'Independently retrieve, filter, sort, and paginate single-table datasets',
        'Demonstrate complete fluency with Milestone 1 competencies without templates or skeletons'
    ],
    concepts: [
        {
            id: 'milestone-1-eval',
            order: 1,
            title: '1. Milestone 1 Core Competency Verification',
            shortDescription: 'Independent skill verification across Days 1–7.',
            theory: {
                summary: 'Milestone 1 Skill Verification: Prove your ability to independently translate business requirements into working single-table SQL queries without templates or assistance.',
                introTable: {
                    tableName: 'products',
                    description: 'Milestone evaluation test dataset',
                    columns: [
                        'product_id',
                        'name',
                        'price',
                        'quantity_in_stock',
                        'reorder_level'
                    ],
                    rows: [
                        [
                            1,
                            'Wireless Mouse',
                            25.00,
                            42,
                            10
                        ],
                        [
                            9,
                            'Wireless Charging Pad',
                            19.99,
                            0,
                            15
                        ],
                        [
                            15,
                            'Steel Cable Management Tray',
                            22.00,
                            2,
                            8
                        ],
                        [
                            20,
                            'Steel Frame Footrest',
                            45.00,
                            0,
                            5
                        ]
                    ]
                },
                explanation: [
                    '### 1. Milestone 1 Verification Objectives',
                    '• **Core Skill**: Filter inventory below reorder thresholds worst-first.',
                    '• **Combination**: Extract unique supplier IDs from filtered subsets (`DISTINCT`).',
                    '• **Transfer**: Retrieve extreme values (`LIMIT 1`).',
                    '• **Hard Problem**: Multi-clause date interval pagination (`LIMIT` + `OFFSET`).'
                ],
                targetQuery: {
                    sql: 'SELECT name, quantity_in_stock, reorder_level\nFROM products\nWHERE quantity_in_stock <= reorder_level\nORDER BY quantity_in_stock ASC\nLIMIT 5;',
                    explanation: 'Assemble a complete single-table query filtering low-stock inventory, sorting worst-first, and limiting to 5.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: FROM products WHERE quantity_in_stock <= reorder_level',
                        sqlSnippet: 'FROM products WHERE quantity_in_stock <= reorder_level',
                        explanation: 'Filters all items where quantity_in_stock is at or below the reorder point.',
                        tableData: {
                            tableName: 'Low-Stock Products',
                            columns: [
                                'name',
                                'quantity_in_stock',
                                'reorder_level'
                            ],
                            rows: [
                                [
                                    'Wireless Charging Pad',
                                    0,
                                    15
                                ],
                                [
                                    'Steel Frame Footrest',
                                    0,
                                    5
                                ],
                                [
                                    'Steel Cable Management Tray',
                                    2,
                                    8
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: 'Step 2: ORDER BY quantity_in_stock ASC LIMIT 5',
                        sqlSnippet: 'ORDER BY quantity_in_stock ASC LIMIT 5',
                        explanation: 'Sorts by stock quantity ascending and slices the top 5 urgent restock items.',
                        tableData: {
                            tableName: 'Final Query Result',
                            columns: [
                                'name',
                                'quantity_in_stock',
                                'reorder_level'
                            ],
                            highlightedColumns: [
                                'name',
                                'quantity_in_stock'
                            ],
                            highlightedRows: [
                                0,
                                1,
                                2
                            ],
                            rows: [
                                [
                                    'Wireless Charging Pad',
                                    0,
                                    15
                                ],
                                [
                                    'Steel Frame Footrest',
                                    0,
                                    5
                                ],
                                [
                                    'Steel Cable Management Tray',
                                    2,
                                    8
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'Single table mastery',
                        sql: 'SELECT DISTINCT ... FROM ... WHERE ... ORDER BY ... LIMIT ... OFFSET ...;',
                        description: 'The complete single-table query foundation.'
                    }
                ],
                keyTakeaway: 'Demonstrate full mastery of single-table data retrieval.',
                exampleQuery: 'SELECT * FROM products WHERE quantity_in_stock <= reorder_level ORDER BY quantity_in_stock ASC;',
                exampleQueryExplanation: 'Evaluates low-stock items worst first.',
                liveDemoSql: 'SELECT * FROM products WHERE quantity_in_stock <= reorder_level ORDER BY quantity_in_stock ASC;',
                liveDemoNotes: 'Displays critical inventory items.',
                mcqs: [
                    {
                        question: 'What is the primary objective of Milestone 1?',
                        options: [
                            'A. Writing complex multi-table joins',
                            'B. Independently retrieving, filtering, sorting, and paginating single-table queries',
                            'C. Designing database indexes',
                            'D. Setting up database replication'
                        ],
                        correctIndex: 1,
                        explanation: 'Milestone 1 establishes single-table query mastery.'
                    }
                ],
                masteryPoints: [
                    'Pass all 5 Milestone 1 independent checkpoint tasks'
                ]
            },
            tasks: [
                {
                    id: 'day08-c1-t1',
                    title: 'Warmup 1: Low Stock Products Worst-First',
                    description: 'Select products where `quantity_in_stock <= reorder_level`, ordered by `quantity_in_stock ASC`.',
                    instructions: [
                        'Select `name`, `quantity_in_stock`, `reorder_level` from `products`.',
                        'Where `quantity_in_stock <= reorder_level`.',
                        'Order by `quantity_in_stock ASC`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'products',
                    initialSql: '-- Warmup 1: Low stock products worst-first\n',
                    solutionSql: 'SELECT name, quantity_in_stock, reorder_level FROM products WHERE quantity_in_stock <= reorder_level ORDER BY quantity_in_stock ASC;',
                    solutionExplanation: 'Finds products below reorder level, ordered from lowest stock to highest.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `WHERE quantity_in_stock <= reorder_level ORDER BY quantity_in_stock ASC;`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requiredColumns: [
                            'name',
                            'quantity_in_stock',
                            'reorder_level'
                        ],
                        requireWhere: true,
                        requireOrderBy: [
                            {
                                column: 'quantity_in_stock',
                                direction: 'ASC'
                            }
                        ],
                        expectedRowCount: 8
                    },
                    successMessage: 'Warmup 1 completed! Low stock items identified worst-first.'
                },
                {
                    id: 'day08-c1-t2',
                    title: 'Warmup 2: Unique Customer City Directory',
                    description: 'Retrieve a distinct list of cities from the customers table, ordered alphabetically.',
                    instructions: [
                        'Query the `customers` table.',
                        'Select `DISTINCT city`.',
                        'Order by `city ASC`.'
                    ],
                    type: 'independent',
                    primaryTable: 'customers',
                    initialSql: '-- Warmup 2: Distinct cities sorted alphabetically\n',
                    solutionSql: 'SELECT DISTINCT city FROM customers ORDER BY city ASC;',
                    solutionExplanation: 'Returns unique customer cities sorted from A to Z.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `SELECT DISTINCT city FROM customers ORDER BY city ASC;`'
                        }
                    ],
                    validation: {
                        targetTable: 'customers',
                        requiredColumns: [
                            'city'
                        ],
                        requireDistinct: true,
                        requireOrderBy: [
                            {
                                column: 'city',
                                direction: 'ASC'
                            }
                        ],
                        expectedRowCount: 6
                    },
                    successMessage: 'Warmup 2 completed! Unique customer locations sorted alphabetically.'
                }
            ]
        }
    ],
    // ===========================================================================
    // DAY 8 CHALLENGE: MILESTONE 1 MASTERY CHECKPOINT (ENDING ACTIVITY)
    // ===========================================================================
    challenge: {
        id: 'day-08-homework',
        title: 'Day 8 — Milestone 1 Mastery Checkpoint (Ending Activity)',
        scenario: 'Complete all 5 deliverables independently to verify Milestone 1 mastery:',
        tasks: [
            {
                id: 'day08-hw-1',
                title: 'Deliverable 1 (Core): Products below reorder level, worst-first',
                description: 'Products below reorder level, worst-first (lowest quantity_in_stock first).',
                instructions: [
                    'Select from `products` where `quantity_in_stock <= reorder_level` ordered by `quantity_in_stock ASC`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'products',
                initialSql: '-- Deliverable 1: Products below reorder level, worst-first\n',
                solutionSql: 'SELECT * FROM products WHERE quantity_in_stock <= reorder_level ORDER BY quantity_in_stock ASC;',
                solutionExplanation: 'Sorts products below reorder level by stock quantity ascending.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `WHERE quantity_in_stock <= reorder_level ORDER BY quantity_in_stock ASC;`'
                    }
                ],
                validation: {
                    targetTable: 'products',
                    requireWhere: true,
                    requireOrderBy: [
                        {
                            column: 'quantity_in_stock',
                            direction: 'ASC'
                        }
                    ],
                    expectedRowCount: 8
                },
                successMessage: 'Deliverable 1 verified! Low stock items sorted worst-first.'
            },
            {
                id: 'day08-hw-2',
                title: 'Deliverable 2 (Combination): Distinct supplier IDs in low-stock inventory',
                description: 'Distinct supplier IDs represented in the low-stock inventory list.',
                instructions: [
                    'Select `DISTINCT supplier_id` from `products` where `quantity_in_stock <= reorder_level`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'products',
                initialSql: '-- Deliverable 2: Distinct supplier IDs in low-stock list\n',
                solutionSql: 'SELECT DISTINCT supplier_id FROM products WHERE quantity_in_stock <= reorder_level;',
                solutionExplanation: '`DISTINCT supplier_id` extracts unique suppliers affected by low stock.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `SELECT DISTINCT supplier_id FROM products WHERE quantity_in_stock <= reorder_level;`'
                    }
                ],
                validation: {
                    targetTable: 'products',
                    requiredColumns: [
                        'supplier_id'
                    ],
                    requireDistinct: true,
                    requireWhere: true,
                    expectedRowCount: 5
                },
                successMessage: 'Deliverable 2 verified! Suppliers affected by low stock listed.'
            },
            {
                id: 'day08-hw-3',
                title: 'Deliverable 3 (Transfer): The single newest customer signup',
                description: 'Retrieve the single most recently registered customer record.',
                instructions: [
                    'Select from `customers` ordered by `signup_date DESC LIMIT 1`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'customers',
                initialSql: '-- Deliverable 3: The single most recently added customer\n',
                solutionSql: 'SELECT * FROM customers ORDER BY signup_date DESC LIMIT 1;',
                solutionExplanation: '`ORDER BY signup_date DESC LIMIT 1` finds the newest customer signup.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `ORDER BY signup_date DESC LIMIT 1;`'
                    }
                ],
                validation: {
                    targetTable: 'customers',
                    requireOrderBy: [
                        {
                            column: 'signup_date',
                            direction: 'DESC'
                        }
                    ],
                    requireLimit: 1,
                    expectedRowCount: 1
                },
                successMessage: 'Deliverable 3 verified! Most recent customer found.'
            },
            {
                id: 'day08-hw-4',
                title: 'Deliverable 4 (Transfer): Top 5 cheapest products',
                description: 'Retrieve the 5 lowest priced products in the catalog.',
                instructions: [
                    'Select from `products` ordered by `price ASC LIMIT 5`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'products',
                initialSql: '-- Deliverable 4: The 5 cheapest products\n',
                solutionSql: 'SELECT * FROM products ORDER BY price ASC LIMIT 5;',
                solutionExplanation: '`ORDER BY price ASC LIMIT 5` returns the 5 lowest priced products.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `ORDER BY price ASC LIMIT 5;`'
                    }
                ],
                validation: {
                    targetTable: 'products',
                    requireOrderBy: [
                        {
                            column: 'price',
                            direction: 'ASC'
                        }
                    ],
                    requireLimit: 5,
                    expectedRowCount: 5
                },
                successMessage: 'Deliverable 4 verified! 5 cheapest products retrieved.'
            },
            {
                id: 'day08-hw-5',
                title: 'Deliverable 5 (Hard Problem): Customer Directory Page 2 Pagination',
                description: 'Retrieve Page 2 of the customer directory (5 customers per page, sorted by signup_date DESC).',
                instructions: [
                    'Select all columns from `customers`.',
                    'Order by `signup_date DESC LIMIT 5 OFFSET 5`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'customers',
                initialSql: '-- Deliverable 5: Page 2 of customer directory (5 per page)\n',
                solutionSql: 'SELECT * FROM customers ORDER BY signup_date DESC LIMIT 5 OFFSET 5;',
                solutionExplanation: 'Orders customers by newest signup first and retrieves Page 2 (skipping 5 with OFFSET 5, taking 5 with LIMIT 5).',
                hints: [
                    {
                        level: 1,
                        text: 'Use `ORDER BY signup_date DESC LIMIT 5 OFFSET 5;`'
                    }
                ],
                validation: {
                    targetTable: 'customers',
                    requireOrderBy: [
                        {
                            column: 'signup_date',
                            direction: 'DESC'
                        }
                    ],
                    requireLimit: 5,
                    requireOffset: 5,
                    expectedRowCount: 5
                },
                successMessage: 'Deliverable 5 verified! Page 2 of customer directory retrieved.'
            }
        ]
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/content/modules/day09to16.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DAY_09_MODULE",
    ()=>DAY_09_MODULE,
    "DAY_10_MODULE",
    ()=>DAY_10_MODULE,
    "DAY_11_MODULE",
    ()=>DAY_11_MODULE,
    "DAY_12_MODULE",
    ()=>DAY_12_MODULE,
    "DAY_13_MODULE",
    ()=>DAY_13_MODULE,
    "DAY_14_MODULE",
    ()=>DAY_14_MODULE,
    "DAY_15_MODULE",
    ()=>DAY_15_MODULE,
    "DAY_16_MODULE",
    ()=>DAY_16_MODULE
]);
const DAY_09_MODULE = {
    id: 'day-09',
    slug: 'aggregation-grouping',
    day: 9,
    title: 'Day 9 — Aggregation & Grouping',
    shortTitle: 'Aggregation & Grouping',
    type: 'module',
    milestoneId: 'milestone-2',
    description: 'Learn aggregate functions (COUNT, SUM, AVG, MIN, MAX), group calculations using GROUP BY, filter aggregate results with HAVING, and understand how GROUP BY handles NULL values.',
    estimatedMinutes: 75,
    completionLearnings: [
        'Calculate counts, totals, averages, minimums, and maximums across datasets',
        'Group rows by common categories using GROUP BY',
        'Filter grouped aggregate results using HAVING (and know when to use WHERE vs HAVING)',
        'Understand how GROUP BY handles NULL category values'
    ],
    concepts: [
        // =========================================================================
        // CONCEPT 1a: Counting Rows with COUNT
        // =========================================================================
        {
            id: 'aggregate-count',
            order: 1,
            title: '1. Counting Rows with COUNT',
            shortDescription: 'Count total rows and non-NULL column values.',
            theory: {
                summary: '`COUNT(*)` counts every row in a table. `COUNT(column)` counts only rows where that specific column is NOT NULL.',
                introTable: {
                    tableName: 'customers',
                    description: 'Customers snapshot with optional emails',
                    columns: [
                        'customer_id',
                        'name',
                        'email',
                        'city'
                    ],
                    rows: [
                        [
                            1,
                            'Rafiul Islam',
                            'rafiul@example.com',
                            'Dhaka'
                        ],
                        [
                            2,
                            'Priya Akter',
                            'priya.akter@example.com',
                            'Dhaka'
                        ],
                        [
                            3,
                            'Tanvir Ahmed',
                            null,
                            'Chittagong'
                        ],
                        [
                            4,
                            'Nusrat Jahan',
                            'nusrat.j@example.com',
                            'Chittagong'
                        ],
                        [
                            7,
                            'Shakil Ahmed',
                            null,
                            'Khulna'
                        ]
                    ]
                },
                explanation: [
                    '### 1. COUNT(*) vs COUNT(column)',
                    '• `COUNT(*)` counts **every single row** in the table, regardless of what values columns hold.',
                    '• `COUNT(column_name)` counts **only non-NULL values** in that specific column.',
                    'If 2 out of 5 customers have a NULL email, `COUNT(*)` returns 5, while `COUNT(email)` returns 3.'
                ],
                targetQuery: {
                    sql: 'SELECT COUNT(*) AS total_rows, COUNT(email) AS emails_present\nFROM customers;',
                    explanation: 'Count total customer rows versus how many have a non-NULL email address.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: FROM customers (Evaluate table rows)',
                        sqlSnippet: 'FROM customers',
                        explanation: 'SQL visits customers table containing 5 records (3 with valid emails, 2 with NULL).',
                        tableData: {
                            tableName: 'customers (Candidate Rows)',
                            columns: [
                                'name',
                                'email'
                            ],
                            rows: [
                                [
                                    'Rafiul Islam',
                                    'rafiul@example.com'
                                ],
                                [
                                    'Priya Akter',
                                    'priya.akter@example.com'
                                ],
                                [
                                    'Tanvir Ahmed',
                                    null
                                ],
                                [
                                    'Nusrat Jahan',
                                    'nusrat.j@example.com'
                                ],
                                [
                                    'Shakil Ahmed',
                                    null
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: 'Step 2: Aggregate COUNT(*) vs COUNT(email)',
                        sqlSnippet: 'SELECT COUNT(*) AS total_rows, COUNT(email) AS emails_present',
                        explanation: 'Processes customer rows: counts 5 total rows and 3 valid email entries.',
                        tableData: {
                            tableName: 'Count Summary Result',
                            columns: [
                                'total_rows',
                                'emails_present'
                            ],
                            highlightedColumns: [
                                'total_rows',
                                'emails_present'
                            ],
                            rows: [
                                [
                                    5,
                                    3
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'Counting rows syntax',
                        sql: 'SELECT COUNT(*) AS total_records FROM products;\nSELECT COUNT(email) AS non_null_emails FROM customers;',
                        description: 'COUNT(*) counts rows; COUNT(column) ignores NULLs.'
                    }
                ],
                keyTakeaway: 'COUNT(*) counts all rows; COUNT(column) ignores NULL entries.',
                exampleQuery: 'SELECT COUNT(*) AS total_products FROM products;',
                exampleQueryExplanation: 'Counts total number of products in the inventory catalog.',
                liveDemoSql: 'SELECT COUNT(*) AS total_products, COUNT(category_id) AS categorized_products FROM products;',
                liveDemoNotes: 'Displays overall row count vs categorized products.',
                mcqs: [
                    {
                        question: 'What is the difference between COUNT(*) and COUNT(email)?',
                        options: [
                            'A. COUNT(*) is faster but less accurate',
                            'B. COUNT(*) counts all rows; COUNT(email) counts only rows where email is NOT NULL',
                            'C. COUNT(email) counts only distinct emails',
                            'D. There is no difference'
                        ],
                        correctIndex: 1,
                        explanation: '`COUNT(*)` counts every row regardless of content, whereas `COUNT(column)` ignores NULL values.'
                    }
                ],
                masteryPoints: [
                    'Use COUNT(*) for total row count',
                    'Use COUNT(column) to count non-NULL entries'
                ]
            },
            tasks: [
                {
                    id: 'day09-c1a-t1',
                    title: 'Task 1: Total Product Count',
                    description: 'Calculate the total number of products in the products table using COUNT(*).',
                    instructions: [
                        'Select `COUNT(*) AS total_products` from `products`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'products',
                    initialSql: '-- Total product count\n',
                    solutionSql: 'SELECT COUNT(*) AS total_products FROM products;',
                    solutionExplanation: '`COUNT(*)` computes the total number of catalog rows (28).',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `SELECT COUNT(*) AS total_products FROM products;`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requiredColumns: [
                            'total_products'
                        ],
                        expectedRowCount: 1
                    },
                    successMessage: 'Total products counted successfully!'
                },
                {
                    id: 'day09-c1a-t2',
                    title: 'Task 2: Count Customers with Valid Email',
                    description: 'Use COUNT(email) to count how many customers have provided a valid (non-NULL) email address without using a WHERE clause.',
                    instructions: [
                        'Query the `customers` table.',
                        'Select `COUNT(email) AS customers_with_email`.'
                    ],
                    type: 'independent',
                    primaryTable: 'customers',
                    initialSql: '-- Count non-NULL emails with COUNT(email)\n',
                    solutionSql: 'SELECT COUNT(email) AS customers_with_email FROM customers;',
                    solutionExplanation: '`COUNT(email)` ignores NULL email values, returning 13 for 15 customer rows.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `SELECT COUNT(email) AS customers_with_email FROM customers;`'
                        }
                    ],
                    validation: {
                        targetTable: 'customers',
                        requiredColumns: [
                            'customers_with_email'
                        ],
                        expectedRowCount: 1
                    },
                    successMessage: 'Perfect! You used COUNT(column) to count non-NULL entries.'
                }
            ]
        },
        // =========================================================================
        // CONCEPT 1b: Finding the Smallest Value with MIN
        // =========================================================================
        {
            id: 'aggregate-min',
            order: 2,
            title: '2. Finding the Smallest Value with MIN',
            shortDescription: 'Find the lowest numerical, alphabetical, or chronological value.',
            theory: {
                summary: '`MIN(column)` scans all non-NULL values in a column and returns the single lowest scalar value.',
                introTable: {
                    tableName: 'products',
                    description: 'Products price scan',
                    columns: [
                        'product_id',
                        'name',
                        'price'
                    ],
                    rows: [
                        [
                            1,
                            'Wireless Mouse',
                            15.99
                        ],
                        [
                            3,
                            'USB-C Charging Cable',
                            9.99
                        ],
                        [
                            12,
                            'Sticky Notes Pack',
                            4.99
                        ],
                        [
                            14,
                            'Office Chair',
                            120.00
                        ]
                    ]
                },
                explanation: [
                    '### 1. The MIN Function',
                    '`MIN(price)` examines every price value in the table and outputs the lowest one ($4.99).',
                    'Like all summary aggregates, `MIN` ignores NULL values.'
                ],
                targetQuery: {
                    sql: 'SELECT MIN(price) AS lowest_price\nFROM products;',
                    explanation: 'Find the lowest product price in the catalog.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: FROM products (Scan price values)',
                        sqlSnippet: 'FROM products',
                        explanation: 'SQL visits all product records.',
                        tableData: {
                            tableName: 'products (Candidate Prices)',
                            columns: [
                                'name',
                                'price'
                            ],
                            rows: [
                                [
                                    'Wireless Mouse',
                                    15.99
                                ],
                                [
                                    'USB-C Charging Cable',
                                    9.99
                                ],
                                [
                                    'Sticky Notes Pack',
                                    4.99
                                ],
                                [
                                    'Office Chair',
                                    120.00
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: 'Step 2: SELECT MIN(price) (Identify minimum)',
                        sqlSnippet: 'SELECT MIN(price) AS lowest_price',
                        explanation: 'Scans all prices and finds $4.99.',
                        tableData: {
                            tableName: 'MIN Scalar Result',
                            columns: [
                                'lowest_price'
                            ],
                            highlightedColumns: [
                                'lowest_price'
                            ],
                            rows: [
                                [
                                    4.99
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'MIN syntax',
                        sql: 'SELECT MIN(price) AS lowest_price FROM products;',
                        description: 'Returns the minimum numeric value in the price column.'
                    }
                ],
                keyTakeaway: 'MIN(column) finds the lowest value in a column across all non-NULL rows.',
                exampleQuery: 'SELECT MIN(price) AS lowest_price FROM products;',
                exampleQueryExplanation: 'Returns the cheapest product price in inventory.',
                liveDemoSql: 'SELECT MIN(price) AS lowest_price FROM products;',
                liveDemoNotes: 'Displays lowest catalog price ($4.99).',
                mcqs: [
                    {
                        question: 'What does `SELECT MIN(price) FROM products;` return if prices are $15, $4.99, and $120?',
                        options: [
                            'A. $15.00',
                            'B. $4.99',
                            'C. $120.00',
                            'D. $46.66'
                        ],
                        correctIndex: 1,
                        explanation: 'MIN selects the lowest value ($4.99).'
                    }
                ],
                masteryPoints: [
                    'Use MIN to identify lowest prices, earliest dates, or alphabetical minimums'
                ]
            },
            tasks: [
                {
                    id: 'day09-c1b-t1',
                    title: 'Task 1: Minimum Product Price',
                    description: 'Find the lowest product price in the products table using MIN(price).',
                    instructions: [
                        'Select `MIN(price) AS lowest_price` from `products`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'products',
                    initialSql: '-- Find lowest price\n',
                    solutionSql: 'SELECT MIN(price) AS lowest_price FROM products;',
                    solutionExplanation: '`MIN(price)` identifies the lowest catalog price ($4.99).',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `SELECT MIN(price) AS lowest_price FROM products;`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requiredColumns: [
                            'lowest_price'
                        ],
                        expectedRowCount: 1
                    },
                    successMessage: 'Lowest price found successfully!'
                },
                {
                    id: 'day09-c1b-t2',
                    title: 'Task 2: Youngest Student Age',
                    description: 'Find the youngest student age in the students table using MIN(age).',
                    instructions: [
                        'Query the `students` table.',
                        'Select `MIN(age) AS youngest_age`.'
                    ],
                    type: 'independent',
                    primaryTable: 'students',
                    initialSql: '-- Find youngest student age\n',
                    solutionSql: 'SELECT MIN(age) AS youngest_age FROM students;',
                    solutionExplanation: '`MIN(age)` identifies age 20 (Ayesha).',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `SELECT MIN(age) AS youngest_age FROM students;`'
                        }
                    ],
                    validation: {
                        targetTable: 'students',
                        requiredColumns: [
                            'youngest_age'
                        ],
                        expectedRowCount: 1
                    },
                    successMessage: 'Spot on! Youngest student age identified.'
                }
            ]
        },
        // =========================================================================
        // CONCEPT 1c: Finding the Largest Value with MAX
        // =========================================================================
        {
            id: 'aggregate-max',
            order: 3,
            title: '3. Finding the Largest Value with MAX',
            shortDescription: 'Find the highest numerical, alphabetical, or latest chronological value.',
            theory: {
                summary: '`MAX(column)` scans all non-NULL values in a column and returns the single highest scalar value.',
                introTable: {
                    tableName: 'products',
                    description: 'Products price scan',
                    columns: [
                        'product_id',
                        'name',
                        'price'
                    ],
                    rows: [
                        [
                            1,
                            'Wireless Mouse',
                            15.99
                        ],
                        [
                            4,
                            'Mechanical Keyboard',
                            65.00
                        ],
                        [
                            14,
                            'Office Chair',
                            120.00
                        ],
                        [
                            15,
                            'Filing Cabinet',
                            89.99
                        ]
                    ]
                },
                explanation: [
                    '### 1. The MAX Function',
                    '`MAX(price)` examines every price value in the table and outputs the highest one ($120.00).',
                    'MAX works on numbers, strings (alphabetical latest), and timestamps (most recent dates).'
                ],
                targetQuery: {
                    sql: 'SELECT MAX(price) AS highest_price\nFROM products;',
                    explanation: 'Find the most expensive product price in the catalog.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: FROM products (Scan price list)',
                        sqlSnippet: 'FROM products',
                        explanation: 'SQL visits product prices in inventory.',
                        tableData: {
                            tableName: 'products (Candidate Prices)',
                            columns: [
                                'name',
                                'price'
                            ],
                            rows: [
                                [
                                    'Wireless Mouse',
                                    15.99
                                ],
                                [
                                    'Mechanical Keyboard',
                                    65.00
                                ],
                                [
                                    'Office Chair',
                                    120.00
                                ],
                                [
                                    'Filing Cabinet',
                                    89.99
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: 'Step 2: SELECT MAX(price) (Identify maximum)',
                        sqlSnippet: 'SELECT MAX(price) AS highest_price',
                        explanation: 'Scans all prices and finds $120.00.',
                        tableData: {
                            tableName: 'MAX Scalar Result',
                            columns: [
                                'highest_price'
                            ],
                            highlightedColumns: [
                                'highest_price'
                            ],
                            rows: [
                                [
                                    120.00
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'MAX syntax',
                        sql: 'SELECT MAX(price) AS highest_price FROM products;',
                        description: 'Returns the maximum numeric value in the price column.'
                    }
                ],
                keyTakeaway: 'MAX(column) finds the highest value in a column across all non-NULL rows.',
                exampleQuery: 'SELECT MAX(price) AS highest_price FROM products;',
                exampleQueryExplanation: 'Returns the most expensive product price in inventory.',
                liveDemoSql: 'SELECT MAX(price) AS highest_price FROM products;',
                liveDemoNotes: 'Displays highest catalog price ($120.00).',
                mcqs: [
                    {
                        question: 'Which query finds the maximum inventory quantity across all products?',
                        options: [
                            'A. SELECT MAX(quantity_in_stock) AS max_stock FROM products;',
                            'B. SELECT MIN(quantity_in_stock) AS max_stock FROM products;',
                            'C. SELECT COUNT(quantity_in_stock) AS max_stock FROM products;',
                            'D. SELECT SUM(quantity_in_stock) AS max_stock FROM products;'
                        ],
                        correctIndex: 0,
                        explanation: 'MAX(column) computes the highest value in that column.'
                    }
                ],
                masteryPoints: [
                    'Use MAX to identify highest prices, latest dates, or top capacities'
                ]
            },
            tasks: [
                {
                    id: 'day09-c1c-t1',
                    title: 'Task 1: Maximum Product Price',
                    description: 'Find the highest product price in the products table using MAX(price).',
                    instructions: [
                        'Select `MAX(price) AS highest_price` from `products`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'products',
                    initialSql: '-- Find highest price\n',
                    solutionSql: 'SELECT MAX(price) AS highest_price FROM products;',
                    solutionExplanation: '`MAX(price)` identifies the top catalog price ($120.00).',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `SELECT MAX(price) AS highest_price FROM products;`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requiredColumns: [
                            'highest_price'
                        ],
                        expectedRowCount: 1
                    },
                    successMessage: 'Highest price found successfully!'
                },
                {
                    id: 'day09-c1c-t2',
                    title: 'Task 2: Oldest Student Age',
                    description: 'Find the oldest student age in the students table using MAX(age).',
                    instructions: [
                        'Query the `students` table.',
                        'Select `MAX(age) AS oldest_age`.'
                    ],
                    type: 'independent',
                    primaryTable: 'students',
                    initialSql: '-- Find oldest student age\n',
                    solutionSql: 'SELECT MAX(age) AS oldest_age FROM students;',
                    solutionExplanation: '`MAX(age)` identifies age 23 (Sumaiya).',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `SELECT MAX(age) AS oldest_age FROM students;`'
                        }
                    ],
                    validation: {
                        targetTable: 'students',
                        requiredColumns: [
                            'oldest_age'
                        ],
                        expectedRowCount: 1
                    },
                    successMessage: 'Spot on! Oldest student age identified.'
                }
            ]
        },
        // =========================================================================
        // CONCEPT 1d: Adding Values with SUM
        // =========================================================================
        {
            id: 'aggregate-sum',
            order: 4,
            title: '4. Adding Values with SUM',
            shortDescription: 'Calculate the mathematical sum of numeric values across rows.',
            theory: {
                summary: '`SUM(column)` adds together all non-NULL numeric values in a column, outputting a single total scalar value.',
                introTable: {
                    tableName: 'products',
                    description: 'Products price list',
                    columns: [
                        'product_id',
                        'name',
                        'price',
                        'quantity_in_stock'
                    ],
                    rows: [
                        [
                            1,
                            'Wireless Mouse',
                            15.99,
                            40
                        ],
                        [
                            2,
                            'Bluetooth Speaker',
                            45.50,
                            3
                        ],
                        [
                            4,
                            'Mechanical Keyboard',
                            65.00,
                            12
                        ]
                    ]
                },
                explanation: [
                    '### 1. The SUM Function',
                    '`SUM(quantity_in_stock)` adds up all inventory units across all products.',
                    'SUM only works on numeric data types (INT, DECIMAL, FLOAT).'
                ],
                targetQuery: {
                    sql: 'SELECT SUM(quantity_in_stock) AS total_units\nFROM products;',
                    explanation: 'Calculate the total inventory units across all products in stock.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: FROM products (Scan quantities)',
                        sqlSnippet: 'FROM products',
                        explanation: 'SQL visits the products table.',
                        tableData: {
                            tableName: 'products (Candidate Units)',
                            columns: [
                                'name',
                                'quantity_in_stock'
                            ],
                            rows: [
                                [
                                    'Wireless Mouse',
                                    40
                                ],
                                [
                                    'Bluetooth Speaker',
                                    3
                                ],
                                [
                                    'Mechanical Keyboard',
                                    12
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: 'Step 2: SELECT SUM(quantity_in_stock) (Sum counts)',
                        sqlSnippet: 'SELECT SUM(quantity_in_stock) AS total_units',
                        explanation: 'Adds 40 + 3 + 12 = 55 total units.',
                        tableData: {
                            tableName: 'SUM Scalar Result',
                            columns: [
                                'total_units'
                            ],
                            highlightedColumns: [
                                'total_units'
                            ],
                            rows: [
                                [
                                    55
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'SUM syntax',
                        sql: 'SELECT SUM(quantity_in_stock) AS total_inventory FROM products;',
                        description: 'Computes arithmetic sum of numeric values.'
                    }
                ],
                keyTakeaway: 'SUM(column) calculates the total sum of all non-NULL numbers in a column.',
                exampleQuery: 'SELECT SUM(price) AS total_catalog_price FROM products;',
                exampleQueryExplanation: 'Sums all individual product prices.',
                liveDemoSql: 'SELECT SUM(quantity_in_stock) AS total_units FROM products;',
                liveDemoNotes: 'Displays total units in stock across all products.',
                mcqs: [
                    {
                        question: 'What happens if SUM(column) encounters rows with NULL values?',
                        options: [
                            'A. The entire sum becomes NULL',
                            'B. The query fails with an error',
                            'C. NULL values are ignored and the remaining non-NULL numbers are summed',
                            'D. NULL is converted to 10'
                        ],
                        correctIndex: 2,
                        explanation: 'SUM ignores NULL values and sums only the valid numeric numbers.'
                    }
                ],
                masteryPoints: [
                    'Use SUM for grand totals and financial sums'
                ]
            },
            tasks: [
                {
                    id: 'day09-c1d-t1',
                    title: 'Task 1: Total Catalog Price Sum',
                    description: 'Calculate the sum of all product prices using SUM(price).',
                    instructions: [
                        'Select `SUM(price) AS total_catalog_price` from `products`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'products',
                    initialSql: '-- Sum all prices\n',
                    solutionSql: 'SELECT SUM(price) AS total_catalog_price FROM products;',
                    solutionExplanation: '`SUM(price)` calculates the total value of all catalog item list prices.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `SELECT SUM(price) AS total_catalog_price FROM products;`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requiredColumns: [
                            'total_catalog_price'
                        ],
                        expectedRowCount: 1
                    },
                    successMessage: 'Total catalog price summed!'
                },
                {
                    id: 'day09-c1d-t2',
                    title: 'Task 2: Total Units in Stock',
                    description: 'Calculate the total number of stock units across all products in inventory.',
                    instructions: [
                        'Query the `products` table.',
                        'Select `SUM(quantity_in_stock) AS total_units`.'
                    ],
                    type: 'independent',
                    primaryTable: 'products',
                    initialSql: '-- Total stock units\n',
                    solutionSql: 'SELECT SUM(quantity_in_stock) AS total_units FROM products;',
                    solutionExplanation: '`SUM(quantity_in_stock)` adds up all inventory counts.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `SELECT SUM(quantity_in_stock) AS total_units FROM products;`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requiredColumns: [
                            'total_units'
                        ],
                        expectedRowCount: 1
                    },
                    successMessage: 'Well done! Total inventory units computed.'
                }
            ]
        },
        // =========================================================================
        // CONCEPT 1e: Calculating an Average with AVG
        // =========================================================================
        {
            id: 'aggregate-avg',
            order: 5,
            title: '5. Calculating an Average with AVG',
            shortDescription: 'Calculate the arithmetic mean across non-NULL numeric values.',
            theory: {
                summary: '`AVG(column)` divides the sum of all non-NULL values by the count of non-NULL values.',
                introTable: {
                    tableName: 'students',
                    description: 'Students age table',
                    columns: [
                        'id',
                        'name',
                        'age'
                    ],
                    rows: [
                        [
                            1,
                            'Rahim',
                            21
                        ],
                        [
                            2,
                            'Karim',
                            22
                        ],
                        [
                            3,
                            'Ayesha',
                            20
                        ],
                        [
                            4,
                            'Sumaiya',
                            23
                        ],
                        [
                            5,
                            'Tanvir',
                            21
                        ]
                    ]
                },
                explanation: [
                    '### 1. How AVG Calculates',
                    '`AVG(age)` computes $(21 + 22 + 20 + 23 + 21) / 5 = 21.40$.',
                    'If a row has `NULL`, it is excluded from BOTH the sum (numerator) and the count (denominator).'
                ],
                targetQuery: {
                    sql: 'SELECT AVG(age) AS avg_age\nFROM students;',
                    explanation: 'Compute the average age of all enrolled students.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: FROM students (Extract student ages)',
                        sqlSnippet: 'FROM students',
                        explanation: 'SQL visits all student age records.',
                        tableData: {
                            tableName: 'students (Ages)',
                            columns: [
                                'name',
                                'age'
                            ],
                            rows: [
                                [
                                    'Rahim',
                                    21
                                ],
                                [
                                    'Karim',
                                    22
                                ],
                                [
                                    'Ayesha',
                                    20
                                ],
                                [
                                    'Sumaiya',
                                    23
                                ],
                                [
                                    'Tanvir',
                                    21
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: 'Step 2: SELECT AVG(age) (Compute mean)',
                        sqlSnippet: 'SELECT AVG(age) AS avg_age',
                        explanation: 'Sums ages (107) and divides by 5 students = 21.4.',
                        tableData: {
                            tableName: 'AVG Scalar Result',
                            columns: [
                                'avg_age'
                            ],
                            highlightedColumns: [
                                'avg_age'
                            ],
                            rows: [
                                [
                                    21.4
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'AVG syntax',
                        sql: 'SELECT AVG(price) AS avg_price FROM products;',
                        description: 'Computes arithmetic average of the price column.'
                    }
                ],
                keyTakeaway: 'AVG(column) divides the sum of non-NULL values by the count of non-NULL values.',
                exampleQuery: 'SELECT AVG(price) AS avg_price FROM products;',
                exampleQueryExplanation: 'Calculates the average product price in the catalog.',
                liveDemoSql: 'SELECT AVG(price) AS avg_price FROM products;',
                liveDemoNotes: 'Displays average catalog price.',
                mcqs: [
                    {
                        question: 'Prices are $10, $20, NULL, and $30. What does `AVG(price)` return?',
                        options: [
                            'A. $15.00 (sum 60 / 4)',
                            'B. $20.00 (sum 60 / 3, since NULL is excluded from count)',
                            'C. NULL',
                            'D. Error'
                        ],
                        correctIndex: 1,
                        explanation: 'AVG excludes NULL from both numerator and denominator: $60 / 3 = $20.00.'
                    }
                ],
                masteryPoints: [
                    'Use AVG to compute arithmetic means accurately'
                ]
            },
            tasks: [
                {
                    id: 'day09-c1e-t1',
                    title: 'Task 1: Average Product Price',
                    description: 'Calculate the average price of all products in the catalog.',
                    instructions: [
                        'Select `AVG(price) AS avg_price` from `products`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'products',
                    initialSql: '-- Average price\n',
                    solutionSql: 'SELECT AVG(price) AS avg_price FROM products;',
                    solutionExplanation: '`AVG(price)` calculates the mean product price.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `SELECT AVG(price) AS avg_price FROM products;`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requiredColumns: [
                            'avg_price'
                        ],
                        expectedRowCount: 1
                    },
                    successMessage: 'Average price calculated!'
                },
                {
                    id: 'day09-c1e-t2',
                    title: 'Task 2: Average Student Age',
                    description: 'Calculate the average age of all students in the students table.',
                    instructions: [
                        'Query the `students` table.',
                        'Select `AVG(age) AS avg_age`.'
                    ],
                    type: 'independent',
                    primaryTable: 'students',
                    initialSql: '-- Average student age\n',
                    solutionSql: 'SELECT AVG(age) AS avg_age FROM students;',
                    solutionExplanation: '`AVG(age)` computes the average student age (21.4).',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `SELECT AVG(age) AS avg_age FROM students;`'
                        }
                    ],
                    validation: {
                        targetTable: 'students',
                        requiredColumns: [
                            'avg_age'
                        ],
                        expectedRowCount: 1
                    },
                    successMessage: 'Spot on! Average student age calculated.'
                }
            ]
        },
        // =========================================================================
        // CONCEPT 2: Grouping with GROUP BY
        // =========================================================================
        {
            id: 'grouping-with-group-by',
            order: 6,
            title: '6. Grouping Rows with GROUP BY',
            shortDescription: 'Segment calculations by category, status, or location.',
            theory: {
                summary: 'When combined with `GROUP BY`, aggregate calculations are performed separately for each category or bucket.',
                introTable: {
                    tableName: 'products',
                    description: 'Products grouped by category_id',
                    columns: [
                        'product_id',
                        'name',
                        'category_id',
                        'price'
                    ],
                    rows: [
                        [
                            1,
                            'Wireless Mouse',
                            1,
                            15.99
                        ],
                        [
                            2,
                            'Bluetooth Speaker',
                            1,
                            45.50
                        ],
                        [
                            6,
                            'Stainless Steel Pan Set',
                            2,
                            55.00
                        ],
                        [
                            7,
                            'Ceramic Mixing Bowls',
                            2,
                            22.30
                        ],
                        [
                            11,
                            'Desk Organizer',
                            3,
                            14.25
                        ]
                    ]
                },
                explanation: [
                    '### 1. How GROUP BY Works',
                    'SQL sorts rows into buckets sharing the same `category_id`, then calculates aggregates per bucket.',
                    'If a column contains `NULL`, SQL places all NULL rows into their own separate group.'
                ],
                targetQuery: {
                    sql: 'SELECT category_id, COUNT(*) AS total_products\nFROM products\nGROUP BY category_id;',
                    explanation: 'Group products by category and calculate total items in each bucket.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: FROM products GROUP BY category_id (Partition buckets)',
                        sqlSnippet: 'FROM products GROUP BY category_id',
                        explanation: 'Partitions all products into groups sharing the same category_id.',
                        tableData: {
                            tableName: 'Categorized Product Groups',
                            columns: [
                                'category_id',
                                'name'
                            ],
                            rows: [
                                [
                                    1,
                                    'Wireless Mouse, Speaker, Cable... (6 items)'
                                ],
                                [
                                    2,
                                    'Pan Set, Bowls... (5 items)'
                                ],
                                [
                                    3,
                                    'Desk Organizer, Chair... (5 items)'
                                ],
                                [
                                    4,
                                    'Sporting Goods... (5 items)'
                                ],
                                [
                                    5,
                                    'Books & Media... (6 items)'
                                ],
                                [
                                    null,
                                    'Uncategorized (1 item)'
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: 'Step 2: SELECT category_id, COUNT(*) (Compute per-group metric)',
                        sqlSnippet: 'SELECT category_id, COUNT(*) AS total_products',
                        explanation: 'Creates a summary row for each category with its item count.',
                        tableData: {
                            tableName: 'Category Summary Result',
                            columns: [
                                'category_id',
                                'total_products'
                            ],
                            highlightedColumns: [
                                'category_id',
                                'total_products'
                            ],
                            highlightedRows: [
                                0,
                                1,
                                2,
                                3,
                                4,
                                5
                            ],
                            rows: [
                                [
                                    1,
                                    6
                                ],
                                [
                                    2,
                                    5
                                ],
                                [
                                    3,
                                    5
                                ],
                                [
                                    4,
                                    5
                                ],
                                [
                                    5,
                                    6
                                ],
                                [
                                    null,
                                    1
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'Grouping syntax',
                        sql: 'SELECT category_id, COUNT(*) AS product_count\nFROM products\nGROUP BY category_id;',
                        description: 'Calculates product count per category.'
                    }
                ],
                keyTakeaway: 'GROUP BY divides rows into buckets so aggregates compute per group.',
                exampleQuery: 'SELECT category_id, COUNT(*) AS total_products FROM products GROUP BY category_id;',
                exampleQueryExplanation: 'Counts total products in each category.',
                liveDemoSql: 'SELECT category_id, COUNT(*) AS total_products FROM products GROUP BY category_id;',
                liveDemoNotes: 'Displays product counts per category.',
                mcqs: [
                    {
                        question: 'How does GROUP BY treat rows where the grouping column is NULL?',
                        options: [
                            'A. It discards them completely',
                            'B. It groups them together into their own single NULL group row',
                            'C. It throws a runtime syntax error',
                            'D. It puts them in group 0'
                        ],
                        correctIndex: 1,
                        explanation: 'SQL groups NULL values together into a single group row.'
                    }
                ],
                masteryPoints: [
                    'Use GROUP BY with aggregate functions',
                    'Understand NULL handling in GROUP BY'
                ]
            },
            tasks: [
                {
                    id: 'day09-c2-t1',
                    title: 'Task 1: Total Products per Category',
                    description: 'Count the total number of products in each category.',
                    instructions: [
                        'Select `category_id` and `COUNT(*) AS total_products` from `products`.',
                        'Group by `category_id`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'products',
                    initialSql: '-- Write your SQL query here\n',
                    solutionSql: 'SELECT category_id, COUNT(*) AS total_products FROM products GROUP BY category_id;',
                    solutionExplanation: '`GROUP BY category_id` computes the count for each category.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `SELECT category_id, COUNT(*) AS total_products FROM products GROUP BY category_id;`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requireGroupBy: true,
                        expectedRowCount: 6
                    },
                    successMessage: 'Products per category counted!'
                },
                {
                    id: 'day09-c2-t2',
                    title: 'Task 2: Customer Distribution by City',
                    description: 'Count the number of customers residing in each city.',
                    instructions: [
                        'Query the `customers` table.',
                        'Select `city` and `COUNT(*) AS customer_count`.',
                        'Group by `city`.'
                    ],
                    type: 'independent',
                    primaryTable: 'customers',
                    initialSql: '-- Customer count by city\n',
                    solutionSql: 'SELECT city, COUNT(*) AS customer_count FROM customers GROUP BY city;',
                    solutionExplanation: 'Groups customers by city and counts them.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `SELECT city, COUNT(*) AS customer_count FROM customers GROUP BY city;`'
                        }
                    ],
                    validation: {
                        targetTable: 'customers',
                        requiredColumns: [
                            'city',
                            'customer_count'
                        ],
                        requireGroupBy: true,
                        expectedRowCount: 6
                    },
                    successMessage: 'Perfect! Customer distribution computed.'
                }
            ]
        },
        // =========================================================================
        // CONCEPT 3: Filtering Groups with HAVING
        // =========================================================================
        {
            id: 'having-filter',
            order: 7,
            title: '7. Filtering Groups with HAVING',
            shortDescription: 'Filter aggregate summaries after grouping.',
            theory: {
                summary: '`WHERE` filters individual rows BEFORE grouping. `HAVING` filters aggregate group values AFTER grouping.',
                introTable: {
                    tableName: 'products',
                    description: 'Aggregated category pricing',
                    columns: [
                        'category_id',
                        'total_products',
                        'avg_price'
                    ],
                    rows: [
                        [
                            1,
                            6,
                            31.79
                        ],
                        [
                            2,
                            5,
                            28.56
                        ],
                        [
                            3,
                            5,
                            47.15
                        ],
                        [
                            4,
                            5,
                            29.10
                        ],
                        [
                            5,
                            6,
                            20.62
                        ]
                    ]
                },
                explanation: [
                    '### 1. WHERE vs HAVING Timing',
                    '• **WHERE** filters individual raw records *before* `GROUP BY` aggregates them.',
                    '• **HAVING** filters grouped summary rows *after* `GROUP BY` aggregates them.',
                    'Writing `WHERE COUNT(*) > 2` is an error because WHERE runs before aggregates exist. Always use `HAVING`.'
                ],
                targetQuery: {
                    sql: 'SELECT category_id, COUNT(*) AS total_products, AVG(price) AS avg_price\nFROM products\nGROUP BY category_id\nHAVING AVG(price) > 30;',
                    explanation: 'Group products by category and filter for categories averaging over $30.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: FROM products GROUP BY category_id (Aggregate all categories)',
                        sqlSnippet: 'FROM products GROUP BY category_id',
                        explanation: 'Computes product count and average price for all categories.',
                        tableData: {
                            tableName: 'All Aggregated Categories',
                            columns: [
                                'category_id',
                                'total_products',
                                'avg_price'
                            ],
                            rows: [
                                [
                                    1,
                                    6,
                                    31.79
                                ],
                                [
                                    2,
                                    5,
                                    28.56
                                ],
                                [
                                    3,
                                    5,
                                    47.15
                                ],
                                [
                                    4,
                                    5,
                                    29.10
                                ],
                                [
                                    5,
                                    6,
                                    20.62
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: 'Step 2: HAVING AVG(price) > 30 (Filter group averages)',
                        sqlSnippet: 'HAVING AVG(price) > 30',
                        explanation: 'Discards categories averaging under $30, keeping categories 1 and 3.',
                        tableData: {
                            tableName: 'Filtered Category Groups',
                            columns: [
                                'category_id',
                                'total_products',
                                'avg_price'
                            ],
                            highlightedColumns: [
                                'avg_price'
                            ],
                            highlightedRows: [
                                0,
                                1
                            ],
                            rows: [
                                [
                                    1,
                                    6,
                                    31.79
                                ],
                                [
                                    3,
                                    5,
                                    47.15
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'HAVING syntax',
                        sql: 'SELECT category_id, COUNT(*) AS total_products, AVG(price) AS avg_price\nFROM products\nGROUP BY category_id\nHAVING AVG(price) > 30\nORDER BY avg_price DESC;',
                        description: 'Full aggregation pipeline: GROUP BY -> HAVING -> ORDER BY.'
                    }
                ],
                keyTakeaway: 'Use WHERE for raw row filtering and HAVING for aggregate summary filtering.',
                exampleQuery: 'SELECT category_id, AVG(price) AS avg_price FROM products GROUP BY category_id ORDER BY avg_price DESC;',
                exampleQueryExplanation: 'Calculates average price per category sorted highest first.',
                liveDemoSql: 'SELECT category_id, AVG(price) AS avg_price FROM products GROUP BY category_id ORDER BY avg_price DESC;',
                liveDemoNotes: 'Displays average price per category.',
                mcqs: [
                    {
                        question: 'Why can you NOT write `WHERE COUNT(*) > 5` in SQL?',
                        options: [
                            'A. Because COUNT is only allowed in SELECT',
                            'B. Because WHERE evaluates individual rows before groups or aggregate counts exist; you must use HAVING',
                            'C. Because 5 is a magic number in SQL',
                            'D. Because WHERE only accepts text'
                        ],
                        correctIndex: 1,
                        explanation: 'WHERE filters rows before aggregation. To filter on aggregate values, you must use HAVING.'
                    }
                ],
                masteryPoints: [
                    'Filter aggregates with HAVING',
                    'Understand WHERE vs HAVING timing'
                ]
            },
            tasks: [
                {
                    id: 'day09-c3-t1',
                    title: 'Task 1: Average Price per Category',
                    description: 'Calculate the average price for each category, sorted highest first.',
                    instructions: [
                        'Select `category_id` and `AVG(price) AS avg_price` from `products`.',
                        'Group by `category_id` and order by `avg_price DESC`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'products',
                    initialSql: '-- Write your SQL query here\n',
                    solutionSql: 'SELECT category_id, AVG(price) AS avg_price FROM products GROUP BY category_id ORDER BY avg_price DESC;',
                    solutionExplanation: 'Computes average price per category and sorts descending.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `GROUP BY category_id ORDER BY avg_price DESC;`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requireGroupBy: true,
                        requireOrderBy: [
                            {
                                column: 'avg_price',
                                direction: 'DESC'
                            }
                        ],
                        expectedRowCount: 6
                    },
                    successMessage: 'Average price per category computed!'
                },
                {
                    id: 'day09-c3-t2',
                    title: 'Task 2: High Density Cities (HAVING)',
                    description: 'Find cities with 2 or more customers, sorted by customer count descending.',
                    instructions: [
                        'Query the `customers` table.',
                        'Select `city` and `COUNT(*) AS customer_count`.',
                        'Group by `city`.',
                        'Filter with `HAVING COUNT(*) >= 2`.',
                        'Order by `customer_count DESC`.'
                    ],
                    type: 'independent',
                    primaryTable: 'customers',
                    initialSql: '-- Cities with at least 2 customers\n',
                    solutionSql: 'SELECT city, COUNT(*) AS customer_count FROM customers GROUP BY city HAVING COUNT(*) >= 2 ORDER BY customer_count DESC;',
                    solutionExplanation: 'Groups by city and uses HAVING to keep cities with >= 2 customers.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `HAVING COUNT(*) >= 2 ORDER BY customer_count DESC;`'
                        }
                    ],
                    validation: {
                        targetTable: 'customers',
                        requiredColumns: [
                            'city',
                            'customer_count'
                        ],
                        requireGroupBy: true,
                        requireHaving: true,
                        requireOrderBy: [
                            {
                                column: 'customer_count',
                                direction: 'DESC'
                            }
                        ],
                        expectedRowCount: 4
                    },
                    successMessage: 'Great job! You filtered aggregate groups with HAVING.'
                }
            ]
        }
    ],
    // ===========================================================================
    // DAY 9 CHALLENGE (MASTER CURRICULUM ASSIGNMENT)
    // ===========================================================================
    challenge: {
        id: 'day-09-homework',
        title: 'Day 9 — Aggregation & Grouping (Homework)',
        scenario: 'Answer these business questions using aggregation, GROUP BY, and HAVING:',
        tasks: [
            {
                id: 'day09-hw-1',
                title: 'Task 1: Total products per category',
                description: 'Total products per category.',
                instructions: [
                    'Select `category_id` and `COUNT(*) AS total_products` from `products` grouped by `category_id`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'products',
                initialSql: '-- Task 1: Total products per category\n',
                solutionSql: 'SELECT category_id, COUNT(*) AS total_products FROM products GROUP BY category_id;',
                solutionExplanation: 'Counts total products for each category_id.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `SELECT category_id, COUNT(*) AS total_products FROM products GROUP BY category_id;`'
                    }
                ],
                validation: {
                    targetTable: 'products',
                    requireGroupBy: true,
                    expectedRowCount: 6
                },
                successMessage: 'Task 1 completed! Product counts per category retrieved.'
            },
            {
                id: 'day09-hw-2',
                title: 'Task 2: Average price per category, sorted highest first',
                description: 'Average price per category, sorted highest first.',
                instructions: [
                    'Select `category_id` and `AVG(price) AS avg_price` from `products` grouped by `category_id` ordered by `avg_price DESC`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'products',
                initialSql: '-- Task 2: Average price per category, sorted highest first\n',
                solutionSql: 'SELECT category_id, AVG(price) AS avg_price FROM products GROUP BY category_id ORDER BY avg_price DESC;',
                solutionExplanation: 'Groups by category, calculates average price, and sorts descending.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `GROUP BY category_id ORDER BY avg_price DESC;`'
                    }
                ],
                validation: {
                    targetTable: 'products',
                    requireGroupBy: true,
                    requireOrderBy: [
                        {
                            column: 'avg_price',
                            direction: 'DESC'
                        }
                    ],
                    expectedRowCount: 6
                },
                successMessage: 'Task 2 completed! Category average prices sorted.'
            },
            {
                id: 'day09-hw-3',
                title: 'Task 3: Categories with average price above $25 (HAVING)',
                description: 'Categories with average price above $25 (HAVING).',
                instructions: [
                    'Select `category_id` and `AVG(price) AS avg_price` from `products` grouped by `category_id` having `AVG(price) > 25`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'products',
                initialSql: '-- Task 3: Categories with average price > 25 (HAVING)\n',
                solutionSql: 'SELECT category_id, AVG(price) AS avg_price FROM products GROUP BY category_id HAVING AVG(price) > 25;',
                solutionExplanation: 'Uses `HAVING AVG(price) > 25` to filter for premium categories.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `GROUP BY category_id HAVING AVG(price) > 25;`'
                    }
                ],
                validation: {
                    targetTable: 'products',
                    requireGroupBy: true,
                    requireHaving: true,
                    expectedRowCount: 4
                },
                successMessage: 'Task 3 completed! Premium categories identified.'
            }
        ]
    }
};
const DAY_10_MODULE = {
    id: 'day-10',
    slug: 'practice-reporting',
    day: 10,
    title: 'Day 10 — Guided Practice: Reporting & Aggregation',
    shortTitle: 'Practice: Reporting & Aggregation',
    type: 'practice_day',
    milestoneId: 'milestone-2',
    description: 'Construct multi-metric reporting widgets and dashboards combining COUNT, SUM, AVG, GROUP BY, and HAVING post-aggregation thresholds.',
    estimatedMinutes: 60,
    completionLearnings: [
        'Construct multi-metric category and inventory summary reports combining multiple aggregates in a single SELECT',
        'Differentiate between row-level WHERE filters and group-level HAVING filters in the same query',
        'Apply post-aggregation thresholds using HAVING to isolate high-volume categories'
    ],
    concepts: [
        {
            id: 'reporting-widgets',
            order: 1,
            title: '1. Multi-Metric Reporting Queries & Dashboards',
            shortDescription: 'Combine multiple aggregates into business summary widgets.',
            theory: {
                summary: 'Reporting queries combine multiple aggregate calculations (counts, totals, averages) with group-level filtering (HAVING) and sorting to power executive dashboards.',
                introTable: {
                    tableName: 'products',
                    description: 'Inventory metrics snapshot per category',
                    columns: [
                        'category_id',
                        'COUNT(*)',
                        'AVG(price)',
                        'SUM(quantity_in_stock)'
                    ],
                    rows: [
                        [
                            1,
                            6,
                            31.79,
                            88
                        ],
                        [
                            2,
                            5,
                            28.56,
                            102
                        ],
                        [
                            3,
                            5,
                            47.15,
                            187
                        ],
                        [
                            4,
                            5,
                            29.10,
                            102
                        ],
                        [
                            5,
                            6,
                            20.62,
                            137
                        ]
                    ]
                },
                explanation: [
                    '### 1. The Multi-Metric Dashboard Pattern',
                    'A single SQL query can compute item count, average price, and total stock volume simultaneously:',
                    '```sql\nSELECT category_id, COUNT(*) AS product_count, AVG(price) AS avg_price, SUM(quantity_in_stock) AS total_units\nFROM products\nGROUP BY category_id\nHAVING AVG(price) > 25\nORDER BY product_count DESC;\n```',
                    '### 2. The Dual-Filter Rule (WHERE vs HAVING)',
                    '• **`WHERE`** filters individual rows *before* grouping (e.g. `WHERE quantity_in_stock > 0`).',
                    '• **`HAVING`** filters aggregated group metrics *after* grouping (e.g. `HAVING COUNT(*) >= 5`).'
                ],
                targetQuery: {
                    sql: 'SELECT category_id, COUNT(*) AS product_count, AVG(price) AS avg_price, SUM(quantity_in_stock) AS total_units\nFROM products\nGROUP BY category_id\nHAVING AVG(price) > 15\nORDER BY product_count DESC;',
                    explanation: 'Generate an executive category audit report for categories averaging over $15, sorted by product count.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: FROM products GROUP BY category_id (Group and aggregate)',
                        sqlSnippet: 'FROM products GROUP BY category_id',
                        explanation: 'Computes product count, avg price, and total stock per category.',
                        tableData: {
                            tableName: 'products (Aggregated Groups)',
                            columns: [
                                'category_id',
                                'product_count',
                                'avg_price',
                                'total_units'
                            ],
                            rows: [
                                [
                                    1,
                                    6,
                                    31.79,
                                    88
                                ],
                                [
                                    5,
                                    6,
                                    20.62,
                                    137
                                ],
                                [
                                    2,
                                    5,
                                    28.56,
                                    102
                                ],
                                [
                                    3,
                                    5,
                                    47.15,
                                    187
                                ],
                                [
                                    4,
                                    5,
                                    29.10,
                                    102
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: 'Step 2: HAVING AVG(price) > 15 ORDER BY product_count DESC',
                        sqlSnippet: 'HAVING AVG(price) > 15 ORDER BY product_count DESC',
                        explanation: 'Filters categories averaging over $15 and sorts highest product volume first.',
                        tableData: {
                            tableName: 'Category Audit Report Result',
                            columns: [
                                'category_id',
                                'product_count',
                                'avg_price',
                                'total_units'
                            ],
                            highlightedColumns: [
                                'category_id',
                                'product_count',
                                'avg_price',
                                'total_units'
                            ],
                            highlightedRows: [
                                0,
                                1,
                                2,
                                3,
                                4
                            ],
                            rows: [
                                [
                                    1,
                                    6,
                                    31.79,
                                    88
                                ],
                                [
                                    5,
                                    6,
                                    20.62,
                                    137
                                ],
                                [
                                    2,
                                    5,
                                    28.56,
                                    102
                                ],
                                [
                                    3,
                                    5,
                                    47.15,
                                    187
                                ],
                                [
                                    4,
                                    5,
                                    29.10,
                                    102
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'Multi-metric dashboard query',
                        sql: 'SELECT category_id, COUNT(*) AS item_count, AVG(price) AS avg_price, SUM(quantity_in_stock) AS total_stock\nFROM products\nGROUP BY category_id\nHAVING AVG(price) > 15\nORDER BY item_count DESC;',
                        description: 'Comprehensive category health metric.'
                    }
                ],
                keyTakeaway: 'Combine multiple aggregate functions in a single SELECT to build rich summaries.',
                exampleQuery: 'SELECT category_id, COUNT(*) AS total_items, AVG(price) AS avg_price FROM products GROUP BY category_id HAVING AVG(price) > 15 ORDER BY total_items DESC;',
                exampleQueryExplanation: 'Produces category overview for categories with average price above $15.',
                liveDemoSql: 'SELECT category_id, COUNT(*) AS total_items, AVG(price) AS avg_price FROM products GROUP BY category_id HAVING AVG(price) > 15 ORDER BY total_items DESC;',
                liveDemoNotes: 'Displays category overview report.',
                mcqs: [
                    {
                        question: 'Can you use multiple aggregate functions like COUNT, AVG, and SUM in the same SELECT statement?',
                        options: [
                            'A. No, only one aggregate function per query',
                            'B. Yes, you can calculate multiple metrics simultaneously',
                            'C. Only if using subqueries',
                            'D. Only in MySQL 8.0+'
                        ],
                        correctIndex: 1,
                        explanation: 'SQL allows multiple aggregate expressions in a single query.'
                    }
                ],
                masteryPoints: [
                    'Construct multi-metric reporting widgets unaided'
                ]
            },
            tasks: [
                {
                    id: 'day10-c1-t1',
                    title: 'Task 1 (High Guidance): Category Overview Widget',
                    description: 'Calculate product count and average price per category for categories averaging above $15, sorted by product count descending.',
                    instructions: [
                        'Query the `products` table.',
                        'Select `category_id`, `COUNT(*) AS product_count`, and `AVG(price) AS avg_price`.',
                        'Group by `category_id`.',
                        'Filter with `HAVING AVG(price) > 15`.',
                        'Sort by `product_count DESC`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'products',
                    initialSql: '-- Task 1: High Guidance - Category overview widget\nSELECT category_id, COUNT(*) AS product_count, AVG(price) AS avg_price\nFROM products\nGROUP BY category_id\nHAVING AVG(price) > 15\nORDER BY product_count DESC;',
                    solutionSql: 'SELECT category_id, COUNT(*) AS product_count, AVG(price) AS avg_price FROM products GROUP BY category_id HAVING AVG(price) > 15 ORDER BY product_count DESC;',
                    solutionExplanation: 'Computes metrics, filters categories averaging > $15, and sorts by count descending.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `GROUP BY category_id` to aggregate per category.'
                        },
                        {
                            level: 2,
                            text: 'Add `HAVING AVG(price) > 15 ORDER BY product_count DESC;`.'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requireGroupBy: true,
                        requireHaving: true,
                        requireOrderBy: [
                            {
                                column: 'product_count',
                                direction: 'DESC'
                            }
                        ],
                        expectedRowCount: 5
                    },
                    successMessage: 'Task 1 completed! Category overview report generated.'
                },
                {
                    id: 'day10-c1-t2',
                    title: 'Task 2 (Partial Guidance): Order Status Breakdown',
                    description: 'Count the total number of orders for each status in the orders table, sorted by count descending.',
                    instructions: [
                        'Query the `orders` table.',
                        'Select `status` and `COUNT(*) AS order_count`.',
                        'Group by `status`.',
                        'Order by `order_count DESC`.'
                    ],
                    type: 'independent',
                    primaryTable: 'orders',
                    initialSql: '-- Task 2: Partial Guidance - Order status metrics\n',
                    solutionSql: 'SELECT status, COUNT(*) AS order_count FROM orders GROUP BY status ORDER BY order_count DESC;',
                    solutionExplanation: 'Groups orders by status and calculates counts.',
                    hints: [
                        {
                            level: 1,
                            text: 'Select `status` and `COUNT(*) AS order_count`.'
                        },
                        {
                            level: 2,
                            text: 'Use `GROUP BY status ORDER BY order_count DESC;`.'
                        }
                    ],
                    validation: {
                        targetTable: 'orders',
                        requiredColumns: [
                            'status',
                            'order_count'
                        ],
                        requireGroupBy: true,
                        requireOrderBy: [
                            {
                                column: 'order_count',
                                direction: 'DESC'
                            }
                        ],
                        expectedRowCount: 4
                    },
                    successMessage: 'Task 2 completed! Order status breakdown generated.'
                },
                {
                    id: 'day10-c1-t3',
                    title: 'Task 3 (Goal Only): In-Stock Category Inventory Audit',
                    description: 'Count in-stock products per category where quantity_in_stock > 0, for categories having at least 4 in-stock products, sorted highest first.',
                    instructions: [
                        'Select `category_id` and `COUNT(*) AS in_stock_count` from `products`.',
                        'Filter rows with `WHERE quantity_in_stock > 0` before grouping.',
                        'Group by `category_id`.',
                        'Filter groups with `HAVING COUNT(*) >= 4`.',
                        'Order by `in_stock_count DESC`.'
                    ],
                    type: 'independent',
                    primaryTable: 'products',
                    initialSql: '-- Task 3: Goal Only - In-stock category inventory audit\n',
                    solutionSql: 'SELECT category_id, COUNT(*) AS in_stock_count FROM products WHERE quantity_in_stock > 0 GROUP BY category_id HAVING COUNT(*) >= 4 ORDER BY in_stock_count DESC;',
                    solutionExplanation: 'Combines row-level WHERE with group-level HAVING filter.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `WHERE quantity_in_stock > 0` before `GROUP BY category_id`.'
                        },
                        {
                            level: 2,
                            text: 'Add `HAVING COUNT(*) >= 4 ORDER BY in_stock_count DESC;`.'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requireWhere: true,
                        requireGroupBy: true,
                        requireHaving: true,
                        expectedRowCount: 5
                    },
                    successMessage: 'Task 3 completed! In-stock category inventory audit generated.'
                }
            ]
        }
    ],
    // ===========================================================================
    // DAY 10 CHALLENGE: BUILD AN EXECUTIVE DASHBOARD WIDGET (ENDING ACTIVITY)
    // ===========================================================================
    challenge: {
        id: 'day-10-homework',
        title: 'Day 10 — Build an Executive Dashboard Widget (Ending Activity)',
        scenario: 'Build the Category Overview dashboard widget independently (business requirements only):',
        tasks: [
            {
                id: 'day10-hw-1',
                title: 'Task 1: "Category Overview" Dashboard Widget',
                description: '"Category Overview" dashboard widget — product count and average price per category, only categories averaging above $15, sorted by product count descending.',
                instructions: [
                    'Select `category_id`, `COUNT(*) AS product_count`, `AVG(price) AS avg_price` from `products` grouped by `category_id` having `AVG(price) > 15` order by `product_count DESC`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'products',
                initialSql: '-- Challenge: Category Overview dashboard widget\n',
                solutionSql: 'SELECT category_id, COUNT(*) AS product_count, AVG(price) AS avg_price FROM products GROUP BY category_id HAVING AVG(price) > 15 ORDER BY product_count DESC;',
                solutionExplanation: 'Constructs the full multi-clause category overview report.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `SELECT category_id, COUNT(*) AS product_count, AVG(price) AS avg_price FROM products GROUP BY category_id HAVING AVG(price) > 15 ORDER BY product_count DESC;`'
                    }
                ],
                validation: {
                    targetTable: 'products',
                    requireGroupBy: true,
                    requireHaving: true,
                    requireOrderBy: [
                        {
                            column: 'product_count',
                            direction: 'DESC'
                        }
                    ],
                    expectedRowCount: 5
                },
                successMessage: 'Challenge completed! Category Overview widget verified.'
            }
        ]
    }
};
const DAY_11_MODULE = {
    id: 'day-11',
    slug: 'joins-relational-data',
    day: 11,
    title: 'Day 11 — JOINs',
    shortTitle: 'JOINs (INNER & LEFT)',
    type: 'module',
    milestoneId: 'milestone-2',
    description: 'Understand relational keys (PK & FK), connect tables using INNER JOIN and LEFT JOIN, and master the Anti-JOIN pattern for finding unmatched rows.',
    estimatedMinutes: 90,
    completionLearnings: [
        'Understand primary keys (PK) and foreign keys (FK) in one-to-many relationships',
        'Combine matching rows across tables using INNER JOIN',
        'Preserve unmatched left-table records using LEFT JOIN',
        'Master the Anti-JOIN pattern (LEFT JOIN ... WHERE right.pk IS NULL) to isolate unmatched rows',
        'Use clean table aliases (e.g. customers c, orders o)'
    ],
    concepts: [
        // =========================================================================
        // CONCEPT 1: PK/FK Primer & INNER JOIN
        // =========================================================================
        {
            id: 'relational-keys-inner-join',
            order: 1,
            title: '1. Relational Keys (PK/FK) & INNER JOIN',
            shortDescription: 'Connect records across tables wherever keys match.',
            theory: {
                summary: 'A primary key (PK) uniquely identifies a row in its own table. A foreign key (FK) points to the primary key of another table to establish a relationship.',
                introTable: {
                    tableName: 'products & categories',
                    description: 'Related product and category records.',
                    columns: [
                        'p.product_id',
                        'p.name',
                        'p.category_id',
                        'c.category_id',
                        'c.name'
                    ],
                    rows: [
                        [
                            1,
                            'Wireless Mouse',
                            1,
                            1,
                            'Electronics'
                        ],
                        [
                            2,
                            'Bluetooth Speaker',
                            1,
                            1,
                            'Electronics'
                        ],
                        [
                            6,
                            'Stainless Steel Pan Set',
                            2,
                            2,
                            'Kitchen & Dining'
                        ],
                        [
                            11,
                            'Desk Organizer',
                            3,
                            3,
                            'Office Supplies'
                        ]
                    ]
                },
                explanation: [
                    '### 1. INNER JOIN Mechanics',
                    '`INNER JOIN` combines rows from two tables **only when there is a match in both tables**.',
                    '### 2. The ON Condition',
                    'The `ON` clause specifies how the tables link: `ON p.category_id = c.category_id`. If an ID does not exist in both tables, it is excluded from the result.'
                ],
                targetQuery: {
                    sql: 'SELECT p.name AS product_name, c.name AS category_name\nFROM products p\nINNER JOIN categories c ON p.category_id = c.category_id;',
                    explanation: 'Combine products with their category names wherever foreign keys match.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: FROM products p INNER JOIN categories c ON p.category_id = c.category_id',
                        sqlSnippet: 'FROM products p INNER JOIN categories c ON p.category_id = c.category_id',
                        explanation: 'Matches each product record to its parent category in the taxonomy table.',
                        tableData: {
                            tableName: 'Matched Joined Rows',
                            columns: [
                                'p.name',
                                'p.category_id',
                                'c.category_id',
                                'c.name'
                            ],
                            rows: [
                                [
                                    'Wireless Mouse',
                                    1,
                                    1,
                                    'Electronics'
                                ],
                                [
                                    'Bluetooth Speaker',
                                    1,
                                    1,
                                    'Electronics'
                                ],
                                [
                                    'Stainless Steel Pan Set',
                                    2,
                                    2,
                                    'Kitchen & Dining'
                                ],
                                [
                                    'Desk Organizer',
                                    3,
                                    3,
                                    'Office Supplies'
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: 'Step 2: SELECT p.name AS product_name, c.name AS category_name',
                        sqlSnippet: 'SELECT p.name AS product_name, c.name AS category_name',
                        explanation: 'Extracts cleanly aliased product and category names.',
                        tableData: {
                            tableName: 'Final Joined Result',
                            columns: [
                                'product_name',
                                'category_name'
                            ],
                            highlightedColumns: [
                                'product_name',
                                'category_name'
                            ],
                            highlightedRows: [
                                0,
                                1,
                                2,
                                3
                            ],
                            rows: [
                                [
                                    'Wireless Mouse',
                                    'Electronics'
                                ],
                                [
                                    'Bluetooth Speaker',
                                    'Electronics'
                                ],
                                [
                                    'Stainless Steel Pan Set',
                                    'Kitchen & Dining'
                                ],
                                [
                                    'Desk Organizer',
                                    'Office Supplies'
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'INNER JOIN syntax',
                        sql: 'SELECT p.name, c.name AS category_name\nFROM products p\nINNER JOIN categories c ON p.category_id = c.category_id;',
                        description: 'Matches product records to their category names.'
                    }
                ],
                keyTakeaway: 'INNER JOIN combines rows from two tables whenever the ON condition is satisfied.',
                exampleQuery: 'SELECT p.name, c.name AS category_name FROM products p INNER JOIN categories c ON p.category_id = c.category_id;',
                exampleQueryExplanation: 'Returns all products along with their category name.',
                liveDemoSql: 'SELECT p.name, c.name AS category_name FROM products p INNER JOIN categories c ON p.category_id = c.category_id LIMIT 5;',
                liveDemoNotes: 'Displays products with matched category names.',
                mcqs: [
                    {
                        question: 'What happens to a customer who has never placed an order when using INNER JOIN orders?',
                        options: [
                            'A. They appear with order_id = NULL',
                            'B. They are excluded from the result because there is no matching row in orders',
                            'C. The query errors with a foreign key violation',
                            'D. They are matched to order 0'
                        ],
                        correctIndex: 1,
                        explanation: 'INNER JOIN only returns rows that have matches in both tables.'
                    }
                ],
                masteryPoints: [
                    'Understand PK and FK roles',
                    'Write INNER JOIN queries with table aliases'
                ]
            },
            tasks: [
                {
                    id: 'day11-c1-t1',
                    title: 'Task 1: Products with Category Names',
                    description: 'Retrieve product name and category name by joining products with categories.',
                    instructions: [
                        'Select `p.name AS product_name` and `c.name AS category_name`.',
                        'From `products p` INNER JOIN `categories c` ON `p.category_id = c.category_id`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'products',
                    secondaryTables: [
                        'categories'
                    ],
                    initialSql: '-- Write your SQL query here\n',
                    solutionSql: 'SELECT p.name AS product_name, c.name AS category_name FROM products p INNER JOIN categories c ON p.category_id = c.category_id;',
                    solutionExplanation: 'Joins products to categories on category_id.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `INNER JOIN categories c ON p.category_id = c.category_id;`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requireJoin: true,
                        requiredColumns: [
                            'product_name',
                            'category_name'
                        ],
                        expectedRowCount: 27
                    },
                    successMessage: 'Products joined with category names!'
                },
                {
                    id: 'day11-c1-t2',
                    title: 'Task 2: Orders with Customer Profiles',
                    description: 'Retrieve order_id, customer name, and order_date by joining orders with customers.',
                    instructions: [
                        'Query `orders o` INNER JOIN `customers c` ON `o.customer_id = c.customer_id`.',
                        'Select `o.order_id`, `c.name`, and `o.order_date`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'independent',
                    primaryTable: 'orders',
                    secondaryTables: [
                        'customers'
                    ],
                    initialSql: '-- Join orders and customers\n',
                    solutionSql: 'SELECT o.order_id, c.name, o.order_date FROM orders o INNER JOIN customers c ON o.customer_id = c.customer_id;',
                    solutionExplanation: 'Extracts all orders along with the customer who placed them.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `FROM orders o INNER JOIN customers c ON o.customer_id = c.customer_id;`'
                        }
                    ],
                    validation: {
                        targetTable: 'orders',
                        requireJoin: true,
                        requiredColumns: [
                            'order_id',
                            'name',
                            'order_date'
                        ],
                        expectedRowCount: 18
                    },
                    successMessage: 'Spot on! Orders joined with customer profiles.'
                }
            ]
        },
        // =========================================================================
        // CONCEPT 2a: Preserving All Left Rows with LEFT JOIN
        // =========================================================================
        {
            id: 'left-join-preserving-left',
            order: 2,
            title: '2. Preserving All Left Rows with LEFT JOIN',
            shortDescription: 'Keep every row from the left table even when no right-table match exists.',
            theory: {
                summary: 'A `LEFT JOIN` returns ALL rows from the left table. If there is no match in the right table, columns from the right table are filled with `NULL`.',
                introTable: {
                    tableName: 'customers & orders',
                    description: 'Left join showing customer records with optional order IDs',
                    columns: [
                        'c.customer_id',
                        'c.name',
                        'o.order_id'
                    ],
                    rows: [
                        [
                            1,
                            'Rafiul Islam',
                            1
                        ],
                        [
                            1,
                            'Rafiul Islam',
                            14
                        ],
                        [
                            13,
                            'Arif Chowdhury',
                            null
                        ],
                        [
                            14,
                            'Nadia Islam',
                            null
                        ]
                    ]
                },
                explanation: [
                    '### 1. LEFT JOIN Mechanics',
                    '`FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id` keeps every customer in the database.',
                    'For customers with no orders (such as newly registered users), right-side order columns are populated with `NULL`.'
                ],
                targetQuery: {
                    sql: 'SELECT c.name, o.order_id\nFROM customers c\nLEFT JOIN orders o ON c.customer_id = o.customer_id;',
                    explanation: 'List all customers and their order IDs, preserving customers with zero orders.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: FROM customers c (Preserve all left rows)',
                        sqlSnippet: 'FROM customers c',
                        explanation: 'Identifies all registered customers in the database.',
                        tableData: {
                            tableName: 'customers (Left Table)',
                            columns: [
                                'customer_id',
                                'name'
                            ],
                            rows: [
                                [
                                    1,
                                    'Rafiul Islam'
                                ],
                                [
                                    13,
                                    'Arif Chowdhury'
                                ],
                                [
                                    14,
                                    'Nadia Islam'
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: 'Step 2: LEFT JOIN orders o ON c.customer_id = o.customer_id (Pad unmatched with NULL)',
                        sqlSnippet: 'LEFT JOIN orders o ON c.customer_id = o.customer_id',
                        explanation: 'Joins orders where available; fills NULL for customers with zero orders.',
                        tableData: {
                            tableName: 'LEFT JOIN Output Result',
                            columns: [
                                'name',
                                'order_id'
                            ],
                            highlightedColumns: [
                                'name',
                                'order_id'
                            ],
                            rows: [
                                [
                                    'Rafiul Islam',
                                    1
                                ],
                                [
                                    'Rafiul Islam',
                                    14
                                ],
                                [
                                    'Arif Chowdhury',
                                    null
                                ],
                                [
                                    'Nadia Islam',
                                    null
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'LEFT JOIN syntax',
                        sql: 'SELECT c.name, o.order_id\nFROM customers c\nLEFT JOIN orders o ON c.customer_id = o.customer_id;',
                        description: 'Preserves all customers, returning NULL for unmatched order IDs.'
                    }
                ],
                keyTakeaway: 'LEFT JOIN retains all records from the left table, padding unmatched right columns with NULL.',
                exampleQuery: 'SELECT c.name, o.order_id FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id;',
                exampleQueryExplanation: 'Shows every customer alongside their order IDs.',
                liveDemoSql: 'SELECT c.name, o.order_id FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id LIMIT 6;',
                liveDemoNotes: 'Displays customer records with NULL for zero-order users.',
                mcqs: [
                    {
                        question: 'In `FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id`, which table has all its rows preserved?',
                        options: [
                            'A. orders (the right table)',
                            'B. customers (the left table)',
                            'C. Both tables equally',
                            'D. Neither table'
                        ],
                        correctIndex: 1,
                        explanation: 'LEFT JOIN guarantees that every row from the left table (`customers`) is preserved.'
                    }
                ],
                masteryPoints: [
                    'Understand how LEFT JOIN preserves unmatched left rows with NULLs'
                ]
            },
            tasks: [
                {
                    id: 'day11-c2a-t1',
                    title: 'Task 1: All Customers and Their Orders',
                    description: 'Display customer name and order_id for all customers using a LEFT JOIN, ensuring customers with zero orders appear in the output.',
                    instructions: [
                        'Select `c.name` and `o.order_id`.',
                        'From `customers c` LEFT JOIN `orders o` ON `c.customer_id = o.customer_id`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'customers',
                    secondaryTables: [
                        'orders'
                    ],
                    initialSql: '-- All customers with orders (LEFT JOIN)\n',
                    solutionSql: 'SELECT c.name, o.order_id FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id;',
                    solutionExplanation: 'Preserves all customers; non-ordering customers have NULL in order_id (19 rows).',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `SELECT c.name, o.order_id FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id;`'
                        }
                    ],
                    validation: {
                        targetTable: 'customers',
                        requireJoin: true,
                        requiredColumns: [
                            'name',
                            'order_id'
                        ],
                        expectedRowCount: 21
                    },
                    successMessage: 'All customers and their orders listed!'
                },
                {
                    id: 'day11-c2a-t2',
                    title: 'Task 2: Suppliers and Their Products',
                    description: 'Display supplier name and product name for all suppliers using LEFT JOIN, including suppliers with no products.',
                    instructions: [
                        'Query `suppliers s` LEFT JOIN `products p` ON `s.supplier_id = p.supplier_id`.',
                        'Select `s.name AS supplier_name` and `p.name AS product_name`.'
                    ],
                    type: 'independent',
                    primaryTable: 'suppliers',
                    secondaryTables: [
                        'products'
                    ],
                    initialSql: '-- Suppliers and products (LEFT JOIN)\n',
                    solutionSql: 'SELECT s.name AS supplier_name, p.name AS product_name FROM suppliers s LEFT JOIN products p ON s.supplier_id = p.supplier_id;',
                    solutionExplanation: 'Preserves all suppliers even if a supplier has 0 products.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `SELECT s.name AS supplier_name, p.name AS product_name FROM suppliers s LEFT JOIN products p ON s.supplier_id = p.supplier_id;`'
                        }
                    ],
                    validation: {
                        targetTable: 'suppliers',
                        requireJoin: true,
                        requiredColumns: [
                            'supplier_name',
                            'product_name'
                        ],
                        expectedRowCount: 27
                    },
                    successMessage: 'Perfect! All suppliers preserved with product names.'
                }
            ]
        }
    ],
    // ===========================================================================
    // DAY 11 CHALLENGE (MASTER CURRICULUM ASSIGNMENT)
    // ===========================================================================
    challenge: {
        id: 'day-11-homework',
        title: 'Day 11 — JOINs (Homework)',
        scenario: 'Master multi-table queries with INNER JOIN and LEFT JOIN:',
        tasks: [
            {
                id: 'day11-hw-1',
                title: 'Task 1: Every order with the customer\'s name and date',
                description: 'Every order with the customer\'s name and date.',
                instructions: [
                    'Select `o.order_id`, `c.name`, `o.order_date` from `orders o` INNER JOIN `customers c` ON `o.customer_id = c.customer_id`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'orders',
                secondaryTables: [
                    'customers'
                ],
                initialSql: '-- Task 1: Every order with customer name and date\n',
                solutionSql: 'SELECT o.order_id, c.name, o.order_date FROM orders o INNER JOIN customers c ON o.customer_id = c.customer_id;',
                solutionExplanation: 'Joins orders to customers to retrieve customer names alongside order details.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `FROM orders o INNER JOIN customers c ON o.customer_id = c.customer_id;`'
                    }
                ],
                validation: {
                    targetTable: 'orders',
                    requireJoin: true,
                    requiredColumns: [
                        'order_id',
                        'name',
                        'order_date'
                    ],
                    expectedRowCount: 18
                },
                successMessage: 'Task 1 completed! Orders with customer names retrieved.'
            },
            {
                id: 'day11-hw-2',
                title: 'Task 2: Every customer with their order count, including customers with zero orders (LEFT JOIN)',
                description: 'Every customer with their order count, including customers with zero orders (LEFT JOIN).',
                instructions: [
                    'Select `c.customer_id`, `c.name`, `COUNT(o.order_id) AS order_count` from `customers c` LEFT JOIN `orders o` ON `c.customer_id = o.customer_id` GROUP BY `c.customer_id`, `c.name`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'customers',
                secondaryTables: [
                    'orders'
                ],
                initialSql: '-- Task 2: Every customer with order count (LEFT JOIN)\n',
                solutionSql: 'SELECT c.customer_id, c.name, COUNT(o.order_id) AS order_count FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.name;',
                solutionExplanation: 'LEFT JOIN preserves customers with zero orders; COUNT(o.order_id) counts orders correctly.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `LEFT JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.name;`'
                    }
                ],
                validation: {
                    targetTable: 'customers',
                    requireJoin: true,
                    requireGroupBy: true,
                    expectedRowCount: 15
                },
                successMessage: 'Task 2 completed! Full customer order roster generated.'
            }
        ]
    }
};
const DAY_12_MODULE = {
    id: 'day-12',
    slug: 'practice-joins-aggregates',
    day: 12,
    title: 'Day 12 — Debugging Lab: Multi-Table Aggregation & Fan-Out',
    shortTitle: 'Debug: Fan-Out & Aggregations',
    type: 'practice_day',
    milestoneId: 'milestone-2',
    description: 'Diagnose and fix cartesian fan-out row multiplication bugs when joining one-to-many tables, and master COUNT(DISTINCT) for safe multi-table aggregations.',
    estimatedMinutes: 75,
    completionLearnings: [
        'Diagnose cartesian fan-out row multiplication when joining one-to-many parent and child tables',
        'Understand why COUNT(o.order_id) overcounts and how COUNT(DISTINCT o.order_id) guarantees accurate metrics',
        'Calculate per-customer order counts and financial spend totals across 3 joined tables'
    ],
    concepts: [
        {
            id: 'fan-out-and-distinct-counts',
            order: 1,
            title: '1. Diagnosing Row Multiplication & Fan-Out Bugs',
            shortDescription: 'Why joining multiple one-to-many tables duplicates rows.',
            theory: {
                summary: 'When you join customers → orders → order_items, each order row is duplicated for every line item it contains. Running COUNT(o.order_id) counts joined result rows, inflating order counts! Fix: COUNT(DISTINCT o.order_id) counts distinct orders accurately.',
                introTable: {
                    tableName: 'orders & order_items (Joined Output)',
                    description: 'Row duplication across line items',
                    columns: [
                        'c.name',
                        'o.order_id',
                        'oi.order_item_id',
                        'oi.quantity',
                        'oi.unit_price'
                    ],
                    rows: [
                        [
                            'Rahim Chowdhury',
                            1,
                            1,
                            2,
                            15.99
                        ],
                        [
                            'Rahim Chowdhury',
                            1,
                            2,
                            1,
                            65.00
                        ],
                        [
                            'Rahim Chowdhury',
                            14,
                            22,
                            1,
                            45.50
                        ],
                        [
                            'Rahim Chowdhury',
                            14,
                            23,
                            1,
                            55.00
                        ],
                        [
                            'Rahim Chowdhury',
                            14,
                            24,
                            1,
                            65.00
                        ]
                    ]
                },
                explanation: [
                    '### 1. 🚨 The Production Bug: Expected 2 Orders, Query Returned 5!',
                    'Look at Rahim\'s orders in the joined output above:',
                    '• Rahim placed **2 orders** (Order #1 and Order #14).',
                    '• Order #1 has 2 line items $\\rightarrow$ creates 2 rows.',
                    '• Order #14 has 3 line items $\\rightarrow$ creates 3 rows.',
                    '• Running `COUNT(o.order_id)` returns **5** ❌ (it counts duplicate joined rows!).',
                    '### 2. The Solution: COUNT(DISTINCT o.order_id)',
                    '`COUNT(DISTINCT o.order_id)` ignores duplicate order IDs and returns **2** ✅.',
                    'Whenever you aggregate parent entities while joining down a one-to-many relationship, ALWAYS use `COUNT(DISTINCT parent_pk)`.'
                ],
                targetQuery: {
                    sql: 'SELECT c.name, COUNT(DISTINCT o.order_id) AS distinct_orders, SUM(oi.quantity * oi.unit_price) AS total_spend\nFROM customers c\nINNER JOIN orders o ON c.customer_id = o.customer_id\nINNER JOIN order_items oi ON o.order_id = oi.order_id\nGROUP BY c.customer_id, c.name;',
                    explanation: 'Calculate accurate order counts and spend per customer, avoiding fan-out row inflation.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: Multi-Table Joins (Fan-Out Multiplication)',
                        sqlSnippet: 'FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id',
                        explanation: 'Joining down to line items duplicates order rows for every item purchased.',
                        tableData: {
                            tableName: 'Multiplied Joined Line Items',
                            columns: [
                                'c.name',
                                'o.order_id',
                                'oi.quantity',
                                'oi.unit_price'
                            ],
                            rows: [
                                [
                                    'Rahim Chowdhury',
                                    1,
                                    2,
                                    15.99
                                ],
                                [
                                    'Rahim Chowdhury',
                                    1,
                                    1,
                                    65.00
                                ],
                                [
                                    'Rahim Chowdhury',
                                    14,
                                    1,
                                    45.50
                                ],
                                [
                                    'Rahim Chowdhury',
                                    14,
                                    1,
                                    55.00
                                ],
                                [
                                    'Rahim Chowdhury',
                                    14,
                                    1,
                                    65.00
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: 'Step 2: COUNT(DISTINCT o.order_id) & SUM(...) GROUP BY c.customer_id',
                        sqlSnippet: 'SELECT c.name, COUNT(DISTINCT o.order_id) AS distinct_orders, SUM(oi.quantity * oi.unit_price) AS total_spend',
                        explanation: 'Deduplicates order count to 2 while correctly summing all line item financial values.',
                        tableData: {
                            tableName: 'Accurate Customer Summary Result',
                            columns: [
                                'name',
                                'distinct_orders',
                                'total_spend'
                            ],
                            highlightedColumns: [
                                'distinct_orders',
                                'total_spend'
                            ],
                            highlightedRows: [
                                0,
                                1,
                                2,
                                3
                            ],
                            rows: [
                                [
                                    'Rafiul Islam',
                                    2,
                                    262.48
                                ],
                                [
                                    'Priya Akter',
                                    1,
                                    55.00
                                ],
                                [
                                    'Tanvir Ahmed',
                                    2,
                                    94.79
                                ],
                                [
                                    'Nusrat Jahan',
                                    1,
                                    56.97
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'Accurate multi-table aggregation',
                        sql: 'SELECT c.customer_id, c.name,\n       COUNT(DISTINCT o.order_id) AS order_count,\n       SUM(oi.quantity * oi.unit_price) AS total_spent\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nJOIN order_items oi ON o.order_id = oi.order_id\nGROUP BY c.customer_id, c.name\nORDER BY total_spent DESC;',
                        description: 'Accurate customer spend with fan-out prevention.'
                    }
                ],
                keyTakeaway: 'Use COUNT(DISTINCT) when joining one-to-many relationships to avoid overcounting parent entities.',
                exampleQuery: 'SELECT c.name, COUNT(DISTINCT o.order_id) AS order_count, SUM(oi.quantity * oi.unit_price) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id, c.name;',
                exampleQueryExplanation: 'Accurately calculates order count and spend per customer.',
                liveDemoSql: 'SELECT c.name, COUNT(DISTINCT o.order_id) AS order_count, SUM(oi.quantity * oi.unit_price) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id, c.name LIMIT 5;',
                liveDemoNotes: 'Displays customer spend metrics with fan-out prevention.',
                mcqs: [
                    {
                        question: 'Why does COUNT(o.order_id) overcount when joining orders with order_items?',
                        options: [
                            'A. Because SQL adds an extra row for table headers',
                            'B. Because each order row is duplicated for every line item in order_items',
                            'C. Because order_items has no primary key',
                            'D. Because COUNT requires single quotes'
                        ],
                        correctIndex: 1,
                        explanation: 'Joining a one-to-many relationship multiplies parent rows by the number of children.'
                    }
                ],
                masteryPoints: [
                    'Use COUNT(DISTINCT) to prevent fan-out overcounting'
                ]
            },
            tasks: [
                {
                    id: 'day12-c1-t1',
                    title: 'Task 1 (Guided Fix): Fix Customer Order Count & Spend',
                    description: 'Calculate distinct order count and total money spent per customer across 3 joined tables.',
                    instructions: [
                        'Query `customers c` JOIN `orders o` ON `c.customer_id = o.customer_id` JOIN `order_items oi` ON `o.order_id = oi.order_id`.',
                        'Select `c.name`, `COUNT(DISTINCT o.order_id) AS order_count`, and `SUM(oi.quantity * oi.unit_price) AS total_spent`.',
                        'Group by `c.customer_id`, `c.name`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'customers',
                    secondaryTables: [
                        'orders',
                        'order_items'
                    ],
                    initialSql: '-- Fix the overcounting query below\nSELECT c.name, COUNT(DISTINCT o.order_id) AS order_count, SUM(oi.quantity * oi.unit_price) AS total_spent\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nJOIN order_items oi ON o.order_id = oi.order_id\nGROUP BY c.customer_id, c.name;',
                    solutionSql: 'SELECT c.name, COUNT(DISTINCT o.order_id) AS order_count, SUM(oi.quantity * oi.unit_price) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id, c.name;',
                    solutionExplanation: 'Multi-table join calculating accurate customer order totals using COUNT(DISTINCT).',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `COUNT(DISTINCT o.order_id)` to avoid counting duplicate order line items.'
                        },
                        {
                            level: 2,
                            text: 'Use `SUM(oi.quantity * oi.unit_price)` to compute total financial spend.'
                        }
                    ],
                    validation: {
                        targetTable: 'customers',
                        requireJoin: true,
                        requireGroupBy: true,
                        expectedRowCount: 12
                    },
                    successMessage: 'Task 1 completed! Customer spend and order counts accurately calculated.'
                },
                {
                    id: 'day12-c1-t2',
                    title: 'Task 2 (Transfer): Category Product Inventory Valuation',
                    description: 'Join categories with products to calculate total inventory units and average product price per category.',
                    instructions: [
                        'Query `categories c` JOIN `products p` ON `c.category_id = p.category_id`.',
                        'Select `c.name AS category_name`, `SUM(p.quantity_in_stock) AS total_units`, and `AVG(p.price) AS avg_price`.',
                        'Group by `c.category_id`, `c.name`.'
                    ],
                    type: 'independent',
                    primaryTable: 'categories',
                    secondaryTables: [
                        'products'
                    ],
                    initialSql: '-- Category inventory metrics\n',
                    solutionSql: 'SELECT c.name AS category_name, SUM(p.quantity_in_stock) AS total_units, AVG(p.price) AS avg_price FROM categories c JOIN products p ON c.category_id = p.category_id GROUP BY c.category_id, c.name;',
                    solutionExplanation: 'Aggregates stock units and average price per category across joined tables.',
                    hints: [
                        {
                            level: 1,
                            text: 'Join `categories c` with `products p` on `c.category_id = p.category_id`.'
                        },
                        {
                            level: 2,
                            text: 'Group by `c.category_id, c.name`.'
                        }
                    ],
                    validation: {
                        targetTable: 'categories',
                        requireJoin: true,
                        requireGroupBy: true,
                        expectedRowCount: 5
                    },
                    successMessage: 'Task 2 completed! Category inventory valuation generated.'
                }
            ]
        }
    ],
    // ===========================================================================
    // DAY 12 CHALLENGE: DEBUG THE PRODUCTION OVERCOUNTING BUG (ENDING ACTIVITY)
    // ===========================================================================
    challenge: {
        id: 'day-12-homework',
        title: 'Day 12 — Debug the Production Overcounting Bug (Ending Activity)',
        scenario: 'Solve these multi-table reporting queries with fan-out prevention:',
        tasks: [
            {
                id: 'day12-hw-1',
                title: 'Task 1: Per-customer order counts and spend totals across multiple joins',
                description: 'Per-customer distinct order counts and spend totals across customers, orders, and order_items.',
                instructions: [
                    'Select `c.name`, `COUNT(DISTINCT o.order_id) AS order_count`, `SUM(oi.quantity * oi.unit_price) AS total_spent` from `customers c` JOIN `orders o` ON `c.customer_id = o.customer_id` JOIN `order_items oi` ON `o.order_id = oi.order_id` GROUP BY `c.customer_id`, `c.name`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'customers',
                secondaryTables: [
                    'orders',
                    'order_items'
                ],
                initialSql: '-- Challenge: Per-customer spend totals with fan-out prevention\n',
                solutionSql: 'SELECT c.name, COUNT(DISTINCT o.order_id) AS order_count, SUM(oi.quantity * oi.unit_price) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id, c.name;',
                solutionExplanation: 'Multi-table join calculating customer spend with distinct order counts.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `COUNT(DISTINCT o.order_id)` and `SUM(oi.quantity * oi.unit_price)`.'
                    }
                ],
                validation: {
                    targetTable: 'customers',
                    requireJoin: true,
                    requireGroupBy: true,
                    expectedRowCount: 12
                },
                successMessage: 'Challenge completed! Multi-table customer spend computed accurately.'
            }
        ]
    }
};
const DAY_13_MODULE = {
    id: 'day-13',
    slug: 'relational-thinking-logical-order-expanded',
    day: 13,
    title: 'Day 13 — Visual Concept Lab: Relational Architecture & 7-Stage Pipeline',
    shortTitle: 'Relational Thinking & Full Execution Order',
    type: 'conceptual_session',
    milestoneId: 'milestone-2',
    description: 'Master the full 7-step logical query processing order (FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT) and understand relational schema architecture.',
    estimatedMinutes: 45,
    completionLearnings: [
        'Master the expanded 7-step logical query processing order across all SQL clauses',
        'Trace multi-table queries through all 7 stages to eliminate clause ordering bugs',
        'Distinguish standard logical visibility rules from database-specific convenience extensions (such as MySQL)'
    ],
    concepts: [
        {
            id: 'expanded-logical-order',
            order: 1,
            title: '1. The Full 7-Step Logical Execution Lifecycle',
            shortDescription: 'FROM/JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.',
            theory: {
                summary: 'Now that JOINs, GROUP BY, and HAVING are in our toolkit, we integrate all 7 clauses into a single unified execution model. Understanding this lifecycle ensures you know when data is created, filtered, and sorted.',
                introTable: {
                    tableName: 'customers & orders',
                    description: 'Sample data for 7-stage query tracing',
                    columns: [
                        'c.name',
                        'o.order_id',
                        'o.status'
                    ],
                    rows: [
                        [
                            'Rafiul Islam',
                            1,
                            'delivered'
                        ],
                        [
                            'Rafiul Islam',
                            14,
                            'delivered'
                        ],
                        [
                            'Kamal Hossain',
                            6,
                            'cancelled'
                        ]
                    ]
                },
                explanation: [
                    '### 1. The Definitive 7-Step Logical Pipeline',
                    '1. **`FROM & JOIN`** (Step 1): Tables are joined to produce the intermediate dataset.',
                    '2. **`WHERE`** (Step 2): Individual rows are filtered *before* any grouping.',
                    '3. **`GROUP BY`** (Step 3): Remaining rows are collapsed into category buckets.',
                    '4. **`HAVING`** (Step 4): Aggregated group metrics are filtered.',
                    '5. **`SELECT`** (Step 5): Columns are computed, aggregated, and assigned aliases.',
                    '6. **`ORDER BY`** (Step 6): The resulting rows are sorted (can see `SELECT` aliases!).',
                    '7. **`LIMIT / OFFSET`** (Step 7): The final sorted output is sliced.'
                ],
                targetQuery: {
                    sql: "SELECT c.name, COUNT(o.order_id) AS valid_orders\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nWHERE o.status != 'cancelled'\nGROUP BY c.customer_id, c.name\nHAVING COUNT(o.order_id) >= 1\nORDER BY valid_orders DESC\nLIMIT 5;",
                    explanation: 'Filter non-cancelled orders, group by customer, keep customers with >= 1 order, and return top 5 by order count.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: FROM & JOIN (Combine candidate entities)',
                        sqlSnippet: 'FROM customers c JOIN orders o ON c.customer_id = o.customer_id',
                        explanation: 'Loads and matches rows between customers and orders.',
                        tableData: {
                            tableName: 'Joined Order Candidates',
                            columns: [
                                'c.name',
                                'o.order_id',
                                'o.status'
                            ],
                            rows: [
                                [
                                    'Rafiul Islam',
                                    1,
                                    'delivered'
                                ],
                                [
                                    'Rafiul Islam',
                                    14,
                                    'delivered'
                                ],
                                [
                                    'Kamal Hossain',
                                    6,
                                    'cancelled'
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: 'Step 2: WHERE (Filter raw records)',
                        sqlSnippet: "WHERE o.status != 'cancelled'",
                        explanation: 'Filters out cancelled orders before any grouping occurs.',
                        tableData: {
                            tableName: 'Non-Cancelled Orders',
                            columns: [
                                'c.name',
                                'o.order_id',
                                'o.status'
                            ],
                            rows: [
                                [
                                    'Rafiul Islam',
                                    1,
                                    'delivered'
                                ],
                                [
                                    'Rafiul Islam',
                                    14,
                                    'delivered'
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 3,
                        stepTitle: 'Step 3: GROUP BY (Partition customer buckets)',
                        sqlSnippet: 'GROUP BY c.customer_id, c.name',
                        explanation: 'Groups active orders by customer.',
                        tableData: {
                            tableName: 'Customer Order Groups',
                            columns: [
                                'customer',
                                'orders'
                            ],
                            rows: [
                                [
                                    'Rafiul Islam',
                                    'Orders #1, #14 (2 orders)'
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 4,
                        stepTitle: 'Step 4: HAVING (Filter aggregate groups)',
                        sqlSnippet: 'HAVING COUNT(o.order_id) >= 1',
                        explanation: 'Filters for customers with at least 1 valid order.',
                        tableData: {
                            tableName: 'Qualified Customer Groups',
                            columns: [
                                'customer',
                                'order_count'
                            ],
                            rows: [
                                [
                                    'Rafiul Islam',
                                    2
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 5,
                        stepTitle: 'Step 5: SELECT (Extract columns and aliases)',
                        sqlSnippet: 'SELECT c.name, COUNT(o.order_id) AS valid_orders',
                        explanation: 'Projects name and assigns the valid_orders alias.',
                        tableData: {
                            tableName: 'Projected Columns',
                            columns: [
                                'name',
                                'valid_orders'
                            ],
                            rows: [
                                [
                                    'Rafiul Islam',
                                    2
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 6,
                        stepTitle: 'Step 6: ORDER BY (Sort by alias)',
                        sqlSnippet: 'ORDER BY valid_orders DESC',
                        explanation: 'Sorts using the valid_orders alias created in SELECT.',
                        tableData: {
                            tableName: 'Sorted Customers',
                            columns: [
                                'name',
                                'valid_orders'
                            ],
                            highlightedColumns: [
                                'valid_orders'
                            ],
                            rows: [
                                [
                                    'Rafiul Islam',
                                    2
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 7,
                        stepTitle: 'Step 7: LIMIT (Slice final rows)',
                        sqlSnippet: 'LIMIT 5',
                        explanation: 'Takes the top 5 customers.',
                        tableData: {
                            tableName: 'Final Query Result',
                            columns: [
                                'name',
                                'valid_orders'
                            ],
                            highlightedColumns: [
                                'name',
                                'valid_orders'
                            ],
                            highlightedRows: [
                                0
                            ],
                            rows: [
                                [
                                    'Rafiul Islam',
                                    2
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'The 7-step logical query order',
                        sql: '1. FROM (and JOINs)\n2. WHERE\n3. GROUP BY\n4. HAVING\n5. SELECT\n6. ORDER BY\n7. LIMIT / OFFSET',
                        description: 'The definitive logical execution order of SQL.'
                    }
                ],
                keyTakeaway: 'Understanding the 7-step logical processing order prevents alias errors and logic bugs across multi-clause queries.',
                exampleQuery: 'SELECT c.name, COUNT(o.order_id) AS order_count FROM customers c JOIN orders o ON c.customer_id = o.customer_id WHERE o.status != \'cancelled\' GROUP BY c.customer_id, c.name HAVING COUNT(o.order_id) >= 1 ORDER BY order_count DESC LIMIT 5;',
                exampleQueryExplanation: 'Full 7-clause query pipeline in action.',
                liveDemoSql: 'SELECT c.name, COUNT(o.order_id) AS order_count FROM customers c JOIN orders o ON c.customer_id = o.customer_id WHERE o.status != \'cancelled\' GROUP BY c.customer_id, c.name HAVING COUNT(o.order_id) >= 1 ORDER BY order_count DESC LIMIT 5;',
                liveDemoNotes: 'Displays top customers by active order count.',
                mcqs: [
                    {
                        question: 'In the standard 7-step order, when does HAVING execute relative to SELECT?',
                        options: [
                            'A. After SELECT',
                            'B. Before SELECT (Step 4 vs Step 5)',
                            'C. Simultaneously with WHERE',
                            'D. At the very end after LIMIT'
                        ],
                        correctIndex: 1,
                        explanation: 'Logically, HAVING executes at Step 4, before SELECT executes at Step 5.'
                    }
                ],
                masteryPoints: [
                    'Master all 7 logical query processing steps',
                    'Explain relational normalization'
                ]
            },
            tasks: [
                {
                    id: 'day13-c1-t1',
                    title: 'Task 1 (Guided): Trace Multi-Table 7-Step Query',
                    description: 'Construct a multi-table query using WHERE, GROUP BY, HAVING, and ORDER BY with aliases.',
                    instructions: [
                        'Select `c.name`, `COUNT(o.order_id) AS valid_orders` from `customers c` JOIN `orders o` ON `c.customer_id = o.customer_id`.',
                        'Where `o.status != \'cancelled\'`.',
                        'Group by `c.customer_id`, `c.name`.',
                        'Having `COUNT(o.order_id) >= 1`.',
                        'Order by `valid_orders DESC` LIMIT 5.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'customers',
                    secondaryTables: [
                        'orders'
                    ],
                    initialSql: '-- Task 1: Complete 7-clause query pipeline\nSELECT c.name, COUNT(o.order_id) AS valid_orders\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nWHERE o.status != \'cancelled\'\nGROUP BY c.customer_id, c.name\nHAVING COUNT(o.order_id) >= 1\nORDER BY valid_orders DESC\nLIMIT 5;',
                    solutionSql: 'SELECT c.name, COUNT(o.order_id) AS valid_orders FROM customers c JOIN orders o ON c.customer_id = o.customer_id WHERE o.status != \'cancelled\' GROUP BY c.customer_id, c.name HAVING COUNT(o.order_id) >= 1 ORDER BY valid_orders DESC LIMIT 5;',
                    solutionExplanation: 'Demonstrates the complete 7-clause logical pipeline.',
                    hints: [
                        {
                            level: 1,
                            text: 'Filter pre-grouping with `WHERE o.status != \'cancelled\'`.'
                        },
                        {
                            level: 2,
                            text: 'Group by customer and filter groups with `HAVING COUNT(o.order_id) >= 1`.'
                        }
                    ],
                    validation: {
                        targetTable: 'customers',
                        requireJoin: true,
                        requireWhere: true,
                        requireGroupBy: true,
                        requireHaving: true,
                        requireLimit: 5,
                        expectedRowCount: 5
                    },
                    successMessage: 'Task 1 completed! Full 7-step logical query executed.'
                },
                {
                    id: 'day13-c1-t2',
                    title: 'Task 2 (Transfer): Category Product Sales Filter',
                    description: 'Join categories with products to count in-stock items per category, keeping categories with at least 2 items, ordered by category name.',
                    instructions: [
                        'Query `categories c` JOIN `products p` ON `c.category_id = p.category_id`.',
                        'Where `p.quantity_in_stock > 0`.',
                        'Select `c.name AS category_name`, `COUNT(p.product_id) AS item_count`.',
                        'Group by `c.category_id`, `c.name`.',
                        'Having `COUNT(p.product_id) >= 2`.',
                        'Order by `category_name ASC`.'
                    ],
                    type: 'independent',
                    primaryTable: 'categories',
                    secondaryTables: [
                        'products'
                    ],
                    initialSql: '-- 7-clause category filter\n',
                    solutionSql: 'SELECT c.name AS category_name, COUNT(p.product_id) AS item_count FROM categories c JOIN products p ON c.category_id = p.category_id WHERE p.quantity_in_stock > 0 GROUP BY c.category_id, c.name HAVING COUNT(p.product_id) >= 2 ORDER BY category_name ASC;',
                    solutionExplanation: 'Demonstrates WHERE (in-stock) -> GROUP BY (category) -> HAVING (item_count >= 2) -> ORDER BY (alias).',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `WHERE p.quantity_in_stock > 0` before grouping.'
                        },
                        {
                            level: 2,
                            text: 'Add `HAVING COUNT(p.product_id) >= 2 ORDER BY category_name ASC;`.'
                        }
                    ],
                    validation: {
                        targetTable: 'categories',
                        requireJoin: true,
                        requireWhere: true,
                        requireGroupBy: true,
                        requireHaving: true,
                        requiredColumns: [
                            'category_name',
                            'item_count'
                        ],
                        expectedRowCount: 5
                    },
                    successMessage: 'Task 2 completed! End-to-end 7-clause analytical query verified.'
                }
            ]
        }
    ],
    // ===========================================================================
    // DAY 13 CHALLENGE: FULL 7-CLAUSE PIPELINE ASSEMBLY (ENDING ACTIVITY)
    // ===========================================================================
    challenge: {
        id: 'day-13-homework',
        title: 'Day 13 — Full 7-Clause Pipeline Assembly (Ending Activity)',
        scenario: 'Solidify your mastery of relational design and query execution order:',
        tasks: [
            {
                id: 'day13-hw-1',
                title: 'Task 1: Full 7-clause pipeline query',
                description: 'Select customer name, count of valid orders aliased as active_orders, grouped by customer, having active_orders >= 1, sorted by active_orders DESC, limit 5.',
                instructions: [
                    'Select `c.name`, `COUNT(o.order_id) AS active_orders` from `customers c` JOIN `orders o` ON `c.customer_id = o.customer_id` WHERE `o.status != \'cancelled\'` GROUP BY `c.customer_id`, `c.name` HAVING `COUNT(o.order_id) >= 1` ORDER BY `active_orders DESC` LIMIT 5.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'customers',
                secondaryTables: [
                    'orders'
                ],
                initialSql: '-- Challenge: Complete 7-clause SQL pipeline\n',
                solutionSql: 'SELECT c.name, COUNT(o.order_id) AS active_orders FROM customers c JOIN orders o ON c.customer_id = o.customer_id WHERE o.status != \'cancelled\' GROUP BY c.customer_id, c.name HAVING COUNT(o.order_id) >= 1 ORDER BY active_orders DESC LIMIT 5;',
                solutionExplanation: 'Executes the complete 7-clause SQL pipeline.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `WHERE o.status != \'cancelled\' GROUP BY c.customer_id, c.name HAVING COUNT(o.order_id) >= 1 ORDER BY active_orders DESC LIMIT 5;`'
                    }
                ],
                validation: {
                    targetTable: 'customers',
                    requireJoin: true,
                    requireWhere: true,
                    requireGroupBy: true,
                    requireHaving: true,
                    requireLimit: 5,
                    expectedRowCount: 5
                },
                successMessage: 'Challenge completed! Full execution pipeline verified.'
            }
        ]
    }
};
const DAY_14_MODULE = {
    id: 'day-14',
    slug: 'project-part-2-multi-table-reporting',
    day: 14,
    title: 'Day 14 — Applied Project: Business Intelligence Reporting Suite',
    shortTitle: 'Project: BI Reporting Suite',
    type: 'project_part',
    milestoneId: 'milestone-2',
    description: 'As a BI Analyst, build production-ready analytics reports: product sales volume rankings, VIP customer leaderboard, and discover unpurchased inventory via anti-joins.',
    estimatedMinutes: 90,
    completionLearnings: [
        'Aggregate line-item sales across products and order_items',
        'Rank top customers by total monetary spend across 3 joined tables',
        'Identify unpurchased inventory using the LEFT JOIN + IS NULL anti-join pattern'
    ],
    concepts: [
        {
            id: 'multi-table-reporting-patterns',
            order: 1,
            title: '1. Multi-Table Business Analytics & Anti-Joins',
            shortDescription: 'Sales volume, revenue rankings, and unpurchased item discovery.',
            theory: {
                summary: 'Welcome to the Business Intelligence (BI) team! Today you build three key executive reports: sales volume by product, top spending VIP customers, and identifying catalog items that have never been ordered using anti-joins.',
                introTable: {
                    tableName: 'products & order_items',
                    description: 'Product catalog joined with order line items',
                    columns: [
                        'p.product_id',
                        'p.name',
                        'oi.quantity',
                        'oi.unit_price'
                    ],
                    rows: [
                        [
                            1,
                            'Wireless Mouse',
                            2,
                            15.99
                        ],
                        [
                            2,
                            'Bluetooth Speaker',
                            1,
                            45.50
                        ],
                        [
                            4,
                            'Mechanical Keyboard',
                            2,
                            65.00
                        ],
                        [
                            28,
                            'Clearance Item',
                            null,
                            null
                        ]
                    ]
                },
                explanation: [
                    '### 1. The Anti-Join Pattern (Never Ordered)',
                    'To find items that have never been purchased, `LEFT JOIN order_items` onto `products` and filter with `WHERE oi.order_item_id IS NULL`.',
                    'Any product that has no matching row in `order_items` will have `NULL` for `oi.order_item_id`.'
                ],
                targetQuery: {
                    sql: 'SELECT p.name, SUM(oi.quantity) AS total_units_sold\nFROM products p\nJOIN order_items oi ON p.product_id = oi.product_id\nGROUP BY p.product_id, p.name\nORDER BY total_units_sold DESC;',
                    explanation: 'Aggregate line-item sales across products and rank products by total volume sold.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: FROM products p JOIN order_items oi ON p.product_id = oi.product_id',
                        sqlSnippet: 'FROM products p JOIN order_items oi ON p.product_id = oi.product_id',
                        explanation: 'Matches products with their order line items.',
                        tableData: {
                            tableName: 'Matched Product Line Items',
                            columns: [
                                'p.name',
                                'oi.quantity',
                                'oi.unit_price'
                            ],
                            rows: [
                                [
                                    'Wireless Mouse',
                                    2,
                                    15.99
                                ],
                                [
                                    'Wireless Mouse',
                                    5,
                                    15.99
                                ],
                                [
                                    'Mechanical Keyboard',
                                    4,
                                    65.00
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: 'Step 2: GROUP BY p.product_id, p.name ORDER BY total_units_sold DESC',
                        sqlSnippet: 'SELECT p.name, SUM(oi.quantity) AS total_units_sold GROUP BY p.product_id, p.name ORDER BY total_units_sold DESC',
                        explanation: 'Sums total quantity per product and ranks top sellers first.',
                        tableData: {
                            tableName: 'Product Sales Volume Result',
                            columns: [
                                'name',
                                'total_units_sold'
                            ],
                            highlightedColumns: [
                                'name',
                                'total_units_sold'
                            ],
                            highlightedRows: [
                                0,
                                1,
                                2
                            ],
                            rows: [
                                [
                                    'Wireless Mouse',
                                    7
                                ],
                                [
                                    'Mechanical Keyboard',
                                    4
                                ],
                                [
                                    'USB-C Cable',
                                    4
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'Anti-join pattern (never ordered)',
                        sql: 'SELECT p.product_id, p.name\nFROM products p\nLEFT JOIN order_items oi ON p.product_id = oi.product_id\nWHERE oi.order_item_id IS NULL;',
                        description: 'Finds products with 0 purchase history.'
                    }
                ],
                keyTakeaway: 'Use LEFT JOIN + IS NULL to detect non-existent relationships (anti-joins).',
                exampleQuery: 'SELECT p.name, SUM(oi.quantity) AS total_units_sold FROM products p JOIN order_items oi ON p.product_id = oi.product_id GROUP BY p.product_id, p.name ORDER BY total_units_sold DESC;',
                exampleQueryExplanation: 'Ranks products by total units sold.',
                liveDemoSql: 'SELECT p.name, SUM(oi.quantity) AS total_units_sold FROM products p JOIN order_items oi ON p.product_id = oi.product_id GROUP BY p.product_id, p.name ORDER BY total_units_sold DESC LIMIT 5;',
                liveDemoNotes: 'Displays top selling products.',
                mcqs: [
                    {
                        question: 'How does `LEFT JOIN order_items oi ... WHERE oi.order_item_id IS NULL` find unpurchased products?',
                        options: [
                            'A. By deleting purchased items',
                            'B. Because unpurchased products have no match in order_items, so all order_items columns are filled with NULL',
                            'C. By checking if price is 0',
                            'D. By counting stock'
                        ],
                        correctIndex: 1,
                        explanation: 'LEFT JOIN keeps unmatched left-table rows with NULLs for all right-table columns.'
                    }
                ],
                masteryPoints: [
                    'Write multi-table aggregate rankings',
                    'Master the LEFT JOIN + IS NULL anti-join pattern'
                ]
            },
            tasks: [
                {
                    id: 'day14-c1-t1',
                    title: 'Mission 1 (Guided): Product Sales Volume Ranking',
                    description: 'List products with their total units sold, sorted highest first.',
                    instructions: [
                        'Select `p.name`, `SUM(oi.quantity) AS total_units_sold` from `products p` JOIN `order_items oi` ON `p.product_id = oi.product_id`.',
                        'Group by `p.product_id`, `p.name`.',
                        'Order by `total_units_sold DESC`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'products',
                    secondaryTables: [
                        'order_items'
                    ],
                    initialSql: '-- Mission 1: Product units sold ranking\n',
                    solutionSql: 'SELECT p.name, SUM(oi.quantity) AS total_units_sold FROM products p JOIN order_items oi ON p.product_id = oi.product_id GROUP BY p.product_id, p.name ORDER BY total_units_sold DESC;',
                    solutionExplanation: 'Sums item quantities per product and sorts descending.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `GROUP BY p.product_id, p.name ORDER BY total_units_sold DESC;`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requireJoin: true,
                        requireGroupBy: true,
                        requireOrderBy: [
                            {
                                column: 'total_units_sold',
                                direction: 'DESC'
                            }
                        ],
                        expectedRowCount: 22
                    },
                    successMessage: 'Mission 1 complete! Product unit sales ranked.'
                },
                {
                    id: 'day14-c1-t2',
                    title: 'Mission 2 (Independent): Unpurchased Products Discovery',
                    description: 'Identify all products that have never appeared in any order using a LEFT JOIN and IS NULL filter.',
                    instructions: [
                        'Query `products p` LEFT JOIN `order_items oi` ON `p.product_id = oi.product_id`.',
                        'Select `p.product_id` and `p.name`.',
                        'Filter where `oi.order_item_id IS NULL`.'
                    ],
                    type: 'independent',
                    primaryTable: 'products',
                    secondaryTables: [
                        'order_items'
                    ],
                    initialSql: '-- Mission 2: Anti-join for unpurchased products\n',
                    solutionSql: 'SELECT p.product_id, p.name FROM products p LEFT JOIN order_items oi ON p.product_id = oi.product_id WHERE oi.order_item_id IS NULL;',
                    solutionExplanation: 'Finds products with 0 recorded purchases.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `WHERE oi.order_item_id IS NULL;`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requireJoin: true,
                        requireWhere: true,
                        whereContainsTerms: [
                            'IS NULL'
                        ],
                        expectedRowCount: 6
                    },
                    successMessage: 'Mission 2 complete! Unpurchased inventory identified.'
                }
            ]
        }
    ],
    // ===========================================================================
    // DAY 14 CHALLENGE: DELIVER THE 3-PART EXECUTIVE BI REPORTING SUITE (ENDING ACTIVITY)
    // ===========================================================================
    challenge: {
        id: 'day-14-homework',
        title: 'Day 14 — Deliver the 3-Part Executive BI Reporting Suite (Ending Activity)',
        scenario: 'Construct all 3 core multi-table reports independently:',
        tasks: [
            {
                id: 'day14-hw-1',
                title: 'Report 1: Product Sales Volume Ranking',
                description: 'Products with total units sold, highest first.',
                instructions: [
                    'Select `p.name`, `SUM(oi.quantity) AS total_units_sold` from `products p` JOIN `order_items oi` ON `p.product_id = oi.product_id` GROUP BY `p.product_id`, `p.name` ORDER BY `total_units_sold DESC`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'products',
                secondaryTables: [
                    'order_items'
                ],
                initialSql: '-- Report 1: Products with total units sold\n',
                solutionSql: 'SELECT p.name, SUM(oi.quantity) AS total_units_sold FROM products p JOIN order_items oi ON p.product_id = oi.product_id GROUP BY p.product_id, p.name ORDER BY total_units_sold DESC;',
                solutionExplanation: 'Calculates total units sold for each product.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `GROUP BY p.product_id, p.name ORDER BY total_units_sold DESC;`'
                    }
                ],
                validation: {
                    targetTable: 'products',
                    requireJoin: true,
                    requireGroupBy: true,
                    requireOrderBy: [
                        {
                            column: 'total_units_sold',
                            direction: 'DESC'
                        }
                    ],
                    expectedRowCount: 22
                },
                successMessage: 'Report 1 verified! Product sales volume calculated.'
            },
            {
                id: 'day14-hw-2',
                title: 'Report 2: Top 5 VIP Spenders Leaderboard',
                description: 'Top 5 customers by total monetary spend.',
                instructions: [
                    'Select `c.customer_id`, `c.name`, `SUM(oi.quantity * oi.unit_price) AS total_spent` from `customers c` JOIN `orders o` ON `c.customer_id = o.customer_id` JOIN `order_items oi` ON `o.order_id = oi.order_id` GROUP BY `c.customer_id`, `c.name` ORDER BY `total_spent DESC` LIMIT 5.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'customers',
                secondaryTables: [
                    'orders',
                    'order_items'
                ],
                initialSql: '-- Report 2: Top 5 VIP customers by spend\n',
                solutionSql: 'SELECT c.customer_id, c.name, SUM(oi.quantity * oi.unit_price) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id, c.name ORDER BY total_spent DESC LIMIT 5;',
                solutionExplanation: 'Joins customers -> orders -> order_items, sums spending, and returns top 5.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `GROUP BY c.customer_id, c.name ORDER BY total_spent DESC LIMIT 5;`'
                    }
                ],
                validation: {
                    targetTable: 'customers',
                    requireJoin: true,
                    requireGroupBy: true,
                    requireOrderBy: [
                        {
                            column: 'total_spent',
                            direction: 'DESC'
                        }
                    ],
                    requireLimit: 5,
                    expectedRowCount: 5
                },
                successMessage: 'Report 2 verified! Top VIP customers identified.'
            },
            {
                id: 'day14-hw-3',
                title: 'Report 3: Unpurchased Products (Anti-Join)',
                description: 'Products that have never been ordered (LEFT JOIN + IS NULL anti-join).',
                instructions: [
                    'Select `p.product_id`, `p.name` from `products p` LEFT JOIN `order_items oi` ON `p.product_id = oi.product_id` WHERE `oi.order_item_id IS NULL`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'products',
                secondaryTables: [
                    'order_items'
                ],
                initialSql: '-- Report 3: Products that have never been ordered\n',
                solutionSql: 'SELECT p.product_id, p.name FROM products p LEFT JOIN order_items oi ON p.product_id = oi.product_id WHERE oi.order_item_id IS NULL;',
                solutionExplanation: 'Anti-join with `WHERE oi.order_item_id IS NULL` finds products that have never appeared in any order.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `WHERE oi.order_item_id IS NULL;`'
                    }
                ],
                validation: {
                    targetTable: 'products',
                    requireJoin: true,
                    requireWhere: true,
                    whereContainsTerms: [
                        'IS NULL'
                    ],
                    expectedRowCount: 6
                },
                successMessage: 'Report 3 verified! Unpurchased inventory identified.'
            }
        ]
    }
};
const DAY_15_MODULE = {
    id: 'day-15',
    slug: 'independent-work-debug',
    day: 15,
    title: 'Day 15 — Debugging Lab: Query Hardening & Temporal Filters',
    shortTitle: 'Debug: Temporal Filters & Audits',
    type: 'practice_day',
    milestoneId: 'milestone-2',
    description: 'Harden multi-table queries with date range boundaries and audit inactive customer accounts before Milestone 2 assessment.',
    estimatedMinutes: 60,
    completionLearnings: [
        'Add date-range constraints to multi-table joined reporting queries',
        'Audit inactive zero-order customer accounts using LEFT JOIN and HAVING',
        'Harden query logic against data edge cases before assessment checkpoints'
    ],
    concepts: [
        {
            id: 'query-debugging-polish',
            order: 1,
            title: '1. Query Hardening & Date Range Constraints',
            shortDescription: 'Refine multi-table queries and add temporal filters.',
            theory: {
                summary: 'Production queries frequently require temporal constraints (such as orders placed in the last 60 days) and inactive account audits. Today we harden existing queries against these real-world requirements.',
                introTable: {
                    tableName: 'customers & orders',
                    description: 'Multi-table customer orders with timestamps',
                    columns: [
                        'c.name',
                        'o.order_id',
                        'o.order_date',
                        'o.status'
                    ],
                    rows: [
                        [
                            'Rafiul Islam',
                            1,
                            '2026-06-10',
                            'delivered'
                        ],
                        [
                            'Rafiul Islam',
                            14,
                            '2026-08-02',
                            'delivered'
                        ],
                        [
                            'Tanvir Ahmed',
                            3,
                            '2026-05-15',
                            'delivered'
                        ]
                    ]
                },
                explanation: [
                    '### 1. Adding Temporal Filters to Multi-Table Queries',
                    'Combine JOINs, WHERE date filters, and GROUP BY:',
                    '```sql\nSELECT c.name, SUM(oi.quantity * oi.unit_price) AS recent_spend\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nJOIN order_items oi ON o.order_id = oi.order_id\nWHERE o.order_date >= \'2026-06-25\'\nGROUP BY c.customer_id, c.name\nORDER BY recent_spend DESC;\n```'
                ],
                targetQuery: {
                    sql: "SELECT c.name, SUM(oi.quantity * oi.unit_price) AS recent_spend\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nJOIN order_items oi ON o.order_id = oi.order_id\nWHERE o.order_date >= '2026-06-25'\nGROUP BY c.customer_id, c.name\nORDER BY recent_spend DESC;",
                    explanation: 'Calculate recent customer spend for orders placed on or after 2026-06-25, sorted highest first.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: FROM ... JOIN ... WHERE o.order_date >= \'2026-06-25\'',
                        sqlSnippet: "FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id WHERE o.order_date >= '2026-06-25'",
                        explanation: 'Joins customer line items and filters for transactions on or after 2026-06-25.',
                        tableData: {
                            tableName: 'Recent Qualifying Line Items',
                            columns: [
                                'c.name',
                                'o.order_date',
                                'oi.quantity',
                                'oi.unit_price'
                            ],
                            rows: [
                                [
                                    'Rafiul Islam',
                                    '2026-08-02',
                                    1,
                                    165.50
                                ],
                                [
                                    'Farhana Rahman',
                                    '2026-07-14',
                                    1,
                                    144.97
                                ],
                                [
                                    'Priya Akter',
                                    '2026-07-01',
                                    1,
                                    55.00
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: 'Step 2: GROUP BY c.customer_id, c.name ORDER BY recent_spend DESC',
                        sqlSnippet: 'SELECT c.name, SUM(oi.quantity * oi.unit_price) AS recent_spend GROUP BY c.customer_id, c.name ORDER BY recent_spend DESC',
                        explanation: 'Aggregates spend per customer and sorts highest spenders first.',
                        tableData: {
                            tableName: 'Recent Spend Breakdown Result',
                            columns: [
                                'name',
                                'recent_spend'
                            ],
                            highlightedColumns: [
                                'name',
                                'recent_spend'
                            ],
                            highlightedRows: [
                                0,
                                1,
                                2
                            ],
                            rows: [
                                [
                                    'Rafiul Islam',
                                    165.50
                                ],
                                [
                                    'Farhana Rahman',
                                    144.97
                                ],
                                [
                                    'Priya Akter',
                                    55.00
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'Filtered multi-table report',
                        sql: 'SELECT c.name, SUM(oi.quantity * oi.unit_price) AS total_spent\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nJOIN order_items oi ON o.order_id = oi.order_id\nWHERE o.order_date >= \'2026-06-25\'\nGROUP BY c.customer_id, c.name\nORDER BY total_spent DESC;',
                        description: 'Combines multi-table joins with date constraints.'
                    }
                ],
                keyTakeaway: 'Ensure multi-table queries run cleanly and withstand added filtering conditions.',
                exampleQuery: 'SELECT c.name, COUNT(o.order_id) AS order_count FROM customers c JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.name;',
                exampleQueryExplanation: 'Calculates customer order count.',
                liveDemoSql: 'SELECT c.name, COUNT(o.order_id) AS order_count FROM customers c JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.name LIMIT 5;',
                liveDemoNotes: 'Displays customer order volume.',
                mcqs: [
                    {
                        question: 'Where should a date filter on order_date be placed in a query that groups by customer?',
                        options: [
                            'A. In the HAVING clause',
                            'B. In the WHERE clause before GROUP BY',
                            'C. In the ORDER BY clause',
                            'D. In the SELECT clause'
                        ],
                        correctIndex: 1,
                        explanation: 'Filtering raw order records by date occurs in the WHERE clause before aggregation.'
                    }
                ],
                masteryPoints: [
                    'Harden multi-table queries with temporal boundaries'
                ]
            },
            tasks: [
                {
                    id: 'day15-c1-t1',
                    title: 'Task 1 (Guided): Recent Customer Spending (Last 60 Days)',
                    description: 'Calculate customer spend for orders placed on or after 2026-06-25 (last 60 days).',
                    instructions: [
                        'Select `c.name`, `SUM(oi.quantity * oi.unit_price) AS recent_spend` from `customers c` JOIN `orders o` ON `c.customer_id = o.customer_id` JOIN `order_items oi` ON `o.order_id = oi.order_id`.',
                        'Where `o.order_date >= \'2026-06-25\'` (or `CURDATE() - INTERVAL 60 DAY`).',
                        'Group by `c.customer_id`, `c.name`.',
                        'Order by `recent_spend DESC`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'customers',
                    secondaryTables: [
                        'orders',
                        'order_items'
                    ],
                    initialSql: '-- Task 1: Recent customer spend with date filter\nSELECT c.name, SUM(oi.quantity * oi.unit_price) AS recent_spend\nFROM customers c\nJOIN orders o ON c.customer_id = o.customer_id\nJOIN order_items oi ON o.order_id = oi.order_id\nWHERE o.order_date >= \'2026-06-25\'\nGROUP BY c.customer_id, c.name\nORDER BY recent_spend DESC;',
                    solutionSql: 'SELECT c.name, SUM(oi.quantity * oi.unit_price) AS recent_spend FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id WHERE o.order_date >= \'2026-06-25\' GROUP BY c.customer_id, c.name ORDER BY recent_spend DESC;',
                    solutionExplanation: 'Filters by date range, joins line items, and sums total spend per customer.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `WHERE o.order_date >= \'2026-06-25\'` before GROUP BY.'
                        },
                        {
                            level: 2,
                            text: 'Group by `c.customer_id, c.name ORDER BY recent_spend DESC;`.'
                        }
                    ],
                    validation: {
                        targetTable: 'customers',
                        requireJoin: true,
                        requireWhere: true,
                        requireGroupBy: true,
                        expectedRowCount: 9
                    },
                    successMessage: 'Task 1 completed! Recent spend query verified.'
                },
                {
                    id: 'day15-c1-t2',
                    title: 'Task 2 (Independent): Inactive Customer Audit',
                    description: 'Identify customers who have placed 0 orders by grouping with a LEFT JOIN and filtering with HAVING.',
                    instructions: [
                        'Query `customers c` LEFT JOIN `orders o` ON `c.customer_id = o.customer_id`.',
                        'Select `c.customer_id`, `c.name`, and `COUNT(o.order_id) AS order_count`.',
                        'Group by `c.customer_id`, `c.name`.',
                        'Filter with `HAVING COUNT(o.order_id) = 0`.'
                    ],
                    type: 'independent',
                    primaryTable: 'customers',
                    secondaryTables: [
                        'orders'
                    ],
                    initialSql: '-- Find zero-order customers\n',
                    solutionSql: 'SELECT c.customer_id, c.name, COUNT(o.order_id) AS order_count FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.name HAVING COUNT(o.order_id) = 0;',
                    solutionExplanation: 'Preserves all customers with LEFT JOIN and isolates zero-order accounts.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `LEFT JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.name HAVING COUNT(o.order_id) = 0;`'
                        }
                    ],
                    validation: {
                        targetTable: 'customers',
                        requireJoin: true,
                        requireGroupBy: true,
                        requireHaving: true,
                        expectedRowCount: 3
                    },
                    successMessage: 'Task 2 completed! Zero-order accounts identified.'
                }
            ]
        }
    ],
    // ===========================================================================
    // DAY 15 CHALLENGE: FIX BROKEN & DATE-CONSTRAINED QUERIES (ENDING ACTIVITY)
    // ===========================================================================
    challenge: {
        id: 'day-15-homework',
        title: 'Day 15 — Fix Broken & Date-Constrained Queries (Ending Activity)',
        scenario: 'Polish and refine your multi-table reporting queries:',
        tasks: [
            {
                id: 'day15-hw-1',
                title: 'Task 1: Polish multi-table customer spend report with date range',
                description: 'Verify and run the multi-table customer spend report with date range constraints.',
                instructions: [
                    'Select `c.name`, `SUM(oi.quantity * oi.unit_price) AS recent_spend` from `customers c` JOIN `orders o` ON `c.customer_id = o.customer_id` JOIN `order_items oi` ON `o.order_id = oi.order_id` WHERE `o.order_date >= \'2026-06-25\'` GROUP BY `c.customer_id`, `c.name` ORDER BY `recent_spend DESC`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'customers',
                secondaryTables: [
                    'orders',
                    'order_items'
                ],
                initialSql: '-- Challenge: Multi-table customer spend with date filter\n',
                solutionSql: 'SELECT c.name, SUM(oi.quantity * oi.unit_price) AS recent_spend FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id WHERE o.order_date >= \'2026-06-25\' GROUP BY c.customer_id, c.name ORDER BY recent_spend DESC;',
                solutionExplanation: 'Multi-table customer spend report with date interval filter.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `WHERE o.order_date >= \'2026-06-25\' GROUP BY c.customer_id, c.name ORDER BY recent_spend DESC;`'
                    }
                ],
                validation: {
                    targetTable: 'customers',
                    requireJoin: true,
                    requireWhere: true,
                    requireGroupBy: true,
                    expectedRowCount: 9
                },
                successMessage: 'Challenge completed! Polished multi-table report verified.'
            }
        ]
    }
};
const DAY_16_MODULE = {
    id: 'day-16',
    slug: 'milestone-2-assessment',
    day: 16,
    title: 'Day 16 — Milestone 2: Relational Mastery Checkpoint',
    shortTitle: 'Milestone 2 Checkpoint',
    type: 'assignment',
    milestoneId: 'milestone-2',
    description: 'Independent competency verification for Milestone 2: prove proficiency in multi-table relational queries, financial aggregations, and anti-joins.',
    estimatedMinutes: 90,
    completionLearnings: [
        'Calculate total database revenue across order line items',
        'Aggregate multi-table revenue breakdowns by product category',
        'Filter high-value customers with spend thresholds using HAVING',
        'Discover suppliers whose products have never been ordered using anti-joins'
    ],
    concepts: [
        {
            id: 'milestone-2-eval',
            order: 1,
            title: '1. Milestone 2 Core Competency Verification',
            shortDescription: 'Independent multi-table skill verification across Days 9–15.',
            theory: {
                summary: 'Milestone 2 Skill Verification: Prove your ability to independently answer real-world business questions using multi-table JOINs, financial aggregations, and anti-joins without templates or assistance.',
                introTable: {
                    tableName: 'order_items',
                    description: 'Line item financial transactions',
                    columns: [
                        'order_item_id',
                        'order_id',
                        'product_id',
                        'quantity',
                        'unit_price'
                    ],
                    rows: [
                        [
                            1,
                            1,
                            1,
                            2,
                            15.99
                        ],
                        [
                            2,
                            1,
                            4,
                            1,
                            65.00
                        ],
                        [
                            3,
                            2,
                            6,
                            1,
                            55.00
                        ]
                    ]
                },
                explanation: [
                    '### 1. Milestone 2 Verification Objectives',
                    '• **Core Skill**: Total database revenue calculation across all order line items.',
                    '• **Combination**: Multi-table revenue breakdown by product category (`categories` $\\rightarrow$ `products` $\\rightarrow$ `order_items`).',
                    '• **Transfer**: High-value customers filtering with post-aggregation thresholds (`HAVING total_spent > 200`).',
                    '• **Hard Problem**: Anti-join discovery of suppliers with zero ordered products (find Unity Traders BD).'
                ],
                targetQuery: {
                    sql: 'SELECT cat.name, SUM(oi.quantity * oi.unit_price) AS category_revenue\nFROM categories cat\nJOIN products p ON cat.category_id = p.category_id\nJOIN order_items oi ON p.product_id = oi.product_id\nGROUP BY cat.category_id, cat.name\nORDER BY category_revenue DESC;',
                    explanation: 'Aggregate multi-table revenue breakdown across categories, products, and line items, sorted highest revenue first.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: FROM categories cat JOIN products p JOIN order_items oi',
                        sqlSnippet: 'FROM categories cat JOIN products p ON cat.category_id = p.category_id JOIN order_items oi ON p.product_id = oi.product_id',
                        explanation: 'Joins 3 tables to link category names to product purchases.',
                        tableData: {
                            tableName: 'Matched Multi-Table Line Items',
                            columns: [
                                'cat.name',
                                'p.name',
                                'oi.quantity',
                                'oi.unit_price'
                            ],
                            rows: [
                                [
                                    'Electronics',
                                    'Wireless Mouse',
                                    2,
                                    15.99
                                ],
                                [
                                    'Electronics',
                                    'Mechanical Keyboard',
                                    1,
                                    65.00
                                ],
                                [
                                    'Kitchen & Dining',
                                    'Stainless Steel Pan Set',
                                    1,
                                    55.00
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: 'Step 2: GROUP BY cat.category_id, cat.name ORDER BY category_revenue DESC',
                        sqlSnippet: 'SELECT cat.name, SUM(oi.quantity * oi.unit_price) AS category_revenue GROUP BY cat.category_id, cat.name ORDER BY category_revenue DESC',
                        explanation: 'Computes total sales revenue generated per category.',
                        tableData: {
                            tableName: 'Category Revenue Summary Result',
                            columns: [
                                'name',
                                'category_revenue'
                            ],
                            highlightedColumns: [
                                'name',
                                'category_revenue'
                            ],
                            highlightedRows: [
                                0,
                                1,
                                2
                            ],
                            rows: [
                                [
                                    'Electronics',
                                    448.47
                                ],
                                [
                                    'Office Furniture',
                                    209.99
                                ],
                                [
                                    'Accessories',
                                    161.42
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'Multi-table join and aggregate competency',
                        sql: 'SELECT cat.name, SUM(oi.quantity * oi.unit_price) AS category_revenue\nFROM categories cat\nJOIN products p ON cat.category_id = p.category_id\nJOIN order_items oi ON p.product_id = oi.product_id\nGROUP BY cat.category_id, cat.name\nORDER BY category_revenue DESC;',
                        description: 'Multi-table category revenue reporting.'
                    }
                ],
                keyTakeaway: 'Demonstrate multi-table JOIN and aggregation mastery.',
                exampleQuery: 'SELECT SUM(quantity * unit_price) AS total_revenue FROM order_items;',
                exampleQueryExplanation: 'Calculates grand total revenue.',
                liveDemoSql: 'SELECT SUM(quantity * unit_price) AS total_revenue FROM order_items;',
                liveDemoNotes: 'Displays grand total revenue across all orders.',
                mcqs: [
                    {
                        question: 'Which supplier in the seed dataset has products that have never been ordered?',
                        options: [
                            'A. LogiTech Direct',
                            'B. Unity Traders BD',
                            'C. KeyChron Components',
                            'D. SoundWave Acoustic'
                        ],
                        correctIndex: 1,
                        explanation: 'Unity Traders BD has products in the catalog, but none have ever been referenced in order_items.'
                    }
                ],
                masteryPoints: [
                    'Pass all 4 Milestone 2 independent verification deliverables'
                ]
            },
            tasks: [
                {
                    id: 'day16-c1-t1',
                    title: 'Warmup 1: Total Revenue Calculation',
                    description: 'Calculate the grand total revenue across all order line items.',
                    instructions: [
                        'Select `SUM(quantity * unit_price) AS total_revenue` from `order_items`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'order_items',
                    initialSql: '-- Warmup 1: Grand total revenue\n',
                    solutionSql: 'SELECT SUM(quantity * unit_price) AS total_revenue FROM order_items;',
                    solutionExplanation: 'Calculates the sum product of quantity and unit_price for all order items.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `SELECT SUM(quantity * unit_price) AS total_revenue FROM order_items;`'
                        }
                    ],
                    validation: {
                        targetTable: 'order_items',
                        expectedRowCount: 1
                    },
                    successMessage: 'Warmup 1 completed! Total revenue calculated.'
                },
                {
                    id: 'day16-c1-t2',
                    title: 'Warmup 2: Category Revenue Breakdown',
                    description: 'Join categories, products, and order_items to compute total revenue generated per category, sorted highest first.',
                    instructions: [
                        'Query `categories cat` JOIN `products p` ON `cat.category_id = p.category_id` JOIN `order_items oi` ON `p.product_id = oi.product_id`.',
                        'Select `cat.name`, `SUM(oi.quantity * oi.unit_price) AS category_revenue`.',
                        'Group by `cat.category_id`, `cat.name`.',
                        'Order by `category_revenue DESC`.'
                    ],
                    type: 'independent',
                    primaryTable: 'categories',
                    secondaryTables: [
                        'products',
                        'order_items'
                    ],
                    initialSql: '-- Warmup 2: Revenue by category\n',
                    solutionSql: 'SELECT cat.name, SUM(oi.quantity * oi.unit_price) AS category_revenue FROM categories cat JOIN products p ON cat.category_id = p.category_id JOIN order_items oi ON p.product_id = oi.product_id GROUP BY cat.category_id, cat.name ORDER BY category_revenue DESC;',
                    solutionExplanation: 'Joins 3 tables and computes revenue per category.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `GROUP BY cat.category_id, cat.name ORDER BY category_revenue DESC;`'
                        }
                    ],
                    validation: {
                        targetTable: 'categories',
                        requireJoin: true,
                        requireGroupBy: true,
                        requireOrderBy: [
                            {
                                column: 'category_revenue',
                                direction: 'DESC'
                            }
                        ],
                        expectedRowCount: 5
                    },
                    successMessage: 'Warmup 2 completed! Category revenue breakdown calculated.'
                }
            ]
        }
    ],
    // ===========================================================================
    // DAY 16 CHALLENGE: MILESTONE 2 MASTERY CHECKPOINT (ENDING ACTIVITY)
    // ===========================================================================
    challenge: {
        id: 'day-16-homework',
        title: 'Day 16 — Milestone 2 Mastery Checkpoint (Ending Activity)',
        scenario: 'Complete all 4 deliverables independently to verify Milestone 2 relational mastery:',
        tasks: [
            {
                id: 'day16-hw-1',
                title: 'Deliverable 1 (Core): Grand total revenue across all orders',
                description: 'Total revenue (SUM across order_items).',
                instructions: [
                    'Select `SUM(quantity * unit_price) AS total_revenue` from `order_items`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'order_items',
                initialSql: '-- Deliverable 1: Total revenue\n',
                solutionSql: 'SELECT SUM(quantity * unit_price) AS total_revenue FROM order_items;',
                solutionExplanation: 'Calculates grand total revenue across all order line items.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `SELECT SUM(quantity * unit_price) AS total_revenue FROM order_items;`'
                    }
                ],
                validation: {
                    targetTable: 'order_items',
                    expectedRowCount: 1
                },
                successMessage: 'Deliverable 1 verified! Grand total revenue calculated.'
            },
            {
                id: 'day16-hw-2',
                title: 'Deliverable 2 (Combination): Revenue by product category',
                description: 'Revenue by category (categories → products → order_items).',
                instructions: [
                    'Select `cat.name`, `SUM(oi.quantity * oi.unit_price) AS category_revenue` from `categories cat` JOIN `products p` ON `cat.category_id = p.category_id` JOIN `order_items oi` ON `p.product_id = oi.product_id` GROUP BY `cat.category_id`, `cat.name` ORDER BY `category_revenue DESC`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'categories',
                secondaryTables: [
                    'products',
                    'order_items'
                ],
                initialSql: '-- Deliverable 2: Revenue by category\n',
                solutionSql: 'SELECT cat.name, SUM(oi.quantity * oi.unit_price) AS category_revenue FROM categories cat JOIN products p ON cat.category_id = p.category_id JOIN order_items oi ON p.product_id = oi.product_id GROUP BY cat.category_id, cat.name ORDER BY category_revenue DESC;',
                solutionExplanation: 'Joins categories -> products -> order_items and sums revenue per category.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `GROUP BY cat.category_id, cat.name ORDER BY category_revenue DESC;`'
                    }
                ],
                validation: {
                    targetTable: 'categories',
                    requireJoin: true,
                    requireGroupBy: true,
                    expectedRowCount: 5
                },
                successMessage: 'Deliverable 2 verified! Revenue by category calculated.'
            },
            {
                id: 'day16-hw-3',
                title: 'Deliverable 3 (Transfer): High-value customers who spent more than $200',
                description: 'Customers who\'ve spent more than $200.',
                instructions: [
                    'Select `c.customer_id`, `c.name`, `SUM(oi.quantity * oi.unit_price) AS total_spent` from `customers c` JOIN `orders o` ON `c.customer_id = o.customer_id` JOIN `order_items oi` ON `o.order_id = oi.order_id` GROUP BY `c.customer_id`, `c.name` HAVING `SUM(oi.quantity * oi.unit_price) > 200` ORDER BY `total_spent DESC`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'customers',
                secondaryTables: [
                    'orders',
                    'order_items'
                ],
                initialSql: '-- Deliverable 3: Customers who spent more than $200\n',
                solutionSql: 'SELECT c.customer_id, c.name, SUM(oi.quantity * oi.unit_price) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id, c.name HAVING SUM(oi.quantity * oi.unit_price) > 200 ORDER BY total_spent DESC;',
                solutionExplanation: 'Filters aggregated customer spending with `HAVING SUM(...) > 200`.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `HAVING SUM(oi.quantity * oi.unit_price) > 200 ORDER BY total_spent DESC;`'
                    }
                ],
                validation: {
                    targetTable: 'customers',
                    requireJoin: true,
                    requireGroupBy: true,
                    requireHaving: true,
                    expectedRowCount: 1
                },
                successMessage: 'Deliverable 3 verified! High-value customers identified.'
            },
            {
                id: 'day16-hw-4',
                title: 'Deliverable 4 (Hard Problem): Suppliers whose products have never been ordered',
                description: 'Suppliers whose products have never been ordered (find Unity Traders BD via anti-join).',
                instructions: [
                    'Select `s.supplier_id`, `s.name` from `suppliers s` LEFT JOIN `products p` ON `s.supplier_id = p.supplier_id` LEFT JOIN `order_items oi` ON `p.product_id = oi.product_id` GROUP BY `s.supplier_id`, `s.name` HAVING `COUNT(oi.order_item_id) = 0`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'suppliers',
                secondaryTables: [
                    'products',
                    'order_items'
                ],
                initialSql: '-- Deliverable 4: Suppliers whose products have never been ordered\n',
                solutionSql: 'SELECT s.supplier_id, s.name FROM suppliers s LEFT JOIN products p ON s.supplier_id = p.supplier_id LEFT JOIN order_items oi ON p.product_id = oi.product_id GROUP BY s.supplier_id, s.name HAVING COUNT(oi.order_item_id) = 0;',
                solutionExplanation: 'Anti-join identifying suppliers with zero order item records (Unity Traders BD).',
                hints: [
                    {
                        level: 1,
                        text: 'Use `GROUP BY s.supplier_id, s.name HAVING COUNT(oi.order_item_id) = 0;`'
                    }
                ],
                validation: {
                    targetTable: 'suppliers',
                    requireJoin: true,
                    requireGroupBy: true,
                    expectedRowCount: 1
                },
                successMessage: 'Deliverable 4 verified! Unordered supplier Unity Traders BD found.'
            }
        ]
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/content/modules/day17to25.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "DAY_17_MODULE",
    ()=>DAY_17_MODULE,
    "DAY_18_MODULE",
    ()=>DAY_18_MODULE,
    "DAY_19_MODULE",
    ()=>DAY_19_MODULE,
    "DAY_20_MODULE",
    ()=>DAY_20_MODULE,
    "DAY_21_MODULE",
    ()=>DAY_21_MODULE,
    "DAY_22_MODULE",
    ()=>DAY_22_MODULE,
    "DAY_23_MODULE",
    ()=>DAY_23_MODULE,
    "DAY_24_MODULE",
    ()=>DAY_24_MODULE,
    "DAY_25_MODULE",
    ()=>DAY_25_MODULE
]);
const DAY_17_MODULE = {
    id: 'day-17',
    slug: 'subqueries-ctes',
    day: 17,
    title: 'Day 17 — Subqueries & CTEs',
    shortTitle: 'Subqueries & CTEs',
    type: 'module',
    milestoneId: 'milestone-3',
    description: 'Master scalar subqueries, IN list subqueries, and Common Table Expressions (CTEs) using the WITH syntax to write modular, readable analytical queries.',
    estimatedMinutes: 75,
    completionLearnings: [
        'Write scalar subqueries to compare individual rows against whole-table aggregates',
        'Filter rows against dynamic result sets using IN subqueries',
        'Structure complex multi-stage queries using Common Table Expressions (WITH syntax)'
    ],
    concepts: [
        // =========================================================================
        // CONCEPT 1a: Scalar Subqueries (Single-Value Comparison)
        // =========================================================================
        {
            id: 'subqueries-scalar',
            order: 1,
            title: '1. Scalar Subqueries (Single-Value Comparison)',
            shortDescription: 'Compare individual rows dynamically against whole-table aggregates.',
            theory: {
                summary: 'A subquery is a query nested inside another SQL statement. A scalar subquery returns exactly one value (one row and one column), allowing you to use it wherever a constant or literal value is expected.',
                introTable: {
                    tableName: 'products',
                    description: 'Comparing items against table-wide average price.',
                    columns: [
                        'product_id',
                        'name',
                        'price'
                    ],
                    rows: [
                        [
                            1,
                            'Wireless Mouse',
                            15.99
                        ],
                        [
                            4,
                            'Mechanical Keyboard',
                            65.00
                        ],
                        [
                            14,
                            'Office Chair',
                            120.00
                        ],
                        [
                            15,
                            'Filing Cabinet',
                            89.99
                        ]
                    ]
                },
                explanation: [
                    '### 1. The Dynamic Comparison Pattern',
                    'Instead of hardcoding a magic number like `WHERE price > 30.00`, a scalar subquery computes the threshold dynamically:\n```sql\nSELECT name, price\nFROM products\nWHERE price > (SELECT AVG(price) FROM products);\n```',
                    '### 2. Execution Order',
                    '1. The database evaluates the inner query `(SELECT AVG(price) FROM products)` first to get the scalar value ($30.13).\n2. The outer query then filters rows where `price > 30.13`.',
                    'A scalar subquery MUST return exactly one row and one column. If it returns multiple rows or columns, SQL will halt with an error.'
                ],
                targetQuery: {
                    sql: 'SELECT name, price\nFROM products\nWHERE price > (SELECT AVG(price) FROM products);',
                    explanation: 'Find all products priced higher than the overall catalog average price.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: Inner Query Computes Average (Scalar Value)',
                        sqlSnippet: 'SELECT AVG(price) FROM products;',
                        explanation: 'Computes overall catalog average price ($30.13).',
                        tableData: {
                            tableName: 'Inner Subquery Scalar Result',
                            columns: [
                                'AVG(price)'
                            ],
                            highlightedColumns: [
                                'AVG(price)'
                            ],
                            rows: [
                                [
                                    30.13
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: 'Step 2: Outer Query Filters for price > $30.13',
                        sqlSnippet: 'SELECT name, price FROM products WHERE price > 30.13;',
                        explanation: 'Retains only items priced above the calculated average.',
                        tableData: {
                            tableName: 'Above Average Products Result',
                            columns: [
                                'name',
                                'price'
                            ],
                            highlightedColumns: [
                                'name',
                                'price'
                            ],
                            rows: [
                                [
                                    'Bluetooth Speaker',
                                    45.50
                                ],
                                [
                                    'Mechanical Keyboard',
                                    65.00
                                ],
                                [
                                    'Office Chair',
                                    120.00
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'Scalar subquery syntax',
                        sql: 'SELECT name, price\nFROM products\nWHERE price > (SELECT AVG(price) FROM products);',
                        description: 'Compares price against table-wide average price dynamically.'
                    }
                ],
                keyTakeaway: 'A scalar subquery evaluates to a single value, enabling dynamic comparisons.',
                exampleQuery: 'SELECT name, price FROM products WHERE price > (SELECT AVG(price) FROM products);',
                exampleQueryExplanation: 'Finds products priced above the overall average.',
                liveDemoSql: 'SELECT name, price FROM products WHERE price > (SELECT AVG(price) FROM products) LIMIT 5;',
                liveDemoNotes: 'Displays above-average priced products.',
                mcqs: [
                    {
                        question: 'What is a scalar subquery in SQL?',
                        options: [
                            'A. A subquery that returns a full multi-column table',
                            'B. A subquery that returns exactly one row and one column (a single atomic value)',
                            'C. A query containing multiple JOINs',
                            'D. A subquery that executes in a background thread'
                        ],
                        correctIndex: 1,
                        explanation: 'Scalar subqueries evaluate to a single atomic value.'
                    }
                ],
                masteryPoints: [
                    'Write scalar subqueries in WHERE clauses',
                    'Compare rows against dynamic aggregates'
                ]
            },
            tasks: [
                {
                    id: 'day17-c1a-t1',
                    title: 'Task 1: Products Priced Above Average',
                    description: 'Select name and price for all products priced higher than the overall average product price.',
                    instructions: [
                        'Select `name` and `price` from `products`.',
                        'Filter with `WHERE price > (SELECT AVG(price) FROM products)`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'products',
                    initialSql: '-- Products above average price\n',
                    solutionSql: 'SELECT name, price FROM products WHERE price > (SELECT AVG(price) FROM products);',
                    solutionExplanation: 'Uses a scalar subquery `(SELECT AVG(price) FROM products)` to dynamically filter products.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `WHERE price > (SELECT AVG(price) FROM products);`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requireWhere: true,
                        requiredColumns: [
                            'name',
                            'price'
                        ],
                        expectedRowCount: 10
                    },
                    successMessage: 'Above-average products retrieved!'
                },
                {
                    id: 'day17-c1a-t2',
                    title: 'Task 2: Students Older Than Average Student Age',
                    description: 'Select name and age for students who are strictly older than the student average age.',
                    instructions: [
                        'Query the `students` table.',
                        'Select `name` and `age`.',
                        'Filter where `age > (SELECT AVG(age) FROM students)`.'
                    ],
                    type: 'independent',
                    primaryTable: 'students',
                    initialSql: '-- Students older than average\n',
                    solutionSql: 'SELECT name, age FROM students WHERE age > (SELECT AVG(age) FROM students);',
                    solutionExplanation: 'The average student age is 21.4; only Karim (22) and Sumaiya (23) are older.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `WHERE age > (SELECT AVG(age) FROM students);`'
                        }
                    ],
                    validation: {
                        targetTable: 'students',
                        requireWhere: true,
                        requiredColumns: [
                            'name',
                            'age'
                        ],
                        expectedRowCount: 2
                    },
                    successMessage: 'Perfect! Above-average age students identified.'
                }
            ]
        },
        // =========================================================================
        // CONCEPT 1b: Set Membership Subqueries with IN
        // =========================================================================
        {
            id: 'subqueries-in-set',
            order: 2,
            title: '2. Set Membership Subqueries with IN',
            shortDescription: 'Filter rows against dynamic lists produced by inner queries.',
            theory: {
                summary: 'When a subquery returns a column of multiple values, you can use `IN` to check if a row\'s column matches any value in that dynamic list.',
                introTable: {
                    tableName: 'customers & orders',
                    description: 'Identifying customers with active orders',
                    columns: [
                        'customer_id',
                        'name',
                        'city'
                    ],
                    rows: [
                        [
                            1,
                            'Rafiul Islam',
                            'Dhaka'
                        ],
                        [
                            2,
                            'Priya Akter',
                            'Dhaka'
                        ],
                        [
                            13,
                            'Arif Chowdhury',
                            'Rajshahi'
                        ]
                    ]
                },
                explanation: [
                    '### 1. The Dynamic IN Subquery',
                    'Instead of hardcoding customer IDs `IN (1, 2, 3, 4...)`, the subquery supplies the list dynamically:\n```sql\nSELECT customer_id, name\nFROM customers\nWHERE customer_id IN (SELECT customer_id FROM orders);\n```',
                    '### 2. How SQL Evaluates It',
                    '1. The inner query produces a distinct set of customer IDs from `orders`.\n2. The outer query matches customer records against that set.'
                ],
                targetQuery: {
                    sql: 'SELECT customer_id, name\nFROM customers\nWHERE customer_id IN (SELECT customer_id FROM orders);',
                    explanation: 'Find all customers who have placed at least one order using a dynamic IN subquery.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: Inner Query Generates Customer ID Set',
                        sqlSnippet: 'SELECT customer_id FROM orders;',
                        explanation: 'Produces dynamic ID list: (1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12).',
                        tableData: {
                            tableName: 'Order Placer IDs',
                            columns: [
                                'customer_id'
                            ],
                            rows: [
                                [
                                    1
                                ],
                                [
                                    2
                                ],
                                [
                                    3
                                ],
                                [
                                    4
                                ],
                                [
                                    5
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: 'Step 2: Outer Query Filters for Matching IDs',
                        sqlSnippet: 'SELECT customer_id, name FROM customers WHERE customer_id IN (...)',
                        explanation: 'Matches customer records against the active buyer list.',
                        tableData: {
                            tableName: 'Active Buyers Result',
                            columns: [
                                'customer_id',
                                'name'
                            ],
                            highlightedColumns: [
                                'customer_id',
                                'name'
                            ],
                            rows: [
                                [
                                    1,
                                    'Rafiul Islam'
                                ],
                                [
                                    2,
                                    'Priya Akter'
                                ],
                                [
                                    3,
                                    'Tanvir Ahmed'
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'IN subquery syntax',
                        sql: 'SELECT customer_id, name\nFROM customers\nWHERE customer_id IN (SELECT customer_id FROM orders);',
                        description: 'Returns rows whose key matches any item in the subquery result.'
                    }
                ],
                keyTakeaway: 'Use IN (SELECT ...) to match values against a dynamically generated list.',
                exampleQuery: 'SELECT customer_id, name FROM customers WHERE customer_id IN (SELECT customer_id FROM orders);',
                exampleQueryExplanation: 'Finds all customers who have placed at least one order.',
                liveDemoSql: 'SELECT customer_id, name FROM customers WHERE customer_id IN (SELECT customer_id FROM orders);',
                liveDemoNotes: 'Returns all 12 ordering customers.',
                mcqs: [
                    {
                        question: 'What type of result does an `IN (SELECT ...)` subquery expect?',
                        options: [
                            'A. Exactly one row and multiple columns',
                            'B. A single column containing zero, one, or many rows',
                            'C. A JSON object',
                            'D. A table with at least 5 columns'
                        ],
                        correctIndex: 1,
                        explanation: 'IN subqueries test a single column against a list of single-column values.'
                    }
                ],
                masteryPoints: [
                    'Write multi-row IN subqueries',
                    'Relate tables without writing explicit JOINs'
                ]
            },
            tasks: [
                {
                    id: 'day17-c1b-t1',
                    title: 'Task 1: Customers with Recorded Orders (IN)',
                    description: 'Retrieve customer_id and name for customers who have placed at least one order using an IN subquery.',
                    instructions: [
                        'Query the `customers` table.',
                        'Select `customer_id` and `name`.',
                        'Filter where `customer_id IN (SELECT customer_id FROM orders)`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'customers',
                    secondaryTables: [
                        'orders'
                    ],
                    initialSql: '-- Customers with orders via IN subquery\n',
                    solutionSql: 'SELECT customer_id, name FROM customers WHERE customer_id IN (SELECT customer_id FROM orders);',
                    solutionExplanation: 'Retrieves all 12 customers who have records in the orders table.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `WHERE customer_id IN (SELECT customer_id FROM orders);`'
                        }
                    ],
                    validation: {
                        targetTable: 'customers',
                        requiredColumns: [
                            'customer_id',
                            'name'
                        ],
                        requireWhere: true,
                        expectedRowCount: 12
                    },
                    successMessage: 'Active customers identified via IN subquery!'
                },
                {
                    id: 'day17-c1b-t2',
                    title: 'Task 2: Products in Large Categories',
                    description: 'Select name, category_id, and price for products belonging to categories that contain 5 or more products.',
                    instructions: [
                        'Query the `products` table.',
                        'Select `name`, `category_id`, and `price`.',
                        'Filter where `category_id IN (SELECT category_id FROM products GROUP BY category_id HAVING COUNT(*) >= 5)`.'
                    ],
                    type: 'independent',
                    primaryTable: 'products',
                    initialSql: '-- Products in large categories (>= 5 items)\n',
                    solutionSql: 'SELECT name, category_id, price FROM products WHERE category_id IN (SELECT category_id FROM products GROUP BY category_id HAVING COUNT(*) >= 5);',
                    solutionExplanation: 'Categories 1, 2, 3, 4, 5 each have at least 5 products (27 items total).',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `WHERE category_id IN (SELECT category_id FROM products GROUP BY category_id HAVING COUNT(*) >= 5);`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requiredColumns: [
                            'name',
                            'category_id',
                            'price'
                        ],
                        requireWhere: true,
                        expectedRowCount: 27
                    },
                    successMessage: 'Spot on! Products in large categories selected dynamically.'
                }
            ]
        },
        // =========================================================================
        // CONCEPT 1c: Exclusion Subqueries with NOT IN & The NULL Trap
        // =========================================================================
        {
            id: 'subqueries-not-in-null-trap',
            order: 3,
            title: '3. Exclusion Subqueries with NOT IN & The NULL Trap',
            shortDescription: 'Exclude matching rows safely and avoid the three-valued logic NULL trap.',
            theory: {
                summary: '`NOT IN` excludes rows that match values in a subquery. However, if the subquery returns even a single NULL value, the entire NOT IN condition collapses to UNKNOWN and returns 0 rows!',
                introTable: {
                    tableName: 'products & order_items',
                    description: 'Products checking for presence in order items',
                    columns: [
                        'product_id',
                        'name',
                        'price'
                    ],
                    rows: [
                        [
                            1,
                            'Wireless Mouse',
                            15.99
                        ],
                        [
                            3,
                            'USB-C Charging Cable (0 orders)',
                            9.99
                        ],
                        [
                            9,
                            'Cutting Board Set (0 orders)',
                            18.00
                        ]
                    ]
                },
                explanation: [
                    '### 1. How NOT IN Evaluates Logically',
                    '`WHERE product_id NOT IN (1, 2, NULL)` expands internally in SQL to chained inequality checks:\n```text\nproduct_id != 1 AND product_id != 2 AND product_id != NULL\n```',
                    '### 2. The Three-Valued Logic NULL Trap',
                    '1. In SQL three-valued logic, `product_id != NULL` evaluates to **UNKNOWN**.\n2. In boolean algebra: `TRUE AND UNKNOWN` evaluates to **UNKNOWN**.\n3. Because `WHERE` only retains rows evaluating to `TRUE`, the query **silently drops ALL rows and returns 0 results!**',
                    '### 3. The Safe Pattern: Always Filter Out NULLs in Inner Queries',
                    '```sql\n-- ✅ Always include WHERE col IS NOT NULL in subqueries used with NOT IN:\nSELECT name, price\nFROM products\nWHERE product_id NOT IN (\n  SELECT product_id FROM order_items WHERE product_id IS NOT NULL\n);\n```'
                ],
                targetQuery: {
                    sql: 'SELECT name, price\nFROM products\nWHERE product_id NOT IN (\n  SELECT product_id FROM order_items WHERE product_id IS NOT NULL\n);',
                    explanation: 'Safely find products that have never been ordered, guarding against NULL trap failures.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: Inner Query Generates Non-NULL Product IDs',
                        sqlSnippet: 'SELECT product_id FROM order_items WHERE product_id IS NOT NULL',
                        explanation: 'Produces clean non-NULL list of ordered product IDs.',
                        tableData: {
                            tableName: 'Non-NULL Ordered Product IDs',
                            columns: [
                                'product_id'
                            ],
                            rows: [
                                [
                                    1
                                ],
                                [
                                    2
                                ],
                                [
                                    4
                                ],
                                [
                                    5
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: 'Step 2: Outer Query Filters for product_id NOT IN (...)',
                        sqlSnippet: 'SELECT name, price FROM products WHERE product_id NOT IN (...)',
                        explanation: 'Isolates the 6 products that have never been ordered.',
                        tableData: {
                            tableName: 'Unordered Products Result',
                            columns: [
                                'name',
                                'price'
                            ],
                            highlightedColumns: [
                                'name',
                                'price'
                            ],
                            rows: [
                                [
                                    'USB-C Charging Cable',
                                    9.99
                                ],
                                [
                                    'Cutting Board Set',
                                    18.00
                                ],
                                [
                                    'Football',
                                    16.50
                                ],
                                [
                                    'Wireless Doorbell',
                                    38.00
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'Safe NOT IN subquery syntax',
                        sql: 'SELECT name, price\nFROM products\nWHERE product_id NOT IN (\n  SELECT product_id FROM order_items WHERE product_id IS NOT NULL\n);',
                        description: 'Safely excludes ordered products by guaranteeing no NULL values in the inner list.'
                    }
                ],
                keyTakeaway: 'Always add WHERE column IS NOT NULL inside a NOT IN subquery to prevent the three-valued logic NULL trap.',
                exampleQuery: 'SELECT name, price FROM products WHERE product_id NOT IN (SELECT product_id FROM order_items WHERE product_id IS NOT NULL);',
                exampleQueryExplanation: 'Finds products that have never been ordered.',
                liveDemoSql: 'SELECT name, price FROM products WHERE product_id NOT IN (SELECT product_id FROM order_items WHERE product_id IS NOT NULL);',
                liveDemoNotes: 'Displays the 6 products with zero sales history.',
                mcqs: [
                    {
                        question: 'Why does `WHERE id NOT IN (1, 2, NULL)` return 0 rows even for id = 5?',
                        options: [
                            'A. Because SQL syntax requires quotes around NULL',
                            'B. Because id != NULL evaluates to UNKNOWN, and TRUE AND UNKNOWN is UNKNOWN, which WHERE drops',
                            'C. Because NULL is treated as 0',
                            'D. Because the query has an invalid table alias'
                        ],
                        correctIndex: 1,
                        explanation: 'Any equality or inequality comparison with NULL evaluates to UNKNOWN, causing NOT IN with NULL to never evaluate to TRUE.'
                    }
                ],
                masteryPoints: [
                    'Understand how three-valued logic affects NOT IN',
                    'Always add WHERE col IS NOT NULL to subqueries used in NOT IN'
                ]
            },
            tasks: [
                {
                    id: 'day17-c1c-t1',
                    title: 'Task 1: Products Never Ordered (Safe NOT IN)',
                    description: 'Find the name and price of all products that have never been ordered using a safe NOT IN subquery with `WHERE product_id IS NOT NULL`.',
                    instructions: [
                        'Select `name` and `price` from `products`.',
                        'Where `product_id NOT IN (SELECT product_id FROM order_items WHERE product_id IS NOT NULL)`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'products',
                    secondaryTables: [
                        'order_items'
                    ],
                    initialSql: '-- Safe NOT IN subquery\n',
                    solutionSql: 'SELECT name, price FROM products WHERE product_id NOT IN (SELECT product_id FROM order_items WHERE product_id IS NOT NULL);',
                    solutionExplanation: 'Safely finds the 6 products that have zero order records.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `WHERE product_id NOT IN (SELECT product_id FROM order_items WHERE product_id IS NOT NULL);`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requireWhere: true,
                        requiredColumns: [
                            'name',
                            'price'
                        ],
                        expectedRowCount: 6
                    },
                    successMessage: 'Unordered products identified safely with NOT IN!'
                },
                {
                    id: 'day17-c1c-t2',
                    title: 'Task 2: Fix the Broken NOT IN Subquery',
                    description: 'A developer wrote a query that returned 0 rows because of the NULL trap. Fix it by ensuring the subquery filters out NULL product IDs.',
                    instructions: [
                        'Query the `products` table.',
                        'Select `name` and `price`.',
                        'Fix the subquery filter: `WHERE product_id NOT IN (SELECT product_id FROM order_items WHERE product_id IS NOT NULL)`.'
                    ],
                    type: 'independent',
                    primaryTable: 'products',
                    secondaryTables: [
                        'order_items'
                    ],
                    initialSql: 'SELECT name, price FROM products WHERE product_id NOT IN (SELECT product_id FROM order_items);\n',
                    solutionSql: 'SELECT name, price FROM products WHERE product_id NOT IN (SELECT product_id FROM order_items WHERE product_id IS NOT NULL);',
                    solutionExplanation: 'Adding `WHERE product_id IS NOT NULL` prevents NULL values from destroying the NOT IN logic.',
                    hints: [
                        {
                            level: 1,
                            text: 'Add `WHERE product_id IS NOT NULL` inside the inner subquery.'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requireWhere: true,
                        requiredColumns: [
                            'name',
                            'price'
                        ],
                        expectedRowCount: 6
                    },
                    successMessage: 'Spot on! You defeated the classic three-valued logic NOT IN NULL trap.'
                }
            ]
        },
        // =========================================================================
        // CONCEPT 4: Correlated Subqueries (Per-Row Dynamic Benchmarks)
        // =========================================================================
        {
            id: 'subqueries-correlated',
            order: 4,
            title: '4. Correlated Subqueries (Per-Row Dynamic Benchmarks)',
            shortDescription: 'Compare each row dynamically against its own category or parent benchmark.',
            theory: {
                summary: 'Unlike an independent subquery that runs once, a correlated subquery references a column from the outer query table. It re-evaluates dynamically for every single row of the outer query.',
                introTable: {
                    tableName: 'products (p1 vs p2)',
                    description: 'Comparing product price against category-specific average',
                    columns: [
                        'p1.name',
                        'p1.category_id',
                        'p1.price',
                        'category_avg_price'
                    ],
                    rows: [
                        [
                            'Ergonomic Desk Chair',
                            3,
                            249.00,
                            219.50
                        ],
                        [
                            'Wireless Mouse',
                            2,
                            25.00,
                            39.37
                        ],
                        [
                            'Mechanical Keyboard',
                            1,
                            89.99,
                            114.99
                        ]
                    ]
                },
                explanation: [
                    '### 1. The Anatomy of a Correlated Subquery',
                    '```sql\nSELECT p1.name, p1.price, p1.category_id\nFROM products p1\nWHERE p1.price > (\n  SELECT AVG(p2.price)\n  FROM products p2\n  WHERE p2.category_id = p1.category_id\n);\n```',
                    '• **Outer Query (`products p1`)**: Iterates through each product row one by one.',
                    '• **Correlation Condition (`p2.category_id = p1.category_id`)**: Links the inner calculation specifically to `p1`\'s category.',
                    '• **Inner Query (`products p2`)**: Calculates the average price only for products in that specific category.',
                    'QUESTION_BLOCK::Repeated Execution Model::A regular subquery runs once for the whole query. A correlated subquery runs once for each outer row, comparing each item against its localized peer group.'
                ],
                targetQuery: {
                    sql: 'SELECT p1.name, p1.price, p1.category_id\nFROM products p1\nWHERE p1.price > (\n  SELECT AVG(p2.price)\n  FROM products p2\n  WHERE p2.category_id = p1.category_id\n);',
                    explanation: 'Compare each product against its own specific category average price dynamically.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: Outer Query Evaluates Row Candidate',
                        sqlSnippet: '-- Inspecting Product: "Office Chair" (Category 3, Price $120.00)',
                        explanation: 'Outer query provides p1.category_id = 3 to the inner query.',
                        tableData: {
                            tableName: 'Outer Candidate Row (p1)',
                            columns: [
                                'name',
                                'price',
                                'category_id'
                            ],
                            rows: [
                                [
                                    'Office Chair',
                                    120.00,
                                    3
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: 'Step 2: Inner Query Computes Category 3 Average',
                        sqlSnippet: 'SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = 3;',
                        explanation: 'Inner query evaluates to $47.15 (Category 3 average).',
                        tableData: {
                            tableName: 'Category 3 Benchmark (p2)',
                            columns: [
                                'AVG(price)'
                            ],
                            highlightedColumns: [
                                'AVG(price)'
                            ],
                            rows: [
                                [
                                    47.15
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 3,
                        stepTitle: 'Step 3: WHERE Condition Evaluates ($120.00 > $47.15)',
                        sqlSnippet: 'WHERE p1.price > 47.15 -- TRUE',
                        explanation: 'Product is kept because its price exceeds its category average.',
                        tableData: {
                            tableName: 'Surviving Qualified Products',
                            columns: [
                                'name',
                                'price',
                                'category_id'
                            ],
                            highlightedColumns: [
                                'name',
                                'price'
                            ],
                            rows: [
                                [
                                    'Mechanical Keyboard',
                                    65.00,
                                    1
                                ],
                                [
                                    'Office Chair',
                                    120.00,
                                    3
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'Correlated subquery pattern',
                        sql: 'SELECT p1.name, p1.price, p1.category_id\nFROM products p1\nWHERE p1.price > (\n  SELECT AVG(p2.price)\n  FROM products p2\n  WHERE p2.category_id = p1.category_id\n);',
                        description: 'Compares each row dynamically to its category average.'
                    }
                ],
                keyTakeaway: 'Correlated subqueries use outer table aliases to calculate localized, row-specific benchmarks.',
                exampleQuery: 'SELECT name, price, category_id FROM products p1 WHERE price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id);',
                exampleQueryExplanation: 'Products priced above their specific category average.',
                liveDemoSql: 'SELECT name, price, category_id FROM products p1 WHERE price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id) LIMIT 5;',
                liveDemoNotes: 'Displays products above their category average.',
                mcqs: [
                    {
                        question: 'How does a correlated subquery differ from an independent scalar subquery?',
                        options: [
                            'A. It runs in a separate database process',
                            'B. It references a column from the outer query and evaluates once per outer row',
                            'C. It requires single quotes around all table names',
                            'D. It can only execute in MySQL 8.0+'
                        ],
                        correctIndex: 1,
                        explanation: 'Correlated subqueries depend on values from the outer query row and execute repeatedly.'
                    }
                ],
                masteryPoints: [
                    'Write correlated subqueries using table aliases',
                    'Compare rows against localized category benchmarks'
                ]
            },
            tasks: [
                {
                    id: 'day17-c1d-t1',
                    title: 'Task 1: Products Above Category Average',
                    description: 'Find name, price, and category_id for products priced higher than the average price within their own category.',
                    instructions: [
                        'Query `products p1`.',
                        'Select `p1.name`, `p1.price` and `p1.category_id`.',
                        'Filter where `p1.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id)`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'products',
                    initialSql: '-- Products above their own category average\nSELECT p1.name, p1.price, p1.category_id\nFROM products p1\nWHERE p1.price > (\n  SELECT AVG(p2.price)\n  FROM products p2\n  WHERE p2.category_id = p1.category_id\n);',
                    solutionSql: 'SELECT p1.name, p1.price, p1.category_id FROM products p1 WHERE p1.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id);',
                    solutionExplanation: 'Correlated subquery compares each product against its own category average price.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use table aliases `p1` for the outer query and `p2` for the inner subquery.'
                        },
                        {
                            level: 2,
                            text: 'Correlate with `WHERE p2.category_id = p1.category_id` inside the AVG subquery.'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requireWhere: true,
                        requiredColumns: [
                            'name',
                            'price',
                            'category_id'
                        ],
                        expectedRowCount: 12
                    },
                    successMessage: 'Task 1 completed! Above-category-average products retrieved via correlated subquery.'
                },
                {
                    id: 'day17-c1d-t2',
                    title: 'Task 2: Products with Above-Average Stock in Category',
                    description: 'Select name, quantity_in_stock, and category_id for products having stock strictly greater than their category average stock.',
                    instructions: [
                        'Query `products p1`.',
                        'Select `p1.name`, `p1.quantity_in_stock`, and `p1.category_id`.',
                        'Filter where `p1.quantity_in_stock > (SELECT AVG(p2.quantity_in_stock) FROM products p2 WHERE p2.category_id = p1.category_id)`.'
                    ],
                    type: 'independent',
                    primaryTable: 'products',
                    initialSql: '-- Products with stock above category average\n',
                    solutionSql: 'SELECT p1.name, p1.quantity_in_stock, p1.category_id FROM products p1 WHERE p1.quantity_in_stock > (SELECT AVG(p2.quantity_in_stock) FROM products p2 WHERE p2.category_id = p1.category_id);',
                    solutionExplanation: 'Calculates category-specific stock averages and filters high-inventory products.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `WHERE p1.quantity_in_stock > (SELECT AVG(p2.quantity_in_stock) FROM products p2 WHERE p2.category_id = p1.category_id);`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requireWhere: true,
                        requiredColumns: [
                            'name',
                            'quantity_in_stock',
                            'category_id'
                        ],
                        expectedRowCount: 13
                    },
                    successMessage: 'Task 2 completed! Correlated inventory benchmark verified.'
                }
            ]
        },
        // =========================================================================
        // CONCEPT 5: Common Table Expressions (WITH syntax)
        // =========================================================================
        {
            id: 'common-table-expressions-cte',
            order: 5,
            title: '5. Common Table Expressions (WITH syntax)',
            shortDescription: 'Readable, modular multi-stage query architecture.',
            theory: {
                summary: 'A Common Table Expression (CTE) defined with `WITH name AS (...)` provides a named, readable temporary result set that exists for the duration of a single query.',
                introTable: {
                    tableName: 'orders & customers',
                    description: 'CTE pipeline input data',
                    columns: [
                        'customer_id',
                        'name',
                        'order_count'
                    ],
                    rows: [
                        [
                            1,
                            'Rafiul Islam',
                            2
                        ],
                        [
                            2,
                            'Priya Akter',
                            1
                        ],
                        [
                            3,
                            'Tanvir Ahmed',
                            2
                        ]
                    ]
                },
                explanation: [
                    '### 1. What is a CTE?',
                    'A CTE is a named temporary result set defined with `WITH cte_name AS (...)` placed at the top of your query.',
                    'CTEs eliminate deeply nested subqueries and allow you to break complex business logic into clean, readable steps.'
                ],
                targetQuery: {
                    sql: 'WITH ActiveCustomers AS (\n  SELECT DISTINCT customer_id FROM orders\n)\nSELECT c.customer_id, c.name\nFROM customers c\nJOIN ActiveCustomers ac ON c.customer_id = ac.customer_id;',
                    explanation: 'Stage active customer IDs in a clean CTE and join them with the customers table.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: Staging ActiveCustomers CTE',
                        sqlSnippet: 'WITH ActiveCustomers AS (SELECT DISTINCT customer_id FROM orders)',
                        explanation: 'Evaluates the named temporary CTE containing distinct buyer IDs.',
                        tableData: {
                            tableName: 'ActiveCustomers (Staged CTE)',
                            columns: [
                                'customer_id'
                            ],
                            rows: [
                                [
                                    1
                                ],
                                [
                                    2
                                ],
                                [
                                    3
                                ],
                                [
                                    4
                                ]
                            ]
                        }
                    },
                    {
                        stepNumber: 2,
                        stepTitle: 'Step 2: Joining CTE with Customers Table',
                        sqlSnippet: 'SELECT c.customer_id, c.name FROM customers c JOIN ActiveCustomers ac ON c.customer_id = ac.customer_id',
                        explanation: 'Joins customers table with the staged CTE result set.',
                        tableData: {
                            tableName: 'Final Joined Result',
                            columns: [
                                'customer_id',
                                'name'
                            ],
                            highlightedColumns: [
                                'customer_id',
                                'name'
                            ],
                            rows: [
                                [
                                    1,
                                    'Rafiul Islam'
                                ],
                                [
                                    2,
                                    'Priya Akter'
                                ],
                                [
                                    3,
                                    'Tanvir Ahmed'
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'CTE syntax',
                        sql: 'WITH ActiveCustomers AS (\n  SELECT DISTINCT customer_id FROM orders\n)\nSELECT c.customer_id, c.name\nFROM customers c\nJOIN ActiveCustomers ac ON c.customer_id = ac.customer_id;',
                        description: 'Common Table Expression syntax.'
                    }
                ],
                keyTakeaway: 'Use CTEs to structure complex queries linearly and improve code maintainability.',
                exampleQuery: 'WITH ActiveCustomers AS (SELECT DISTINCT customer_id FROM orders) SELECT c.customer_id, c.name FROM customers c JOIN ActiveCustomers ac ON c.customer_id = ac.customer_id;',
                exampleQueryExplanation: 'Joins customers to a named CTE of active order placements.',
                liveDemoSql: 'WITH ActiveCustomers AS (SELECT DISTINCT customer_id FROM orders) SELECT c.customer_id, c.name FROM customers c JOIN ActiveCustomers ac ON c.customer_id = ac.customer_id;',
                liveDemoNotes: 'Displays CTE query execution.',
                mcqs: [
                    {
                        question: 'What is the primary readability advantage of a CTE over deeply nested subqueries?',
                        options: [
                            'A. CTEs can be defined at the top with a clear name, avoiding nested parenthesis indents',
                            'B. CTEs disable database security',
                            'C. CTEs run in background threads',
                            'D. CTEs only work on numbers'
                        ],
                        correctIndex: 0,
                        explanation: 'CTEs give a descriptive name to intermediate queries, linearizing the logic.'
                    }
                ],
                masteryPoints: [
                    'Structure modular queries using WITH (CTEs)'
                ]
            },
            tasks: [
                {
                    id: 'day17-c2-t1',
                    title: 'Task 1: Customer Order CTE',
                    description: 'Rewrite the active customer order query using a WITH cte AS (...) clause.',
                    instructions: [
                        'Define `WITH ActiveCustomers AS (SELECT DISTINCT customer_id FROM orders)`.',
                        'Select `c.customer_id`, `c.name` from `customers c` JOIN `ActiveCustomers ac` ON `c.customer_id = ac.customer_id`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'customers',
                    secondaryTables: [
                        'orders'
                    ],
                    initialSql: '-- Write your SQL query here\n',
                    solutionSql: 'WITH ActiveCustomers AS (SELECT DISTINCT customer_id FROM orders) SELECT c.customer_id, c.name FROM customers c JOIN ActiveCustomers ac ON c.customer_id = ac.customer_id;',
                    solutionExplanation: 'Uses a Common Table Expression to define active customer IDs.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `WITH ActiveCustomers AS (SELECT DISTINCT customer_id FROM orders) ...`'
                        }
                    ],
                    validation: {
                        targetTable: 'customers',
                        expectedRowCount: 12
                    },
                    successMessage: 'CTE query executed successfully!'
                },
                {
                    id: 'day17-c2-t2',
                    title: 'Task 2: Category Stats CTE',
                    description: 'Create a CTE named CategoryStats that computes average price per category, then select categories with average price > 25.',
                    instructions: [
                        'Define `WITH CategoryStats AS (SELECT category_id, AVG(price) AS avg_price FROM products GROUP BY category_id)`.',
                        'Select all columns from `CategoryStats` where `avg_price > 25`.'
                    ],
                    type: 'independent',
                    primaryTable: 'products',
                    initialSql: '-- Category stats CTE\n',
                    solutionSql: 'WITH CategoryStats AS (SELECT category_id, AVG(price) AS avg_price FROM products GROUP BY category_id) SELECT * FROM CategoryStats WHERE avg_price > 25;',
                    solutionExplanation: 'Computes category metrics inside a CTE and filters the resulting set.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `WITH CategoryStats AS (SELECT category_id, AVG(price) AS avg_price FROM products GROUP BY category_id) SELECT * FROM CategoryStats WHERE avg_price > 25;`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        expectedRowCount: 4
                    },
                    successMessage: 'Category stats CTE created and filtered!'
                }
            ]
        }
    ],
    // ===========================================================================
    // DAY 17 CHALLENGE (MASTER CURRICULUM ASSIGNMENT)
    // ===========================================================================
    challenge: {
        id: 'day-17-homework',
        title: 'Day 17 — Subqueries & CTEs (Homework)',
        scenario: 'Solve these complex analytical queries using subqueries and CTEs:',
        tasks: [
            {
                id: 'day17-hw-1',
                title: 'Task 1: Products priced higher than the overall average',
                description: 'Products priced higher than the catalog-wide average product price.',
                instructions: [
                    'Select `name`, `price` from `products` where `price > (SELECT AVG(price) FROM products)`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'products',
                initialSql: '-- Task 1: Products priced above overall average\n',
                solutionSql: 'SELECT name, price FROM products WHERE price > (SELECT AVG(price) FROM products);',
                solutionExplanation: 'Filters products using a scalar subquery.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `WHERE price > (SELECT AVG(price) FROM products);`'
                    }
                ],
                validation: {
                    targetTable: 'products',
                    requireWhere: true,
                    expectedRowCount: 10
                },
                successMessage: 'Task 1 completed! Above average products found.'
            },
            {
                id: 'day17-hw-2',
                title: 'Task 2: Customers who placed at least one order (IN subquery)',
                description: 'Customers who placed at least one order (using IN subquery).',
                instructions: [
                    'Select `customer_id`, `name` from `customers` where `customer_id IN (SELECT customer_id FROM orders)`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'customers',
                initialSql: '-- Task 2: Customers who placed at least one order (IN subquery)\n',
                solutionSql: 'SELECT customer_id, name FROM customers WHERE customer_id IN (SELECT customer_id FROM orders);',
                solutionExplanation: 'Uses an IN subquery against the orders table.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `WHERE customer_id IN (SELECT customer_id FROM orders);`'
                    }
                ],
                validation: {
                    targetTable: 'customers',
                    requireWhere: true,
                    expectedRowCount: 12
                },
                successMessage: 'Task 2 completed! Ordered customers identified.'
            },
            {
                id: 'day17-hw-3',
                title: 'Task 3: Products priced above their own category average (Correlated Subquery)',
                description: 'Products priced higher than their own category average using a correlated subquery.',
                instructions: [
                    'Select `p1.name`, `p1.price` from `products p1` where `p1.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id)`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'products',
                initialSql: '-- Task 3: Correlated subquery per category\n',
                solutionSql: 'SELECT p1.name, p1.price FROM products p1 WHERE p1.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id);',
                solutionExplanation: 'Uses a correlated subquery to dynamically calculate the average for each product\'s category.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `WHERE p1.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id);`'
                    }
                ],
                validation: {
                    targetTable: 'products',
                    requireWhere: true,
                    expectedRowCount: 12
                },
                successMessage: 'Task 3 completed! Correlated category query verified.'
            },
            {
                id: 'day17-hw-4',
                title: 'Task 4: Customer Order CTE',
                description: 'Rewrite the active customer order query using a WITH cte AS (...) clause.',
                instructions: [
                    'Use `WITH ActiveCustomers AS (SELECT DISTINCT customer_id FROM orders) SELECT c.customer_id, c.name FROM customers c JOIN ActiveCustomers ac ON c.customer_id = ac.customer_id;`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'customers',
                initialSql: '-- Task 4: Customer order query rewritten as CTE\n',
                solutionSql: 'WITH ActiveCustomers AS (SELECT DISTINCT customer_id FROM orders) SELECT c.customer_id, c.name FROM customers c JOIN ActiveCustomers ac ON c.customer_id = ac.customer_id;',
                solutionExplanation: 'Uses a Common Table Expression to define active customer IDs.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `WITH ActiveCustomers AS (SELECT DISTINCT customer_id FROM orders) ...`'
                    }
                ],
                validation: {
                    targetTable: 'customers',
                    expectedRowCount: 12
                },
                successMessage: 'Task 4 completed! CTE query verified.'
            }
        ]
    }
};
const DAY_18_MODULE = {
    id: 'day-18',
    slug: 'practice-subqueries-ctes',
    day: 18,
    title: 'Day 18 — Guided Practice: Advanced Subqueries & CTEs',
    shortTitle: 'Practice: Correlated Subqueries & CTEs',
    type: 'practice_day',
    milestoneId: 'milestone-3',
    description: 'Practice writing correlated subqueries, multi-stage CTE aggregations, and refactoring nested subqueries into clean Common Table Expressions.',
    estimatedMinutes: 60,
    completionLearnings: [
        'Write correlated subqueries linking inner and outer table references with table aliases',
        'Calculate customer financial spend inside a CTE and extract tier segments',
        'Refactor nested subqueries into maintainable, staged Common Table Expressions'
    ],
    concepts: [
        {
            id: 'correlated-and-staged-ctes',
            order: 1,
            title: '1. Correlated Subqueries & CTE Refactoring',
            shortDescription: 'Category benchmarks and tiered spend CTEs.',
            theory: {
                summary: 'Reinforce advanced subqueries and CTEs: compare items against localized category averages using correlated subqueries, build tiered analytical customer segments, and refactor nested queries into clean CTEs.',
                introTable: {
                    tableName: 'products (p1 vs p2)',
                    description: 'Comparing product price against category-specific average',
                    columns: [
                        'p1.name',
                        'p1.category_id',
                        'p1.price',
                        'category_avg_price'
                    ],
                    rows: [
                        [
                            'Ergonomic Desk Chair',
                            3,
                            249.00,
                            219.50
                        ],
                        [
                            'Wireless Mouse',
                            2,
                            25.00,
                            39.37
                        ],
                        [
                            'Mechanical Keyboard',
                            1,
                            89.99,
                            114.99
                        ]
                    ]
                },
                explanation: [
                    '### 1. Correlated Subquery Scaffolding',
                    'Remember: For each product row `p1`, the inner query runs `SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id`.',
                    '### 2. Multi-Stage CTE Reporting',
                    '```sql\nWITH CustomerSpend AS (\n  SELECT c.customer_id, c.name, SUM(oi.quantity * oi.unit_price) AS total_spent\n  FROM customers c\n  JOIN orders o ON c.customer_id = o.customer_id\n  JOIN order_items oi ON o.order_id = oi.order_id\n  GROUP BY c.customer_id, c.name\n)\nSELECT * FROM CustomerSpend WHERE total_spent > 150 ORDER BY total_spent DESC;\n```',
                    '### 3. CTE Refactoring Pattern',
                    'When queries require multi-step aggregation, CTEs allow you to stage the metrics cleanly without deep nesting.'
                ],
                targetQuery: {
                    sql: 'SELECT p1.name, p1.price, p1.category_id\nFROM products p1\nWHERE p1.price > (\n  SELECT AVG(p2.price)\n  FROM products p2\n  WHERE p2.category_id = p1.category_id\n);',
                    explanation: 'Compare products against localized category benchmarks with a correlated subquery.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: Evaluating Category Averages Correlated per Row',
                        sqlSnippet: 'SELECT p1.name, p1.price, p1.category_id\nFROM products p1\nWHERE p1.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id);',
                        explanation: 'Computes category benchmark for each product dynamically.',
                        tableData: {
                            tableName: 'Above-Category-Average Items',
                            columns: [
                                'name',
                                'price',
                                'category_id'
                            ],
                            highlightedColumns: [
                                'name',
                                'price',
                                'category_id'
                            ],
                            rows: [
                                [
                                    'Mechanical Keyboard',
                                    65.00,
                                    1
                                ],
                                [
                                    'Gaming Headset',
                                    55.00,
                                    1
                                ],
                                [
                                    'Office Chair',
                                    120.00,
                                    3
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'Correlated subquery vs CTE',
                        sql: '-- Correlated Subquery\nSELECT name, price FROM products p1\nWHERE price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id);',
                        description: 'Comparing items against their specific category average.'
                    }
                ],
                keyTakeaway: 'Correlated subqueries allow per-row dynamic comparisons, while CTEs modularize multi-stage pipelines.',
                exampleQuery: 'SELECT name, price FROM products p1 WHERE price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id);',
                exampleQueryExplanation: 'Products priced above their specific category average.',
                liveDemoSql: 'SELECT name, price FROM products p1 WHERE price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id);',
                liveDemoNotes: 'Displays products above their category average.',
                mcqs: [
                    {
                        question: 'What defines a correlated subquery?',
                        options: [
                            'A. It runs in a separate database',
                            'B. It references a column from the outer query and re-evaluates for each outer row',
                            'C. It only uses JOIN syntax',
                            'D. It always returns a table'
                        ],
                        correctIndex: 1,
                        explanation: 'Correlated subqueries depend on values from the outer query row.'
                    }
                ],
                masteryPoints: [
                    'Write correlated subqueries',
                    'Write staged analytical CTEs',
                    'Refactor nested subqueries into CTEs'
                ]
            },
            tasks: [
                {
                    id: 'day18-c1-t1',
                    title: 'Task 1 (High Guidance): Products Above Category Average',
                    description: 'Find products priced higher than the average price within their own category.',
                    instructions: [
                        'Query `products p1`.',
                        'Select `p1.name`, `p1.price`, and `p1.category_id`.',
                        'Where `p1.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id)`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'products',
                    initialSql: '-- Task 1: High Guidance - Products above category average\nSELECT p1.name, p1.price, p1.category_id\nFROM products p1\nWHERE p1.price > (\n  SELECT AVG(p2.price)\n  FROM products p2\n  WHERE p2.category_id = p1.category_id\n);',
                    solutionSql: 'SELECT p1.name, p1.price, p1.category_id FROM products p1 WHERE p1.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id);',
                    solutionExplanation: 'Correlated subquery compares each product against its own category average.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `WHERE p1.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id);`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requireWhere: true,
                        expectedRowCount: 12
                    },
                    successMessage: 'Task 1 completed! Products above category average found.'
                },
                {
                    id: 'day18-c1-t2',
                    title: 'Task 2 (Partial Guidance): High Spenders Tier CTE (> $150)',
                    description: 'Build a CTE named CustomerSpend to calculate total spend per customer, then query customers who spent more than $150.',
                    instructions: [
                        'Define `WITH CustomerSpend AS (SELECT c.customer_id, c.name, SUM(oi.quantity * oi.unit_price) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id, c.name)`.',
                        'Select all columns from `CustomerSpend` where `total_spent > 150` ordered by `total_spent DESC`.'
                    ],
                    type: 'independent',
                    primaryTable: 'customers',
                    secondaryTables: [
                        'orders',
                        'order_items'
                    ],
                    initialSql: '-- Task 2: Partial Guidance - Staged CTE for high-spend tier\n',
                    solutionSql: 'WITH CustomerSpend AS (SELECT c.customer_id, c.name, SUM(oi.quantity * oi.unit_price) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id, c.name) SELECT * FROM CustomerSpend WHERE total_spent > 150 ORDER BY total_spent DESC;',
                    solutionExplanation: 'Calculates customer spend inside CTE and extracts customers above $150.',
                    hints: [
                        {
                            level: 1,
                            text: 'Define the CTE at the top with `WITH CustomerSpend AS (...)`.'
                        },
                        {
                            level: 2,
                            text: 'Query `SELECT * FROM CustomerSpend WHERE total_spent > 150 ORDER BY total_spent DESC;`.'
                        }
                    ],
                    validation: {
                        targetTable: 'customers',
                        expectedRowCount: 2
                    },
                    successMessage: 'Task 2 completed! High-spend customer tier analyzed with CTE.'
                },
                {
                    id: 'day18-c1-t3',
                    title: 'Task 3 (Goal Only): CTE Refactoring Challenge',
                    description: 'Create a CTE named HighValueOrders that selects order_id and order_date from orders having status = "delivered", then join it with order_items to sum total revenue per order for delivered orders.',
                    instructions: [
                        'Define `WITH DeliveredOrders AS (SELECT order_id, order_date FROM orders WHERE status = \'delivered\')`.',
                        'Select `d.order_id`, `d.order_date`, `SUM(oi.quantity * oi.unit_price) AS order_total` from `DeliveredOrders d` JOIN `order_items oi` ON `d.order_id = oi.order_id`.',
                        'Group by `d.order_id`, `d.order_date`.',
                        'Order by `order_total DESC`.'
                    ],
                    type: 'independent',
                    primaryTable: 'orders',
                    secondaryTables: [
                        'order_items'
                    ],
                    initialSql: '-- Task 3: Goal Only - CTE Refactoring Challenge\n',
                    solutionSql: 'WITH DeliveredOrders AS (SELECT order_id, order_date FROM orders WHERE status = \'delivered\') SELECT d.order_id, d.order_date, SUM(oi.quantity * oi.unit_price) AS order_total FROM DeliveredOrders d JOIN order_items oi ON d.order_id = oi.order_id GROUP BY d.order_id, d.order_date ORDER BY order_total DESC;',
                    solutionExplanation: 'Refactors delivered order filtering into a clean CTE, joined with order items.',
                    hints: [
                        {
                            level: 1,
                            text: 'Stage delivered orders in `WITH DeliveredOrders AS (...)`.'
                        },
                        {
                            level: 2,
                            text: 'Join `DeliveredOrders d` with `order_items oi` on `d.order_id = oi.order_id`.'
                        }
                    ],
                    validation: {
                        targetTable: 'orders',
                        requireJoin: true,
                        requireGroupBy: true,
                        requireOrderBy: [
                            {
                                column: 'order_total',
                                direction: 'DESC'
                            }
                        ],
                        expectedRowCount: 11
                    },
                    successMessage: 'Task 3 completed! Nested pipeline refactored into a clean CTE.'
                }
            ]
        }
    ],
    // ===========================================================================
    // DAY 18 CHALLENGE: SUBQUERIES & CTES PIPELINE CHALLENGE (ENDING ACTIVITY)
    // ===========================================================================
    challenge: {
        id: 'day-18-homework',
        title: 'Day 18 — Subqueries & CTEs Pipeline Challenge (Ending Activity)',
        scenario: 'Complete these 2 analytical challenges independently:',
        tasks: [
            {
                id: 'day18-hw-1',
                title: 'Task 1: Products priced above their own category average',
                description: 'Products priced above their own category average (correlated subquery).',
                instructions: [
                    'Select `p1.name`, `p1.price` from `products p1` where `p1.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id)`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'products',
                initialSql: '-- Task 1: Products priced above their own category average\n',
                solutionSql: 'SELECT p1.name, p1.price FROM products p1 WHERE p1.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id);',
                solutionExplanation: 'Executes a correlated subquery per category.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `WHERE p1.price > (SELECT AVG(p2.price) FROM products p2 WHERE p2.category_id = p1.category_id);`'
                    }
                ],
                validation: {
                    targetTable: 'products',
                    requireWhere: true,
                    expectedRowCount: 12
                },
                successMessage: 'Task 1 completed! Correlated category query verified.'
            },
            {
                id: 'day18-hw-2',
                title: 'Task 2: CTE that calculates spend per customer, then queries for customers above $150',
                description: 'CTE that calculates total spend per customer, then queries that CTE for customers above $150.',
                instructions: [
                    'Use `WITH CustomerSpend AS (SELECT c.customer_id, c.name, SUM(oi.quantity * oi.unit_price) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id, c.name) SELECT * FROM CustomerSpend WHERE total_spent > 150 ORDER BY total_spent DESC;`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'customers',
                secondaryTables: [
                    'orders',
                    'order_items'
                ],
                initialSql: '-- Task 2: Customer spend CTE filtered for > $150\n',
                solutionSql: 'WITH CustomerSpend AS (SELECT c.customer_id, c.name, SUM(oi.quantity * oi.unit_price) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id, c.name) SELECT * FROM CustomerSpend WHERE total_spent > 150 ORDER BY total_spent DESC;',
                solutionExplanation: 'Constructs the CustomerSpend CTE and filters for total_spent > 150.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `WITH CustomerSpend AS (...) SELECT * FROM CustomerSpend WHERE total_spent > 150;`'
                    }
                ],
                validation: {
                    targetTable: 'customers',
                    expectedRowCount: 2
                },
                successMessage: 'Task 2 completed! Staged CTE spending report verified.'
            }
        ]
    }
};
const DAY_19_MODULE = {
    id: 'day-19',
    slug: 'dml-insert-update-delete',
    day: 19,
    title: 'Day 19 — DML: INSERT, UPDATE, DELETE',
    shortTitle: 'DML (Data Modification)',
    type: 'module',
    milestoneId: 'milestone-3',
    description: 'Learn safe data modification commands (INSERT, UPDATE, DELETE), the critical danger of missing WHERE clauses, and transaction safety.',
    estimatedMinutes: 75,
    completionLearnings: [
        'Insert single and multi-row records using INSERT INTO',
        'Safely modify records using UPDATE ... SET ... WHERE',
        'Safely delete records using DELETE FROM ... WHERE',
        'Recognize and prevent catastrophic unbounded table mutations'
    ],
    concepts: [
        // =========================================================================
        // CONCEPT 1: Inserting New Records with INSERT INTO
        // =========================================================================
        {
            id: 'dml-insert-into',
            order: 1,
            title: '1. Inserting New Records with INSERT INTO',
            shortDescription: 'Add new rows of data into existing database tables.',
            theory: {
                summary: '`INSERT INTO table (col1, col2) VALUES (val1, val2)` appends new records into a database table.',
                introTable: {
                    tableName: 'products (before insert)',
                    description: 'Products table before appending new record',
                    columns: [
                        'product_id',
                        'name',
                        'price',
                        'quantity_in_stock'
                    ],
                    rows: [
                        [
                            1,
                            'Wireless Mouse',
                            15.99,
                            40
                        ],
                        [
                            2,
                            'Bluetooth Speaker',
                            45.50,
                            3
                        ]
                    ]
                },
                explanation: [
                    '### 1. INSERT INTO Syntax',
                    'Specify the target table, the column names in parentheses, followed by `VALUES (...)` with the matching data:',
                    '```sql\nINSERT INTO products (\n  name, supplier_id, category_id, price, quantity_in_stock, reorder_level\n) VALUES (\n  \'Ultra Wireless Mouse\', 1, 1, 49.99, 100, 20\n);\n```',
                    'You typically omit the primary key column (e.g. `product_id`) if the database is configured to generate sequential auto-increment IDs automatically.'
                ],
                targetQuery: {
                    sql: "INSERT INTO products (\n  name, supplier_id, category_id, price, quantity_in_stock, reorder_level\n) VALUES (\n  'Ultra Wireless Mouse', 1, 1, 49.99, 100, 20\n);",
                    explanation: 'Append a new wireless mouse record into the products inventory catalog.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: Appending New Record (INSERT INTO)',
                        sqlSnippet: "INSERT INTO products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level) VALUES ('Ultra Wireless Mouse', 1, 1, 49.99, 100, 20);",
                        explanation: 'Creates a new row in the products table with the specified attributes.',
                        tableData: {
                            tableName: 'Newly Inserted Product Row',
                            columns: [
                                'name',
                                'supplier_id',
                                'category_id',
                                'price',
                                'quantity_in_stock'
                            ],
                            highlightedColumns: [
                                'name',
                                'price',
                                'quantity_in_stock'
                            ],
                            rows: [
                                [
                                    'Ultra Wireless Mouse',
                                    1,
                                    1,
                                    49.99,
                                    100
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'INSERT INTO syntax',
                        sql: 'INSERT INTO table_name (column1, column2)\nVALUES (value1, value2);',
                        description: 'Inserts a new record into table_name.'
                    }
                ],
                keyTakeaway: 'INSERT INTO adds new rows. Match the order of values to the specified column list.',
                exampleQuery: 'INSERT INTO products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level) VALUES (\'Ultra Wireless Mouse\', 1, 1, 49.99, 100, 20);',
                exampleQueryExplanation: 'Appends a new mouse record to the catalog.',
                liveDemoSql: 'SELECT * FROM products ORDER BY product_id DESC LIMIT 1;',
                liveDemoNotes: 'Displays the most recently added product.',
                mcqs: [
                    {
                        question: 'What happens if the number of columns in the column list does not match the number of values in VALUES?',
                        options: [
                            'A. SQL fills missing columns with 0',
                            'B. SQL throws a column count mismatch syntax error',
                            'C. SQL inserts a blank row',
                            'D. SQL ignores the extra values'
                        ],
                        correctIndex: 1,
                        explanation: 'The number of specified columns and provided values must match exactly.'
                    }
                ],
                masteryPoints: [
                    'Write well-formed INSERT INTO statements with explicit column lists'
                ]
            },
            tasks: [
                {
                    id: 'day19-c1-t1',
                    title: 'Task 1: Insert a New Product',
                    description: 'Insert a new item into the `products` table.',
                    instructions: [
                        'Insert into `products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level)` values `(\'Ultra Wireless Mouse\', 1, 1, 49.99, 100, 20)`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'products',
                    initialSql: '-- Insert a new product\n',
                    solutionSql: 'INSERT INTO products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level) VALUES (\'Ultra Wireless Mouse\', 1, 1, 49.99, 100, 20);',
                    solutionExplanation: 'Inserts a new product record.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `INSERT INTO products (...) VALUES (...);`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        expectedRowCount: 1
                    },
                    successMessage: 'Product inserted successfully!'
                },
                {
                    id: 'day19-c1-t2',
                    title: 'Task 2: Insert a New Customer',
                    description: 'Insert a new customer profile into the `customers` table.',
                    instructions: [
                        'Insert into `customers (name, email, city, signup_date)`.',
                        'Values: `(\'Sultana Begum\', \'sultana@example.com\', \'Dhaka\', \'2026-08-25\')`.'
                    ],
                    type: 'independent',
                    primaryTable: 'customers',
                    initialSql: '-- Insert new customer\n',
                    solutionSql: 'INSERT INTO customers (name, email, city, signup_date) VALUES (\'Sultana Begum\', \'sultana@example.com\', \'Dhaka\', \'2026-08-25\');',
                    solutionExplanation: 'Appends Sultana Begum to the customer roster.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `INSERT INTO customers (name, email, city, signup_date) VALUES (\'Sultana Begum\', \'sultana@example.com\', \'Dhaka\', \'2026-08-25\');`'
                        }
                    ],
                    validation: {
                        targetTable: 'customers',
                        expectedRowCount: 1
                    },
                    successMessage: 'Well done! New customer record inserted.'
                }
            ]
        },
        // =========================================================================
        // CONCEPT 2a: Modifying Rows Safely with UPDATE ... SET ... WHERE
        // =========================================================================
        {
            id: 'dml-safe-update',
            order: 2,
            title: '2. Modifying Rows Safely with UPDATE ... SET ... WHERE',
            shortDescription: 'Update specific records and avoid unintended table-wide modifications.',
            theory: {
                summary: '`UPDATE table SET col = new_value WHERE condition` modifies existing data. Always verify the WHERE condition first, because omitting WHERE mutates EVERY row in the entire table!',
                introTable: {
                    tableName: 'products (before update)',
                    description: 'Product 1 before targeted price change',
                    columns: [
                        'product_id',
                        'name',
                        'price'
                    ],
                    rows: [
                        [
                            1,
                            'Wireless Mouse',
                            15.99
                        ],
                        [
                            2,
                            'Bluetooth Speaker',
                            45.50
                        ]
                    ]
                },
                explanation: [
                    '### 1. The Anatomy of an UPDATE',
                    '```sql\nUPDATE products\nSET price = 19.99\nWHERE product_id = 1;\n```',
                    '### 2. The Danger of Missing WHERE',
                    'If you accidentally run `UPDATE products SET price = 19.99;` without a `WHERE` clause, **every product in the catalog will be set to $19.99**! Always write your `WHERE` clause first.'
                ],
                targetQuery: {
                    sql: 'UPDATE products\nSET price = price * 1.10\nWHERE product_id = 1;',
                    explanation: 'Safely apply a 10% price increase specifically to product 1 using a targeted WHERE condition.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: Targeted Update with WHERE',
                        sqlSnippet: 'UPDATE products\nSET price = price * 1.10\nWHERE product_id = 1;',
                        explanation: 'Selectively increases product 1 price by 10% without altering other products.',
                        tableData: {
                            tableName: 'Updated Row',
                            columns: [
                                'product_id',
                                'name',
                                'price'
                            ],
                            highlightedColumns: [
                                'price'
                            ],
                            rows: [
                                [
                                    1,
                                    'Wireless Mouse',
                                    17.59
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'UPDATE syntax',
                        sql: 'UPDATE products\nSET price = 24.99\nWHERE product_id = 1;',
                        description: 'Modifies specific rows matching the WHERE criteria.'
                    }
                ],
                keyTakeaway: 'Always include a WHERE clause with UPDATE to prevent table-wide data overwrite.',
                exampleQuery: 'UPDATE products SET price = price * 1.10 WHERE product_id = 1;',
                exampleQueryExplanation: 'Safely increases product 1 price by 10%.',
                liveDemoSql: 'SELECT * FROM products WHERE product_id = 1;',
                liveDemoNotes: 'Displays product record.',
                mcqs: [
                    {
                        question: 'What happens if you run `UPDATE products SET price = 0;` without a WHERE clause?',
                        options: [
                            'A. Only the first row is updated',
                            'B. SQL asks for user confirmation',
                            'C. Every single product in the table has its price changed to 0',
                            'D. The database throws an error'
                        ],
                        correctIndex: 2,
                        explanation: 'Without a WHERE clause, UPDATE modifies all rows in the table.'
                    }
                ],
                masteryPoints: [
                    'Write targeted UPDATE statements',
                    'Prevent accidental full-table overwrites'
                ]
            },
            tasks: [
                {
                    id: 'day19-c2a-t1',
                    title: 'Task 1: Targeted Price Increase',
                    description: 'Safely update the price of product_id 1 by 10% (price = price * 1.10).',
                    instructions: [
                        'Update `products`.',
                        'Set `price = price * 1.10`.',
                        'Where `product_id = 1`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'products',
                    initialSql: '-- Targeted price update\n',
                    solutionSql: 'UPDATE products SET price = price * 1.10 WHERE product_id = 1;',
                    solutionExplanation: 'Safely applies a 10% price increase specifically to product 1.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `UPDATE products SET price = price * 1.10 WHERE product_id = 1;`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requireWhere: true,
                        expectedRowCount: 1
                    },
                    successMessage: 'Product price updated safely with WHERE!'
                },
                {
                    id: 'day19-c2a-t2',
                    title: 'Task 2: Restock Category 1 Products',
                    description: 'Increase quantity_in_stock by 20 for all products belonging to category_id 1 (Electronics).',
                    instructions: [
                        'Update `products`.',
                        'Set `quantity_in_stock = quantity_in_stock + 20`.',
                        'Where `category_id = 1`.'
                    ],
                    type: 'independent',
                    primaryTable: 'products',
                    initialSql: '-- Restock category 1 products\n',
                    solutionSql: 'UPDATE products SET quantity_in_stock = quantity_in_stock + 20 WHERE category_id = 1;',
                    solutionExplanation: 'Updates all products in category 1.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `UPDATE products SET quantity_in_stock = quantity_in_stock + 20 WHERE category_id = 1;`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requireWhere: true,
                        expectedRowCount: 7
                    },
                    successMessage: 'Well done! Batch category update executed safely.'
                }
            ]
        },
        // =========================================================================
        // CONCEPT 2b: Removing Rows Safely with DELETE FROM ... WHERE
        // =========================================================================
        {
            id: 'dml-safe-delete',
            order: 3,
            title: '3. Removing Rows Safely with DELETE FROM ... WHERE',
            shortDescription: 'Remove specific rows and prevent accidental table wipes.',
            theory: {
                summary: '`DELETE FROM table WHERE condition` removes targeted rows. Omitting WHERE wipes all data in the table.',
                introTable: {
                    tableName: 'orders (before deletion)',
                    description: 'Orders table with temporary test order 18',
                    columns: [
                        'order_id',
                        'customer_id',
                        'status'
                    ],
                    rows: [
                        [
                            17,
                            3,
                            'delivered'
                        ],
                        [
                            18,
                            1,
                            'pending'
                        ]
                    ]
                },
                explanation: [
                    '### 1. The Anatomy of a DELETE',
                    '```sql\nDELETE FROM orders\nWHERE order_id = 18;\n```',
                    '### 2. The Danger of Missing WHERE',
                    'Executing `DELETE FROM orders;` without a `WHERE` clause deletes **every single row** in the table! Always specify the exact primary key or condition to delete.'
                ],
                targetQuery: {
                    sql: 'DELETE FROM orders\nWHERE order_id = 18;',
                    explanation: 'Safely delete temporary test order 18 from the orders table.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: Targeted Row Deletion',
                        sqlSnippet: 'DELETE FROM orders WHERE order_id = 18;',
                        explanation: 'Removes order #18 cleanly from the database.',
                        tableData: {
                            tableName: 'Surviving Orders',
                            columns: [
                                'order_id',
                                'status'
                            ],
                            highlightedColumns: [
                                'order_id'
                            ],
                            rows: [
                                [
                                    17,
                                    'delivered'
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'DELETE syntax',
                        sql: 'DELETE FROM table_name\nWHERE condition;',
                        description: 'Deletes rows matching the condition.'
                    }
                ],
                keyTakeaway: 'Always verify your WHERE clause before executing DELETE to avoid wiping entire tables.',
                exampleQuery: 'DELETE FROM orders WHERE order_id = 18;',
                exampleQueryExplanation: 'Deletes order #18.',
                liveDemoSql: 'SELECT * FROM orders WHERE order_id = 18;',
                liveDemoNotes: 'Displays order before deletion.',
                mcqs: [
                    {
                        question: 'What does `DELETE FROM customers;` do?',
                        options: [
                            'A. Deletes only inactive customers',
                            'B. Drops the customer table schema',
                            'C. Deletes every single row in the customers table',
                            'D. Prompts for confirmation'
                        ],
                        correctIndex: 2,
                        explanation: 'DELETE without WHERE deletes all rows from the table.'
                    }
                ],
                masteryPoints: [
                    'Write targeted DELETE statements',
                    'Guard against unbounded table deletion'
                ]
            },
            tasks: [
                {
                    id: 'day19-c2b-t1',
                    title: 'Task 1: Delete Disposable Test Order',
                    description: 'Delete the test order with order_id 18 from the orders table.',
                    instructions: [
                        'Delete from `orders`.',
                        'Where `order_id = 18`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'orders',
                    initialSql: '-- Delete order 18\n',
                    solutionSql: 'DELETE FROM orders WHERE order_id = 18;',
                    solutionExplanation: 'Safely removes order record 18.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `DELETE FROM orders WHERE order_id = 18;`'
                        }
                    ],
                    validation: {
                        targetTable: 'orders',
                        requireWhere: true,
                        expectedRowCount: 1
                    },
                    successMessage: 'Order 18 safely deleted!'
                },
                {
                    id: 'day19-c2b-t2',
                    title: 'Task 2: Guard an Unbounded Delete',
                    description: 'A junior script has a dangerous query: `DELETE FROM products;`. Fix it so it only removes obsolete products that are completely out of stock (`quantity_in_stock = 0`).',
                    instructions: [
                        'Delete from `products`.',
                        'Add the safeguard filter: `WHERE quantity_in_stock = 0`.'
                    ],
                    type: 'independent',
                    primaryTable: 'products',
                    initialSql: '-- Warning: DELETE FROM products; wipes the whole catalog.\n-- Now write the SAME delete but ONLY for quantity_in_stock = 0\n',
                    solutionSql: 'DELETE FROM products WHERE quantity_in_stock = 0;',
                    solutionExplanation: 'Adds a WHERE condition to only delete items with 0 stock (3 items).',
                    hints: [
                        {
                            level: 1,
                            text: 'Add `WHERE quantity_in_stock = 0;`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requireWhere: true,
                        expectedRowCount: 3
                    },
                    successMessage: 'Spot on! You guarded against an unbounded table wipe.'
                }
            ]
        }
    ],
    // ===========================================================================
    // DAY 19 CHALLENGE (MASTER CURRICULUM ASSIGNMENT)
    // ===========================================================================
    challenge: {
        id: 'day-19-homework',
        title: 'Day 19 — DML Operations (Homework)',
        scenario: 'Demonstrate safe data modification operations:',
        tasks: [
            {
                id: 'day19-hw-1',
                title: 'Task 1: Insert a new product into products',
                description: 'Insert a new product into products.',
                instructions: [
                    'Insert into `products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level)` values `(\'Precision Stylus Pen\', 1, 1, 29.99, 80, 15)`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'products',
                initialSql: '-- Task 1: Insert a new product into products\n',
                solutionSql: 'INSERT INTO products (name, supplier_id, category_id, price, quantity_in_stock, reorder_level) VALUES (\'Precision Stylus Pen\', 1, 1, 29.99, 80, 15);',
                solutionExplanation: 'Inserts new product with complete column attributes.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `INSERT INTO products (...) VALUES (...);`'
                    }
                ],
                validation: {
                    targetTable: 'products',
                    expectedRowCount: 1
                },
                successMessage: 'Task 1 completed! New product added.'
            },
            {
                id: 'day19-hw-2',
                title: 'Task 2: Update the price of a product by 10%',
                description: 'Update the price of product_id = 1 by 10% (price = price * 1.10).',
                instructions: [
                    'Update `products` set `price = price * 1.10` where `product_id = 1`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'products',
                initialSql: '-- Task 2: Update the price of product 1 by 10%\n',
                solutionSql: 'UPDATE products SET price = price * 1.10 WHERE product_id = 1;',
                solutionExplanation: 'Safely applies targeted 10% price increase using WHERE product_id = 1.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `UPDATE products SET price = price * 1.10 WHERE product_id = 1;`'
                    }
                ],
                validation: {
                    targetTable: 'products',
                    requireWhere: true,
                    expectedRowCount: 1
                },
                successMessage: 'Task 2 completed! Product price safely updated.'
            }
        ]
    }
};
const DAY_20_MODULE = {
    id: 'day-20',
    slug: 'ddl-schema-design',
    day: 20,
    title: 'Day 20 — DDL: CREATE TABLE, ALTER TABLE, DROP TABLE',
    shortTitle: 'DDL (Schema Design)',
    type: 'module',
    milestoneId: 'milestone-3',
    description: 'Deeply master Data Definition Language: CREATE TABLE, column data types, integrity constraints (PK, NOT NULL, UNIQUE, DEFAULT, CHECK), ALTER TABLE schema modifications, FOREIGN KEY relations, and DROP TABLE.',
    estimatedMinutes: 90,
    completionLearnings: [
        'Create structured tables with CREATE TABLE',
        'Choose appropriate column data types (INT, VARCHAR, DECIMAL, DATETIME, BOOLEAN)',
        'Enforce entity identity with PRIMARY KEY and AUTO_INCREMENT',
        'Apply data integrity constraints: NOT NULL, UNIQUE, DEFAULT, and CHECK',
        'Modify existing table schemas using ALTER TABLE ... ADD COLUMN',
        'Establish relational foreign key constraints using ALTER TABLE ... ADD FOREIGN KEY',
        'Safely tear down temporary schemas using DROP TABLE IF EXISTS'
    ],
    concepts: [
        // =========================================================================
        // CONCEPT 1: Creating a Table with CREATE TABLE
        // =========================================================================
        {
            id: 'ddl-create-table',
            order: 1,
            title: '1. Creating a Table with CREATE TABLE',
            shortDescription: 'Define table structure and allocate new database entities.',
            theory: {
                summary: '`CREATE TABLE table_name (col1 type, col2 type)` creates a new empty table structure in your database.',
                introTable: {
                    tableName: 'product_tags (blueprint)',
                    description: 'Blueprint for tagging inventory items',
                    columns: [
                        'tag_id',
                        'tag_name'
                    ],
                    rows: [
                        [
                            1,
                            'bestseller'
                        ],
                        [
                            2,
                            'clearance'
                        ]
                    ]
                },
                explanation: [
                    '### 1. The Core CREATE TABLE Syntax',
                    '```sql\nCREATE TABLE product_tags (\n  tag_id INT,\n  tag_name VARCHAR(50)\n);\n```',
                    'Table names should be lowercase, descriptive, and pluralized by convention (e.g. `products`, `orders`, `tags`).'
                ],
                targetQuery: {
                    sql: 'CREATE TABLE product_tags (\n  tag_id INT,\n  tag_name VARCHAR(50)\n);',
                    explanation: 'Allocate a new table structure for tagging catalog items with integer IDs and descriptive names.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: Creating Table',
                        sqlSnippet: 'CREATE TABLE product_tags (\n  tag_id INT,\n  tag_name VARCHAR(50)\n);',
                        explanation: 'Allocates storage structure with two columns: tag_id and tag_name.',
                        tableData: {
                            tableName: 'Created Structure',
                            columns: [
                                'Column Name',
                                'Type'
                            ],
                            rows: [
                                [
                                    'tag_id',
                                    'INT'
                                ],
                                [
                                    'tag_name',
                                    'VARCHAR(50)'
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'CREATE TABLE syntax',
                        sql: 'CREATE TABLE table_name (\n  column1 datatype,\n  column2 datatype\n);',
                        description: 'Creates a new table schema.'
                    }
                ],
                keyTakeaway: 'CREATE TABLE defines the column blueprint for your database entity.',
                exampleQuery: 'CREATE TABLE product_tags ( tag_id INT, tag_name VARCHAR(50) );',
                exampleQueryExplanation: 'Creates a simple tag table.',
                liveDemoSql: 'SELECT * FROM categories LIMIT 1;',
                liveDemoNotes: 'Displays existing table structure.',
                mcqs: [
                    {
                        question: 'What is the minimum requirement to create a table in SQL?',
                        options: [
                            'A. Only a table name',
                            'B. A table name and at least one column definition (name and data type)',
                            'C. A table name and an existing CSV file',
                            'D. A foreign key constraint'
                        ],
                        correctIndex: 1,
                        explanation: 'Every CREATE TABLE requires a table name and at least one column with a defined data type.'
                    }
                ],
                masteryPoints: [
                    'Write clean CREATE TABLE statements'
                ]
            },
            tasks: [
                {
                    id: 'day20-c1-t1',
                    title: 'Task 1: Create the Product Tags Table',
                    description: 'Create a new table named `product_tags` with `tag_id INT` and `tag_name VARCHAR(50)`.',
                    instructions: [
                        'Write `CREATE TABLE product_tags (tag_id INT, tag_name VARCHAR(50));`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'product_tags',
                    initialSql: '-- Create product_tags table\n',
                    solutionSql: 'CREATE TABLE product_tags (tag_id INT, tag_name VARCHAR(50));',
                    solutionExplanation: 'Creates product_tags with tag_id and tag_name.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `CREATE TABLE product_tags (tag_id INT, tag_name VARCHAR(50));`'
                        }
                    ],
                    validation: {
                        targetTable: 'product_tags',
                        expectedRowCount: 1
                    },
                    successMessage: 'Product tags table created!'
                },
                {
                    id: 'day20-c1-t2',
                    title: 'Task 2: Create Quick Notes Table',
                    description: 'Create a table named `quick_notes` with columns `note_id INT` and `content TEXT`.',
                    instructions: [
                        'Create table `quick_notes`.',
                        'Define `note_id INT` and `content TEXT`.'
                    ],
                    type: 'independent',
                    primaryTable: 'quick_notes',
                    initialSql: '-- Create quick_notes table\n',
                    solutionSql: 'CREATE TABLE quick_notes (note_id INT, content TEXT);',
                    solutionExplanation: 'Allocates the quick_notes table schema.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `CREATE TABLE quick_notes (note_id INT, content TEXT);`'
                        }
                    ],
                    validation: {
                        targetTable: 'quick_notes',
                        expectedRowCount: 1
                    },
                    successMessage: 'Well done! Quick notes table created.'
                }
            ]
        },
        // =========================================================================
        // CONCEPT 2: Column Data Types (INT, VARCHAR, DECIMAL, DATETIME, BOOLEAN)
        // =========================================================================
        {
            id: 'ddl-data-types',
            order: 2,
            title: '2. Choosing Column Data Types',
            shortDescription: 'INT, VARCHAR, DECIMAL, DATETIME, and MySQL BOOLEAN / TINYINT(1).',
            theory: {
                summary: 'Choosing the correct data type ensures storage efficiency, query speed, and data accuracy.',
                introTable: {
                    tableName: 'Common SQL Data Types',
                    description: 'Standard SQL data types comparison',
                    columns: [
                        'Type',
                        'Usage',
                        'Example Values'
                    ],
                    rows: [
                        [
                            'INT',
                            'Whole numbers / IDs',
                            '1, 42, -500'
                        ],
                        [
                            'VARCHAR(255)',
                            'Variable-length text',
                            "'Wireless Mouse'"
                        ],
                        [
                            'DECIMAL(10,2)',
                            'Exact financial numbers (10 digits, 2 decimals)',
                            '49.99, 1200.50'
                        ],
                        [
                            'DATETIME',
                            'Timestamps with date & time',
                            "'2026-08-25 14:30:00'"
                        ],
                        [
                            'BOOLEAN',
                            'True/False (In MySQL: TINYINT(1) where 1=TRUE, 0=FALSE)',
                            'TRUE (1), FALSE (0)'
                        ]
                    ]
                },
                explanation: [
                    '### 1. DECIMAL Precision & Scale',
                    '`DECIMAL(10, 2)` means **10 total digits** with **2 digits after the decimal point** (maximum: 99,999,999.99). Never use FLOAT for currency because floating-point rounding causes financial inaccuracy!',
                    '### 2. MySQL BOOLEAN Note',
                    'In MySQL, `BOOLEAN` is an alias for `TINYINT(1)`. `TRUE` evaluates to `1` and `FALSE` evaluates to `0`.'
                ],
                targetQuery: {
                    sql: 'CREATE TABLE product_metrics (\n  product_id INT,\n  weight_kg DECIMAL(6,2),\n  is_fragile BOOLEAN,\n  logged_at DATETIME\n);',
                    explanation: 'Define appropriate data types (INT, exact DECIMAL, BOOLEAN, and DATETIME) for a metrics table.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: Multi-Type Schema Definition',
                        sqlSnippet: 'CREATE TABLE product_metrics (\n  product_id INT,\n  weight_kg DECIMAL(6,2),\n  is_fragile BOOLEAN,\n  logged_at DATETIME\n);',
                        explanation: 'Demonstrates integer, decimal, boolean, and timestamp data types.',
                        tableData: {
                            tableName: 'Metrics Schema',
                            columns: [
                                'Column',
                                'Type'
                            ],
                            rows: [
                                [
                                    'product_id',
                                    'INT'
                                ],
                                [
                                    'weight_kg',
                                    'DECIMAL(6,2)'
                                ],
                                [
                                    'is_fragile',
                                    'BOOLEAN / TINYINT(1)'
                                ],
                                [
                                    'logged_at',
                                    'DATETIME'
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'Data type declarations',
                        sql: 'CREATE TABLE product_metrics (\n  product_id INT,\n  weight_kg DECIMAL(6,2),\n  is_fragile BOOLEAN,\n  logged_at DATETIME\n);',
                        description: 'Declares appropriate data types for varied business attributes.'
                    }
                ],
                keyTakeaway: 'Always use DECIMAL for financial currency and appropriate string lengths for VARCHAR.',
                exampleQuery: 'CREATE TABLE product_metrics ( product_id INT, weight_kg DECIMAL(6,2), is_fragile BOOLEAN, logged_at DATETIME );',
                exampleQueryExplanation: 'Creates a multi-type metrics table.',
                liveDemoSql: 'SELECT product_id, price FROM products LIMIT 3;',
                liveDemoNotes: 'Displays DECIMAL price columns.',
                mcqs: [
                    {
                        question: 'Why should monetary prices always use DECIMAL(10,2) instead of FLOAT?',
                        options: [
                            'A. Because FLOAT is deprecated',
                            'B. Because FLOAT uses binary approximations that cause floating-point rounding errors on money calculations',
                            'C. Because DECIMAL only works on positive numbers',
                            'D. Because FLOAT cannot store decimals'
                        ],
                        correctIndex: 1,
                        explanation: 'DECIMAL stores exact fixed-point numbers, preventing floating-point rounding inaccuracies.'
                    }
                ],
                masteryPoints: [
                    'Select appropriate data types',
                    'Understand DECIMAL precision and MySQL BOOLEAN/TINYINT(1)'
                ]
            },
            tasks: [
                {
                    id: 'day20-c2-t1',
                    title: 'Task 1: Create Product Metrics Table',
                    description: 'Create `product_metrics` with `product_id INT`, `weight_kg DECIMAL(6,2)`, `is_fragile BOOLEAN`, and `logged_at DATETIME`.',
                    instructions: [
                        'Write `CREATE TABLE product_metrics (product_id INT, weight_kg DECIMAL(6,2), is_fragile BOOLEAN, logged_at DATETIME);`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'product_metrics',
                    initialSql: '-- Create product_metrics table\n',
                    solutionSql: 'CREATE TABLE product_metrics (product_id INT, weight_kg DECIMAL(6,2), is_fragile BOOLEAN, logged_at DATETIME);',
                    solutionExplanation: 'Creates product_metrics schema with precision decimals and booleans.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `CREATE TABLE product_metrics (product_id INT, weight_kg DECIMAL(6,2), is_fragile BOOLEAN, logged_at DATETIME);`'
                        }
                    ],
                    validation: {
                        targetTable: 'product_metrics',
                        expectedRowCount: 1
                    },
                    successMessage: 'Product metrics table created!'
                },
                {
                    id: 'day20-c2-t2',
                    title: 'Task 2: Create Customer Preferences Table',
                    description: 'Create `customer_preferences` with `customer_id INT`, `newsletter_subscribed BOOLEAN`, and `monthly_budget DECIMAL(10,2)`.',
                    instructions: [
                        'Create table `customer_preferences`.',
                        'Include `customer_id INT`, `newsletter_subscribed BOOLEAN`, `monthly_budget DECIMAL(10,2)`.'
                    ],
                    type: 'independent',
                    primaryTable: 'customer_preferences',
                    initialSql: '-- Customer preferences table\n',
                    solutionSql: 'CREATE TABLE customer_preferences (customer_id INT, newsletter_subscribed BOOLEAN, monthly_budget DECIMAL(10,2));',
                    solutionExplanation: 'Defines preferences with boolean and currency decimal types.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `CREATE TABLE customer_preferences (customer_id INT, newsletter_subscribed BOOLEAN, monthly_budget DECIMAL(10,2));`'
                        }
                    ],
                    validation: {
                        targetTable: 'customer_preferences',
                        expectedRowCount: 1
                    },
                    successMessage: 'Well done! Data types declared accurately.'
                }
            ]
        },
        // =========================================================================
        // CONCEPT 3: The PRIMARY KEY Constraint
        // =========================================================================
        {
            id: 'ddl-primary-key',
            order: 3,
            title: '3. The PRIMARY KEY Constraint',
            shortDescription: 'Uniquely identify every row and configure AUTO_INCREMENT.',
            theory: {
                summary: 'A `PRIMARY KEY` uniquely identifies each record in a table. It cannot contain NULL values, cannot have duplicates, and creates an automatic clustered index.',
                introTable: {
                    tableName: 'categories_new',
                    description: 'Primary key identity demo',
                    columns: [
                        'category_id (PK)',
                        'name'
                    ],
                    rows: [
                        [
                            1,
                            'Electronics'
                        ],
                        [
                            2,
                            'Kitchen & Dining'
                        ],
                        [
                            3,
                            'Office Supplies'
                        ]
                    ]
                },
                explanation: [
                    '### 1. PRIMARY KEY & AUTO_INCREMENT',
                    '```sql\nCREATE TABLE categories_new (\n  category_id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(100)\n);\n```',
                    'When you insert a row without specifying `category_id`, the database automatically generates the next sequential integer (1, 2, 3, 4...).'
                ],
                targetQuery: {
                    sql: 'CREATE TABLE categories_new (\n  category_id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(100)\n);',
                    explanation: 'Establish unique row identity and automatic sequential numbering with AUTO_INCREMENT PRIMARY KEY.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: Primary Key Declaration',
                        sqlSnippet: 'CREATE TABLE categories_new (\n  category_id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(100)\n);',
                        explanation: 'Declares category_id as the unique row identifier.',
                        tableData: {
                            tableName: 'Primary Key Table',
                            columns: [
                                'Column',
                                'Constraint'
                            ],
                            rows: [
                                [
                                    'category_id',
                                    'PRIMARY KEY AUTO_INCREMENT'
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'PRIMARY KEY syntax',
                        sql: 'CREATE TABLE table_name (\n  id INT AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(100)\n);',
                        description: 'Defines auto-increment primary key.'
                    }
                ],
                keyTakeaway: 'A PRIMARY KEY guarantees uniqueness and provides a permanent identity for each record.',
                exampleQuery: 'CREATE TABLE categories_new ( category_id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100) );',
                exampleQueryExplanation: 'Creates category table with auto-incrementing primary key.',
                liveDemoSql: 'SELECT customer_id, name FROM customers LIMIT 3;',
                liveDemoNotes: 'Displays customer primary key IDs.',
                mcqs: [
                    {
                        question: 'Can a PRIMARY KEY column contain NULL values?',
                        options: [
                            'A. Yes, at most one NULL',
                            'B. No, PRIMARY KEY columns are implicitly NOT NULL and strictly unique',
                            'C. Yes, if AUTO_INCREMENT is off',
                            'D. Only in SQLite'
                        ],
                        correctIndex: 1,
                        explanation: 'Primary keys strictly disallow NULL values and require unique scalar entries for every row.'
                    }
                ],
                masteryPoints: [
                    'Declare PRIMARY KEY with AUTO_INCREMENT'
                ]
            },
            tasks: [
                {
                    id: 'day20-c3-t1',
                    title: 'Task 1: Create Categories Table with Primary Key',
                    description: 'Create a table named `categories_new` with `category_id INT AUTO_INCREMENT PRIMARY KEY` and `name VARCHAR(100)`.',
                    instructions: [
                        'Write `CREATE TABLE categories_new (category_id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100));`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'categories_new',
                    initialSql: '-- Categories with PK\n',
                    solutionSql: 'CREATE TABLE categories_new (category_id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100));',
                    solutionExplanation: 'Creates table with auto-incrementing primary key.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `CREATE TABLE categories_new (category_id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(100));`'
                        }
                    ],
                    validation: {
                        targetTable: 'categories_new',
                        expectedRowCount: 1
                    },
                    successMessage: 'Categories table created with Primary Key!'
                },
                {
                    id: 'day20-c3-t2',
                    title: 'Task 2: Create Departments Table with Primary Key',
                    description: 'Create `departments` with `dept_id INT AUTO_INCREMENT PRIMARY KEY` and `title VARCHAR(80)`.',
                    instructions: [
                        'Create table `departments`.',
                        'Define `dept_id INT AUTO_INCREMENT PRIMARY KEY` and `title VARCHAR(80)`.'
                    ],
                    type: 'independent',
                    primaryTable: 'departments',
                    initialSql: '-- Departments with PK\n',
                    solutionSql: 'CREATE TABLE departments (dept_id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(80));',
                    solutionExplanation: 'Allocates departments with primary key.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `CREATE TABLE departments (dept_id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(80));`'
                        }
                    ],
                    validation: {
                        targetTable: 'departments',
                        expectedRowCount: 1
                    },
                    successMessage: 'Perfect! Primary key constraint configured.'
                }
            ]
        },
        // =========================================================================
        // CONCEPT 4: Mandatory Columns with NOT NULL
        // =========================================================================
        {
            id: 'ddl-not-null',
            order: 4,
            title: '4. Mandatory Columns with NOT NULL',
            shortDescription: 'Prevent missing values and enforce required business fields.',
            theory: {
                summary: 'The `NOT NULL` constraint enforces that a column must have a value on every INSERT or UPDATE. Attempting to insert a NULL value triggers a constraint violation error.',
                introTable: {
                    tableName: 'employees (schema)',
                    description: 'Employees with mandatory name and salary',
                    columns: [
                        'emp_id (PK)',
                        'full_name (NOT NULL)',
                        'salary (NOT NULL)'
                    ],
                    rows: [
                        [
                            101,
                            'Arif Chowdhury',
                            55000.00
                        ],
                        [
                            102,
                            'Nadia Islam',
                            62000.00
                        ]
                    ]
                },
                explanation: [
                    '### 1. Enforcing NOT NULL',
                    '```sql\nCREATE TABLE employees (\n  emp_id INT PRIMARY KEY,\n  full_name VARCHAR(100) NOT NULL,\n  salary DECIMAL(10,2) NOT NULL\n);\n```',
                    'Use NOT NULL for essential data (names, prices, dates) to avoid dealing with NULL handling edge-cases later in analytics.'
                ],
                targetQuery: {
                    sql: 'CREATE TABLE employees (\n  emp_id INT PRIMARY KEY,\n  full_name VARCHAR(100) NOT NULL,\n  salary DECIMAL(10,2) NOT NULL\n);',
                    explanation: 'Enforce that all employee records must contain a valid name and salary upon insertion.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: Applying NOT NULL',
                        sqlSnippet: 'CREATE TABLE employees (\n  emp_id INT PRIMARY KEY,\n  full_name VARCHAR(100) NOT NULL,\n  salary DECIMAL(10,2) NOT NULL\n);',
                        explanation: 'Guarantees that no employee record can ever be saved without a name and salary.',
                        tableData: {
                            tableName: 'NOT NULL Schema',
                            columns: [
                                'Column',
                                'Requirement'
                            ],
                            rows: [
                                [
                                    'full_name',
                                    'Mandatory (NOT NULL)'
                                ],
                                [
                                    'salary',
                                    'Mandatory (NOT NULL)'
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'NOT NULL syntax',
                        sql: 'CREATE TABLE employees (\n  emp_id INT PRIMARY KEY,\n  full_name VARCHAR(100) NOT NULL,\n  salary DECIMAL(10,2) NOT NULL\n);',
                        description: 'Enforces non-nullable column rules.'
                    }
                ],
                keyTakeaway: 'Apply NOT NULL to every column that must always hold a concrete value.',
                exampleQuery: 'CREATE TABLE employees ( emp_id INT PRIMARY KEY, full_name VARCHAR(100) NOT NULL, salary DECIMAL(10,2) NOT NULL );',
                exampleQueryExplanation: 'Creates employee table with NOT NULL constraints.',
                liveDemoSql: 'SELECT * FROM students WHERE age IS NOT NULL;',
                liveDemoNotes: 'Displays students with valid age entries.',
                mcqs: [
                    {
                        question: 'What happens when an INSERT query provides NULL for a column marked NOT NULL without a DEFAULT?',
                        options: [
                            'A. SQL inserts an empty string',
                            'B. SQL aborts the query and throws a constraint violation error',
                            'C. SQL inserts 0',
                            'D. SQL prompts the terminal for input'
                        ],
                        correctIndex: 1,
                        explanation: 'Violating a NOT NULL constraint raises a database error and rejects the insert.'
                    }
                ],
                masteryPoints: [
                    'Enforce mandatory columns using NOT NULL'
                ]
            },
            tasks: [
                {
                    id: 'day20-c4-t1',
                    title: 'Task 1: Create Employees Table with NOT NULL',
                    description: 'Create table `employees` with `emp_id INT PRIMARY KEY`, `full_name VARCHAR(100) NOT NULL`, and `salary DECIMAL(10,2) NOT NULL`.',
                    instructions: [
                        'Write `CREATE TABLE employees (emp_id INT PRIMARY KEY, full_name VARCHAR(100) NOT NULL, salary DECIMAL(10,2) NOT NULL);`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'employees',
                    initialSql: '-- Employees with NOT NULL\n',
                    solutionSql: 'CREATE TABLE employees (emp_id INT PRIMARY KEY, full_name VARCHAR(100) NOT NULL, salary DECIMAL(10,2) NOT NULL);',
                    solutionExplanation: 'Enforces NOT NULL on full_name and salary.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `CREATE TABLE employees (emp_id INT PRIMARY KEY, full_name VARCHAR(100) NOT NULL, salary DECIMAL(10,2) NOT NULL);`'
                        }
                    ],
                    validation: {
                        targetTable: 'employees',
                        expectedRowCount: 1
                    },
                    successMessage: 'Employees table created with NOT NULL constraints!'
                },
                {
                    id: 'day20-c4-t2',
                    title: 'Task 2: Create User Logins Table',
                    description: 'Create `user_logins` with `login_id INT PRIMARY KEY`, `username VARCHAR(50) NOT NULL`, and `password_hash VARCHAR(255) NOT NULL`.',
                    instructions: [
                        'Create table `user_logins`.',
                        'Include `login_id INT PRIMARY KEY`, `username VARCHAR(50) NOT NULL`, `password_hash VARCHAR(255) NOT NULL`.'
                    ],
                    type: 'independent',
                    primaryTable: 'user_logins',
                    initialSql: '-- User logins table\n',
                    solutionSql: 'CREATE TABLE user_logins (login_id INT PRIMARY KEY, username VARCHAR(50) NOT NULL, password_hash VARCHAR(255) NOT NULL);',
                    solutionExplanation: 'Enforces required credentials using NOT NULL.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `CREATE TABLE user_logins (login_id INT PRIMARY KEY, username VARCHAR(50) NOT NULL, password_hash VARCHAR(255) NOT NULL);`'
                        }
                    ],
                    validation: {
                        targetTable: 'user_logins',
                        expectedRowCount: 1
                    },
                    successMessage: 'Well done! Required fields protected with NOT NULL.'
                }
            ]
        },
        // =========================================================================
        // CONCEPT 5: Preventing Duplicates with UNIQUE
        // =========================================================================
        {
            id: 'ddl-unique',
            order: 5,
            title: '5. Preventing Duplicates with UNIQUE',
            shortDescription: 'Guarantee distinct column values across rows (emails, SKUs, usernames).',
            theory: {
                summary: 'The `UNIQUE` constraint ensures that all values in a column are distinct across all rows in the table. Unlike PRIMARY KEY, a table can have multiple UNIQUE columns.',
                introTable: {
                    tableName: 'customer_emails (schema)',
                    description: 'Enforcing unique email registration',
                    columns: [
                        'account_id (PK)',
                        'email (UNIQUE)'
                    ],
                    rows: [
                        [
                            1,
                            'rafiul@example.com'
                        ],
                        [
                            2,
                            'priya.akter@example.com'
                        ]
                    ]
                },
                explanation: [
                    '### 1. UNIQUE Syntax',
                    '```sql\nCREATE TABLE customer_emails (\n  account_id INT PRIMARY KEY,\n  email VARCHAR(150) NOT NULL UNIQUE\n);\n```',
                    'A table can only have **one** PRIMARY KEY, but can have **multiple** UNIQUE columns (e.g. `username UNIQUE`, `email UNIQUE`, `phone_number UNIQUE`).'
                ],
                targetQuery: {
                    sql: 'CREATE TABLE customer_emails (\n  account_id INT PRIMARY KEY,\n  email VARCHAR(150) NOT NULL UNIQUE\n);',
                    explanation: 'Prevent duplicate email addresses across customer registrations using a UNIQUE constraint.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: Applying UNIQUE Constraint',
                        sqlSnippet: 'CREATE TABLE customer_emails (\n  account_id INT PRIMARY KEY,\n  email VARCHAR(150) NOT NULL UNIQUE\n);',
                        explanation: 'Guarantees no duplicate emails can ever be inserted.',
                        tableData: {
                            tableName: 'UNIQUE Schema',
                            columns: [
                                'Column',
                                'Constraint'
                            ],
                            rows: [
                                [
                                    'email',
                                    'NOT NULL UNIQUE'
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'UNIQUE syntax',
                        sql: 'CREATE TABLE customer_emails (\n  account_id INT PRIMARY KEY,\n  email VARCHAR(150) NOT NULL UNIQUE\n);',
                        description: 'Enforces column uniqueness.'
                    }
                ],
                keyTakeaway: 'Use UNIQUE constraints to prevent duplicate emails, SKUs, slugs, and barcodes.',
                exampleQuery: 'CREATE TABLE customer_emails ( account_id INT PRIMARY KEY, email VARCHAR(150) NOT NULL UNIQUE );',
                exampleQueryExplanation: 'Creates customer emails table with UNIQUE constraint.',
                liveDemoSql: 'SELECT customer_id, email FROM customers WHERE email IS NOT NULL LIMIT 3;',
                liveDemoNotes: 'Displays distinct customer email addresses.',
                mcqs: [
                    {
                        question: 'How many UNIQUE constraints can a single table contain?',
                        options: [
                            'A. Exactly one',
                            'B. As many as needed across different columns',
                            'C. None if a PRIMARY KEY exists',
                            'D. Maximum 2'
                        ],
                        correctIndex: 1,
                        explanation: 'A table can have multiple UNIQUE constraints across any columns requiring distinct values.'
                    }
                ],
                masteryPoints: [
                    'Apply UNIQUE constraints to business keys'
                ]
            },
            tasks: [
                {
                    id: 'day20-c5-t1',
                    title: 'Task 1: Create Customer Emails Table with UNIQUE',
                    description: 'Create `customer_emails` with `account_id INT PRIMARY KEY` and `email VARCHAR(150) NOT NULL UNIQUE`.',
                    instructions: [
                        'Write `CREATE TABLE customer_emails (account_id INT PRIMARY KEY, email VARCHAR(150) NOT NULL UNIQUE);`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'customer_emails',
                    initialSql: '-- Customer emails with UNIQUE\n',
                    solutionSql: 'CREATE TABLE customer_emails (account_id INT PRIMARY KEY, email VARCHAR(150) NOT NULL UNIQUE);',
                    solutionExplanation: 'Enforces email uniqueness with UNIQUE.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `CREATE TABLE customer_emails (account_id INT PRIMARY KEY, email VARCHAR(150) NOT NULL UNIQUE);`'
                        }
                    ],
                    validation: {
                        targetTable: 'customer_emails',
                        expectedRowCount: 1
                    },
                    successMessage: 'Customer emails table created with UNIQUE constraint!'
                },
                {
                    id: 'day20-c5-t2',
                    title: 'Task 2: Create Product SKUs Table with UNIQUE',
                    description: 'Create `product_skus` with `item_id INT PRIMARY KEY` and `sku_code VARCHAR(30) NOT NULL UNIQUE`.',
                    instructions: [
                        'Create table `product_skus`.',
                        'Include `item_id INT PRIMARY KEY` and `sku_code VARCHAR(30) NOT NULL UNIQUE`.'
                    ],
                    type: 'independent',
                    primaryTable: 'product_skus',
                    initialSql: '-- Product SKUs with UNIQUE\n',
                    solutionSql: 'CREATE TABLE product_skus (item_id INT PRIMARY KEY, sku_code VARCHAR(30) NOT NULL UNIQUE);',
                    solutionExplanation: 'Prevents duplicate SKU codes.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `CREATE TABLE product_skus (item_id INT PRIMARY KEY, sku_code VARCHAR(30) NOT NULL UNIQUE);`'
                        }
                    ],
                    validation: {
                        targetTable: 'product_skus',
                        expectedRowCount: 1
                    },
                    successMessage: 'Perfect! Product SKU uniqueness guaranteed.'
                }
            ]
        },
        // =========================================================================
        // CONCEPT 6: Automatic Fallback Values with DEFAULT
        // =========================================================================
        {
            id: 'ddl-default',
            order: 6,
            title: '6. Automatic Fallback Values with DEFAULT',
            shortDescription: 'Supply automatic fallback values when INSERT omits a column.',
            theory: {
                summary: 'The `DEFAULT` constraint specifies a fallback value for a column when an `INSERT` statement does not explicitly provide one.',
                introTable: {
                    tableName: 'audit_logs (schema)',
                    description: 'Logs table with automatic timestamp default',
                    columns: [
                        'log_id (PK)',
                        'action',
                        'created_at (DEFAULT CURRENT_TIMESTAMP)'
                    ],
                    rows: [
                        [
                            1,
                            'user_login',
                            '2026-08-25 15:00:00'
                        ],
                        [
                            2,
                            'item_checkout',
                            '2026-08-25 15:05:12'
                        ]
                    ]
                },
                explanation: [
                    '### 1. DEFAULT Syntax Examples',
                    '• Number default: `balance DECIMAL(10,2) DEFAULT 0.00`',
                    '• String default: `status VARCHAR(20) DEFAULT \'active\'`',
                    '• Timestamp default: `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`'
                ],
                targetQuery: {
                    sql: 'CREATE TABLE audit_logs (\n  log_id INT PRIMARY KEY,\n  action VARCHAR(100) NOT NULL,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);',
                    explanation: 'Automatically populate created_at with current server timestamp when omitted.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: Applying DEFAULT',
                        sqlSnippet: 'CREATE TABLE audit_logs (\n  log_id INT PRIMARY KEY,\n  action VARCHAR(100) NOT NULL,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);',
                        explanation: 'Automatically fills created_at with current server timestamp when omitted.',
                        tableData: {
                            tableName: 'DEFAULT Schema',
                            columns: [
                                'Column',
                                'Default Value'
                            ],
                            rows: [
                                [
                                    'created_at',
                                    'CURRENT_TIMESTAMP'
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'DEFAULT syntax',
                        sql: 'CREATE TABLE audit_logs (\n  log_id INT PRIMARY KEY,\n  action VARCHAR(100) NOT NULL,\n  created_at DATETIME DEFAULT CURRENT_TIMESTAMP\n);',
                        description: 'Configures default values for column insertions.'
                    }
                ],
                keyTakeaway: 'DEFAULT eliminates the need to manually pass timestamps or standard initial zero/active states.',
                exampleQuery: 'CREATE TABLE audit_logs ( log_id INT PRIMARY KEY, action VARCHAR(100) NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP );',
                exampleQueryExplanation: 'Creates audit logs with automatic timestamp default.',
                liveDemoSql: 'SELECT order_id, order_date, status FROM orders LIMIT 3;',
                liveDemoNotes: 'Displays orders with timestamps.',
                mcqs: [
                    {
                        question: 'What happens if you insert a row without mentioning a column that has a DEFAULT specified?',
                        options: [
                            'A. The query errors with a missing field warning',
                            'B. SQL automatically populates that column with the configured DEFAULT value',
                            'C. The column is set to NULL',
                            'D. The whole table is reset'
                        ],
                        correctIndex: 1,
                        explanation: 'When an inserted column is omitted, SQL automatically substitutes the DEFAULT value.'
                    }
                ],
                masteryPoints: [
                    'Configure DEFAULT values for timestamps, counters, and status flags'
                ]
            },
            tasks: [
                {
                    id: 'day20-c6-t1',
                    title: 'Task 1: Create Audit Logs Table with DEFAULT',
                    description: 'Create `audit_logs` with `log_id INT PRIMARY KEY`, `action VARCHAR(100) NOT NULL`, and `created_at DATETIME DEFAULT CURRENT_TIMESTAMP`.',
                    instructions: [
                        'Write `CREATE TABLE audit_logs (log_id INT PRIMARY KEY, action VARCHAR(100) NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'audit_logs',
                    initialSql: '-- Audit logs with DEFAULT\n',
                    solutionSql: 'CREATE TABLE audit_logs (log_id INT PRIMARY KEY, action VARCHAR(100) NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);',
                    solutionExplanation: 'Configures automatic CURRENT_TIMESTAMP default.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `CREATE TABLE audit_logs (log_id INT PRIMARY KEY, action VARCHAR(100) NOT NULL, created_at DATETIME DEFAULT CURRENT_TIMESTAMP);`'
                        }
                    ],
                    validation: {
                        targetTable: 'audit_logs',
                        expectedRowCount: 1
                    },
                    successMessage: 'Audit logs table created with DEFAULT timestamp!'
                },
                {
                    id: 'day20-c6-t2',
                    title: 'Task 2: Create Store Credits Table with Defaults',
                    description: 'Create `store_credits` with `account_id INT PRIMARY KEY`, `balance DECIMAL(10,2) DEFAULT 0.00`, and `status VARCHAR(20) DEFAULT \'active\'`.',
                    instructions: [
                        'Create table `store_credits`.',
                        'Define `account_id INT PRIMARY KEY`, `balance DECIMAL(10,2) DEFAULT 0.00`, `status VARCHAR(20) DEFAULT \'active\'`.'
                    ],
                    type: 'independent',
                    primaryTable: 'store_credits',
                    initialSql: '-- Store credits with defaults\n',
                    solutionSql: 'CREATE TABLE store_credits (account_id INT PRIMARY KEY, balance DECIMAL(10,2) DEFAULT 0.00, status VARCHAR(20) DEFAULT \'active\');',
                    solutionExplanation: 'Configures default financial balance and status.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `CREATE TABLE store_credits (account_id INT PRIMARY KEY, balance DECIMAL(10,2) DEFAULT 0.00, status VARCHAR(20) DEFAULT \'active\');`'
                        }
                    ],
                    validation: {
                        targetTable: 'store_credits',
                        expectedRowCount: 1
                    },
                    successMessage: 'Spot on! Default values configured cleanly.'
                }
            ]
        },
        // =========================================================================
        // CONCEPT 7: Business Rules with CHECK
        // =========================================================================
        {
            id: 'ddl-check',
            order: 7,
            title: '7. Business Rules with CHECK',
            shortDescription: 'Validate range conditions and rules directly at the database layer.',
            theory: {
                summary: 'A `CHECK` constraint validates that values inserted or updated in a column satisfy a boolean condition (e.g. `rating BETWEEN 1 AND 5`, `price >= 0`).',
                introTable: {
                    tableName: 'product_ratings (schema)',
                    description: 'Enforcing 1 to 5 star rating boundaries',
                    columns: [
                        'rating_id (PK)',
                        'score (CHECK 1..5)'
                    ],
                    rows: [
                        [
                            1,
                            5
                        ],
                        [
                            2,
                            4
                        ]
                    ]
                },
                explanation: [
                    '### 1. CHECK Constraint Syntax',
                    '```sql\nCREATE TABLE product_ratings (\n  rating_id INT PRIMARY KEY,\n  score INT NOT NULL CHECK (score BETWEEN 1 AND 5)\n);\n```',
                    'If a buggy frontend sends `score = 10` or `score = -1`, the database CHECK constraint instantly rejects the transaction and prevents corrupt data from ever entering your database.'
                ],
                targetQuery: {
                    sql: 'CREATE TABLE product_ratings (\n  rating_id INT PRIMARY KEY,\n  score INT NOT NULL CHECK (score BETWEEN 1 AND 5)\n);',
                    explanation: 'Enforce database-level validation rules with CHECK to ensure ratings stay between 1 and 5.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: Applying CHECK Constraint',
                        sqlSnippet: 'CREATE TABLE product_ratings (\n  rating_id INT PRIMARY KEY,\n  score INT NOT NULL CHECK (score BETWEEN 1 AND 5)\n);',
                        explanation: 'Guarantees ratings strictly stay between 1 and 5.',
                        tableData: {
                            tableName: 'CHECK Schema',
                            columns: [
                                'Column',
                                'Rule'
                            ],
                            rows: [
                                [
                                    'score',
                                    'CHECK (score BETWEEN 1 AND 5)'
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'CHECK syntax',
                        sql: 'CREATE TABLE product_ratings (\n  rating_id INT PRIMARY KEY,\n  score INT NOT NULL CHECK (score BETWEEN 1 AND 5)\n);',
                        description: 'Enforces validation rule.'
                    }
                ],
                keyTakeaway: 'Use CHECK constraints to guard business limits (positive prices, percentage ranges, rating bounds).',
                exampleQuery: 'CREATE TABLE product_ratings ( rating_id INT PRIMARY KEY, score INT NOT NULL CHECK (score BETWEEN 1 AND 5) );',
                exampleQueryExplanation: 'Creates ratings table with boundary check.',
                liveDemoSql: 'SELECT product_id, price FROM products WHERE price > 0 LIMIT 3;',
                liveDemoNotes: 'Displays valid product prices.',
                mcqs: [
                    {
                        question: 'What happens if an application tries to insert rating = 6 into a column with `CHECK (rating BETWEEN 1 AND 5)`?',
                        options: [
                            'A. The database rounds it down to 5',
                            'B. The database rejects the query with a CHECK constraint violation error',
                            'C. It inserts NULL',
                            'D. It logs a warning but allows the insert'
                        ],
                        correctIndex: 1,
                        explanation: 'CHECK constraints strictly reject invalid data by throwing a violation error.'
                    }
                ],
                masteryPoints: [
                    'Write CHECK constraints for boundary and range validation'
                ]
            },
            tasks: [
                {
                    id: 'day20-c7-t1',
                    title: 'Task 1: Create Product Ratings Table with CHECK',
                    description: 'Create `product_ratings` with `rating_id INT PRIMARY KEY` and `score INT NOT NULL CHECK (score BETWEEN 1 AND 5)`.',
                    instructions: [
                        'Write `CREATE TABLE product_ratings (rating_id INT PRIMARY KEY, score INT NOT NULL CHECK (score BETWEEN 1 AND 5));`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'product_ratings',
                    initialSql: '-- Ratings with CHECK\n',
                    solutionSql: 'CREATE TABLE product_ratings (rating_id INT PRIMARY KEY, score INT NOT NULL CHECK (score BETWEEN 1 AND 5));',
                    solutionExplanation: 'Enforces valid 1-5 rating range with CHECK.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `CREATE TABLE product_ratings (rating_id INT PRIMARY KEY, score INT NOT NULL CHECK (score BETWEEN 1 AND 5));`'
                        }
                    ],
                    validation: {
                        targetTable: 'product_ratings',
                        expectedRowCount: 1
                    },
                    successMessage: 'Product ratings table created with CHECK constraint!'
                },
                {
                    id: 'day20-c7-t2',
                    title: 'Task 2: Create Employee Bonuses Table with CHECK',
                    description: 'Create `employee_bonuses` with `bonus_id INT PRIMARY KEY` and `percentage DECIMAL(4,2) CHECK (percentage >= 0.00 AND percentage <= 1.00)`.',
                    instructions: [
                        'Create table `employee_bonuses`.',
                        'Define `bonus_id INT PRIMARY KEY` and `percentage DECIMAL(4,2) CHECK (percentage >= 0.00 AND percentage <= 1.00)`.'
                    ],
                    type: 'independent',
                    primaryTable: 'employee_bonuses',
                    initialSql: '-- Employee bonuses with CHECK\n',
                    solutionSql: 'CREATE TABLE employee_bonuses (bonus_id INT PRIMARY KEY, percentage DECIMAL(4,2) CHECK (percentage >= 0.00 AND percentage <= 1.00));',
                    solutionExplanation: 'Enforces bonus percentage between 0% and 100%.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `CREATE TABLE employee_bonuses (bonus_id INT PRIMARY KEY, percentage DECIMAL(4,2) CHECK (percentage >= 0.00 AND percentage <= 1.00));`'
                        }
                    ],
                    validation: {
                        targetTable: 'employee_bonuses',
                        expectedRowCount: 1
                    },
                    successMessage: 'Spot on! CHECK rule protects percentage boundaries.'
                }
            ]
        },
        // =========================================================================
        // CONCEPT 8: Modifying Existing Tables with ALTER TABLE ... ADD
        // =========================================================================
        {
            id: 'ddl-alter-table-add',
            order: 8,
            title: '8. Modifying Existing Tables with ALTER TABLE ... ADD',
            shortDescription: 'Add new columns to live tables without dropping existing data.',
            theory: {
                summary: 'As application requirements grow, you can add new columns to existing live tables using `ALTER TABLE table_name ADD COLUMN column_name data_type;`.',
                introTable: {
                    tableName: 'products (adding is_featured)',
                    description: 'Altering live products schema',
                    columns: [
                        'product_id',
                        'name',
                        'price',
                        '+ is_featured (NEW)'
                    ],
                    rows: [
                        [
                            1,
                            'Wireless Mouse',
                            15.99,
                            'FALSE (default)'
                        ],
                        [
                            2,
                            'Bluetooth Speaker',
                            45.50,
                            'FALSE (default)'
                        ]
                    ]
                },
                explanation: [
                    '### 1. ALTER TABLE ADD Syntax',
                    '```sql\nALTER TABLE products\nADD COLUMN is_featured BOOLEAN DEFAULT FALSE;\n```',
                    'ALTER TABLE preserves all existing rows in the table, populating the new column with NULL (or the specified DEFAULT value).'
                ],
                targetQuery: {
                    sql: 'ALTER TABLE products\nADD COLUMN is_featured BOOLEAN DEFAULT FALSE;',
                    explanation: 'Safely evolve existing tables by appending new columns without deleting production rows.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: Adding Column to Existing Table',
                        sqlSnippet: 'ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;',
                        explanation: 'Appends is_featured to products without losing any existing catalog items.',
                        tableData: {
                            tableName: 'Altered Schema',
                            columns: [
                                'Existing Columns',
                                'New Column Added'
                            ],
                            rows: [
                                [
                                    'product_id, name, price...',
                                    'is_featured (BOOLEAN DEFAULT FALSE)'
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'ALTER TABLE ADD syntax',
                        sql: 'ALTER TABLE table_name\nADD COLUMN column_name datatype constraint;',
                        description: 'Appends a new column to an existing table.'
                    }
                ],
                keyTakeaway: 'ALTER TABLE allows schema evolution without destroying existing production data.',
                exampleQuery: 'ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;',
                exampleQueryExplanation: 'Adds a featured flag column to products.',
                liveDemoSql: 'SELECT * FROM products LIMIT 2;',
                liveDemoNotes: 'Displays existing products schema.',
                mcqs: [
                    {
                        question: 'What happens to existing records when you execute `ALTER TABLE ... ADD COLUMN`?',
                        options: [
                            'A. All existing rows are deleted',
                            'B. All existing rows are preserved, and the new column is filled with NULL or the column DEFAULT',
                            'C. The database duplicates the table',
                            'D. It fails if the table has data'
                        ],
                        correctIndex: 1,
                        explanation: 'ALTER TABLE preserves existing records, populating new attributes with NULL or default values.'
                    }
                ],
                masteryPoints: [
                    'Evolve schemas safely using ALTER TABLE ADD COLUMN'
                ]
            },
            tasks: [
                {
                    id: 'day20-c8-t1',
                    title: 'Task 1: Add Featured Flag to Products',
                    description: 'Add a new column `is_featured BOOLEAN DEFAULT FALSE` to the `products` table using ALTER TABLE.',
                    instructions: [
                        'Write `ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'products',
                    initialSql: '-- Add is_featured column\n',
                    solutionSql: 'ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;',
                    solutionExplanation: 'Appends is_featured to products.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `ALTER TABLE products ADD COLUMN is_featured BOOLEAN DEFAULT FALSE;`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        expectedRowCount: 1
                    },
                    successMessage: 'New column added to products safely!'
                },
                {
                    id: 'day20-c8-t2',
                    title: 'Task 2: Add Phone Number to Customers',
                    description: 'Add a new column `phone_number VARCHAR(20)` to the `customers` table.',
                    instructions: [
                        'Alter table `customers`.',
                        'Add column `phone_number VARCHAR(20)`.'
                    ],
                    type: 'independent',
                    primaryTable: 'customers',
                    initialSql: '-- Add phone_number to customers\n',
                    solutionSql: 'ALTER TABLE customers ADD COLUMN phone_number VARCHAR(20);',
                    solutionExplanation: 'Adds phone_number column to customers.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `ALTER TABLE customers ADD COLUMN phone_number VARCHAR(20);`'
                        }
                    ],
                    validation: {
                        targetTable: 'customers',
                        expectedRowCount: 1
                    },
                    successMessage: 'Spot on! Customer schema extended with phone_number.'
                }
            ]
        },
        // =========================================================================
        // CONCEPT 9: Connecting Tables with ALTER TABLE ... ADD FOREIGN KEY
        // =========================================================================
        {
            id: 'ddl-foreign-key',
            order: 9,
            title: '9. Connecting Tables with FOREIGN KEY Constraints',
            shortDescription: 'Enforce relational integrity between child and parent tables.',
            theory: {
                summary: 'A `FOREIGN KEY` links a column in a child table to the `PRIMARY KEY` of a parent table, guaranteeing that orphaned records cannot be created.',
                introTable: {
                    tableName: 'orders -> customers link',
                    description: 'Relating orders to customers via foreign key',
                    columns: [
                        'Child Table Column (FK)',
                        'Parent Table Reference (PK)'
                    ],
                    rows: [
                        [
                            'orders.customer_id',
                            'customers.customer_id'
                        ]
                    ]
                },
                explanation: [
                    '### 1. Adding Foreign Key Constraints',
                    '```sql\nALTER TABLE orders\nADD CONSTRAINT fk_orders_customer\nFOREIGN KEY (customer_id) REFERENCES customers(customer_id);\n```',
                    'Once this constraint is active, SQL will prevent anyone from inserting an order with a non-existent `customer_id` (e.g. customer 9999).'
                ],
                targetQuery: {
                    sql: 'ALTER TABLE orders\nADD CONSTRAINT fk_orders_customer\nFOREIGN KEY (customer_id) REFERENCES customers(customer_id);',
                    explanation: 'Establish referential integrity between orders and customers to prevent orphaned records.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: Applying Foreign Key',
                        sqlSnippet: 'ALTER TABLE orders ADD CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id);',
                        explanation: 'Enforces that all order customer_id values must exist in the customers table.',
                        tableData: {
                            tableName: 'Constraint Definition',
                            columns: [
                                'Constraint Name',
                                'FK Column',
                                'Target PK'
                            ],
                            rows: [
                                [
                                    'fk_orders_customer',
                                    'customer_id',
                                    'customers(customer_id)'
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'ADD FOREIGN KEY syntax',
                        sql: 'ALTER TABLE child_table\nADD CONSTRAINT fk_name\nFOREIGN KEY (child_column) REFERENCES parent_table(parent_column);',
                        description: 'Enforces relational referential integrity.'
                    }
                ],
                keyTakeaway: 'Foreign keys protect relational integrity, preventing orphan or invalid records.',
                exampleQuery: 'ALTER TABLE orders ADD CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id);',
                exampleQueryExplanation: 'Establishes foreign key constraint between orders and customers.',
                liveDemoSql: 'SELECT order_id, customer_id FROM orders LIMIT 3;',
                liveDemoNotes: 'Displays orders with parent customer IDs.',
                mcqs: [
                    {
                        question: 'What happens if you try to insert an order with customer_id = 999 when no customer 999 exists and a FOREIGN KEY is enabled?',
                        options: [
                            'A. The database creates a placeholder customer 999',
                            'B. The insert is rejected with a foreign key constraint violation error',
                            'C. The order is inserted with customer_id = NULL',
                            'D. The database prompts for customer info'
                        ],
                        correctIndex: 1,
                        explanation: 'Foreign keys guarantee referential integrity and strictly reject non-existent parent references.'
                    }
                ],
                masteryPoints: [
                    'Establish relational integrity with FOREIGN KEY constraints'
                ]
            },
            tasks: [
                {
                    id: 'day20-c9-t1',
                    title: 'Task 1: Add Foreign Key from Orders to Customers',
                    description: 'Add a foreign key constraint named `fk_orders_customer` on `orders(customer_id)` referencing `customers(customer_id)`.',
                    instructions: [
                        'Write `ALTER TABLE orders ADD CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id);`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'orders',
                    secondaryTables: [
                        'customers'
                    ],
                    initialSql: '-- Add foreign key constraint\n',
                    solutionSql: 'ALTER TABLE orders ADD CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id);',
                    solutionExplanation: 'Enforces foreign key link to customers.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `ALTER TABLE orders ADD CONSTRAINT fk_orders_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id);`'
                        }
                    ],
                    validation: {
                        targetTable: 'orders',
                        expectedRowCount: 1
                    },
                    successMessage: 'Foreign key constraint established successfully!'
                },
                {
                    id: 'day20-c9-t2',
                    title: 'Task 2: Add Foreign Key from Order Items to Products',
                    description: 'Add a foreign key constraint named `fk_items_product` on `order_items(product_id)` referencing `products(product_id)`.',
                    instructions: [
                        'Alter table `order_items`.',
                        'Add constraint `fk_items_product` foreign key `(product_id)` references `products(product_id)`.'
                    ],
                    type: 'independent',
                    primaryTable: 'order_items',
                    secondaryTables: [
                        'products'
                    ],
                    initialSql: '-- Add FK on order_items\n',
                    solutionSql: 'ALTER TABLE order_items ADD CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products(product_id);',
                    solutionExplanation: 'Links order_items to products.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `ALTER TABLE order_items ADD CONSTRAINT fk_items_product FOREIGN KEY (product_id) REFERENCES products(product_id);`'
                        }
                    ],
                    validation: {
                        targetTable: 'order_items',
                        expectedRowCount: 1
                    },
                    successMessage: 'Perfect! Relational integrity enforced on order_items.'
                }
            ]
        },
        // =========================================================================
        // CONCEPT 10: Removing Tables with DROP TABLE IF EXISTS
        // =========================================================================
        {
            id: 'ddl-drop-table',
            order: 10,
            title: '10. Removing Tables with DROP TABLE IF EXISTS',
            shortDescription: 'Permanently remove schemas and use IF EXISTS to prevent runtime errors.',
            theory: {
                summary: '`DROP TABLE table_name;` permanently destroys a table and all data inside it. Using `DROP TABLE IF EXISTS` avoids fatal errors if the table does not exist in migration scripts.',
                introTable: {
                    tableName: 'Database Schema Cleanup',
                    description: 'Dropping temporary staging entities',
                    columns: [
                        'Command',
                        'Behavior'
                    ],
                    rows: [
                        [
                            'DROP TABLE table_name;',
                            'Fails with an error if table does not exist'
                        ],
                        [
                            'DROP TABLE IF EXISTS table_name;',
                            'Succeeds safely whether table exists or not'
                        ]
                    ]
                },
                explanation: [
                    '### 1. The Safe DROP TABLE Pattern',
                    '```sql\nDROP TABLE IF EXISTS temp_order_staging;\n```',
                    'Unlike deleting rows inside a transaction, dropping a table is a DDL operation that cannot typically be undone with a simple ROLLBACK. Use with care in production!'
                ],
                targetQuery: {
                    sql: 'DROP TABLE IF EXISTS temp_order_staging;',
                    explanation: 'Permanently tear down temporary staging schemas safely without crashing if they are already dropped.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: Dropping Table Safely',
                        sqlSnippet: 'DROP TABLE IF EXISTS temp_order_staging;',
                        explanation: 'Permanently tears down table schema without throwing errors if already absent.',
                        tableData: {
                            tableName: 'Drop Status',
                            columns: [
                                'Target Table',
                                'Result'
                            ],
                            rows: [
                                [
                                    'temp_order_staging',
                                    'Destroyed cleanly'
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'DROP TABLE syntax',
                        sql: 'DROP TABLE IF EXISTS table_name;',
                        description: 'Safely removes a table from the database.'
                    }
                ],
                keyTakeaway: 'Always use IF EXISTS with DROP TABLE in reproducible migration and reset scripts.',
                exampleQuery: 'DROP TABLE IF EXISTS temp_order_staging;',
                exampleQueryExplanation: 'Safely drops staging table.',
                liveDemoSql: 'SELECT table_name FROM information_schema.tables WHERE table_schema = \'public\' LIMIT 2;',
                liveDemoNotes: 'Displays database tables.',
                mcqs: [
                    {
                        question: 'Why is `DROP TABLE IF EXISTS` preferred over plain `DROP TABLE` in migration scripts?',
                        options: [
                            'A. It executes twice as fast',
                            'B. It prevents the entire migration script from crashing with an error if the table was already dropped or does not exist',
                            'C. It backs up the data first',
                            'D. It only drops empty tables'
                        ],
                        correctIndex: 1,
                        explanation: '`IF EXISTS` suppresses missing-table errors, allowing scripts to run idempotently.'
                    }
                ],
                masteryPoints: [
                    'Safely tear down tables using DROP TABLE IF EXISTS'
                ]
            },
            tasks: [
                {
                    id: 'day20-c10-t1',
                    title: 'Task 1: Drop Staging Table Safely',
                    description: 'Safely drop the table named `temp_order_staging` if it exists.',
                    instructions: [
                        'Write `DROP TABLE IF EXISTS temp_order_staging;`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'temp_order_staging',
                    initialSql: '-- Drop staging table\n',
                    solutionSql: 'DROP TABLE IF EXISTS temp_order_staging;',
                    solutionExplanation: 'Safely destroys temp_order_staging schema.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `DROP TABLE IF EXISTS temp_order_staging;`'
                        }
                    ],
                    validation: {
                        targetTable: 'temp_order_staging',
                        expectedRowCount: 1
                    },
                    successMessage: 'Staging table safely dropped!'
                },
                {
                    id: 'day20-c10-t2',
                    title: 'Task 2: Drop Legacy Grades Table',
                    description: 'Safely drop the table named `legacy_student_grades` if it exists.',
                    instructions: [
                        'Drop table `legacy_student_grades` if it exists.'
                    ],
                    type: 'independent',
                    primaryTable: 'legacy_student_grades',
                    initialSql: '-- Drop legacy grades table\n',
                    solutionSql: 'DROP TABLE IF EXISTS legacy_student_grades;',
                    solutionExplanation: 'Safely drops legacy_student_grades.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `DROP TABLE IF EXISTS legacy_student_grades;`'
                        }
                    ],
                    validation: {
                        targetTable: 'legacy_student_grades',
                        expectedRowCount: 1
                    },
                    successMessage: 'Spot on! Legacy table destroyed cleanly.'
                }
            ]
        }
    ],
    // ===========================================================================
    // DAY 20 CHALLENGE (MASTER CURRICULUM ASSIGNMENT)
    // ===========================================================================
    challenge: {
        id: 'day-20-homework',
        title: 'Day 20 — DDL Operations (Homework)',
        scenario: 'Design and query the reviews table schema:',
        tasks: [
            {
                id: 'day20-hw-1',
                title: 'Task 1: Create a reviews table',
                description: 'Create a reviews table: review_id (PK, auto-increment), product_id (FK → products), customer_id (FK → customers), rating (1–5), comment (TEXT), created_at (DEFAULT CURRENT_TIMESTAMP).',
                instructions: [
                    'Write `CREATE TABLE reviews ( review_id INT AUTO_INCREMENT PRIMARY KEY, product_id INT NOT NULL, customer_id INT NOT NULL, rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5), comment TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP );`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'reviews',
                initialSql: '-- Task 1: Create the reviews table\n',
                solutionSql: 'CREATE TABLE reviews ( review_id INT AUTO_INCREMENT PRIMARY KEY, product_id INT NOT NULL, customer_id INT NOT NULL, rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5), comment TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP );',
                solutionExplanation: 'Creates the new reviews entity table with complete constraints.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `CREATE TABLE reviews ( review_id INT AUTO_INCREMENT PRIMARY KEY, product_id INT NOT NULL, customer_id INT NOT NULL, rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5), comment TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP );`'
                    }
                ],
                validation: {
                    targetTable: 'reviews',
                    expectedRowCount: 1
                },
                successMessage: 'Task 1 completed! Reviews table schema defined.'
            },
            {
                id: 'day20-hw-2',
                title: 'Task 2: Query average rating per product joining reviews and products',
                description: 'Query the average rating and review count per product joining reviews and products.',
                instructions: [
                    'Select `p.product_id`, `p.name`, `AVG(r.rating) AS avg_rating`, `COUNT(r.review_id) AS total_reviews` from `products p` JOIN `reviews r` ON `p.product_id = r.product_id` GROUP BY `p.product_id`, `p.name`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'products',
                secondaryTables: [
                    'reviews'
                ],
                initialSql: '-- Task 2: Average rating per product\n',
                solutionSql: 'SELECT p.product_id, p.name, AVG(r.rating) AS avg_rating, COUNT(r.review_id) AS total_reviews FROM products p JOIN reviews r ON p.product_id = r.product_id GROUP BY p.product_id, p.name;',
                solutionExplanation: 'Joins products to reviews to calculate rating metrics.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `JOIN reviews r ON p.product_id = r.product_id GROUP BY p.product_id, p.name;`'
                    }
                ],
                validation: {
                    targetTable: 'products',
                    requireJoin: true,
                    requireGroupBy: true,
                    expectedRowCount: 12
                },
                successMessage: 'Task 2 completed! Product ratings aggregated.'
            }
        ]
    }
};
const DAY_21_MODULE = {
    id: 'day-21',
    slug: 'indexing-transactions-real-world',
    day: 21,
    title: 'Day 21 — Visual Concept Lab: Performance, Indexing & Safety',
    shortTitle: 'Performance, Indexing & Safety',
    type: 'conceptual_session',
    milestoneId: 'milestone-3',
    description: 'Understand B-tree indexing mechanics, read EXPLAIN query plans, master ACID transaction guarantees, and understand how single relational queries prevent N+1 performance bottlenecks.',
    estimatedMinutes: 60,
    completionLearnings: [
        'Understand how B-Tree indexes speed up lookups (index scan vs full table scan)',
        'Interpret EXPLAIN query plans (type: ALL vs type: ref/const)',
        'Explain the ACID transaction model for operational database integrity',
        'Recognize application pitfalls such as the N+1 query problem and solve them with relational queries'
    ],
    concepts: [
        {
            id: 'indexes-acid-and-explain',
            order: 1,
            title: '1. B-Trees, EXPLAIN & Operational Query Efficiency',
            shortDescription: 'Performance optimization and query safety.',
            theory: {
                summary: 'An index is a B-tree data structure that allows the database to find rows in logarithmic time rather than scanning every row sequentially. Using `EXPLAIN` reveals whether a query performs a fast index lookup (`type: const` / `ref`) or an expensive full table scan (`type: ALL`).',
                introTable: {
                    tableName: 'products (Indexed on price)',
                    description: 'B-Tree index structure visualization',
                    columns: [
                        'B-Tree Key (price)',
                        'Row Pointer',
                        'product_name'
                    ],
                    rows: [
                        [
                            '$4.99',
                            'Row 28',
                            'Miscellaneous Clearance Item'
                        ],
                        [
                            '$15.99',
                            'Row 1',
                            'Wireless Mouse'
                        ],
                        [
                            '$65.00',
                            'Row 4',
                            'Mechanical Keyboard'
                        ],
                        [
                            '$120.00',
                            'Row 14',
                            'Office Chair'
                        ]
                    ]
                },
                explanation: [
                    '### 1. B-Tree Index Analogy',
                    'Think of the index at the back of a textbook: instead of reading all 500 pages (Table Scan), you look up "PostgreSQL" on page 501 and jump directly to page 142.',
                    '### 2. ACID Properties',
                    '• **Atomicity**: All operations in a transaction succeed, or all are completely rolled back.',
                    '• **Consistency**: Database transitions only between valid constraint states.',
                    '• **Isolation**: Concurrent transactions do not corrupt or interfere with each other.',
                    '• **Durability**: Committed transactions are permanently saved and survive system reboots.',
                    '### 3. Application Efficiency (N+1 Problem vs Single Relational Query)',
                    '• **Approach A (Loop of queries)**: 1 query to get 50 orders, plus 50 separate round-trip queries to get line items (51 network requests).',
                    '• **Approach B (Single SQL JOIN)**: 1 well-designed relational query fetching all data in a single network round trip.',
                    'Reducing unnecessary database round trips can significantly improve performance across production backend applications.'
                ],
                targetQuery: {
                    sql: 'EXPLAIN SELECT * FROM products WHERE price > 50;',
                    explanation: 'Inspect query execution plans to identify whether SQL utilizes fast B-tree index scans or slow full table scans.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: Inspecting Query Plan with EXPLAIN',
                        sqlSnippet: 'EXPLAIN SELECT * FROM products WHERE price > 50;',
                        explanation: 'Shows execution cost, estimated rows scanned, and index usage.',
                        tableData: {
                            tableName: 'EXPLAIN Execution Plan Output',
                            columns: [
                                'id',
                                'select_type',
                                'table',
                                'type',
                                'rows',
                                'Extra'
                            ],
                            highlightedColumns: [
                                'type',
                                'rows'
                            ],
                            rows: [
                                [
                                    1,
                                    'SIMPLE',
                                    'products',
                                    'ALL',
                                    28,
                                    'Using where'
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'Query plan inspection and indexing',
                        sql: '-- Inspect query execution plan\nEXPLAIN SELECT * FROM products WHERE price > 50;\n\n-- Create index on frequently filtered column\nCREATE INDEX idx_products_price ON products(price);',
                        description: 'EXPLAIN output inspection and index creation.'
                    }
                ],
                keyTakeaway: 'Indexes convert slow table scans into fast logarithmic lookups; EXPLAIN reveals how the database executes your SQL.',
                exampleQuery: 'EXPLAIN SELECT * FROM products WHERE supplier_id = 1;',
                exampleQueryExplanation: 'Inspects execution plan for supplier_id lookup.',
                liveDemoSql: 'EXPLAIN SELECT * FROM products WHERE supplier_id = 1;',
                liveDemoNotes: 'Displays query execution plan.',
                mcqs: [
                    {
                        question: 'In database EXPLAIN output, what does `type: ALL` indicate?',
                        options: [
                            'A. All indexes were utilized',
                            'B. A full table scan occurred, sequentially checking every row in the table',
                            'C. The query ran in 0 milliseconds',
                            'D. All columns were indexed'
                        ],
                        correctIndex: 1,
                        explanation: '`type: ALL` signifies a full table scan without index acceleration.'
                    }
                ],
                masteryPoints: [
                    'Read EXPLAIN plans',
                    'Explain ACID transaction properties',
                    'Identify N+1 query patterns and solve them with JOINs'
                ]
            },
            tasks: [
                {
                    id: 'day21-c1-t1',
                    title: 'Task 1 (Guided): Inspect Query Execution with EXPLAIN',
                    description: 'Run EXPLAIN on a filtered query on the `products` table.',
                    instructions: [
                        'Run `EXPLAIN SELECT * FROM products WHERE price > 50;`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'products',
                    initialSql: '-- Task 1: Inspect query execution plan\nEXPLAIN SELECT * FROM products WHERE price > 50;\n',
                    solutionSql: 'EXPLAIN SELECT * FROM products WHERE price > 50;',
                    solutionExplanation: 'Inspects the query execution plan for a price filter.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `EXPLAIN SELECT * FROM products WHERE price > 50;`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        expectedRowCount: 1
                    },
                    successMessage: 'Task 1 completed! EXPLAIN plan analyzed.'
                },
                {
                    id: 'day21-c1-t2',
                    title: 'Task 2 (Independent): Supplier Lookup Plan Inspection',
                    description: 'Inspect the query execution plan for finding products from supplier_id = 2.',
                    instructions: [
                        'Run `EXPLAIN SELECT * FROM products WHERE supplier_id = 2;`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'independent',
                    primaryTable: 'products',
                    initialSql: '-- Inspect supplier filter execution plan\n',
                    solutionSql: 'EXPLAIN SELECT * FROM products WHERE supplier_id = 2;',
                    solutionExplanation: 'Generates execution plan for supplier_id lookup.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `EXPLAIN SELECT * FROM products WHERE supplier_id = 2;`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        expectedRowCount: 1
                    },
                    successMessage: 'Task 2 completed! Execution plan generated.'
                }
            ]
        }
    ],
    // ===========================================================================
    // DAY 21 CHALLENGE: PERFORMANCE & INDEXING LAB (ENDING ACTIVITY)
    // ===========================================================================
    challenge: {
        id: 'day-21-homework',
        title: 'Day 21 — Performance & Indexing Lab (Ending Activity)',
        scenario: 'Demonstrate your understanding of indexing and query plans:',
        tasks: [
            {
                id: 'day21-hw-1',
                title: 'Task 1: Run EXPLAIN on a product supplier query',
                description: 'Run EXPLAIN on `SELECT * FROM products WHERE supplier_id = 2;`.',
                instructions: [
                    'Run `EXPLAIN SELECT * FROM products WHERE supplier_id = 2;`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'products',
                initialSql: '-- Challenge: Run EXPLAIN on supplier query\n',
                solutionSql: 'EXPLAIN SELECT * FROM products WHERE supplier_id = 2;',
                solutionExplanation: 'Inspects index usage for supplier_id lookup.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `EXPLAIN SELECT * FROM products WHERE supplier_id = 2;`'
                    }
                ],
                validation: {
                    targetTable: 'products',
                    expectedRowCount: 1
                },
                successMessage: 'Challenge completed! Query execution plan verified.'
            }
        ]
    }
};
const DAY_22_MODULE = {
    id: 'day-22',
    slug: 'project-part-3-integration-queries',
    day: 22,
    title: 'Day 22 — Applied Project: Full-Stack Backend Integration Queries',
    shortTitle: 'Project: Backend API Queries',
    type: 'project_part',
    milestoneId: 'milestone-3',
    description: 'As a Backend API Engineer, write production-ready integration queries: product detail view payload, customer profile order history, and executive dashboard KPIs in single round trips.',
    estimatedMinutes: 120,
    completionLearnings: [
        'Build a single-payload Product Detail Page query joining products, categories, and suppliers',
        'Hydrate customer profile screens with distinct order counts and monetary spend',
        'Generate single-query executive KPI dashboard metrics to eliminate API round-trip latency'
    ],
    concepts: [
        {
            id: 'full-stack-query-patterns',
            order: 1,
            title: '1. Production Backend API Query Patterns',
            shortDescription: 'Product detail pages, customer profiles, and executive KPIs.',
            theory: {
                summary: 'In real full-stack web applications, backend route handlers issue rich SQL queries to hydrate entire UI screens in a single database round trip, avoiding chatty network calls.',
                introTable: {
                    tableName: 'products & categories & suppliers',
                    description: 'Data sources for single-payload Product Detail View',
                    columns: [
                        'p.name',
                        'p.price',
                        'c.name (Category)',
                        's.name (Supplier)'
                    ],
                    rows: [
                        [
                            'Wireless Mouse',
                            15.99,
                            'Accessories',
                            'LogiTech Direct'
                        ],
                        [
                            'Mechanical Keyboard',
                            65.00,
                            'Electronics',
                            'KeyChron Components'
                        ]
                    ]
                },
                explanation: [
                    '### 1. The Single-Payload Product Detail View (`GET /api/products/:id`)',
                    'Instead of 3 separate queries, join `products` $\\rightarrow$ `categories` $\\rightarrow$ `suppliers` in one query.',
                    '### 2. The Customer Profile Endpoint (`GET /api/customers/:id`)',
                    'Combines customer attributes with distinct order counts and lifetime spend totals.',
                    '### 3. The Executive Dashboard KPI Endpoint (`GET /api/admin/dashboard`)',
                    'Aggregates total distinct orders and grand total revenue in a single pass.'
                ],
                targetQuery: {
                    sql: 'SELECT p.product_id, p.name, p.price,\n       c.name AS category_name, s.name AS supplier_name\nFROM products p\nJOIN categories c ON p.category_id = c.category_id\nJOIN suppliers s ON p.supplier_id = s.supplier_id\nWHERE p.product_id = 1;',
                    explanation: 'Hydrate an entire production product detail view across 3 joined tables in 1 database round trip.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: Hydrating Product Detail Payload',
                        sqlSnippet: 'SELECT p.product_id, p.name, p.price,\n       c.name AS category_name, s.name AS supplier_name\nFROM products p\nJOIN categories c ON p.category_id = c.category_id\nJOIN suppliers s ON p.supplier_id = s.supplier_id\nWHERE p.product_id = 1;',
                        explanation: 'Consolidates product attributes, category label, and supplier info in 1 query.',
                        tableData: {
                            tableName: 'Hydrated View Payload',
                            columns: [
                                'product_id',
                                'name',
                                'price',
                                'category_name',
                                'supplier_name'
                            ],
                            highlightedColumns: [
                                'name',
                                'category_name',
                                'supplier_name'
                            ],
                            rows: [
                                [
                                    1,
                                    'Wireless Mouse',
                                    15.99,
                                    'Accessories',
                                    'LogiTech Direct'
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'Product detail page backend query',
                        sql: 'SELECT p.product_id, p.name, p.price, p.quantity_in_stock,\n       c.name AS category_name, s.name AS supplier_name\nFROM products p\nJOIN categories c ON p.category_id = c.category_id\nJOIN suppliers s ON p.supplier_id = s.supplier_id\nWHERE p.product_id = 1;',
                        description: 'Hydrates a full product detail view in 1 round trip.'
                    }
                ],
                keyTakeaway: 'Design comprehensive multi-table queries that satisfy full UI view requirements in a single round trip.',
                exampleQuery: 'SELECT p.product_id, p.name, c.name AS category_name, s.name AS supplier_name FROM products p JOIN categories c ON p.category_id = c.category_id JOIN suppliers s ON p.supplier_id = s.supplier_id WHERE p.product_id = 1;',
                exampleQueryExplanation: 'Hydrates detail view for product 1.',
                liveDemoSql: 'SELECT p.product_id, p.name, c.name AS category_name, s.name AS supplier_name FROM products p JOIN categories c ON p.category_id = c.category_id JOIN suppliers s ON p.supplier_id = s.supplier_id WHERE p.product_id = 1;',
                liveDemoNotes: 'Displays product detail payload.',
                mcqs: [
                    {
                        question: 'Why is it preferable to fetch all product page details in a single joined query rather than multiple separate queries?',
                        options: [
                            'A. It minimizes network latency and round trips between backend API and database',
                            'B. SQL only allows 1 query per hour',
                            'C. It saves hard drive space',
                            'D. It disables indexes'
                        ],
                        correctIndex: 0,
                        explanation: 'Consolidating into a single query eliminates unnecessary network latency round trips.'
                    }
                ],
                masteryPoints: [
                    'Write multi-entity UI hydration queries',
                    'Construct executive KPI summaries'
                ]
            },
            tasks: [
                {
                    id: 'day22-c1-t1',
                    title: 'Mission 1 (Guided): Product Detail View Endpoint Query',
                    description: 'Retrieve product information with category name and supplier name for `product_id = 1`.',
                    instructions: [
                        'Select `p.product_id`, `p.name`, `p.price`, `c.name AS category_name`, `s.name AS supplier_name` from `products p` JOIN `categories c` ON `p.category_id = c.category_id` JOIN `suppliers s` ON `p.supplier_id = s.supplier_id` WHERE `p.product_id = 1`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'products',
                    secondaryTables: [
                        'categories',
                        'suppliers'
                    ],
                    initialSql: '-- Mission 1: Product detail page query\n',
                    solutionSql: 'SELECT p.product_id, p.name, p.price, c.name AS category_name, s.name AS supplier_name FROM products p JOIN categories c ON p.category_id = c.category_id JOIN suppliers s ON p.supplier_id = s.supplier_id WHERE p.product_id = 1;',
                    solutionExplanation: 'Hydrates the product detail view across 3 joined tables in one round trip.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `WHERE p.product_id = 1;`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requireJoin: true,
                        requireWhere: true,
                        expectedRowCount: 1
                    },
                    successMessage: 'Mission 1 complete! Product detail endpoint query verified.'
                },
                {
                    id: 'day22-c1-t2',
                    title: 'Mission 2 (Independent): Executive Dashboard KPI Summary Query',
                    description: 'Calculate overall total distinct orders and grand total revenue in a single query.',
                    instructions: [
                        'Query `orders o` JOIN `order_items oi` ON `o.order_id = oi.order_id`.',
                        'Select `COUNT(DISTINCT o.order_id) AS total_orders` and `SUM(oi.quantity * oi.unit_price) AS total_revenue`.'
                    ],
                    type: 'independent',
                    primaryTable: 'orders',
                    secondaryTables: [
                        'order_items'
                    ],
                    initialSql: '-- Executive dashboard summary\n',
                    solutionSql: 'SELECT COUNT(DISTINCT o.order_id) AS total_orders, SUM(oi.quantity * oi.unit_price) AS total_revenue FROM orders o JOIN order_items oi ON o.order_id = oi.order_id;',
                    solutionExplanation: 'Calculates high-level executive KPI metrics in a single pass.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `SELECT COUNT(DISTINCT o.order_id) AS total_orders, SUM(oi.quantity * oi.unit_price) AS total_revenue FROM orders o JOIN order_items oi ON o.order_id = oi.order_id;`'
                        }
                    ],
                    validation: {
                        targetTable: 'orders',
                        requireJoin: true,
                        expectedRowCount: 1
                    },
                    successMessage: 'Mission 2 complete! Executive dashboard KPI query verified.'
                }
            ]
        }
    ],
    // ===========================================================================
    // DAY 22 CHALLENGE: DELIVER THE BACKEND API ENDPOINT QUERY SUITE (ENDING ACTIVITY)
    // ===========================================================================
    challenge: {
        id: 'day-22-homework',
        title: 'Day 22 — Deliver the Backend API Endpoint Query Suite (Ending Activity)',
        scenario: 'Construct the production backend integration queries independently:',
        tasks: [
            {
                id: 'day22-hw-1',
                title: 'Endpoint 1: "Get Product Detail Page" Query',
                description: 'Product info + category name + supplier name for product 1.',
                instructions: [
                    'Select `p.product_id`, `p.name`, `p.price`, `c.name AS category_name`, `s.name AS supplier_name` from `products p` JOIN `categories c` ON `p.category_id = c.category_id` JOIN `suppliers s` ON `p.supplier_id = s.supplier_id` WHERE `p.product_id = 1`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'products',
                secondaryTables: [
                    'categories',
                    'suppliers'
                ],
                initialSql: '-- Endpoint 1: Product Detail Page query\n',
                solutionSql: 'SELECT p.product_id, p.name, p.price, c.name AS category_name, s.name AS supplier_name FROM products p JOIN categories c ON p.category_id = c.category_id JOIN suppliers s ON p.supplier_id = s.supplier_id WHERE p.product_id = 1;',
                solutionExplanation: 'Multi-table join hydrating the full product page payload.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `WHERE p.product_id = 1;`'
                    }
                ],
                validation: {
                    targetTable: 'products',
                    requireJoin: true,
                    requireWhere: true,
                    expectedRowCount: 1
                },
                successMessage: 'Endpoint 1 verified! Product detail query active.'
            },
            {
                id: 'day22-hw-2',
                title: 'Endpoint 2: "Executive Dashboard KPI Query" (Revenue & Orders)',
                description: 'Calculate grand total revenue and total distinct order count in a single query.',
                instructions: [
                    'Select `COUNT(DISTINCT o.order_id) AS total_orders`, `SUM(oi.quantity * oi.unit_price) AS total_revenue` from `orders o` JOIN `order_items oi` ON `o.order_id = oi.order_id`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'orders',
                secondaryTables: [
                    'order_items'
                ],
                initialSql: '-- Endpoint 2: Executive Dashboard KPI Query\n',
                solutionSql: 'SELECT COUNT(DISTINCT o.order_id) AS total_orders, SUM(oi.quantity * oi.unit_price) AS total_revenue FROM orders o JOIN order_items oi ON o.order_id = oi.order_id;',
                solutionExplanation: 'Computes high-level KPI metrics in a single query.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `SELECT COUNT(DISTINCT o.order_id) AS total_orders, SUM(oi.quantity * oi.unit_price) AS total_revenue FROM orders o JOIN order_items oi ON o.order_id = oi.order_id;`'
                    }
                ],
                validation: {
                    targetTable: 'orders',
                    requireJoin: true,
                    expectedRowCount: 1
                },
                successMessage: 'Endpoint 2 verified! Executive KPI summary verified.'
            }
        ]
    }
};
const DAY_23_MODULE = {
    id: 'day-23',
    slug: 'project-part-4-edge-cases-performance',
    day: 23,
    title: 'Day 23 — Debugging Lab & Polish: Zero-State Hardening & Edge Cases',
    shortTitle: 'Debug: Zero-State Hardening',
    type: 'project_part',
    milestoneId: 'milestone-3',
    description: 'Harden production queries against zero-state edge cases: preserve inactive customers and unpurchased products using LEFT JOIN and understand when COALESCE is needed for SUM aggregates.',
    estimatedMinutes: 90,
    completionLearnings: [
        'Handle 0-order customer edge cases using LEFT JOIN so inactive accounts remain in audits',
        'Understand COUNT() natural 0-behavior vs SUM() NULL-behavior and when to use COALESCE(SUM(...), 0)',
        'Harden analytical reporting pipelines against zero-record edge cases across the canonical 6-table schema'
    ],
    concepts: [
        {
            id: 'performance-and-edge-cases',
            order: 1,
            title: '1. Zero-State Hardening & NULL-Safe Aggregates',
            shortDescription: 'LEFT JOIN, COUNT natural 0s, and COALESCE with SUM.',
            theory: {
                summary: 'Production queries must handle zero-state edge cases gracefully: customers with 0 orders and products never ordered must not vanish from business reports. We master LEFT JOIN and understand the crucial difference between COUNT() and SUM() NULL behavior.',
                introTable: {
                    tableName: 'customers & orders (Canonical Schema)',
                    description: 'Customer records with and without orders',
                    columns: [
                        'c.name',
                        'COUNT(o.order_id)',
                        'SUM(quantity * unit_price)'
                    ],
                    rows: [
                        [
                            'Rafiul Islam',
                            2,
                            262.48
                        ],
                        [
                            'Arif Chowdhury (0 orders)',
                            0,
                            'NULL -> COALESCE(..., 0) = $0.00'
                        ]
                    ]
                },
                explanation: [
                    '### 1. COUNT() vs SUM() Zero-State Rule',
                    '• **`COUNT(o.order_id)`**: Naturally returns **`0`** when no matching rows exist in a `LEFT JOIN`. You do **NOT** need `COALESCE(COUNT(...), 0)`.',
                    '• **`SUM(oi.quantity)`**: Returns **`NULL`** when there are no matching rows to sum. You **MUST** use `COALESCE(SUM(oi.quantity), 0)` to display `0`.',
                    '### 2. Preserving Zero-Order Customers',
                    '`SELECT c.customer_id, c.name, COUNT(o.order_id) AS order_count FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.name;`',
                    'INNER JOIN silently drops inactive entities (e.g. customers with 0 orders). Always use LEFT JOIN when reporting rosters require 100% entity coverage.'
                ],
                targetQuery: {
                    sql: 'SELECT c.customer_id, c.name, COUNT(o.order_id) AS order_count\nFROM customers c\nLEFT JOIN orders o ON c.customer_id = o.customer_id\nGROUP BY c.customer_id, c.name;',
                    explanation: 'Preserve inactive zero-order customers in audits using a LEFT JOIN with natural COUNT 0-behavior.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: Preserving Inactive Customers with LEFT JOIN',
                        sqlSnippet: 'SELECT c.customer_id, c.name, COUNT(o.order_id) AS order_count\nFROM customers c\nLEFT JOIN orders o ON c.customer_id = o.customer_id\nGROUP BY c.customer_id, c.name;',
                        explanation: 'Preserves all 15 customers including zero-order accounts.',
                        tableData: {
                            tableName: 'Zero-Safe Customer Order Volume',
                            columns: [
                                'customer_id',
                                'name',
                                'order_count'
                            ],
                            highlightedColumns: [
                                'name',
                                'order_count'
                            ],
                            rows: [
                                [
                                    1,
                                    'Rafiul Islam',
                                    2
                                ],
                                [
                                    13,
                                    'Arif Chowdhury',
                                    0
                                ],
                                [
                                    14,
                                    'Nadia Islam',
                                    0
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'Null-safe aggregate query',
                        sql: 'SELECT p.product_id, p.name,\n       COUNT(oi.order_item_id) AS times_ordered,\n       COALESCE(SUM(oi.quantity), 0) AS total_units_sold\nFROM products p\nLEFT JOIN order_items oi ON p.product_id = oi.product_id\nGROUP BY p.product_id, p.name;',
                        description: 'Preserves unpurchased products with clean zero counts and COALESCE(SUM, 0).'
                    }
                ],
                keyTakeaway: 'Use LEFT JOIN to preserve zero-activity entities, and use COALESCE(SUM(...), 0) for null-safe financial totals.',
                exampleQuery: 'SELECT c.customer_id, c.name, COUNT(o.order_id) AS total_orders FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.name;',
                exampleQueryExplanation: 'Lists all customers with zero-order accounts preserved.',
                liveDemoSql: 'SELECT c.customer_id, c.name, COUNT(o.order_id) AS total_orders FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.name LIMIT 5;',
                liveDemoNotes: 'Displays customer order volume with 0s preserved.',
                mcqs: [
                    {
                        question: 'Why does `SUM()` need `COALESCE(SUM(...), 0)` while `COUNT()` does not in a LEFT JOIN when 0 rows match?',
                        options: [
                            'A. Because COUNT() naturally counts 0 non-null values, while SUM() over an empty set evaluates to NULL',
                            'B. Because SUM only works on integers',
                            'C. Because COUNT is an ORM keyword',
                            'D. Because SQL deletes null counts'
                        ],
                        correctIndex: 0,
                        explanation: 'COUNT(col) returns 0 when all values are NULL, whereas SUM(col) returns NULL.'
                    }
                ],
                masteryPoints: [
                    'Use LEFT JOIN for zero-state preservation',
                    'Apply COALESCE(SUM(...), 0) appropriately'
                ]
            },
            tasks: [
                {
                    id: 'day23-c1-t1',
                    title: 'Task 1 (Guided Fix): Customer Order Volume Audit',
                    description: 'List all customers with their order count, using LEFT JOIN so customers with 0 orders are preserved.',
                    instructions: [
                        'Query `customers c` LEFT JOIN `orders o` ON `c.customer_id = o.customer_id`.',
                        'Select `c.customer_id`, `c.name`, and `COUNT(o.order_id) AS total_orders`.',
                        'Group by `c.customer_id`, `c.name`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'customers',
                    secondaryTables: [
                        'orders'
                    ],
                    initialSql: '-- Null-safe customer order audit\nSELECT c.customer_id, c.name, COUNT(o.order_id) AS total_orders\nFROM customers c\nLEFT JOIN orders o ON c.customer_id = o.customer_id\nGROUP BY c.customer_id, c.name;',
                    solutionSql: 'SELECT c.customer_id, c.name, COUNT(o.order_id) AS total_orders FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.name;',
                    solutionExplanation: 'Preserves all 15 customers with clean 0 counts for inactive accounts.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `LEFT JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.name;`'
                        }
                    ],
                    validation: {
                        targetTable: 'customers',
                        requireJoin: true,
                        requireGroupBy: true,
                        expectedRowCount: 15
                    },
                    successMessage: 'Task 1 completed! All customer accounts preserved with accurate zero counts.'
                },
                {
                    id: 'day23-c1-t2',
                    title: 'Task 2 (Transfer): Catalog Sales Volume Audit with COALESCE',
                    description: 'List all products with total units sold using LEFT JOIN and COALESCE(SUM(oi.quantity), 0) so unpurchased products show 0 units.',
                    instructions: [
                        'Query `products p` LEFT JOIN `order_items oi` ON `p.product_id = oi.product_id`.',
                        'Select `p.product_id`, `p.name`, and `COALESCE(SUM(oi.quantity), 0) AS total_units_sold`.',
                        'Group by `p.product_id`, `p.name`.'
                    ],
                    type: 'independent',
                    primaryTable: 'products',
                    secondaryTables: [
                        'order_items'
                    ],
                    initialSql: '-- Catalog sales volume with COALESCE\n',
                    solutionSql: 'SELECT p.product_id, p.name, COALESCE(SUM(oi.quantity), 0) AS total_units_sold FROM products p LEFT JOIN order_items oi ON p.product_id = oi.product_id GROUP BY p.product_id, p.name;',
                    solutionExplanation: 'Preserves all 28 products with null-safe COALESCE on SUM.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `COALESCE(SUM(oi.quantity), 0) AS total_units_sold`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requireJoin: true,
                        requireGroupBy: true,
                        expectedRowCount: 28
                    },
                    successMessage: 'Task 2 completed! Catalog sales audit hardened against NULL sums.'
                }
            ]
        }
    ],
    // ===========================================================================
    // DAY 23 CHALLENGE: ZERO-STATE HARDENING CHALLENGE (ENDING ACTIVITY)
    // ===========================================================================
    challenge: {
        id: 'day-23-homework',
        title: 'Day 23 — Zero-State Hardening Challenge (Ending Activity)',
        scenario: 'Harden analytical reporting queries against zero-state edge cases:',
        tasks: [
            {
                id: 'day23-hw-1',
                title: 'Task 1: Customer order roster with 0-order preservation',
                description: 'Customer order roster preserving all customers (LEFT JOIN).',
                instructions: [
                    'Select `c.customer_id`, `c.name`, `COUNT(o.order_id) AS total_orders` from `customers c` LEFT JOIN `orders o` ON `c.customer_id = o.customer_id` GROUP BY `c.customer_id`, `c.name`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'customers',
                secondaryTables: [
                    'orders'
                ],
                initialSql: '-- Challenge: Customer order audit with 0-order preservation\n',
                solutionSql: 'SELECT c.customer_id, c.name, COUNT(o.order_id) AS total_orders FROM customers c LEFT JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.name;',
                solutionExplanation: 'Preserves all customer accounts using LEFT JOIN.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `LEFT JOIN orders o ON c.customer_id = o.customer_id GROUP BY c.customer_id, c.name;`'
                    }
                ],
                validation: {
                    targetTable: 'customers',
                    requireJoin: true,
                    requireGroupBy: true,
                    expectedRowCount: 15
                },
                successMessage: 'Challenge completed! Zero-order accounts preserved.'
            }
        ]
    }
};
const DAY_24_MODULE = {
    id: 'day-24',
    slug: 'milestone-3-final-assessment',
    day: 24,
    title: 'Day 24 — Milestone 3: Comprehensive Final Assessment',
    shortTitle: 'Milestone 3 Final Assessment',
    type: 'assignment',
    milestoneId: 'milestone-3',
    description: 'Comprehensive capstone assessment covering advanced multi-table CTEs, correlated subqueries, schema DDL modifications, index creation, and DML data integrity.',
    estimatedMinutes: 120,
    completionLearnings: [
        'Write top-category revenue rankings with multi-table joins',
        'Calculate correlated customer spend benchmarks using Common Table Expressions',
        'Execute schema DDL alterations (ALTER TABLE with column defaults)',
        'Create targeted performance B-tree indexes for query optimization'
    ],
    concepts: [
        {
            id: 'capstone-evaluation',
            order: 1,
            title: '1. Milestone 3 Capstone Skill Verification',
            shortDescription: 'Final comprehensive SQL certification assessment across all 24 days.',
            theory: {
                summary: 'Milestone 3 Capstone: Prove full database engineering proficiency across multi-table JOINs, subqueries, Common Table Expressions, schema architecture, and query optimization.',
                introTable: {
                    tableName: 'categories & products & order_items',
                    description: 'Multi-table revenue aggregation pipeline',
                    columns: [
                        'cat.name',
                        'p.name',
                        'oi.quantity',
                        'oi.unit_price'
                    ],
                    rows: [
                        [
                            'Electronics',
                            'Wireless Mouse',
                            2,
                            15.99
                        ],
                        [
                            'Electronics',
                            'Mechanical Keyboard',
                            1,
                            65.00
                        ],
                        [
                            'Office Furniture',
                            'Office Chair',
                            1,
                            120.00
                        ]
                    ]
                },
                explanation: [
                    '### 1. Final Assessment Deliverables',
                    '• **Deliverable 1 (Complex Retrieval)**: Top 3 product categories by total sales revenue.',
                    '• **Deliverable 2 (CTE Analysis)**: Customers with above-average total spending.',
                    '• **Deliverable 3 (Schema DDL)**: Add a `status` column with a default value to `products`.',
                    '• **Deliverable 4 (Index DDL)**: Create an index on `orders(customer_id)` for lookup acceleration.'
                ],
                targetQuery: {
                    sql: 'SELECT cat.name, SUM(oi.quantity * oi.unit_price) AS category_revenue\nFROM categories cat\nJOIN products p ON cat.category_id = p.category_id\nJOIN order_items oi ON p.product_id = oi.product_id\nGROUP BY cat.category_id, cat.name\nORDER BY category_revenue DESC\nLIMIT 3;',
                    explanation: 'Aggregate total sales revenue per product category across 3 joined tables and limit to top 3 rankings.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: Top 3 Categories by Revenue Ranking',
                        sqlSnippet: 'SELECT cat.name, SUM(oi.quantity * oi.unit_price) AS category_revenue\nFROM categories cat\nJOIN products p ON cat.category_id = p.category_id\nJOIN order_items oi ON p.product_id = oi.product_id\nGROUP BY cat.category_id, cat.name\nORDER BY category_revenue DESC\nLIMIT 3;',
                        explanation: 'Aggregates sales revenue per product category and limits to the top 3.',
                        tableData: {
                            tableName: 'Top 3 Revenue Categories',
                            columns: [
                                'name',
                                'category_revenue'
                            ],
                            highlightedColumns: [
                                'name',
                                'category_revenue'
                            ],
                            rows: [
                                [
                                    'Electronics',
                                    448.47
                                ],
                                [
                                    'Office Furniture',
                                    209.99
                                ],
                                [
                                    'Accessories',
                                    161.42
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'Mastery SQL syntax',
                        sql: 'WITH CategoryRevenue AS (\n  SELECT c.category_id, c.name, SUM(oi.quantity * oi.unit_price) AS rev\n  FROM categories c\n  JOIN products p ON c.category_id = p.category_id\n  JOIN order_items oi ON p.product_id = oi.product_id\n  GROUP BY c.category_id, c.name\n)\nSELECT * FROM CategoryRevenue ORDER BY rev DESC LIMIT 3;',
                        description: 'Capstone multi-stage CTE analysis.'
                    }
                ],
                keyTakeaway: 'Demonstrate complete fluency in advanced SQL.',
                exampleQuery: 'SELECT c.name, SUM(oi.quantity * oi.unit_price) AS rev FROM categories c JOIN products p ON c.category_id = p.category_id JOIN order_items oi ON p.product_id = oi.product_id GROUP BY c.category_id, c.name ORDER BY rev DESC LIMIT 3;',
                exampleQueryExplanation: 'Top 3 categories by total revenue.',
                liveDemoSql: 'SELECT c.name, SUM(oi.quantity * oi.unit_price) AS rev FROM categories c JOIN products p ON c.category_id = p.category_id JOIN order_items oi ON p.product_id = oi.product_id GROUP BY c.category_id, c.name ORDER BY rev DESC LIMIT 3;',
                liveDemoNotes: 'Displays top 3 revenue categories.',
                mcqs: [
                    {
                        question: 'What combination of tools enables optimal read performance in high-scale relational databases?',
                        options: [
                            'A. Targeted B-tree indexes, normalized schema design, and clean JOINs without Cartesian fan-out',
                            'B. Removing all constraints',
                            'C. Storing everything in 1 text column',
                            'D. Disabling foreign keys'
                        ],
                        correctIndex: 0,
                        explanation: 'Targeted indexes, normalization, and precise joins provide maximum efficiency.'
                    }
                ],
                masteryPoints: [
                    'Complete all Milestone 3 Capstone deliverables'
                ]
            },
            tasks: [
                {
                    id: 'day24-c1-t1',
                    title: 'Warmup 1: Top 3 Categories by Revenue',
                    description: 'Calculate top 3 categories by total revenue generated across order items.',
                    instructions: [
                        'Select `cat.name`, `SUM(oi.quantity * oi.unit_price) AS category_revenue` from `categories cat` JOIN `products p` ON `cat.category_id = p.category_id` JOIN `order_items oi` ON `p.product_id = oi.product_id`.',
                        'Group by `cat.category_id`, `cat.name`.',
                        'Order by `category_revenue DESC` LIMIT 3.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'categories',
                    secondaryTables: [
                        'products',
                        'order_items'
                    ],
                    initialSql: '-- Warmup 1: Top 3 categories by revenue\n',
                    solutionSql: 'SELECT cat.name, SUM(oi.quantity * oi.unit_price) AS category_revenue FROM categories cat JOIN products p ON cat.category_id = p.category_id JOIN order_items oi ON p.product_id = oi.product_id GROUP BY cat.category_id, cat.name ORDER BY category_revenue DESC LIMIT 3;',
                    solutionExplanation: 'Ranks top 3 categories by revenue.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `GROUP BY cat.category_id, cat.name ORDER BY category_revenue DESC LIMIT 3;`'
                        }
                    ],
                    validation: {
                        targetTable: 'categories',
                        requireJoin: true,
                        requireGroupBy: true,
                        requireOrderBy: [
                            {
                                column: 'category_revenue',
                                direction: 'DESC'
                            }
                        ],
                        requireLimit: 3,
                        expectedRowCount: 3
                    },
                    successMessage: 'Warmup 1 completed! Top 3 revenue categories calculated.'
                },
                {
                    id: 'day24-c1-t2',
                    title: 'Warmup 2: Above-Average Customer Spenders (CTE)',
                    description: 'Find customers whose total spend is higher than the overall average customer spend using a CTE.',
                    instructions: [
                        'Define `WITH CustomerTotals AS (SELECT c.customer_id, c.name, SUM(oi.quantity * oi.unit_price) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id, c.name)`.',
                        'Select all columns from `CustomerTotals` where `total_spent > (SELECT AVG(total_spent) FROM CustomerTotals)` ordered by `total_spent DESC`.'
                    ],
                    type: 'independent',
                    primaryTable: 'customers',
                    secondaryTables: [
                        'orders',
                        'order_items'
                    ],
                    initialSql: '-- High-spending customer benchmark\n',
                    solutionSql: 'WITH CustomerTotals AS (SELECT c.customer_id, c.name, SUM(oi.quantity * oi.unit_price) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id, c.name) SELECT * FROM CustomerTotals WHERE total_spent > (SELECT AVG(total_spent) FROM CustomerTotals) ORDER BY total_spent DESC;',
                    solutionExplanation: 'Calculates high-value customers above average threshold.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `WHERE total_spent > (SELECT AVG(total_spent) FROM CustomerTotals) ORDER BY total_spent DESC;`'
                        }
                    ],
                    validation: {
                        targetTable: 'customers',
                        expectedRowCount: 5
                    },
                    successMessage: 'Warmup 2 completed! Above-average spenders filtered with CTE benchmark.'
                }
            ]
        }
    ],
    // ===========================================================================
    // DAY 24 CHALLENGE: MILESTONE 3 CAPSTONE ASSESSMENT (ENDING ACTIVITY)
    // ===========================================================================
    challenge: {
        id: 'day-24-homework',
        title: 'Day 24 — Milestone 3 Capstone Assessment (Ending Activity)',
        scenario: 'Complete all 4 capstone deliverables independently to achieve SQL certification:',
        tasks: [
            {
                id: 'day24-hw-1',
                title: 'Deliverable 1 (Complex Retrieval): Top 3 categories by revenue',
                description: 'Top 3 categories by revenue (categories → products → order_items).',
                instructions: [
                    'Select `cat.name`, `SUM(oi.quantity * oi.unit_price) AS category_revenue` from `categories cat` JOIN `products p` ON `cat.category_id = p.category_id` JOIN `order_items oi` ON `p.product_id = oi.product_id` GROUP BY `cat.category_id`, `cat.name` ORDER BY `category_revenue DESC` LIMIT 3.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'categories',
                secondaryTables: [
                    'products',
                    'order_items'
                ],
                initialSql: '-- Deliverable 1: Top 3 categories by revenue\n',
                solutionSql: 'SELECT cat.name, SUM(oi.quantity * oi.unit_price) AS category_revenue FROM categories cat JOIN products p ON cat.category_id = p.category_id JOIN order_items oi ON p.product_id = oi.product_id GROUP BY cat.category_id, cat.name ORDER BY category_revenue DESC LIMIT 3;',
                solutionExplanation: 'Joins across 3 tables and sums revenue per category.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `ORDER BY category_revenue DESC LIMIT 3;`'
                    }
                ],
                validation: {
                    targetTable: 'categories',
                    requireJoin: true,
                    requireGroupBy: true,
                    requireOrderBy: [
                        {
                            column: 'category_revenue',
                            direction: 'DESC'
                        }
                    ],
                    requireLimit: 3,
                    expectedRowCount: 3
                },
                successMessage: 'Deliverable 1 verified! Top 3 revenue categories calculated.'
            },
            {
                id: 'day24-hw-2',
                title: 'Deliverable 2 (CTE Analysis): Customers with above-average total spend',
                description: 'Find customers whose total spend is higher than the overall average customer spend.',
                instructions: [
                    'Use `WITH CustomerTotals AS (SELECT c.customer_id, c.name, SUM(oi.quantity * oi.unit_price) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id, c.name) SELECT * FROM CustomerTotals WHERE total_spent > (SELECT AVG(total_spent) FROM CustomerTotals) ORDER BY total_spent DESC;`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'customers',
                secondaryTables: [
                    'orders',
                    'order_items'
                ],
                initialSql: '-- Deliverable 2: Customers with above-average total spend\n',
                solutionSql: 'WITH CustomerTotals AS (SELECT c.customer_id, c.name, SUM(oi.quantity * oi.unit_price) AS total_spent FROM customers c JOIN orders o ON c.customer_id = o.customer_id JOIN order_items oi ON o.order_id = oi.order_id GROUP BY c.customer_id, c.name) SELECT * FROM CustomerTotals WHERE total_spent > (SELECT AVG(total_spent) FROM CustomerTotals) ORDER BY total_spent DESC;',
                solutionExplanation: 'Uses CTE with subquery benchmark to filter high-spending accounts.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `WITH CustomerTotals AS (...) SELECT * FROM CustomerTotals WHERE total_spent > (SELECT AVG(total_spent) FROM CustomerTotals);`'
                    }
                ],
                validation: {
                    targetTable: 'customers',
                    expectedRowCount: 5
                },
                successMessage: 'Deliverable 2 verified! High-value customer benchmark verified.'
            },
            {
                id: 'day24-hw-3',
                title: 'Deliverable 3 (Schema DDL): Add status column to products with default',
                description: 'Add a status column to products: `ALTER TABLE products ADD COLUMN status VARCHAR(20) DEFAULT \'active\';`.',
                instructions: [
                    'Execute `ALTER TABLE products ADD COLUMN status VARCHAR(20) DEFAULT \'active\';`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'products',
                initialSql: '-- Deliverable 3: Alter table products add status column\n',
                solutionSql: 'ALTER TABLE products ADD COLUMN status VARCHAR(20) DEFAULT \'active\';',
                solutionExplanation: 'Alters products table schema by appending the status column with default value.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `ALTER TABLE products ADD COLUMN status VARCHAR(20) DEFAULT \'active\';`'
                    }
                ],
                validation: {
                    targetTable: 'products',
                    expectedRowCount: 1
                },
                successMessage: 'Deliverable 3 verified! Schema altered with status column.'
            },
            {
                id: 'day24-hw-4',
                title: 'Deliverable 4 (Index Optimization): Create index on orders(customer_id)',
                description: 'Create an index named idx_orders_customer_id on orders(customer_id).',
                instructions: [
                    'Execute `CREATE INDEX idx_orders_customer_id ON orders(customer_id);`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'orders',
                initialSql: '-- Deliverable 4: Create index on orders(customer_id)\n',
                solutionSql: 'CREATE INDEX idx_orders_customer_id ON orders(customer_id);',
                solutionExplanation: 'Creates a B-tree index on orders foreign key customer_id.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `CREATE INDEX idx_orders_customer_id ON orders(customer_id);`'
                    }
                ],
                validation: {
                    targetTable: 'orders',
                    expectedRowCount: 1
                },
                successMessage: 'Deliverable 4 verified! Index created on orders(customer_id).'
            }
        ]
    }
};
const DAY_25_MODULE = {
    id: 'day-25',
    slug: 'graduation-real-world-bridge',
    day: 25,
    title: 'Day 25 — Beyond the Course: Window Functions Preview & Graduation',
    shortTitle: 'Graduation & Window Functions',
    type: 'project_part',
    milestoneId: 'milestone-3',
    description: 'Celebrate your 25-day SQL journey! Preview advanced Window Functions (ROW_NUMBER OVER PARTITION BY) and bridge your skills to Node.js/TypeScript backend production development.',
    estimatedMinutes: 60,
    completionLearnings: [
        'Understand the difference between GROUP BY (collapses rows) and Window Functions (preserves all rows while appending analytical ranks)',
        'Write modern Window Functions using ROW_NUMBER() OVER (PARTITION BY ... ORDER BY ...)',
        'Bridge SQL skills to backend Node.js / TypeScript libraries (Drizzle, Prisma, pg, mysql2)',
        'Review the complete progression from Day 1 table basics to Day 25 full relational engineering'
    ],
    concepts: [
        {
            id: 'window-functions-and-future',
            order: 1,
            title: '1. Beyond the Course: Window Functions Preview',
            shortDescription: 'Calculate analytical ranks and running metrics without collapsing rows.',
            theory: {
                summary: 'Congratulations on reaching Day 25! Today is a celebration and a bridge to advanced SQL: preview Window Functions, which calculate rankings and running totals across rows while keeping every individual row visible in the result.',
                introTable: {
                    tableName: 'products (Ranked in Category)',
                    description: 'Window function category partition output',
                    columns: [
                        'name',
                        'category_id',
                        'price',
                        'rank_in_category'
                    ],
                    rows: [
                        [
                            'Mechanical Keyboard',
                            1,
                            65.00,
                            1
                        ],
                        [
                            'Gaming Headset',
                            1,
                            55.00,
                            2
                        ],
                        [
                            'Office Chair',
                            3,
                            120.00,
                            1
                        ]
                    ]
                },
                explanation: [
                    '### 1. The Core Difference: GROUP BY vs Window Functions',
                    '• **`GROUP BY`**: **Collapses** multiple rows into a single summary bucket row.',
                    '• **`Window Function (OVER / PARTITION BY)`**: **Preserves** all original rows and appends an analytical rank or running calculation alongside each row.',
                    '```sql\nSELECT name, category_id, price,\n       ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS category_rank\nFROM products;\n```',
                    '### 2. Bridging SQL to Full-Stack Production Development',
                    'In modern TypeScript/Node.js stacks, your SQL mastery translates directly into production database workflows using tools like **Drizzle ORM**, **Prisma**, **Kysely**, and raw drivers like **pg** and **mysql2**.',
                    '### 3. Graduation Celebration 🎓',
                    'You have progressed through 25 comprehensive days: from single-table retrieval and filtering, to multi-table joins, relational aggregation, subqueries, CTEs, DML mutations, DDL schema architecture, and performance indexing!'
                ],
                targetQuery: {
                    sql: 'SELECT name, category_id, price,\n       ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS category_rank\nFROM products;',
                    explanation: 'Compute analytical in-category price ranks dynamically without collapsing individual product rows.',
                    badge: "The query we're going to break down"
                },
                stepBreakdowns: [
                    {
                        stepNumber: 1,
                        stepTitle: 'Step 1: Partitioning Products by Category and Ranking by Price',
                        sqlSnippet: 'SELECT name, category_id, price,\n       ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS category_rank\nFROM products;',
                        explanation: 'Assigns ranks 1, 2, 3... within each category partition ordered by price descending.',
                        tableData: {
                            tableName: 'Partitioned Product Rankings',
                            columns: [
                                'name',
                                'category_id',
                                'price',
                                'category_rank'
                            ],
                            highlightedColumns: [
                                'category_id',
                                'category_rank'
                            ],
                            rows: [
                                [
                                    'Mechanical Keyboard',
                                    1,
                                    65.00,
                                    1
                                ],
                                [
                                    'Gaming Headset',
                                    1,
                                    55.00,
                                    2
                                ],
                                [
                                    'Wireless Mouse',
                                    1,
                                    15.99,
                                    3
                                ]
                            ]
                        }
                    }
                ],
                syntaxBlocks: [
                    {
                        title: 'Window function syntax',
                        sql: 'SELECT name, category_id, price,\n       ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS rank_in_category\nFROM products;',
                        description: 'Ranks items inside each partition while preserving all rows.'
                    }
                ],
                keyTakeaway: 'Window functions calculate partition rankings and running aggregates without collapsing individual rows.',
                exampleQuery: 'SELECT name, category_id, price, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS category_rank FROM products;',
                exampleQueryExplanation: 'Ranks products within each category.',
                liveDemoSql: 'SELECT name, category_id, price, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS category_rank FROM products LIMIT 10;',
                liveDemoNotes: 'Displays window function category rankings.',
                mcqs: [
                    {
                        question: 'What is the main conceptual difference between GROUP BY and a Window Function with PARTITION BY?',
                        options: [
                            'A. GROUP BY collapses rows into a single summary row per group; Window Functions retain individual rows and append calculated metrics',
                            'B. Window Functions only work on strings',
                            'C. GROUP BY is deprecated',
                            'D. Window Functions delete duplicate records'
                        ],
                        correctIndex: 0,
                        explanation: 'Window functions compute partition metrics while preserving all individual rows.'
                    }
                ],
                masteryPoints: [
                    'Write Window Functions using PARTITION BY and ORDER BY',
                    'Graduate with full 25-day SQL relational mastery'
                ]
            },
            tasks: [
                {
                    id: 'day25-c1-t1',
                    title: 'Exploration 1: Rank Products within Categories',
                    description: 'Use ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) to rank products in each category.',
                    instructions: [
                        'Select `name`, `category_id`, `price`, `ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS category_rank` from `products`.',
                        'End with a semicolon (;).'
                    ],
                    type: 'guided',
                    primaryTable: 'products',
                    initialSql: '-- Exploration 1: Rank products inside categories\nSELECT name, category_id, price, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS category_rank\nFROM products;\n',
                    solutionSql: 'SELECT name, category_id, price, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS category_rank FROM products;',
                    solutionExplanation: 'Ranks products by price within each category.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS category_rank`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        requiredColumns: [
                            'name',
                            'category_id',
                            'price',
                            'category_rank'
                        ],
                        expectedRowCount: 28
                    },
                    successMessage: 'Exploration 1 verified! Window function ranking calculated.'
                },
                {
                    id: 'day25-c1-t2',
                    title: 'Exploration 2: Top 2 Products per Category via CTE',
                    description: 'Combine a Window Function with a CTE to extract only the top 2 highest priced products per category.',
                    instructions: [
                        'Define `WITH RankedProducts AS (SELECT name, category_id, price, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS rank_num FROM products)`.',
                        'Select all columns from `RankedProducts` where `rank_num <= 2`.'
                    ],
                    type: 'independent',
                    primaryTable: 'products',
                    initialSql: '-- Top 2 products per category with window function\n',
                    solutionSql: 'WITH RankedProducts AS (SELECT name, category_id, price, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS rank_num FROM products) SELECT * FROM RankedProducts WHERE rank_num <= 2;',
                    solutionExplanation: 'Extracts top 2 ranked products per category.',
                    hints: [
                        {
                            level: 1,
                            text: 'Use `WITH RankedProducts AS (...) SELECT * FROM RankedProducts WHERE rank_num <= 2;`'
                        }
                    ],
                    validation: {
                        targetTable: 'products',
                        expectedRowCount: 11
                    },
                    successMessage: 'Congratulations! You have completed the entire 25-Day SQL Master Curriculum!'
                }
            ]
        }
    ],
    // ===========================================================================
    // DAY 25: OPTIONAL EXPLORATION SANDBOX (GRADUATION)
    // ===========================================================================
    challenge: {
        id: 'day-25-homework',
        title: 'Day 25 — Optional Exploration Sandbox (Graduation)',
        scenario: 'Optional Exploration: Run the final Window Function query to complete your graduation portfolio:',
        tasks: [
            {
                id: 'day25-hw-1',
                title: 'Graduation Milestone: Top 2 Most Expensive Products in Each Category',
                description: 'Find the top 2 most expensive products in each category using ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC).',
                instructions: [
                    'Use `WITH RankedProducts AS (SELECT name, category_id, price, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS rank_num FROM products) SELECT * FROM RankedProducts WHERE rank_num <= 2;`.',
                    'End with a semicolon (;).'
                ],
                type: 'challenge',
                primaryTable: 'products',
                secondaryTables: [
                    'categories'
                ],
                initialSql: '-- Graduation Milestone: Top 2 products in each category using Window Function\n',
                solutionSql: 'WITH RankedProducts AS (SELECT name, category_id, price, ROW_NUMBER() OVER (PARTITION BY category_id ORDER BY price DESC) AS rank_num FROM products) SELECT * FROM RankedProducts WHERE rank_num <= 2;',
                solutionExplanation: 'Combines a Window Function inside a CTE to slice the top 2 products per category.',
                hints: [
                    {
                        level: 1,
                        text: 'Use `WITH RankedProducts AS (...) SELECT * FROM RankedProducts WHERE rank_num <= 2;`'
                    }
                ],
                validation: {
                    targetTable: 'products',
                    expectedRowCount: 11
                },
                successMessage: 'Congratulations on graduating the 25-Day SQL Master Curriculum! 🎓'
            }
        ]
    }
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_content_1hf65h6._.js.map