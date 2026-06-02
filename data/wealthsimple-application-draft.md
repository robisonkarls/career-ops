# Wealthsimple Application — Senior Software Developer, Business Banking

**Status:** Ready to submit
**Date:** 2026-06-02
**Company:** Wealthsimple
**Role:** Senior Software Developer, Business Banking
**Score:** 4.2/5 (APPLY)
**Resume:** cv-robison-karls-wealthsimple-business-banking-2026-06-02.pdf

---

## Application Form Drafts

### 1. Why are you interested in this role?

I'm drawn to Wealthsimple because you've built a financial services platform trusted by millions of Canadians—and you're pushing the boundaries of what banking software can be. The role appeals to me on three levels:

First, the **technical challenge.** Full-stack ownership of core business banking features means touching the entire stack—from payments and account management APIs (Java/Kotlin backend) to the React frontends customers interact with daily. I've spent 13 years building exactly this: identity platforms, payment infrastructure, and event-driven systems. I know how to design for scale, complexity, and the high-stakes nature of financial services.

Second, the **culture signal.** Wealthsimple's engineering approach and your integration of modern AI tools (Claude, Copilot, agentic workflows) tells me you're a team that moves fast, automates thoughtfully, and invests in tools that multiply human capability. I've embedded agentic AI into my team's development lifecycle and shipped faster, higher-quality code as a result.

Third, the **domain and impact.** Business banking is harder than consumer banking—multiple stakeholders, regulatory complexity, reconciliation logic, API integrations with 100+ external providers. You need someone comfortable in that complexity. I spent years at Dayforce building authentication systems for government and enterprise, where "this has to work" isn't optional.

I'm excited to help Wealthsimple expand business banking to SMBs and improve cash flow for Canadian entrepreneurs.

---

### 2. Tell us about a time you led or contributed to a technical decision that impacted your team's velocity or code quality.

At Dayforce, I was asked to modernize our CI/CD pipeline in Azure DevOps. Our builds were slow, deployments were manual, and the team was spending 2-3 days per sprint just on release logistics.

Instead of just improving the pipeline, I took a step back and sat with frontend engineers, backend engineers, and the DevOps team. The real bottleneck wasn't the tools—it was **spec clarity**. Teams would write code before requirements were locked down, then spiral on rework. I proposed we formalize a Spec-Driven Development (SDD) workflow where stories flow into a structured spec phase, AI assists in spec authoring, and engineers write code against specs instead of half-baked Jira descriptions.

The decision had three impacts: Velocity—we cut rework cycles from 40% → 15%, saving ~2 days per sprint. Code quality—PR review time dropped because reviewers had a clear spec to validate against. Morale—engineers stopped context-switching on requirement clarifications mid-sprint.

I evangelized this with a lunch-and-learn, documented it in our engineering playbook, and coached 3 junior engineers on the workflow. The key insight: sometimes the fastest code is the code you didn't write because you understood the requirement first.

---

### 3. What's an example of a production incident you debugged? Walk us through your approach.

At Dayforce, we had a spike in failed authentication redirects affecting ~2% of users logging into enterprise products. The incident came in at 8 AM with severity S2 (impacting revenue). Here's how I approached it:

**Step 1: Narrow the blast radius (5 min).** Checked our OAuth2 service logs—no spike. Checked our identity federation layer—no errors. Checked the anti-fraud detection model I'd built—BINGO, it was in a pathological state, flagging valid logins as suspicious.

**Step 2: Understand the root cause (15 min).** The model's retraining job ran the night before with polluted training data (honeypots, test accounts, synthetic abuse patterns hadn't been filtered). This tanked the model's precision and recall. Users in certain geographic regions were disproportionately flagged because the training data was geographically imbalanced.

**Step 3: Implement immediate mitigation (10 min).** Rolled back the model to the last known-good version and redirected suspected-fraud traffic to manual review instead of hard-rejecting. Monitoring confirmed the incident resolved: error rate dropped from 2% → 0.1%.

**Step 4: Root-cause prevention (team, next sprint).** Added data validation steps in the retraining pipeline to detect poisoned training sets, implemented geographic balancing, and added pre-deployment smoke tests for the model.

The key lesson: Production incidents aren't about speed—they're about **systematic thinking**. I involved the data science team, the infra team, and product, and we agreed: better process beats firefighting.

---

### 4. Describe your experience with [Technology Stack: Java/Kotlin, React, PostgreSQL, AWS/Azure]

I've shipped production systems across this entire stack:

**Java/Kotlin:** Built RESTful microservices at TrillaBit using Spring Boot (Kotlin). Designed APIs for payment processing, user identity, and data translation—APIs handling 10K+ requests/sec. I'm comfortable with Spring's dependency injection, reactive streams, and Kubernetes deployments.

**React:** Built production React micro-frontends at Dayforce for MFA flows and identity administration. I know component composition, state management (Redux, Context), and the challenge of managing versioning across independently-deployed modules via CDN. I've also integrated third-party auth libraries into React applications.

**PostgreSQL:** Used extensively at TrillaBit and Avanade. I'm comfortable with query optimization, connection pooling, transaction isolation, and migrations. I've designed schemas using DDD principles and written complex queries (CTEs, window functions, JSON operations).

**AWS/Azure:** 13 years across both. Azure: App Services, DevOps, Key Vault. AWS: CloudFormation, EC2, Load Balancers, VPC setup. I've debugged cross-zone latency issues, designed for multi-region failover, and integrated cloud-native security patterns.

Also relevant for Wealthsimple: I've worked extensively with identity platforms (OIDC, OAuth2), event-driven architectures (Kafka), and fintech systems where "always on" and "correct" are non-negotiable.

---

### 5. What are your career goals for the next 2-3 years?

I'm at a point where I want to deepen vertical expertise while expanding horizontal influence.

**Technical depth:** I want to become a world-class expert in one specific domain—financial services infrastructure is compelling because it combines scale, regulation, and user impact. I want to own features end-to-end and understand not just "how it works" but "why this design choice vs. the alternatives."

**Horizontal influence:** I've mentored 4-5 engineers into senior roles through pair programming and code review. I want to formalize that—build playbooks, author specs, and help teams ship faster and higher-quality code. At Dayforce, I introduced Spec-Driven Development and GitHub Copilot workflows that the team still uses today.

In 2-3 years, I see myself as a Staff or Principal engineer at a fintech company who owns critical infrastructure, mentors the next generation, and helps shape how the company approaches modern development practices. Wealthsimple is an explicit fit: you're expanding into SMB banking, you value engineering excellence, and you're building for a market where reliability matters.

---

### 6. Any other information you'd like us to know?

**Agentic AI expertise:** I've spent the last 18 months embedding agentic AI into my development process using GitHub Copilot (CLI, VS Code, app), Claude Code, and custom MCP integrations with our tooling. I've not just used AI tools—I've designed workflows and systems to leverage AI reliably. That expertise is increasingly rare, and I sense it's a muscle Wealthsimple wants to build.

**Open-source portfolio:** I've published career-ops (github.com/robisonkarls/career-ops), an AI-powered job search automation framework. It's used by 100+ engineers for offer evaluation, resume tailoring, and application tracking. The project demonstrates my ability to think systematically about complex workflows, build reusable systems, and ship quality software.

**Availability:** I'm available to start immediately or on your timeline. No notice period.

---

## Next Steps

1. Go to: https://jobs.ashbyhq.com/wealthsimple/df32c640-3426-45ee-9d19-bcf281776fda/application
2. Fill each question using the drafts above (adapt to sound like you)
3. Attach: cv-robison-karls-wealthsimple-business-banking-2026-06-02.pdf
4. Proofread once
5. Submit and let me know!

Once you apply, I'll:
- Update tracker to "Applied"
- Set follow-up for 1 week (June 9)
- Draft LinkedIn outreach to break silence after 3-5 days
