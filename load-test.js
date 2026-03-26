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
    login_only_30000: {
      executor: 'shared-iterations',
      vus: 200,
      iterations: 30000,
      exec: 'loginOnly',
      maxDuration: '60m',
    },

    spectator_simple_5000: {
      executor: 'shared-iterations',
      vus: 80,
      iterations: 5000,
      exec: 'spectatorSimple',
      startTime: '2s',
      maxDuration: '60m',
    },

    athlete_simple_7000: {
      executor: 'shared-iterations',
      vus: 100,
      iterations: 7000,
      exec: 'athleteSimple',
      startTime: '4s',
      maxDuration: '60m',
    },

    volunteer_simple_2000: {
      executor: 'shared-iterations',
      vus: 40,
      iterations: 2000,
      exec: 'volunteerSimple',
      startTime: '6s',
      maxDuration: '60m',
    },

    commissioner_simple_2000: {
      executor: 'shared-iterations',
      vus: 40,
      iterations: 2000,
      exec: 'commissionerSimple',
      startTime: '8s',
      maxDuration: '60m',
    },

    admin_simple_4000: {
      executor: 'shared-iterations',
      vus: 40,
      iterations: 4000,
      exec: 'adminSimple',
      startTime: '10s',
      maxDuration: '60m',
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
    'signin ok': (r) => r.status === 200 || r.status === 201,
  });

  const token = extractToken(res);

  check(token, {
    'token ok': (t) => !!t,
  });

  return token;
}

function get(url, token, expected = [200]) {
  const res = http.get(`${BASE_URL}${url}`, bearerHeaders(token));
  check(res, {
    [`${url} ok`]: (r) => expected.includes(r.status),
  });
  return res;
}

function pause() {
  sleep(Math.random() * 0.4 + 0.1);
}

// 30,000 logins
export function loginOnly() {
  const roleList = ['spectator', 'athlete', 'volunteer', 'commissioner', 'admin'];
  const role = roleList[Math.floor(Math.random() * roleList.length)];
  const u = pickUser(role);
  login(u.email, u.password);
  pause();
}

// 20,000 simple scenarios
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
  get('/api/athlete/competitions', token, [200]);

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