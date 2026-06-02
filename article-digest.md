# Robison Karls — Proof Points & STAR Stories

## Executive Summary

Backend engineer with 13+ years shipping identity infrastructure and distributed systems at scale. 
Recent focus: architecting agent-native systems that increase team velocity without compromising 
quality. Hands-on experience integrating AI skills into production engineering workflows.

---

## Key Proof Points

### 1. Dayforce SDD (Spec-Driven Development) Framework — Agent-Native Systems at Production Scale

**What:** Integrated AI skills into Dayforce's core engineering workflow, connecting Jira user 
stories → GitHub code → AI agents → human review feedback loop.

**How:**
- Built specification layer: Jira user stories as AI-consumable specs (not just documentation)
- Automated planning layer: AI generates implementation tasks + architectural plans, customized 
  for company tech stack
- Customized GitHub SpecKit: Foundation framework adapted for Dayforce tooling ecosystem
- Business-context-aware PR review: Agent connects code changes back to user story intent, 
  validates business value added (not just code syntax)

**Result:** Measurable velocity increase, zero quality loss, production system in active use.

**Why it matters:** 
- Production-grade agent integration, not POC
- Multi-tool orchestration (Jira, GitHub, internal systems, AI)
- Business context awareness (the hard part)
- Proof that redesigning workflow around agents beats bolting them on top

**Relevant roles:** Platform Engineer, Distributed Systems Engineer, Strategic Projects

---

### 2. Identity Infrastructure at Scale (Dayforce)

**What:** Designed, built, and operated OAuth2/SAML/OIDC infrastructure serving millions of 
government and enterprise users.

**How:**
- Custom OAuth2 authorization server from scratch
- SAML federation for enterprise SSO
- OIDC integration for third-party services
- Multi-tenant identity management
- Government compliance (Canada/USA security posture)

**Result:** 
- Deployed to government pilots in Canada and USA
- 99.99% uptime during my tenure
- Zero identity-related security incidents
- Team grew from 2 to 5 engineers; mentored them to ownership

**Why it matters:** 
- Deep systems credibility (not just CRUD)
- Security-first mindset
- Production hardening experience
- Government-scale reliability discipline

**Relevant roles:** Senior Backend Engineer, Staff Engineer, Distributed Systems Engineer

---

### 3. Distributed Systems & Kubernetes Migrations

**What:** Led migration of monolithic systems to Kafka-based event streams and Kubernetes-
orchestrated microservices.

**How:**
- Kafka topic design for 10M+ events/day
- Blue-green deployment strategy for zero-downtime migration
- Kubernetes cluster design and operational runbooks
- Performance optimization (latency, throughput, cost)

**Result:**
- 3x throughput increase
- 40% cost savings (optimized resource utilization)
- Team confidence in production operations

**Why it matters:** 
- Scalability thinking (not just performance)
- Operational discipline
- Cross-team coordination
- Bottom-line impact (cost savings, reliability)

**Relevant roles:** Distributed Systems Engineer, Platform Engineer, Performance Engineer

---

### 4. GitHub Copilot Integration — career-ops

**What:** Led integration of GitHub Copilot into career-ops, an open-source job search platform. 
Built agentic workflows performing multi-step business reasoning (job evaluation, resume 
tailoring, LinkedIn strategy, application tracking).

**How:**
- Agentic workflow orchestration (Claude Code, GitHub Copilot)
- Multi-step reasoning: JD → evaluation → resume tailoring → PDF generation → tracker update
- Validation and security practices embedded in agent outputs
- CLI architecture designed for agent-driven tasks

**Result:**
- Reduced time-to-application from hours to minutes
- All generated materials maintained production quality
- Open-source adoption (multiple job seekers using framework)

**Why it matters:** 
- Validation of SDD framework at smaller scale
- Demonstrates ability to integrate agents into existing systems (not greenfield)
- Proof of responsible agent integration (validation, security, human review)

**Relevant roles:** Software Engineer, Platform thinking, agent-native systems

---

## STAR Stories (Interview Prep)

### Story 1: "Tell me about a time you maintained quality while increasing velocity."

**Situation:** Dayforce identity infrastructure team was a bottleneck. Adding more engineers 
didn't scale (deep domain expertise required). Pressure to ship faster without hiring.

**Task:** Increase development velocity on complex systems without sacrificing code quality or 
reliability.

**Action:** 
- Designed SDD framework integrating AI skills into Jira → GitHub workflow
- Built spec generation from user stories (AI reads requirements, generates tasks)
- Implemented business-context-aware PR review (agent understands user story intent)
- Added validation checkpoints at each stage

**Result:** Measurable velocity increase, zero regression in code quality metrics or uptime.

---

### Story 2: "Tell me about a challenge you overcame in a systems engineering project."

**Situation:** Migrating from monolithic service to Kafka + Kubernetes. 10M events/day, 
production traffic, zero downtime tolerance.

**Task:** Design migration strategy that doesn't disrupt customers.

**Action:**
- Built dual-write strategy (monolith → Kafka + legacy system in parallel)
- Implemented comprehensive observability (metrics, logs, traces)
- Blue-green deployment for zero-downtime cutover
- Post-cutover runbooks for ops team

**Result:** Clean migration, 3x throughput gain, zero incidents, ops team trained on new 
systems.

---

### Story 3: "Tell me about a time you led a team through ambiguity."

**Situation:** Moving from monolithic auth to federated OAuth2/SAML/OIDC. No clear standard 
in company. Multiple teams (frontend, backend, mobile, integrations) had different 
requirements.

**Task:** Design identity infrastructure that supports all use cases without over-engineering.

**Action:**
- Stakeholder interviews (all teams)
- Prototyped multiple approaches
- Settled on OAuth2 as core, SAML federation + OIDC for flexibility
- Documented decision (trade-offs, alternatives considered)
- Led rollout with per-team enablement sessions

**Result:** Adoption across all teams, zero security incidents, became standard for company.

---

## Technical Skills

**Systems Architecture:** Kubernetes, Kafka, microservices, distributed consensus, observability

**Languages:** Java (primary), Python, Rust, TypeScript, Go (learning)

**Infrastructure:** Kubernetes (AKS, GKE), Docker, CI/CD (GitHub Actions), Terraform, 
Prometheus/Grafana

**Identity:** OAuth2, SAML, OIDC, JWT, MFA

**AI/Agents:** GitHub Copilot, Claude, LLM integration, agentic workflows, production agent 
systems

---

## Negotiation Points

### Compensation
- Market data (Levels.fyi for Canada): Senior backend engineer in fintech/identity = 
  CAD $160K–$200K
- Apply range: CAD $170K–$200K (walk-away: CAD $160K)
- Go-market roles (e.g., Tailscale): Can command premium (remote, agent-native culture) = 
  CAD $200K+

### Location
- Primary: Fully remote (North America)
- Secondary: Hybrid/on-site in Calgary, Alberta (Cochrane area)

### Growth
- Want: Platform thinking + agent-native architecture = rare skill combination
- Avoid: Feature factory (CRUD, no architecture ownership)
- Seek: Teams shipping to millions of users, high-stakes infrastructure

---
