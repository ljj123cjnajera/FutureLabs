const fetch = require('node-fetch');

async function verifyOrder() {
    const baseURL = 'http://localhost:3000/api';

    try {
        // 1. Login to get token
        console.log('🔑 Logging in...');
        const loginRes = await fetch(`${baseURL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'admin@futurelabs.com',
                password: 'admin123'
            })
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status}`);
        const loginData = await loginRes.json();
        const token = loginData.token || loginData.data?.token;

        if (!token) throw new Error('No token received');
        console.log('✅ Logged in successfully');

        // 2. Add item to cart (ensure cart is not empty)
        console.log('🛒 Adding item to cart...');
        const productsRes = await fetch(`${baseURL}/products?limit=1`);
        const productsData = await productsRes.json();
        console.log('Products response:', JSON.stringify(productsData, null, 2));

        const product = productsData.data && (Array.isArray(productsData.data) ? productsData.data[0] : productsData.data.products[0]);
        if (!product) throw new Error('No products found');
        const productId = product.id;

        await fetch(`${baseURL}/cart`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ product_id: productId, quantity: 1 })
        });
        console.log('✅ Item added to cart');

        // 3. Create Order (Cash)
        console.log('💳 Creating Cash Order...');
        const orderRes = await fetch(`${baseURL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                shipping_address: 'Av. Test 123',
                shipping_city: 'Lima',
                shipping_country: 'Peru',
                shipping_phone: '999999999',
                shipping_full_name: 'Test User',
                shipping_email: 'test@example.com',
                payment_method: 'cash',
                shipping_cost: 10
            })
        });

        const orderData = await orderRes.json();
        if (!orderRes.ok) {
            console.error('❌ Order failed:', JSON.stringify(orderData, null, 2));
        } else {
            console.log('✅ Order created successfully:', orderData.data.order.order_number);
            console.log('Status:', orderData.data.order.status);
        }

    } catch (error) {
        console.error('❌ Verification failed:', error.message);
    }
}

verifyOrder();
