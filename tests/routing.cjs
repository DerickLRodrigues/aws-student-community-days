const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const template = fs.readFileSync('infra/03-static-site.yaml', 'utf8');
const block = template.match(/FunctionCode: !Sub \|\r?\n([\s\S]*?)\r?\n  Distribution:/)[1];
const code = block.replace(/^        /gm, '').replaceAll('${DomainName}', 'awsstudentcommunitydays.com.br');
const context = vm.createContext({});
vm.runInContext(code, context);
function call(uri, host = 'preview.cloudfront.net', querystring = {}) {
  return context.handler({request: {uri, headers: {host: {value: host}}, querystring}});
}
assert.equal(call('/').uri, '/index.html');
assert.equal(call('/belo-horizonte/').uri, '/belo-horizonte/index.html');
assert.equal(call('/styles.css').uri, '/styles.css');
assert.equal(call('/.git/config').uri, '/.git/config');
assert.equal(call('/infra/deploy-config.json').uri, '/infra/deploy-config.json');
assert.equal(call('/belo-horizonte').statusCode, 301);
assert.equal(call('/belo-horizonte', undefined, {ano: {value: '2026'}}).headers.location.value,
  'https://preview.cloudfront.net/belo-horizonte/?ano=2026');
assert.equal(call('/belo-horizonte/', 'www.awsstudentcommunitydays.com.br', {q: {multiValue: [{value: 'a%20b'}, {value: 'c'}]}}).headers.location.value,
  'https://awsstudentcommunitydays.com.br/belo-horizonte/?q=a%20b&q=c');
assert.equal(call('//example.com/path').headers.location.value, 'https://preview.cloudfront.net//example.com/path/');
console.log('PASS: directory indexes, canonical host, query strings, hidden paths and redirect origin');
