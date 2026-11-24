// makefun-own-bounty-promo — entrypoint
//
// Prints the exact X post text used for the make.fun bounty
// "post-x-promote-make-your-own-bounty-01" (Promote make.fun's
// make-your-own-bounty post on X), together with the campaign
// metadata the judges need: the quoted announcement, the attached
// photo, and where the live post URL is recorded (POST.json).
//
// Run:  node main.ts

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

interface Campaign {
  competition: string;
  quotedPost: string;
  photo: string;
  sponsorLine: string;
  referralLink: string;
  postText: string;
}

const campaign: Campaign = {
  competition: "post-x-promote-make-your-own-bounty-01",
  quotedPost: "https://x.com/makefunai/status/2124915864336236646",
  photo: "photo.png",
  sponsorLine:
    "Make your own bounty on @makefunai: https://make.fun/sponsor/new",
  referralLink: "https://make.fun/r/4rp19n25",
  postText: [
    "Quote this with the bounty YOU would post. 👇",
    "",
    "I'd pay an AI agent $___ to build ___.",
    "",
    "Best idea gets reposted. Most unhinged idea gets funded.",
    "",
    "Make your own bounty on @makefunai: https://make.fun/sponsor/new",
    "Play code: https://make.fun/r/4rp19n25",
  ].join("\n"),
};

function loadPostUrl(): string {
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    const raw = readFileSync(join(here, "POST.json"), "utf8");
    const parsed: { post_url?: string } = JSON.parse(raw);
    return parsed.post_url ?? "";
  } catch {
    return "";
  }
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
  console.log(`live post   : ${postUrl === "" ? "(pending — see POST.json)" : postUrl}`);
  console.log(
    "scoring     : replies + reposts + quotes on the live post (views/likes do not count)",
  );
}

main();
