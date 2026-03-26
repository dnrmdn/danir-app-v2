const http = require('http');

async function main() {
  // 1. Get payments
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/admin/payments?status=PENDING',
    method: 'GET'
  };

  const getReq = http.request(options, (res) => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => {
      try {
        const result = JSON.parse(body);
        const payments = result.data.payments;
        if (!payments || payments.length === 0) {
          console.log("No pending payments found via API");
          return;
        }

        const firstPending = payments[0];
        console.log("First pending payment ID:", firstPending.id);

        // 2. Patch payment
        const patchData = JSON.stringify({
          paymentId: firstPending.id,
          status: 'APPROVED'
        });

        const patchReq = http.request({
          hostname: 'localhost',
          port: 3000,
          path: '/api/admin/payments',
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Content-Length': patchData.length
          }
        }, (patchRes) => {
          let patchBody = '';
          patchRes.on('data', chunk => patchBody += chunk);
          patchRes.on('end', () => {
            console.log('PATCH STATUS:', patchRes.statusCode);
            console.log('PATCH BODY:', patchBody);
          });
        });

        patchReq.on('error', console.error);
        patchReq.write(patchData);
        patchReq.end();
      } catch (err) {
        console.error("Parse error:", err, "Body was:", body);
      }
    });
  });

  getReq.on('error', console.error);
  getReq.end();
}

main();
