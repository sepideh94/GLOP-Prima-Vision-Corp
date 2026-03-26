import http from 'k6/http';
import { check, sleep } from 'k6';
import { SharedArray } from 'k6/data';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:8083';
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
    s01_public_events: {
      executor: 'ramping-vus',
      exec: 's01_public_events',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 10 },
        { duration: '40s', target: 10 },
        { duration: '20s', target: 0 },
      ],
      tags: { scenario_name: '01_public_events' },
    },

    s02_public_event_detail: {
      executor: 'ramping-vus',
      exec: 's02_public_event_detail',
      startTime: '5s',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 8 },
        { duration: '40s', target: 8 },
        { duration: '20s', target: 0 },
      ],
      tags: { scenario_name: '02_public_event_detail' },
    },

    s03_public_trials_list: {
      executor: 'ramping-vus',
      exec: 's03_public_trials_list',
      startTime: '10s',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 8 },
        { duration: '40s', target: 8 },
        { duration: '20s', target: 0 },
      ],
      tags: { scenario_name: '03_public_trials_list' },
    },

    s04_public_trials_by_competition_3001: {
      executor: 'ramping-vus',
      exec: 's04_public_trials_by_competition_3001',
      startTime: '15s',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 8 },
        { duration: '40s', target: 8 },
        { duration: '20s', target: 0 },
      ],
      tags: { scenario_name: '04_public_trials_by_comp_3001' },
    },

    s05_public_trials_by_competition_3002: {
      executor: 'ramping-vus',
      exec: 's05_public_trials_by_competition_3002',
      startTime: '20s',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 8 },
        { duration: '40s', target: 8 },
        { duration: '20s', target: 0 },
      ],
      tags: { scenario_name: '05_public_trials_by_comp_3002' },
    },

    s06_public_trial_detail_7001: {
      executor: 'ramping-vus',
      exec: 's06_public_trial_detail_7001',
      startTime: '25s',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 6 },
        { duration: '40s', target: 6 },
        { duration: '20s', target: 0 },
      ],
      tags: { scenario_name: '06_public_trial_detail_7001' },
    },

    s07_public_trial_detail_7006: {
      executor: 'ramping-vus',
      exec: 's07_public_trial_detail_7006',
      startTime: '30s',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 6 },
        { duration: '40s', target: 6 },
        { duration: '20s', target: 0 },
      ],
      tags: { scenario_name: '07_public_trial_detail_7006' },
    },

    s08_login_spectator: {
      executor: 'ramping-vus',
      exec: 's08_login_spectator',
      startTime: '35s',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 5 },
        { duration: '40s', target: 5 },
        { duration: '20s', target: 0 },
      ],
      tags: { scenario_name: '08_login_spectator' },
    },

    s09_login_athlete: {
      executor: 'ramping-vus',
      exec: 's09_login_athlete',
      startTime: '40s',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 5 },
        { duration: '40s', target: 5 },
        { duration: '20s', target: 0 },
      ],
      tags: { scenario_name: '09_login_athlete' },
    },

    s10_login_commissioner: {
      executor: 'ramping-vus',
      exec: 's10_login_commissioner',
      startTime: '45s',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 4 },
        { duration: '40s', target: 4 },
        { duration: '20s', target: 0 },
      ],
      tags: { scenario_name: '10_login_commissioner' },
    },

    s11_login_admin: {
      executor: 'ramping-vus',
      exec: 's11_login_admin',
      startTime: '50s',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 3 },
        { duration: '40s', target: 3 },
        { duration: '20s', target: 0 },
      ],
      tags: { scenario_name: '11_login_admin' },
    },

    s12_spectator_browse_after_login: {
      executor: 'ramping-vus',
      exec: 's12_spectator_browse_after_login',
      startTime: '55s',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 5 },
        { duration: '40s', target: 5 },
        { duration: '20s', target: 0 },
      ],
      tags: { scenario_name: '12_spectator_browse' },
    },

    s13_athlete_view_trials: {
      executor: 'ramping-vus',
      exec: 's13_athlete_view_trials',
      startTime: '60s',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 5 },
        { duration: '40s', target: 5 },
        { duration: '20s', target: 0 },
      ],
      tags: { scenario_name: '13_athlete_view_trials' },
    },

    s14_athlete_view_results_flow: {
      executor: 'ramping-vus',
      exec: 's14_athlete_view_results_flow',
      startTime: '65s',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 5 },
        { duration: '40s', target: 5 },
        { duration: '20s', target: 0 },
      ],
      tags: { scenario_name: '14_athlete_results_flow' },
    },

    s15_volunteer_schedule_flow: {
      executor: 'ramping-vus',
      exec: 's15_volunteer_schedule_flow',
      startTime: '70s',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 4 },
        { duration: '40s', target: 4 },
        { duration: '20s', target: 0 },
      ],
      tags: { scenario_name: '15_volunteer_schedule' },
    },

    s16_commissioner_competitions: {
      executor: 'ramping-vus',
      exec: 's16_commissioner_competitions',
      startTime: '75s',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 4 },
        { duration: '40s', target: 4 },
        { duration: '20s', target: 0 },
      ],
      tags: { scenario_name: '16_commissioner_competitions' },
    },

    s17_admin_competition_detail: {
      executor: 'ramping-vus',
      exec: 's17_admin_competition_detail',
      startTime: '80s',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 3 },
        { duration: '40s', target: 3 },
        { duration: '20s', target: 0 },
      ],
      tags: { scenario_name: '17_admin_competition_detail' },
    },

    s18_admin_sites_rounds: {
      executor: 'ramping-vus',
      exec: 's18_admin_sites_rounds',
      startTime: '85s',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 3 },
        { duration: '40s', target: 3 },
        { duration: '20s', target: 0 },
      ],
      tags: { scenario_name: '18_admin_sites_rounds' },
    },

    s19_notifications_like_flow: {
      executor: 'ramping-vus',
      exec: 's19_notifications_like_flow',
      startTime: '90s',
      startVUs: 0,
      stages: [
        { duration: '20s', target: 5 },
        { duration: '40s', target: 5 },
        { duration: '20s', target: 0 },
      ],
      tags: { scenario_name: '19_notifications_like_flow' },
    },

    s20_mixed_user_journey: {
      executor: 'ramping-vus',
      exec: 's20_mixed_user_journey',
      startTime: '95s',
      startVUs: 0,
      stages: [
        { duration: '30s', target: 10 },
        { duration: '60s', target: 10 },
        { duration: '30s', target: 0 },
      ],
      tags: { scenario_name: '20_mixed_user_journey' },
    },
  },

  thresholds: {
    http_req_failed: ['rate<0.10'],
    http_req_duration: ['p(95)<2000'],
    checks: ['rate>0.90'],
  },
};

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

function pickUser(role) {
  const pool = users.filter((u) => u.role === role);
  return pool[Math.floor(Math.random() * pool.length)];
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
    'signin status ok': (r) => r.status === 200 || r.status === 201,
  });

  return extractToken(res);
}

function get(url, token) {
  const res = http.get(`${BASE_URL}${url}`, bearerHeaders(token));
  check(res, { [`GET ${url} ok`]: (r) => r.status < 400 });
  return res;
}

function think(min = 1, max = 3) {
  sleep(Math.random() * (max - min) + min);
}

/* 01 */
export function s01_public_events() {
  get('/api/events');
  think();
}

/* 02 */
export function s02_public_event_detail() {
  get('/api/events/2001');
  think();
}

/* 03 */
export function s03_public_trials_list() {
  get('/api/trials');
  think();
}

/* 04 */
export function s04_public_trials_by_competition_3001() {
  get('/api/trials?competitionId=3001');
  think();
}

/* 05 */
export function s05_public_trials_by_competition_3002() {
  get('/api/trials?competitionId=3002');
  think();
}

/* 06 */
export function s06_public_trial_detail_7001() {
  get('/api/trials/7001');
  think();
}

/* 07 */
export function s07_public_trial_detail_7006() {
  get('/api/trials/7006');
  think();
}

/* 08 */
export function s08_login_spectator() {
  const u = pickUser('spectator');
  login(u.email, u.password);
  think();
}

/* 09 */
export function s09_login_athlete() {
  const u = pickUser('athlete');
  login(u.email, u.password);
  think();
}

/* 10 */
export function s10_login_commissioner() {
  const u = pickUser('commissioner');
  login(u.email, u.password);
  think();
}

/* 11 */
export function s11_login_admin() {
  const u = pickUser('admin');
  login(u.email, u.password);
  think();
}

/* 12 */
export function s12_spectator_browse_after_login() {
  const u = pickUser('spectator');
  const token = login(u.email, u.password);
  get('/api/events', token);
  get('/api/events/2001', token);
  get('/api/trials?competitionId=3001', token);
  get('/api/trials/7003', token);
  think();
}

/* 13 */
export function s13_athlete_view_trials() {
  const u = pickUser('athlete');
  const token = login(u.email, u.password);
  get('/api/trials?competitionId=3001', token);
  get('/api/trials/7001', token);
  get('/api/trials/7002', token);
  think();
}

/* 14 */
export function s14_athlete_view_results_flow() {
  const u = pickUser('athlete');
  const token = login(u.email, u.password);
  get('/api/trials/7003', token);
  get('/api/trials/7004', token);
  get('/api/events/2001', token);
  think();
}

/* 15 */
export function s15_volunteer_schedule_flow() {
  const u = pickUser('volunteer');
  const token = login(u.email, u.password);
  get('/api/events', token);
  get('/api/trials?competitionId=3001', token);
  think();
}

/* 16 */
export function s16_commissioner_competitions() {
  const u = pickUser('commissioner');
  const token = login(u.email, u.password);
  get('/api/trials?competitionId=3001', token);
  get('/api/trials?competitionId=3002', token);
  get('/api/trials/7005', token);
  think();
}

/* 17 */
export function s17_admin_competition_detail() {
  const u = pickUser('admin');
  const token = login(u.email, u.password);
  get('/api/admin/competitions/3001', token);
  get('/api/admin/competitions/by-event/2001', token);
  think();
}

/* 18 */
export function s18_admin_sites_rounds() {
  const u = pickUser('admin');
  const token = login(u.email, u.password);
  get('/api/admin/sites', token);
  get('/api/admin/sites/1003', token);
  get('/api/rounds', token);
  get('/api/rounds/4002', token);
  think();
}

/* 19 */
export function s19_notifications_like_flow() {
  const u = pickUser('spectator');
  const token = login(u.email, u.password);
  get('/api/events', token);
  get('/api/trials/7006', token);
  get('/api/events/2001', token);
  think();
}

/* 20 */
export function s20_mixed_user_journey() {
  const roleOrder = ['spectator', 'athlete', 'volunteer', 'commissioner', 'admin'];
  const role = roleOrder[Math.floor(Math.random() * roleOrder.length)];
  const u = pickUser(role);
  const token = login(u.email, u.password);

  get('/api/events', token);
  get('/api/events/2001', token);

  if (role === 'admin') {
    get('/api/admin/competitions/3001', token);
    get('/api/admin/sites', token);
  } else if (role === 'commissioner') {
    get('/api/trials?competitionId=3001', token);
    get('/api/trials/7005', token);
  } else if (role === 'athlete') {
    get('/api/trials/7001', token);
    get('/api/trials/7003', token);
  } else {
    get('/api/trials?competitionId=3002', token);
    get('/api/trials/7006', token);
  }

  think(1, 2);
}