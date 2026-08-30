import { TableRow } from '../../types/database';

export const INITIAL_TABLES: Record<string, TableRow[]> = {
  categories: [
    { category_id: 1, name: 'Electronics' },
    { category_id: 2, name: 'Kitchen & Dining' },
    { category_id: 3, name: 'Office Supplies' },
    { category_id: 4, name: 'Sporting Goods' },
    { category_id: 5, name: 'Home & Garden' },
    { category_id: 6, name: 'Books & Stationery' }, // FIX 3: 0 products for anti-join/NULL tests
  ],

  suppliers: [
    { supplier_id: 1, name: 'TechSource Ltd', contact_email: 'contact@techsource.com' },
    { supplier_id: 2, name: 'Global Kitchenware Co', contact_email: 'sales@globalkitchen.com' },
    { supplier_id: 3, name: 'OfficeMax Wholesale', contact_email: 'orders@officemaxwholesale.com' },
    { supplier_id: 4, name: 'ProSport Distributors', contact_email: 'info@prosportdist.com' },
    { supplier_id: 5, name: 'GreenLeaf Home Supplies', contact_email: 'hello@greenleafhome.com' },
    { supplier_id: 6, name: 'Unity Traders BD', contact_email: 'contact@unitytraders.bd' }, // FIX 4: unpurchased supplier
  ],

  products: [
    { product_id: 1, name: 'Wireless Mouse', category_id: 1, supplier_id: 1, price: 15.99, quantity_in_stock: 40, reorder_level: 10 },
    { product_id: 2, name: 'Bluetooth Speaker', category_id: 1, supplier_id: 1, price: 45.50, quantity_in_stock: 3, reorder_level: 10 },
    { product_id: 3, name: 'USB-C Charging Cable', category_id: 1, supplier_id: 1, price: 9.99, quantity_in_stock: 0, reorder_level: 20 },
    { product_id: 4, name: 'Mechanical Keyboard', category_id: 1, supplier_id: 1, price: 65.00, quantity_in_stock: 12, reorder_level: 5 },
    { product_id: 5, name: 'Laptop Stand', category_id: 1, supplier_id: 1, price: 28.75, quantity_in_stock: 8, reorder_level: 10 },
    { product_id: 6, name: 'Stainless Steel Pan Set', category_id: 2, supplier_id: 2, price: 55.00, quantity_in_stock: 15, reorder_level: 5 },
    { product_id: 7, name: 'Ceramic Mixing Bowls', category_id: 2, supplier_id: 2, price: 22.30, quantity_in_stock: 30, reorder_level: 8 },
    { product_id: 8, name: 'Electric Kettle', category_id: 2, supplier_id: 2, price: 34.99, quantity_in_stock: 2, reorder_level: 5 },
    { product_id: 9, name: 'Cutting Board Set', category_id: 2, supplier_id: 2, price: 18.00, quantity_in_stock: 0, reorder_level: 6 },
    { product_id: 10, name: 'Knife Sharpener', category_id: 2, supplier_id: 2, price: 12.50, quantity_in_stock: 25, reorder_level: 5 },
    { product_id: 11, name: 'Desk Organizer', category_id: 3, supplier_id: 3, price: 14.25, quantity_in_stock: 18, reorder_level: 5 },
    { product_id: 12, name: 'Sticky Notes Pack', category_id: 3, supplier_id: 3, price: 4.99, quantity_in_stock: 100, reorder_level: 20 },
    { product_id: 13, name: 'Ballpoint Pen Box', category_id: 3, supplier_id: 3, price: 6.50, quantity_in_stock: 60, reorder_level: 15 },
    { product_id: 14, name: 'Office Chair', category_id: 3, supplier_id: 3, price: 120.00, quantity_in_stock: 5, reorder_level: 3 },
    { product_id: 15, name: 'Filing Cabinet', category_id: 3, supplier_id: 3, price: 89.99, quantity_in_stock: 4, reorder_level: 5 },
    { product_id: 16, name: 'Yoga Mat', category_id: 4, supplier_id: 4, price: 19.99, quantity_in_stock: 22, reorder_level: 8 },
    { product_id: 17, name: 'Dumbbell Set 10kg', category_id: 4, supplier_id: 4, price: 42.00, quantity_in_stock: 6, reorder_level: 5 },
    { product_id: 18, name: 'Resistance Bands', category_id: 4, supplier_id: 4, price: 11.99, quantity_in_stock: 35, reorder_level: 10 },
    { product_id: 19, name: 'Football', category_id: 4, supplier_id: 4, price: 16.50, quantity_in_stock: 0, reorder_level: 10 },
    { product_id: 20, name: 'Tennis Racket', category_id: 4, supplier_id: 4, price: 55.00, quantity_in_stock: 9, reorder_level: 4 },
    { product_id: 21, name: 'Garden Hose 50ft', category_id: 5, supplier_id: 5, price: 24.99, quantity_in_stock: 14, reorder_level: 5 },
    { product_id: 22, name: 'Pruning Shears', category_id: 5, supplier_id: 5, price: 13.75, quantity_in_stock: 20, reorder_level: 6 },
    { product_id: 23, name: 'Planter Pot Set', category_id: 5, supplier_id: 5, price: 17.50, quantity_in_stock: 3, reorder_level: 5 },
    { product_id: 24, name: 'LED String Lights', category_id: 5, supplier_id: 5, price: 9.50, quantity_in_stock: 45, reorder_level: 15 },
    { product_id: 25, name: 'Wireless Doorbell', category_id: 5, supplier_id: 6, price: 38.00, quantity_in_stock: 10, reorder_level: 4 },
    { product_id: 26, name: 'Wireless Earbuds', category_id: 1, supplier_id: 1, price: 32.00, quantity_in_stock: 20, reorder_level: 8 },
    { product_id: 27, name: 'Portable Charger', category_id: 1, supplier_id: 1, price: 21.99, quantity_in_stock: 16, reorder_level: 6 },
    { product_id: 28, name: 'Miscellaneous Clearance Item', category_id: null, supplier_id: null, price: 4.99, quantity_in_stock: 7, reorder_level: 2 },
  ],

  customers: [
    { customer_id: 1, name: 'Rafiul Islam', email: 'rafiul@example.com', city: 'Dhaka', signup_date: '2025-11-10' },
    { customer_id: 2, name: 'Priya Akter', email: 'priya.akter@example.com', city: 'Dhaka', signup_date: '2026-08-05' },
    { customer_id: 3, name: 'Tanvir Ahmed', email: null, city: 'Chittagong', signup_date: '2026-01-15' },
    { customer_id: 4, name: 'Nusrat Jahan', email: 'nusrat.j@example.com', city: 'Chittagong', signup_date: '2026-08-15' },
    { customer_id: 5, name: 'Kamal Hossain', email: 'kamal.h@example.com', city: 'Sylhet', signup_date: '2025-09-20' },
    { customer_id: 6, name: 'Farhana Rahman', email: 'farhana.r@example.com', city: 'Dhaka', signup_date: '2026-02-28' },
    { customer_id: 7, name: 'Shakil Ahmed', email: null, city: 'Khulna', signup_date: '2026-08-10' },
    { customer_id: 8, name: 'Mim Akter', email: 'mim.akter@example.com', city: 'Dhaka', signup_date: '2025-12-01' },
    { customer_id: 9, name: 'Rasel Khan', email: 'rasel.khan@example.com', city: 'Chittagong', signup_date: '2026-03-18' },
    { customer_id: 10, name: 'Sabrina Yasmin', email: 'sabrina.y@example.com', city: 'Sylhet', signup_date: '2026-07-01' },
    { customer_id: 11, name: 'Imran Hossain', email: 'imran.h@example.com', city: 'Dhaka', signup_date: '2026-08-20' },
    { customer_id: 12, name: 'Lubna Sultana', email: 'lubna.s@example.com', city: 'Khulna', signup_date: '2026-04-12' },
    // FIX 1 & FIX 2: Zero-order customers & recency anchors
    { customer_id: 13, name: 'Arif Chowdhury', email: 'arif.c@example.com', city: 'Rajshahi', signup_date: '2025-10-05' },
    { customer_id: 14, name: 'Nadia Islam', email: 'nadia.islam@example.com', city: 'Barisal', signup_date: '2026-08-20' },
    { customer_id: 15, name: 'Jahid Karim', email: 'jahid.karim@example.com', city: 'Dhaka', signup_date: '2026-07-11' },
  ],

  orders: [
    { order_id: 1, customer_id: 1, order_date: '2026-06-10', status: 'delivered' },
    { order_id: 2, customer_id: 2, order_date: '2026-08-01', status: 'pending' },
    { order_id: 3, customer_id: 3, order_date: '2026-05-15', status: 'delivered' },
    { order_id: 4, customer_id: 4, order_date: '2026-08-10', status: 'shipped' },
    { order_id: 5, customer_id: 5, order_date: '2026-04-02', status: 'delivered' },
    { order_id: 6, customer_id: 5, order_date: '2026-06-18', status: 'cancelled' },
    { order_id: 7, customer_id: 6, order_date: '2026-07-05', status: 'delivered' },
    { order_id: 8, customer_id: 7, order_date: '2026-08-12', status: 'pending' },
    { order_id: 9, customer_id: 8, order_date: '2026-03-20', status: 'delivered' },
    { order_id: 10, customer_id: 9, order_date: '2026-05-28', status: 'delivered' },
    { order_id: 11, customer_id: 9, order_date: '2026-07-30', status: 'delivered' },
    { order_id: 12, customer_id: 10, order_date: '2026-06-25', status: 'delivered' },
    { order_id: 13, customer_id: 11, order_date: '2026-08-21', status: 'pending' },
    { order_id: 14, customer_id: 1, order_date: '2026-08-02', status: 'delivered' },
    { order_id: 15, customer_id: 12, order_date: '2026-02-14', status: 'delivered' },
    { order_id: 16, customer_id: 6, order_date: '2026-08-18', status: 'shipped' },
    { order_id: 17, customer_id: 3, order_date: '2026-07-10', status: 'delivered' },
    // FIX 4: Disposable order for safe testing
    { order_id: 18, customer_id: 1, order_date: '2026-08-23', status: 'pending' },
  ],

  order_items: [
    { order_item_id: 1, order_id: 1, product_id: 1, quantity: 2, unit_price: 15.99 },
    { order_item_id: 2, order_id: 1, product_id: 4, quantity: 1, unit_price: 65.00 },
    { order_item_id: 3, order_id: 2, product_id: 6, quantity: 1, unit_price: 55.00 },
    { order_item_id: 4, order_id: 3, product_id: 7, quantity: 2, unit_price: 22.30 },
    { order_item_id: 5, order_id: 3, product_id: 10, quantity: 1, unit_price: 12.50 },
    { order_item_id: 6, order_id: 4, product_id: 16, quantity: 1, unit_price: 19.99 },
    { order_item_id: 7, order_id: 4, product_id: 18, quantity: 2, unit_price: 11.99 },
    { order_item_id: 8, order_id: 5, product_id: 21, quantity: 1, unit_price: 24.99 },
    { order_item_id: 9, order_id: 6, product_id: 17, quantity: 1, unit_price: 42.00 },
    { order_item_id: 10, order_id: 7, product_id: 11, quantity: 3, unit_price: 14.25 },
    { order_item_id: 11, order_id: 7, product_id: 12, quantity: 2, unit_price: 4.99 },
    { order_item_id: 12, order_id: 7, product_id: 13, quantity: 1, unit_price: 6.50 },
    { order_item_id: 13, order_id: 8, product_id: 22, quantity: 2, unit_price: 13.75 },
    { order_item_id: 14, order_id: 9, product_id: 14, quantity: 1, unit_price: 120.00 },
    { order_item_id: 15, order_id: 10, product_id: 1, quantity: 1, unit_price: 15.99 },
    { order_item_id: 16, order_id: 10, product_id: 5, quantity: 1, unit_price: 28.75 },
    { order_item_id: 17, order_id: 11, product_id: 1, quantity: 3, unit_price: 15.99 },
    { order_item_id: 18, order_id: 11, product_id: 4, quantity: 1, unit_price: 65.00 },
    { order_item_id: 19, order_id: 11, product_id: 26, quantity: 1, unit_price: 32.00 },
    { order_item_id: 20, order_id: 12, product_id: 23, quantity: 2, unit_price: 17.50 },
    { order_item_id: 21, order_id: 13, product_id: 24, quantity: 4, unit_price: 9.50 },
    { order_item_id: 22, order_id: 14, product_id: 2, quantity: 1, unit_price: 45.50 },
    { order_item_id: 23, order_id: 14, product_id: 6, quantity: 1, unit_price: 55.00 },
    { order_item_id: 24, order_id: 14, product_id: 4, quantity: 1, unit_price: 65.00 },
    { order_item_id: 25, order_id: 15, product_id: 15, quantity: 1, unit_price: 89.99 },
    { order_item_id: 26, order_id: 16, product_id: 20, quantity: 1, unit_price: 55.00 },
    { order_item_id: 27, order_id: 17, product_id: 8, quantity: 1, unit_price: 34.99 },
    { order_item_id: 28, order_id: 17, product_id: 10, quantity: 2, unit_price: 12.50 },
    { order_item_id: 29, order_id: 18, product_id: 5, quantity: 1, unit_price: 28.75 },
  ],

  payments: [
    { payment_id: 1, order_id: 1, amount: 96.98, payment_date: '2026-06-11', method: 'card' },
    { payment_id: 2, order_id: 3, amount: 57.10, payment_date: '2026-05-16', method: 'mobile banking' },
    { payment_id: 3, order_id: 4, amount: 43.97, payment_date: '2026-08-11', method: 'card' },
    { payment_id: 4, order_id: 5, amount: 24.99, payment_date: '2026-04-03', method: 'cash' },
    { payment_id: 5, order_id: 7, amount: 59.23, payment_date: '2026-07-06', method: 'card' },
    { payment_id: 6, order_id: 9, amount: 120.00, payment_date: '2026-03-21', method: 'mobile banking' },
    { payment_id: 7, order_id: 10, amount: 44.74, payment_date: '2026-05-29', method: 'card' },
    { payment_id: 8, order_id: 11, amount: 144.97, payment_date: '2026-07-31', method: 'card' },
    { payment_id: 9, order_id: 12, amount: 35.00, payment_date: '2026-06-26', method: 'cash' },
    { payment_id: 10, order_id: 14, amount: 165.50, payment_date: '2026-08-03', method: 'card' },
    { payment_id: 11, order_id: 15, amount: 89.99, payment_date: '2026-02-15', method: 'mobile banking' },
    { payment_id: 12, order_id: 16, amount: 55.00, payment_date: '2026-08-19', method: 'card' },
    { payment_id: 13, order_id: 17, amount: 59.99, payment_date: '2026-07-11', method: 'cash' },
  ],

  // Pedagogical tables for introductory concepts (Day 1)
  students: [
    { id: 1, name: 'Rahim', age: 21, department: 'CSE', city: 'Dhaka' },
    { id: 2, name: 'Karim', age: 22, department: 'EEE', city: 'Gazipur' },
    { id: 3, name: 'Ayesha', age: 20, department: 'CSE', city: 'Dhaka' },
    { id: 4, name: 'Sumaiya', age: 23, department: 'BBA', city: 'Chattogram' },
    { id: 5, name: 'Tanvir', age: 21, department: 'CSE', city: 'Rajshahi' },
  ],

  student_records: [
    { std_id: 1, std_nm: 'Rahim', std_age: 21, dept: 'CSE' },
    { std_id: 2, std_nm: 'Karim', std_age: 22, dept: 'EEE' },
    { std_id: 3, std_nm: 'Ayesha', std_age: 20, dept: 'CSE' },
    { std_id: 4, std_nm: 'Sumaiya', std_age: 23, dept: 'BBA' },
    { std_id: 5, std_nm: 'Tanvir', std_age: 21, dept: 'CSE' },
  ],

  reviews: [
    { review_id: 1, product_id: 1, customer_id: 1, rating: 5, comment: 'Great mouse, very comfortable to use.', created_at: '2026-07-15' },
    { review_id: 2, product_id: 2, customer_id: 2, rating: 4, comment: 'Solid sound quality for the price.', created_at: '2026-08-02' },
    { review_id: 3, product_id: 4, customer_id: 1, rating: 5, comment: 'The tactile feel on this keyboard is amazing.', created_at: '2026-06-20' },
    { review_id: 4, product_id: 6, customer_id: 3, rating: 5, comment: 'Heats up quickly and evenly.', created_at: '2026-07-11' },
    { review_id: 5, product_id: 7, customer_id: 4, rating: 4, comment: 'Beautiful mixing bowls, great finish.', created_at: '2026-08-12' },
    { review_id: 6, product_id: 10, customer_id: 3, rating: 4, comment: 'Very easy to use and keep knives sharp.', created_at: '2026-07-12' },
    { review_id: 7, product_id: 11, customer_id: 6, rating: 5, comment: 'Cleaned up my entire desk clutter.', created_at: '2026-07-08' },
    { review_id: 8, product_id: 14, customer_id: 8, rating: 5, comment: 'Extremely comfortable ergonomic chair.', created_at: '2026-03-25' },
    { review_id: 9, product_id: 16, customer_id: 4, rating: 4, comment: 'Good grip and cushioning for workouts.', created_at: '2026-08-14' },
    { review_id: 10, product_id: 18, customer_id: 4, rating: 5, comment: 'Durable resistance bands with good elasticity.', created_at: '2026-08-14' },
    { review_id: 11, product_id: 21, customer_id: 5, rating: 4, comment: 'Flexible and sturdy garden hose.', created_at: '2026-04-05' },
    { review_id: 12, product_id: 26, customer_id: 9, rating: 5, comment: 'Crisp audio and long battery life.', created_at: '2026-08-01' },
  ],

  // Teaching table for Day 30 (Schema Design & Normalization): the anti-pattern.
  // Facts are copied onto every line so learners can MEASURE redundancy, cause
  // update/delete anomalies, then design the normalized replacement themselves.
  // Constraints: 3 distinct product names, 3 distinct emails, order_id 1 appears
  // exactly once (the update-anomaly task mutates only that row).
  fat_orders: [
    { order_id: 1, customer_email: 'rafiul@example.com', product_name: 'Wireless Mouse', product_price: 15.99, quantity: 2 },
    { order_id: 2, customer_email: 'priya.akter@example.com', product_name: 'Wireless Mouse', product_price: 15.99, quantity: 5 },
    { order_id: 3, customer_email: 'kamal.h@example.com', product_name: 'Bluetooth Speaker', product_price: 45.50, quantity: 1 },
    { order_id: 4, customer_email: 'kamal.h@example.com', product_name: 'Stainless Steel Pan Set', product_price: 55.00, quantity: 2 },
  ],

  // Teaching tables for Day 30 concepts 4-5 (functional dependency -> 2NF/3NF).
  // Seed rows deliberately mirror the concept intro tables so the dependency
  // counts discussed in theory match what learners run live.
  combined_items: [
    { order_id: 1, product_id: 101, product_name: 'Wireless Mouse', product_price: 15.99, quantity: 2 },
    { order_id: 1, product_id: 102, product_name: 'Bluetooth Speaker', product_price: 45.50, quantity: 1 },
    { order_id: 2, product_id: 101, product_name: 'Wireless Mouse', product_price: 15.99, quantity: 5 },
  ],

  combined_orders: [
    { order_id: 1, customer_id: 10, customer_name: 'Rahim', customer_city: 'Dhaka' },
    { order_id: 2, customer_id: 10, customer_name: 'Rahim', customer_city: 'Dhaka' },
    { order_id: 3, customer_id: 11, customer_name: 'Karim', customer_city: 'Chattogram' },
  ],
};
