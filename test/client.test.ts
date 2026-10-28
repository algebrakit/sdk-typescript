import { after, before, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import type { AddressInfo } from 'node:net';
import { ApiClient, DEFAULT_BASE_URL, handleApiError } from '../src';

// A local server that records each request and answers with `nextResponse`
interface RecordedRequest {
  method?: string;
  url?: string;
  headers: http.IncomingHttpHeaders;
  body: unknown;
}

let server: http.Server;
let baseUrl: string;
let requests: RecordedRequest[] = [];
let nextResponse: { status: number; body: unknown; delayMs?: number } = { status: 200, body: {} };

before(async () => {
  server = http.createServer((req, res) => {
    let raw = '';
    req.on('data', chunk => (raw += chunk));
    req.on('end', () => {
      requests.push({ method: req.method, url: req.url, headers: req.headers, body: raw ? JSON.parse(raw) : undefined });
      setTimeout(() => {
        res.writeHead(nextResponse.status, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(nextResponse.body));
      }, nextResponse.delayMs ?? 0);
    });
  });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(() => {
  server.closeAllConnections();
  server.close();
});

beforeEach(() => {
  requests = [];
  nextResponse = { status: 200, body: {} };
});

test('uses the production API by default', () => {
  const client = new ApiClient({ apiKey: 'key' });
  assert.equal(DEFAULT_BASE_URL, 'https://api.algebrakit.com');
  assert.equal((client as any).axiosInstance.defaults.baseURL, DEFAULT_BASE_URL);
});

test('sends the API key with every request', async () => {
  await new ApiClient({ apiKey: 'test-key', baseUrl }).getSessionInfo({ sessionId: 's1' });
  assert.equal(requests[0].headers['x-api-key'], 'test-key');
  assert.match(String(requests[0].headers['content-type']), /application\/json/);
});

test('still accepts the (baseUrl, apiKey) constructor', async () => {
  await new ApiClient(baseUrl, 'legacy-key').getSessionInfo({ sessionId: 's1' });
  assert.equal(requests[0].headers['x-api-key'], 'legacy-key');
});

test('calls the right endpoint for each method', async () => {
  const client = new ApiClient({ apiKey: 'key', baseUrl });
  await client.createSession({ exercises: [{ exerciseId: 'e1' }] });
  await client.getSessionScore({ sessionId: 's1' });
  await client.lockSession({ action: 'LOCK', sessionIds: ['s1'] });
  await client.getSessionInfo({ sessionId: 's1' });
  await client.retrieveSession({ sessionIds: ['s1'] });
  await client.validateExercise({ exerciseId: 'e1' });
  await client.getExercisePublishedInfo({ id: 'e1' });

  assert.deepEqual(
    requests.map(r => `${r.method} ${r.url}`),
    [
      'POST /session/create',
      'POST /session/score',
      'POST /sessions/lock',
      'POST /session/info',
      'POST /session/retrieve',
      'POST /exercise/validate',
      'POST /exercise/published-info',
    ]
  );
});

test('createSession sends apiVersion 2 when it is not given', async () => {
  const client = new ApiClient({ apiKey: 'key', baseUrl });
  await client.createSession({ exercises: [{ exerciseId: 'e1', version: 'latest' }] });
  assert.deepEqual(requests[0].body, { apiVersion: 2, exercises: [{ exerciseId: 'e1', version: 'latest' }] });
});

test('errors include the message from the API', async () => {
  nextResponse = {
    status: 401,
    body: { success: false, error: 'Could not validate credentials: the provided api-key is not valid' },
  };
  const client = new ApiClient({ apiKey: 'wrong', baseUrl });

  await assert.rejects(client.getSessionInfo({ sessionId: 's1' }), (error: any) => {
    assert.equal(error.message, 'Algebrakit API error 401: Could not validate credentials: the provided api-key is not valid');
    assert.equal(error.response.status, 401); // still an AxiosError, so existing checks keep working
    assert.equal(
      handleApiError(error),
      'API Error: 401 - Could not validate credentials: the provided api-key is not valid'
    );
    return true;
  });
});

test('times out after the configured timeout', async () => {
  nextResponse = { status: 200, body: {}, delayMs: 300 };
  const client = new ApiClient({ apiKey: 'key', baseUrl, timeout: 50 });

  await assert.rejects(client.getSessionInfo({ sessionId: 's1' }), (error: unknown) => {
    assert.match(handleApiError(error), /^API Error: No response received from the server \(timeout of 50ms exceeded\)\.$/);
    return true;
  });
});

test('handleApiError handles errors that are not from the API', () => {
  assert.equal(handleApiError(new Error('something broke')), 'API Error: something broke');
  assert.equal(handleApiError('plain string'), 'API Error: plain string');
});
