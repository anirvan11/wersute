"""
RCB Ticket Monitor — BULLETPROOF EDITION v4 (false-alarm fixes)
================================================================
SETUP:
  pip install playwright requests
  playwright install chromium
  python rcb_ticket_monitor.py

Prevent Mac sleep (run once before starting):
  sudo pmset -c sleep 0    (on charger — recommended)
  sudo pmset -b sleep 0    (on battery)
  To undo later: sudo pmset -c sleep 5
"""

import time
import threading
import subprocess
import sys
import requests
import traceback
from datetime import datetime
from playwright.sync_api import sync_playwright

# ═══════════════════════════════════════════════════════════════
#  CONFIGURE
# ═══════════════════════════════════════════════════════════════

NTFY_TOPIC  = "rvb-tickets-anirvan"   # Your working ntfy topic
NTFY_BACKUP = ""                      # Second device topic — leave "" to skip

HEARTBEAT_EVERY_MINUTES = 60          # "Still alive" ping to your phone

# ═══════════════════════════════════════════════════════════════
#  URLs TO WATCH
# ═══════════════════════════════════════════════════════════════

URLS_TO_WATCH = [
    "https://shop.royalchallengers.com/ticket",
    "https://www.royalchallengers.com",
]

# ═══════════════════════════════════════════════════════════════
#  TRIGGER RULES
# ═══════════════════════════════════════════════════════════════

# Confirmed on the live page right now (2026-03-24).
# If ALL of these are absent → page has changed → investigate.
UNAVAILABLE_PHRASES = [
    "tickets not available",
    "please await further announcements",
    "not available yet",
    "coming soon",
]

# If ANY of these appear → tickets are confirmed live.
AVAILABLE_KEYWORDS = [
    "buy now",
    "book now",
    "book tickets",
    "add to cart",
    "select match",
    "select seats",
    "choose stand",
    "proceed to pay",
    "buy tickets",
    "get tickets",
    "on sale now",
    "tickets available",
    "tickets are live",
]

# If the page redirects to one of these → confirmed live.
BOOKING_URL_PATTERNS = [
    "/ticket/rcb",
    "/ticket/match",
    "bookmyshow",
    "ticketgenie",
    "insider.in",
    "district.zomato",
]

# Minimum characters the page body must contain to be considered
# a valid load (Playwright sometimes returns near-empty on first hit).
MIN_PAGE_LENGTH = 200

# ═══════════════════════════════════════════════════════════════

siren_active = False


def log(msg=""):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{ts}] {msg}", flush=True)


def play_siren():
    global siren_active
    siren_active = True
    sounds = ["/System/Library/Sounds/Sosumi.aiff",
              "/System/Library/Sounds/Basso.aiff"]
    i = 0
    while siren_active:
        try:
            subprocess.Popen(["afplay", sounds[i % 2]],
                             stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
            time.sleep(0.6)
            i += 1
        except Exception:
            sys.stdout.write("\a")
            sys.stdout.flush()
            time.sleep(0.5)


def start_siren():
    threading.Thread(target=play_siren, daemon=True).start()


def stop_siren():
    global siren_active
    siren_active = False


def send_notification(title, message, priority="urgent"):
    topics = [t for t in [NTFY_TOPIC, NTFY_BACKUP] if t]
    for topic in topics:
        try:
            title_safe = title.encode("utf-8").decode("latin-1", errors="replace")
            r = requests.post(
                f"https://ntfy.sh/{topic}",
                data=message.encode("utf-8"),
                headers={
                    "Title": title_safe,
                    "Priority": priority,
                    "Tags": "cricket,bell,rotating_light",
                    "Click": URLS_TO_WATCH[0],
                    "Content-Type": "text/plain; charset=utf-8",
                },
                timeout=10,
            )
            log(f"  ntfy [{topic}]: {'OK' if r.status_code == 200 else r.status_code}")
        except Exception as e:
            log(f"  ntfy [{topic}] FAILED: {e}")


def check_url(page, url):
    try:
        resp = page.goto(url, wait_until="domcontentloaded", timeout=20000)
        page.wait_for_timeout(1500)

        final_url   = page.url.lower()
        page_text   = page.inner_text("body").lower()
        http_status = resp.status if resp else 0
        page_loaded = len(page_text.strip()) >= MIN_PAGE_LENGTH

        url_redirected  = any(p in final_url for p in BOOKING_URL_PATTERNS)
        has_unavailable = any(p in page_text  for p in UNAVAILABLE_PHRASES)
        matched_kw      = next((k for k in AVAILABLE_KEYWORDS if k in page_text), None)
        site_down       = http_status >= 500

        return {
            "url":            url,
            "final_url":      final_url,
            "http_status":    http_status,
            "page_text":      page_text,
            "snippet":        page_text[:300],
            "page_loaded":    page_loaded,
            "url_redirected": url_redirected,
            "has_unavailable":has_unavailable,
            "matched_kw":     matched_kw,
            "site_down":      site_down,
            "error":          None,
        }
    except Exception as e:
        return {
            "url": url, "final_url": url, "http_status": 0,
            "page_text": "", "snippet": "", "page_loaded": False,
            "url_redirected": False, "has_unavailable": False,
            "matched_kw": None, "site_down": False, "error": str(e),
        }


def fire_alert(reason):
    log()
    log("*" * 62)
    log("  *** RCB TICKETS ARE LIVE — BUY NOW! ***")
    log(f"  Reason : {reason}")
    log(f"  URL    : {URLS_TO_WATCH[0]}")
    log("*" * 62)
    log()
    start_siren()
    for i in range(3):
        send_notification(
            "RCB TICKETS ARE LIVE! BUY NOW!",
            f"Tickets on sale! {reason}  Go to {URLS_TO_WATCH[0]} NOW!",
        )
        if i < 2:
            time.sleep(2)
    log("Press ENTER to silence the siren...")
    try:
        input()
    except Exception:
        pass
    stop_siren()
    log("Siren stopped. Continuing to monitor...\n")


def main():
    print("=" * 62)
    print("  RCB Ticket Monitor  —  BULLETPROOF EDITION v4")
    print("=" * 62)
    print(f"  Watching  : {len(URLS_TO_WATCH)} URLs, ~3-4s per full cycle")
    for u in URLS_TO_WATCH:
        print(f"    - {u}")
    print(f"  Notify    : ntfy.sh/{NTFY_TOPIC}")
    if NTFY_BACKUP:
        print(f"  Backup    : ntfy.sh/{NTFY_BACKUP}")
    print(f"  Heartbeat : every {HEARTBEAT_EVERY_MINUTES} min")
    print("=" * 62)
    print()
    print("  REMINDER: sudo pmset -c sleep 0   (prevents Mac sleep)")
    print()
    print("Launching headless Chromium...")

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        pages = []
        for _ in URLS_TO_WATCH:
            ctx = browser.new_context(user_agent=(
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/122.0.0.0 Safari/537.36"
            ))
            pages.append(ctx.new_page())

        log("Browser ready. Sending test notification...")
        send_notification(
            "RCB Monitor v4 Active",
            f"Watching {len(URLS_TO_WATCH)} URLs, ~3-4s cycle. "
            f"Heartbeat every {HEARTBEAT_EVERY_MINUTES}min. False-alarm fixes applied.",
            priority="default",
        )
        print()

        check_count        = 0
        consecutive_errors = 0
        site_down_count    = 0
        last_heartbeat     = datetime.now()

        # Per-URL state: track whether we've confirmed the "unavailable" phrase
        # was seen at least once. Prevents false alarm on first-load empty page.
        url_seen_unavailable = {url: False for url in URLS_TO_WATCH}

        while True:
            check_count += 1
            any_confirmed = False
            any_possibly  = False
            any_site_down = False
            alert_reason  = ""
            all_errors    = True

            for i, url in enumerate(URLS_TO_WATCH):
                result    = check_url(pages[i], url)
                short_url = url.replace("https://", "").replace("http://", "")
                prefix    = f"Check #{check_count} [{short_url}]"

                if result["error"]:
                    log(f"{prefix} ERROR: {result['error']}")
                    continue

                all_errors = False

                # Page didn't load properly — skip, don't trust
                if not result["page_loaded"]:
                    log(f"{prefix} WARNING: Page loaded empty/too short ({len(result['page_text'])} chars) — skipping this check")
                    continue

                # Track that we've seen the unavailable phrase at least once
                if result["has_unavailable"]:
                    url_seen_unavailable[url] = True

                # ── CONFIRMED: redirect to booking platform ──────────
                if result["url_redirected"]:
                    alert_reason  = f"Page redirected to: {result['final_url']}"
                    any_confirmed = True
                    log(f"{prefix} *** CONFIRMED LIVE — {alert_reason} ***")

                # ── CONFIRMED: buy/book keyword found ────────────────
                elif result["matched_kw"]:
                    alert_reason  = f"Keyword '{result['matched_kw']}' found on {short_url}"
                    any_confirmed = True
                    log(f"{prefix} *** CONFIRMED LIVE — {alert_reason} ***")
                    log(f"  Page snippet: {result['snippet'][:200]}")

                # ── SITE DOWN ────────────────────────────────────────
                elif result["site_down"]:
                    any_site_down = True
                    log(f"{prefix} SITE DOWN (HTTP {result['http_status']}) — possible ticket-rush surge!")

                # ── POSSIBLY CHANGED (only if we've confirmed unavailable before) ──
                elif (not result["has_unavailable"]
                      and url_seen_unavailable[url]):
                    # The "not available" text is gone AND we know it was there before
                    # — this is a real change worth investigating
                    any_possibly = True
                    log(f"{prefix} !! 'NOT AVAILABLE' TEXT DISAPPEARED — page changed. Snippet:")
                    log(f"  {result['snippet'][:250]}")

                # ── ALL CLEAR ────────────────────────────────────────
                else:
                    log(f"{prefix} Not available yet.")
                    # Uncomment to see exactly what the page says each check:
                    # log(f"  Snippet: {result['snippet'][:150]}")

            # ── Error tracking ───────────────────────────────────────
            if all_errors:
                consecutive_errors += 1
                if consecutive_errors == 10:
                    send_notification(
                        "RCB Monitor - Network Issue",
                        "10 checks failed in a row — check your internet connection!",
                        priority="high",
                    )
            else:
                consecutive_errors = 0

            # ── Site surge detection ──────────────────────────────────
            if any_site_down:
                site_down_count += 1
                if site_down_count == 3:
                    send_notification(
                        "RCB Site DOWN 3x — Tickets may have just dropped!",
                        f"Server errors 3 checks running. Often means ticket rush just started. CHECK MANUALLY: {URLS_TO_WATCH[0]}",
                        priority="urgent",
                    )
            else:
                site_down_count = 0

            # ── Fire alerts ───────────────────────────────────────────
            if any_confirmed:
                fire_alert(alert_reason)
                time.sleep(60)

            elif any_possibly:
                fire_alert("'Not available' text is GONE from page — verify manually!")
                time.sleep(30)

            # ── Heartbeat ─────────────────────────────────────────────
            mins_elapsed = (datetime.now() - last_heartbeat).seconds / 60
            if mins_elapsed >= HEARTBEAT_EVERY_MINUTES:
                send_notification(
                    f"RCB Monitor Alive — Check #{check_count}",
                    f"Still running. {check_count} checks done. No tickets as of {datetime.now().strftime('%H:%M')}.",
                    priority="min",
                )
                last_heartbeat = datetime.now()

            time.sleep(0)   # no extra sleep — render time (~1.5s x 2 URLs) is the natural throttle


if __name__ == "__main__":
    while True:
        try:
            main()
        except KeyboardInterrupt:
            stop_siren()
            print("\n\nMonitor stopped. Good luck!")
            sys.exit(0)
        except Exception as e:
            log(f"CRASH: {e}")
            log(traceback.format_exc())
            log("Auto-restarting in 15 seconds...")
            try:
                send_notification(
                    "RCB Monitor CRASHED - Restarting",
                    f"Error: {str(e)[:200]}. Restarting in 15s.",
                    priority="high",
                )
            except Exception:
                pass
            time.sleep(15)