# Changelog

All notable changes to this project will be documented in this file.

The format loosely follows Keep a Changelog, and this project currently starts with `v0.1.0`.

## [v0.1.0] - 2026-03-17

### Added

- Built the first complete `AI 微波炉` web app release for internal AI microcourse sharing
- Added a community-style homepage with archive pagination and a 16-card per page limit
- Added public no-login talk submission flow and a visual success feedback page
- Added archived microcourse detail pages with replay links, multiple material links, and related content
- Added a lightweight admin panel with separate `报名信息` and `历史活动` tabs
- Added archive ledger table view and CSV export for operations review
- Added dual admin authentication modes: `password` and `trusted_header`
- Added Prisma schema, seed data, one-click local startup script, and Docker support
- Added Playwright end-to-end coverage for main user and admin flows
- Added GitHub-facing release assets, README screenshots, release draft docs, and MIT license

### Notes

- Current default database is `SQLite`, suitable for demo and small-scale internal trial use
- Current version does not include mobile adaptation
