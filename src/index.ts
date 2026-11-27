import { randomUUID } from "node:crypto";
import { setTimeout as sleep } from "node:timers/promises";

type JobStatus = "pending" | "processing" | "completed" | "failed";

interface Job {
  id: string;
  type: string;
  payload: {
    message: string;
  };
  status: JobStatus;
  createdAt: Date;
}
const queue: Job[] = [];

function enqueue(type: string, message: string): Job {
  const job: Job = {
    id: randomUUID(),
    type,
    payload: { message },
    status: "pending",
    createdAt: new Date(),
  };

  queue.push(job);

  console.log(`[QUEUED] ${job.id}`);

  return job;
}

function dequeue(): Job | undefined {
  return queue.shift();
}


async function executeJob(job: Job): Promise<void> {
  console.log(`[EXECUTING] ${job.type}`);

  await sleep(2000);

  console.log(job.payload.message);
}


async function processNextJob(): Promise<boolean> {
  const job = dequeue();

  if (!job) {
    return false;
  }

  job.status = "processing";

  console.log(`[PROCESSING] ${job.id}`);

  try {
    await executeJob(job);

    job.status = "completed";

    console.log(`[COMPLETED] ${job.id}`);
  } catch (error) {
    job.status = "failed";

    console.error(`[FAILED] ${job.id}`, error);
  }

  return true;
}

async function main(): Promise<void> {
  enqueue("send_email", "Welcome email sent");
  enqueue("generate_invoice", "Invoice generated");
  enqueue("send_notification", "Notification sent");

  console.log("\nWorker started\n");

  while (await processNextJob()) {
    // Continue until the queue is empty.
  }

  console.log("\nAll queued jobs attempted");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
