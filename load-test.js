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