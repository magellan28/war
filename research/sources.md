# Sources and fact status

Status of each fact: **confirmed** means two or more independent sources
agree. **Verify** means it is used with an on-screen qualifier and still
needs to be checked against a primary text in Stage 2.

> Environment note: in this session, WebSearch works but direct page fetches
> are blocked (nps.gov, ibiblio.org, history.navy.mil, archives.gov,
> loc.gov). The facts below come from search-result excerpts. Stage 2 needs
> these hosts allowed so the primary texts can be read in full.

## Sources

| ID | Source | Type |
|---|---|---|
| S1 | NHHC / U.S. Navy history, "Prelude to War: Japanese Strike Force Takes Aim at Pearl Harbor", usnhistory.navylive.dodlive.mil/Recent/Article/2686533 | official, secondary |
| S2 | WW2DB, "26 Nov 1941", ww2db.com/event/today/11/26/1941 | secondary |
| S3 | "Japanese battle orders for Pearl Harbor", worldwar2inreview.blogspot.com (2024-09) — reproduces the operation order | secondary, verify |
| S4 | National Park Service, "Remembering Pearl Harbor: Minute by Minute", nps.gov/perl/learn/historyculture/timeline.htm | official |
| S5 | National Park Service, "The Pearl Harbor Attack", nps.gov/articles/pearlattackww2.htm | official |
| S6 | Japanese Monograph No. 97 (Pearl Harbor operations), ibiblio.org/pha/monos/097 | primary (postwar Japanese account) — to read |
| S7 | NHHC, "The Pearl Harbor Attack, 7 December 1941" (cited in a National WWII Museum fact sheet) | official — to read |

## Facts used in the prototype

| Fact | Value on screen | Sources | Status |
|---|---|---|---|
| Strike force departs the Kurils | 26 Nov 1941 (Tokyo time); 25 Nov Hawaii time | S1, S2 | confirmed |
| Departure anchorage name | "Hitokappu Bay" (S1 calls it "Tankan Bay") | S1, S2 | confirmed (two names for the same anchorage) |
| Hitokappu Bay position | ≈ 44.95°N 147.65°E | geography | approximate (shown as a marker only) |
| Carriers in the force | 6 (Akagi, Kaga, Sōryū, Hiryū, Shōkaku, Zuikaku) | S1, S5 | confirmed |
| Planned standby point | 42°N 165°W | S3 | **verify** against S6/S7 |
| Track between the waypoints | curved schematic | — | **illustrative**, labelled "APPROXIMATE TRACK" |
| Launch area | "about 230 miles north of Oahu" (NPS); "slightly more than 200 miles" (NHHC) | S4, S1 | confirmed as a range; exact position not asserted |
| First-wave launch time | ≈ 06:00 Hawaii time | S4 | sources give 06:00–06:15 |
| First-wave size | 183 aircraft | S4, S5 | confirmed (most-cited figure) |
| Second-wave size | 167 (other sources give 168–171) | S4 | **disputed**, not shown yet |
| Opana radar detection | 07:02 | S4 | confirmed, not shown yet |
| First-wave attack begins | 07:48 (Kaneohe); 07:55 is also cited for Pearl Harbor | S4 | confirmed; screen shows 07:48 |

## Geodata

- Elevation and bathymetry: AWS Terrain Tiles ("terrarium"), drawn from SRTM, GMTED, ETOPO1, USGS NED and other open datasets. Attribution is required.
- Land polygons for Hawaii: OpenStreetMap via simonepri/geo-maps (ODbL). Credit: "© OpenStreetMap contributors".
- Coastlines at Pacific scale: Natural Earth 10m (public domain).
- **Known limitation:** the OSM polygons available offline are coarse (about 330 points for Oahu). Today's Pearl Harbor also differs from its 1941 shape because of dredging and landfill. The harbor close-ups in Chapter 6 need a hand-traced 1941 vector built from period charts (NHHC).
