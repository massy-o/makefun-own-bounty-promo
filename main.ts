// makefun-own-bounty-promo — entrypoint
//
// Prints the exact X post text used for the make.fun bounty
// "post-x-promote-make-your-own-bounty-01" (Promote make.fun's
// make-your-own-bounty post on X), together with the campaign
// metadata the judges need: the quoted announcement, the attached
// photo, and where the live post URL is recorded (POST.json).
//
// Run:  node main.ts

import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

interface Campaign {
  competition: string;
  quotedPost: string;
  photo: string;
  sponsorLine: string;
  referralLink: string;
  playCode: string;
  postText: string;
}

const campaign: Campaign = {
  competition: "post-x-promote-make-your-own-bounty-01",
  quotedPost: "https://x.com/makefunai/status/2124915864336236646",
  photo: "photo.png",
  sponsorLine:
    "Make your own bounty on @makefunai: https://make.fun/sponsor/new",
  referralLink: "https://make.fun/r/4rp19n25",
  playCode: "makefun-magnolia-muffin-crumpet",
  postText: [
    "Quote this with the bounty YOU would post. 👇",
    "",
    "I'd pay an AI agent $___ to build ___.",
    "",
    "Best idea gets reposted. Most unhinged idea gets funded.",
    "",
    "Make your own bounty on @makefunai: https://make.fun/sponsor/new",
    "Play code: makefun-magnolia-muffin-crumpet",
  ].join("\n"),
};

function loadPostUrl(): string {
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    const raw = readFileSync(join(here, "POST.json"), "utf8");
    const parsed: { url?: string } = JSON.parse(raw);
    return parsed.url ?? "";
  } catch {
    return "";
  }
}

interface Check {
  label: string;
  ok: boolean;
  detail: string;
}

function validateEntry(postUrl: string): Check[] {
  const here = dirname(fileURLToPath(import.meta.url));
  const checks: Check[] = [];

  // POST.json must use the {"url": ...} schema the entry_link check expects;
  // the legacy {"post_url": ...} shape is rejected.
  let schemaOk = false;
  let schemaDetail = "POST.json unreadable";
  try {
    const raw = readFileSync(join(here, "POST.json"), "utf8");
    const parsed: Record<string, unknown> = JSON.parse(raw);
    const keys = Object.keys(parsed);
    schemaOk = keys.length === 1 && keys[0] === "url";
    schemaDetail = schemaOk
      ? 'keys: ["url"]'
      : `keys: [${keys.join(", ")}] (legacy "post_url" is rejected)`;
  } catch (err) {
    schemaDetail = `POST.json unreadable: ${(err as Error).message}`;
  }
  checks.push({ label: "POST.json schema", ok: schemaOk, detail: schemaDetail });

  const urlOk = /^https:\/\/x\.com\/[A-Za-z0-9_]+\/status\/\d+$/.test(postUrl);
  checks.push({
    label: "live post URL shape",
    ok: urlOk,
    detail: urlOk ? postUrl : "missing or not an x.com status URL",
  });

  const sponsorOk = campaign.postText.includes(campaign.sponsorLine);
  checks.push({
    label: "sponsor line in post text",
    ok: sponsorOk,
    detail: sponsorOk ? campaign.sponsorLine : "sponsor line missing",
  });

  // The post text must carry this account's play code; a referral URL in the
  // "Play code:" line does not count and fails the entry_link check.
  const playCodeLine = `Play code: ${campaign.playCode}`;
  const playCodeOk =
    campaign.postText.includes(playCodeLine) &&
    !campaign.postText.includes("Play code: https://make.fun/r/");
  checks.push({
    label: "play code in post text",
    ok: playCodeOk,
    detail: playCodeOk
      ? playCodeLine
      : "post text must carry the play code, not a referral URL",
  });

  const photoOk = existsSync(join(here, campaign.photo));
  checks.push({
    label: "photo present",
    ok: photoOk,
    detail: photoOk ? campaign.photo : `${campaign.photo} not found`,
  });

  return checks;
}

function main(): void {
  const postUrl = loadPostUrl();
  console.log("=== X post text ===");
  console.log(campaign.postText);
  console.log("");
  console.log("=== Campaign metadata ===");
  console.log(`competition : ${campaign.competition}`);
  console.log(`quotes      : ${campaign.quotedPost}`);
  console.log(`photo       : ${campaign.photo}`);
  console.log(`sponsor line: ${campaign.sponsorLine}`);
  console.log(`referral    : ${campaign.referralLink}`);
  console.log(`play code   : ${campaign.playCode}`);
  console.log(`live post   : ${postUrl === "" ? "(pending — see POST.json)" : postUrl}`);
  console.log(
    "scoring     : replies + reposts + quotes on the live post (views/likes do not count)",
  );
  console.log("");
  console.log("=== Pre-submit checklist ===");
  const checks = validateEntry(postUrl);
  for (const check of checks) {
    console.log(`${check.ok ? "✓" : "✗"} ${check.label} — ${check.detail}`);
  }
  if (checks.some((check) => !check.ok)) {
    console.error("checklist failed: fix the ✗ items before submitting");
    process.exitCode = 1;
  }
}

main();
