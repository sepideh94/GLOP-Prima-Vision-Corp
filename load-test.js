import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

const BASE_URL = __ENV.BASE_URL || 'http://51.21.16.8:8083';
const PASSWORD = __ENV.USER_PASSWORD || '12345678';
const ADMIN_EMAIL = __ENV.ADMIN_EMAIL || 'admincos@yopmail.com';
const ADMIN_PASSWORD = __ENV.ADMIN_PASSWORD || 'Admin@123';

const users = new SharedArray('users', function () {
  return [
    { role: 'spectator', email: 'sophie.martin@yopmail.com', password: PASSWORD },
    { role: 'spectator', email: 'karim.haddou@yopmail.com', password: PASSWORD },
    { role: 'spectator', email: 'claire.dubois@yopmail.com', password: PASSWORD },

    { role: 'athlete', email: 'emma.fournier@yopmail.com', password: PASSWORD },
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

    { role: 'volunteer', email: 'lea.bernard@yopmail.com', password: PASSWORD },
    { role: 'volunteer', email: 'mehdi.fares@yopmail.com', password: PASSWORD },
    { role: 'volunteer', email: 'julie.petit@yopmail.com', password: PASSWORD },

    { role: 'commissioner', email: 'amina.badji@yopmail.com', password: PASSWORD },
    { role: 'commissioner', email: 'thomas.mercier@yopmail.com', password: PASSWORD },

    { role: 'admin', email: ADMIN_EMAIL, password: ADMIN_PASSWORD },
  ];
});

export const options = {
  scenarios: {
    login_only_3000: {
      executor: 'shared-iterations',
      vus: 120,
      iterations: 3000,
      exec: 'loginOnly',
      maxDuration: '10m',
    },

    spectator_simple_500: {
      executor: 'shared-iterations',
      vus: 40,
      iterations: 500,
      exec: 'spectatorSimple',
      startTime: '2s',
      maxDuration: '10m',
    },

    athlete_simple_700: {
      executor: 'shared-iterations',
      vus: 50,
      iterations: 700,
      exec: 'athleteSimple',
      startTime: '4s',
      maxDuration: '10m',
    },

    volunteer_simple_200: {
      executor: 'shared-iterations',
      vus: 20,
      iterations: 200,
      exec: 'volunteerSimple',
      startTime: '6s',
      maxDuration: '10m',
    },

    commissioner_simple_200: {
      executor: 'shared-iterations',
      vus: 20,
      iterations: 200,
      exec: 'commissionerSimple',
      startTime: '8s',
      maxDuration: '10m',
    },

    admin_simple_400: {
      executor: 'shared-iterations',
      vus: 20,
      iterations: 400,
      exec: 'adminSimple',
      startTime: '10s',
      maxDuration: '10m',
    },
  },

  thresholds: {
    http_req_failed: ['rate<0.05'],
    checks: ['rate>0.95'],
    http_req_duration: ['p(95)<3000'],
  },
};

function pickUser(role) {
  const pool = users.filter((u) => u.role === role);
  return pool[Math.floor(Math.random() * pool.length)];
}

function jsonHeaders(token) {
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
  const res = http.post(`${BASE_URL}/api/auth/signin`, payload, jsonHeaders());

  check(res, {
    'signin ok': (r) => r.status === 200 || r.status === 201,
  });

  const token = extractToken(res);

  check(token, {
    'token ok': (t) => !!t,
  });

  return token;
}

function get(url, token) {
  const res = http.get(`${BASE_URL}${url}`, bearerHeaders(token));
  check(res, {
    [`GET ${url} ok`]: (r) => r.status === 200,
  });
  return res;
}

function pause() {
  sleep(Math.random() * 0.5 + 0.2);
}

export function loginOnly() {
  const roles = ['spectator', 'athlete', 'volunteer', 'commissioner', 'admin'];
  const role = roles[Math.floor(Math.random() * roles.length)];
  const u = pickUser(role);
  login(u.email, u.password);
  pause();
}

export function spectatorSimple() {
  const u = pickUser('spectator');
  const token = login(u.email, u.password);

  get('/api/events', token);
  get('/api/events/2001', token);
  get('/api/trials?competitionId=3001', token);
  get('/api/trials/7003', token);

  pause();
}

export function athleteSimple() {
  const u = pickUser('athlete');
  const token = login(u.email, u.password);

  get('/api/events', token);
  get('/api/trials?competitionId=3001', token);
  get('/api/trials/7001', token);
  get('/api/trials/7002', token);
  get('/api/athlete/competitions', token);

  pause();
}

export function volunteerSimple() {
  const u = pickUser('volunteer');
  const token = login(u.email, u.password);

  get('/api/events', token);
  get('/api/trials?competitionId=3002', token);
  get('/api/trials/7003', token);

  pause();
}

export function commissionerSimple() {
  const u = pickUser('commissioner');
  const token = login(u.email, u.password);

  get('/api/trials?competitionId=3001', token);
  get('/api/trials?competitionId=3002', token);
  get('/api/trials/7005', token);

  pause();
}

export function adminSimple() {
  const u = pickUser('admin');
  const token = login(u.email, u.password);

  get('/api/admin/competitions/3001', token);
  get('/api/admin/competitions/by-event/2001', token);
  get('/api/admin/sites', token);
  get('/api/rounds', token);

  pause();
}