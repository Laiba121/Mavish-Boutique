import fetch from 'node-fetch';

async function main() {
  try {
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email: 'admin@mehrma.com', password: 'Admin@1234'})
    });
    const loginTxt = await loginRes.text();
    console.log('LOGIN_STATUS', loginRes.status);
    console.log('LOGIN_BODY', loginTxt);
    if (!loginRes.ok) return;
    const token = JSON.parse(loginTxt).token;

    const productRes = await fetch('http://localhost:5000/api/products', {
      method: 'POST',
      headers: {'Content-Type': 'application/json', Authorization: `Bearer ${token}`},
      body: JSON.stringify({
        name: 'Test Product 123',
        description: 'Test desc',
        price: 100,
        category: '000000000000000000000000',
        images: ['/uploads/test.jpg']
      })
    });
    const productTxt = await productRes.text();
    console.log('PRODUCT_STATUS', productRes.status);
    console.log('PRODUCT_BODY', productTxt);
  } catch (err) {
    console.error('ERROR', err);
  }
}

main();