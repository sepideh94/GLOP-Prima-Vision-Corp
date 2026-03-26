import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

const BASE_URL = __ENV.BASE_URL || 'http://51.21.16.8:8083';
const PASSWORD = __ENV.USER_PASSWORD || '12345678';
const ADMIN_EMAIL = __ENV.ADMIN_EMAIL || 'admincos@yopmail.com';
const ADMIN_PASSWORD = __ENV.ADMIN_PASSWORD || 'Admin@123';

const users = new SharedArray('users', function () {
  return [
    { role: 'commissioner', email: 'amina.badji@yopmail.com', password: PASSWORD },
    { role: 'commissioner', email: 'thomas.mercier@yopmail.com', password: PASSWORD },

    { role: 'volunteer', email: 'lea.bernard@yopmail.com', password: PASSWORD },
    { role: 'volunteer', email: 'mehdi.fares@yopmail.com', password: PASSWORD },
    { role: 'volunteer', email: 'julie.petit@yopmail.com', password: PASSWORD },

    { role: 'athlete', email: 'lina.haddad@yopmail.com', password: PASSWORD },
    { role: 'athlete', email: 'nora.azizi@yopmail.com', password: PASSWORD },
    { role: 'athlete', email: 'ines.benali@yopmail.com', password: PASSWORD },
    { role: 'athlete', email: 'sarah.abbas@yopmail.com', password: PASSWORD },
    { role: 'athlete', email: 'camille.moreau@yopmail.com', password: PASSWORD },
    { role: 'athlete', email: 'zoe.laurent@yopmail.com', password: PASSWORD },
    { role: 'athlete', email: 'yanis.cherif@yopmail.com', password: PASSWORD },
    { role: 'athlete', email: 'adam.rahimi@yopmail.com', password: PASSWORD },
    { role: 'athlete', email: 'louis.perrin@yopmail.com', password: PASSWORD },
    { role: 'athlete', email: 'hugo.martin@yopmail.com', password: PASSWORD },
    { role: 'athlete', email: 'noa.diallo@yopmail.com', password: PASSWORD },
    { role: 'athlete', email: 'lena.rossi@yopmail.com', password: PASSWORD },
    { role: 'athlete', email: 'rayan.kaci@yopmail.com', password: PASSWORD },
    { role: 'athlete', email: 'emma.fournier@yopmail.com', password: PASSWORD },

    { role: 'spectator', email: 'sophie.martin@yopmail.com', password: PASSWORD },
    { role: 'spectator', email: 'karim.haddou@yopmail.com', password: PASSWORD },
    { role: 'spectator', email: 'claire.dubois@yopmail.com', password: PASSWORD },

    { role: 'admin', email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  ];
});

export const options = {
  scenarios: {
    spectator_flow: {
      executor: 'shared-iterations',
      vus: 30,
      iterations: 300,
      exec: 'spectatorFlow',
      maxDuration: '10m',
    },
    athlete_flow: {
      executor: 'shared-iterations',
      vus: 40,
      iterations: 400,
      exec: 'athleteFlow',
      startTime: '3s',
      maxDuration: '10m',
    },
    volunteer_flow: {
      executor: 'shared-iterations',
      vus: 15,
      iterations: 100,
      exec: 'volunteerFlow',
      startTime: '6s',
      maxDuration: '10m',
    },
    commissioner_flow: {
      executor: 'shared-iterations',
      vus: 10,
      iterations: 100,
      exec: 'commissionerFlow',
      startTime: '9s',
      maxDuration: '10m',
    },
    admin_flow: {
      executor: 'shared-iterations',
      vus: 8,
      iterations: 100,
      exec: 'adminFlow',
      startTime: '12s',
      maxDuration: '10m',
    },
  },
  thresholds: {
    http_req_failed: ['rate<0.15'],
    http_req_duration: ['p(95)<3000'],
    checks: ['rate>0.85'],
  },
};

function pickUser(role) {
  const pool = users.filter((u) => u.role === role);
  return pool[Math.floor(Math.random() * pool.length)];
}

function authHeaders(token) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return { headers };
}

function bearerHeaders(token) {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  return { headers };
}

function extractToken(res) {
  try {
    const body = res.json();
    return (
      body.token ||
      body.jwt ||
      body.accessToken ||
      body.access_token ||
      body.authenticationToken ||
      body.data?.token ||
      body.data?.accessToken ||
      null
    );
  } catch (e) {
    return null;
  }
}

function login(email, password) {
  const payload = JSON.stringify({ email, password });
  const res = http.post(`${BASE_URL}/api/auth/signin`, payload, authHeaders());

  check(res, {
    'signin status ok': (r) => r.status === 200 || r.status === 201,
  });

  const token = extractToken(res);

  check(token, {
    'token extracted': (t) => !!t,
  });

  return token;
}

function get(url, token, expectedStatuses = [200]) {
  const res = http.get(`${BASE_URL}${url}`, bearerHeaders(token));
  check(res, {
    [`GET ${url} status ok`]: (r) => expectedStatuses.includes(r.status),
  });
  return res;
}

function think(min = 0.3, max = 1.2) {
  sleep(Math.random() * (max - min) + min);
}

// ---------- FLOWS ----------

export function spectatorFlow() {
  const u = pickUser('spectator');
  const token = login(u.email, u.password);

  get('/api/events', token);
  think();

  get('/api/events/2001', token);
  think();

  get('/api/trials?competitionId=3001', token);
  think();

  get('/api/trials/7003', token);
  think();

  // notifications / user routes si déjà dispo dans ton app
  get('/api/notifications', token, [200, 204, 403]);
  think();

  get('/api/user', token, [200, 403]);
  think();
}

export function athleteFlow() {
  const u = pickUser('athlete');
  const token = login(u.email, u.password);

  get('/api/events', token);
  think();

  get('/api/trials?competitionId=3001', token);
  think();

  get('/api/trials/7001', token);
  think();

  get('/api/trials/7002', token);
  think();

  // mes competitions / profil athlete si déjà présent
  get('/api/athlete/competitions', token, [200, 403, 404]);
  think();

  get('/api/user', token, [200, 403]);
  think();
}

export function volunteerFlow() {
  const u = pickUser('volunteer');
  const token = login(u.email, u.password);

  get('/api/events', token);
  think();

  get('/api/trials?competitionId=3002', token);
  think();

  get('/api/schedule', token, [200, 403, 404]);
  think();

  get('/api/user', token, [200, 403]);
  think();
}

export function commissionerFlow() {
  const u = pickUser('commissioner');
  const token = login(u.email, u.password);

  get('/api/trials?competitionId=3001', token);
  think();

  get('/api/trials?competitionId=3002', token);
  think();

  get('/api/trials/7005', token);
  think();

  get('/api/commissioner', token, [200, 403, 404]);
  think();

  get('/api/user', token, [200, 403]);
  think();
}

export function adminFlow() {
  const u = pickUser('admin');
  const token = login(u.email, u.password);

  get('/api/admin/competitions/3001', token);
  think();

  get('/api/admin/competitions/by-event/2001', token);
  think();

  get('/api/admin/sites', token);
  think();

  get('/api/rounds', token);
  think();

  get('/api/user', token, [200, 403]);
  think();
}