# Finalization Checklist

- [ ] **P0: Security & Backend Hardening**
    - [ ] Install `helmet` and `express-rate-limit`
    - [ ] Implement Security Middleware in `backend/index.js`
    - [ ] Add strict input validation for `/api/submit`
    - [ ] Sanitize API responses
- [ ] **P1: Performance & Efficiency**
    - [ ] Implement simple in-memory caching for Google Sheets data
    - [ ] Optimize Dashboard chart computations (Memoization)
    - [ ] Add `will-change: transform` to Background Paws for GPU acceleration
- [ ] **P2: UI/UX & Reliability**
    - [ ] Add Skeleton Loaders for initial Dashboard mount
    - [ ] Add "Empty States" for all chart views
    - [ ] Improve Mobile responsiveness for Dashboard sidebar
- [ ] **P3: Documentation & Portfolio**
    - [ ] Generate professional `README.md`
    - [ ] Cleanup `.env.example` files
- [ ] **Final Standing-Out Features**
    - [ ] Implement "Export as PDF" for reports
