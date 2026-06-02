════════════════════════════════════════════════════════════════════════════════
RBC STAFF AI ENGINEER — APPLICATION DRAFT
════════════════════════════════════════════════════════════════════════════════

COMPANY: Royal Bank of Canada (RBC Borealis)
ROLE: Staff AI Engineer (AI Engineering Lead)
LOCATION: Calgary, Alberta, Canada
SCORE: 4.6/5.0 — EXCEPTIONAL MATCH

APPLY IMMEDIATELY after filling in these answers.

════════════════════════════════════════════════════════════════════════════════

LIKELY FORM QUESTIONS (RBC ATS):

════════════════════════════════════════════════════════════════════════════════

1. "Tell us about your experience designing agentic AI systems."
───────────────────────────────────────────────────────────────────────────────

COPY-PASTE READY:

I've designed and deployed production-grade agentic AI systems at Dayforce. Most recently, 
I architected an SDD (Spec-Driven Development) framework that integrates AI agents 
directly into the feature development pipeline. Here's how it works:

The framework has four integrated layers:
• Specification Layer: AI transforms Jira user stories into machine-consumable specs 
  (no more ad-hoc prompts)
• Planning Layer: AI decomposes specs into implementation tasks and generates architecture 
  plans, automatically tailored to our tech stack
• Development Layer: Developers use Copilot skills integrated with Jira, GitHub, Everest, 
  and Figma via MCP connections—context flows seamlessly without leaving the IDE
• Review Layer: The most critical part—AI-powered PR review that understands *business 
  intent*. The agent reads the user story, understands what we're trying to solve, and 
  validates whether code changes actually deliver that value. This catches logic errors, 
  missed edge cases, and contract violations before a human reviewer sees it.

The result: measurable team velocity increase with zero regression in code quality or 
uptime. This is production-grade agent integration—the framework handles the full 
feature lifecycle from story creation through production deployment, with all 
agent decisions validated by human review gates.

This is exactly the kind of systems architecture you're seeking: agents designed for 
enterprise scale, with clear standards and best practices that teams can build on top of.

════════════════════════════════════════════════════════════════════════════════

2. "Describe your experience with distributed systems at scale."
───────────────────────────────────────────────────────────────────────────────

COPY-PASTE READY:

I've designed and deployed distributed systems to production at massive scale. Recent 
example: migrating a monolithic service to Kafka + Kubernetes handling 10M+ events 
per day, zero downtime allowed.

Challenge: Throughput was a bottleneck; system couldn't grow. Relocation to different 
tech stack was risky with live traffic.

Approach:
• Dual-write strategy: system wrote to both legacy monolith AND new Kafka pipeline 
  in parallel (hedging bets during transition)
• Comprehensive observability: metrics, logs, traces across both systems so we could 
  see divergence in real-time
• Blue-green deployment: gradual traffic shift from old to new system with instant rollback
• Post-cutover runbooks: ops team trained on new systems before going live

Result: Clean migration, 3x throughput gain, zero incidents, team confident in the 
new infrastructure. This taught me how to move fast on high-stakes infrastructure 
without creating risk—exactly what you need for agent-native AI systems at scale.

Additional expertise: Kubernetes cluster design, Helm deployment automation, Kafka 
topic design for high-volume pipelines, event-driven patterns, distributed consensus 
problems.

════════════════════════════════════════════════════════════════════════════════

3. "Why are you interested in RBC Borealis and this role?"
───────────────────────────────────────────────────────────────────────────────

COPY-PASTE READY:

Two reasons:

First, mission alignment. You're explicitly building agentic AI systems and LLM 
integration pipelines—the exact work I've been architecting at Dayforce. Most companies 
say they want AI, but RBC is actually investing in the infrastructure and standards 
required for *production-grade* AI at enterprise scale. That's rare and valuable.

Second, infrastructure thinking. The best AI systems aren't just better prompts—they're 
systems designed from the ground up to work *with* agents. Your job description asks 
for "best practices and standards for AI systems architecture, including agent 
frameworks"—that's what I built at Dayforce with the SDD framework. I don't just use 
agents; I architect the systems that let others use them safely and at scale.

I'm excited about helping RBC define what agent-native, business-aware AI infrastructure 
looks like at a Fortune 500 company. Your research access, your datasets, your compute 
resources—those are the conditions you need to build something genuinely innovative.

════════════════════════════════════════════════════════════════════════════════

4. "Tell us about your Python experience."
───────────────────────────────────────────────────────────────────────────────

COPY-PASTE READY:

Python isn't my primary language (Java is), but I've shipped production Python code 
at scale. Examples:

• At TrillaBit: Built LLM-powered multi-agent orchestration platform in Python using 
  LangChain. Designed coordinator agents that spawn specialized sub-agents for dataset 
  discovery, query execution, and insight generation. Integrated with heterogeneous data 
  stores (ClickHouse, MySQL, Snowflake). This was live, production system handling 
  real user queries.

• At Dayforce: Designed anti-fraud ML classifier using scikit-learn, trained on network 
  telemetry and user behavior features. End-to-end: data pipeline, model training, 
  inference, monitoring.

• General: Data engineering workflows, infrastructure automation, notebook prototyping.

My track record across languages (Java, Python, Rust, TypeScript, C#) tells me the 
language is secondary to systems thinking. Python's philosophy—simple, pragmatic, 
production-focused—resonates with me. I'm comfortable with Python and can ramp quickly 
on LangChain/LangGraph given my agent orchestration background.

════════════════════════════════════════════════════════════════════════════════

5. "What experience do you have with cloud infrastructure (AWS/Azure)?"
───────────────────────────────────────────────────────────────────────────────

COPY-PASTE READY:

13+ years working across AWS and Azure:

Azure (primary at recent roles):
• Azure DevOps: built CI/CD pipelines, automated builds and deployments
• Azure App Services, Azure Functions for containerized workloads
• VPNs, private endpoints, security hardening
• Azure managed databases (SQL Server, PostgreSQL)

AWS (earlier experience):
• CloudFormation infrastructure-as-code
• EC2 instance management, load balancers, auto-scaling
• CloudWatch monitoring and alerting

Kubernetes (both clouds):
• AKS (Azure Kubernetes Service): multi-region deployments, regional routing, active/passive setups
• GKE (Google Cloud): used on TrillaBit project
• Helm charts, namespace isolation, resource management

Hybrid on-prem + cloud:
• Designed region-aware systems that balance on-prem and cloud resources
• Solved complex networking constraints (OAuth2 redirects across regions, client affinity)
• Understood cost trade-offs between dedicated on-prem and cloud elasticity

I'm also comfortable with Docker, Terraform, and modern DevOps tooling—the fundamentals 
transfer across providers.

════════════════════════════════════════════════════════════════════════════════

6. "Tell us about your experience with Kafka and event-driven systems."
───────────────────────────────────────────────────────────────────────────────

COPY-PASTE READY:

I've designed and operated Kafka at scale: 10M+ events per day, multi-partition topics, 
consumer groups, offset management.

Specific work:
• Designed topic schema for complex financial workflows (identity service events, 
  transaction telemetry, audit logs)
• Implemented consumer group logic for multi-tenant isolation
• Solved backpressure problems: when downstream systems lagged, tuned producer batching 
  and broker configuration
• Monitoring: tracked producer lag, consumer lag, and partition rebalancing in real-time

Event-driven patterns:
• Service-to-service communication via Kafka (instead of direct API calls)
• Event sourcing for audit and compliance (identity service: every auth decision logged 
  as immutable event)
• Stream processing for analytics and real-time alerts

Trade-offs I've navigated:
• Exactly-once vs. at-least-once delivery semantics (and when each is appropriate)
• Decoupling vs. debugging complexity (Kafka is powerful but you pay for the complexity 
  in observability)

For AI systems at RBC, Kafka becomes critical: logging agent decisions, streaming 
training data, building event-driven ML pipelines. I've done this.

════════════════════════════════════════════════════════════════════════════════

FORM FIELDS:

NAME: Robison Karls
EMAIL: robison.karls@gmail.com
PHONE: 226-505-4522
LOCATION: Calgary, Alberta / Cochrane, AB (same region)
LINKEDIN: linkedin.com/in/robison-karls

WORK ARRANGEMENT: [Select appropriate based on RBC's openness]
Ideally: "Flexible / Open to discussion" (Calgary location is tier-2 acceptable, but 
clarify if remote work is possible within RBC Borealis)

NOTICE PERIOD: [If currently employed, state: "2 weeks standard" or discuss with Dayforce]

RESUME UPLOAD: cv-robison-karls-rbc-staff-ai-2026-06-02.pdf (47.3 KB, 2 pages)

════════════════════════════════════════════════════════════════════════════════

SUBMISSION CHECKLIST:

☐ Fill form fields (name, email, phone, location, work arrangement)
☐ Upload resume PDF (output/cv-robison-karls-rbc-staff-ai-2026-06-02.pdf)
☐ Answer Q1: "Tell us about your experience designing agentic AI systems" → Copy-paste from above
☐ Answer Q2: "Describe your experience with distributed systems at scale" → Copy-paste from above
☐ Answer Q3: "Why are you interested in RBC Borealis and this role?" → Copy-paste from above
☐ Answer Q4: "Tell us about your Python experience" → Copy-paste from above
☐ Answer Q5: "What experience do you have with cloud infrastructure?" → Copy-paste from above
☐ Answer Q6: "Tell us about your experience with Kafka?" → Copy-paste from above
☐ Review all answers
☐ Submit application
☐ Tell Copilot: "Applied to RBC"
☐ Update tracker: status → "Applied"

════════════════════════════════════════════════════════════════════════════════

FOLLOW-UP TRACKER:

Submit date: [Today, 2026-06-02]
Expected recruiter contact: 2–5 business days (major bank ATS)
LinkedIn outreach: June 3 (2–3 RBC Borealis engineers)
Follow-up email (if no response): June 9

════════════════════════════════════════════════════════════════════════════════
