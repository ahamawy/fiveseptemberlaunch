#!/usr/bin/env tsx

import { listJobs, runJob } from '@/lib/infrastructure/jobs';

async function main() {
  const [,, cmd, arg1] = process.argv;
  if (!cmd || cmd === 'list') {
    console.log('Available jobs:');
    for (const name of listJobs()) console.log('-', name);
    process.exit(0);
  }

  if (cmd === 'run') {
    if (!arg1) {
      console.error('Usage: tsx SCRIPTS/sync-jobs.ts run <job-name>');
      process.exit(1);
    }
    try {
      const res = await runJob(arg1);
      console.log(JSON.stringify(res, null, 2));
      process.exit(res.ok ? 0 : 1);
    } catch (e: any) {
      console.error('Job failed:', e?.message || e);
      process.exit(1);
    }
  }
}

main();


