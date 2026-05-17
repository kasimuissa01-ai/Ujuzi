import https from 'https';
import fs from 'fs';

const url = 'https://ais-pre-5sry5pmjh42x5ke5luyqrw-693099206806.europe-west2.run.app/';

https.get(url, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    fs.writeFileSync('index.html', data);
    console.log('Done fetching index.html');
  });
});
