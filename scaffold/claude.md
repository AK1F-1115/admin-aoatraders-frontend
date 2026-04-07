# AOA Traders Admin Frontend — Claude Operating Guide

You are working in a **production-grade admin frontend**.

This system is:
- Multi-tenant
- Connected to a FastAPI backend
- Used by real users
- Security-sensitive

---

# 🚨 CRITICAL RULE

If required context is missing:
→ DO NOT PROCEED  
→ ASK FOR CONTEXT  

Proceeding without proper context is a FAILURE.

---

# 📚 REQUIRED FILES (MANDATORY)

Before ANY work:

You MUST reference:

1. `admin.frontend.instructions.md`
2. `ARCHITECTURE.md`
3. `TODO.md`
4. `ADMIN_FRONTEND.md`

---

If any required file is not consulted when needed:
→ STOP

---

# 🧠 REQUIRED THINKING PROCESS

Before writing ANY code:

You MUST create a structured plan:

### PLAN MUST INCLUDE:

1. Problem summary  
2. Scope (which pages/components affected)  
3. Files to change  
4. API endpoints involved  
5. State management approach  
6. Risk level (SAFE / MEDIUM / DANGEROUS)  
7. Failure handling  
8. Security considerations  
9. Idempotency check  

---

If ANY section is missing:
→ STOP

---

# ⚠️ RISK LEVELS (STRICT)

## SAFE
- UI-only changes
- styling
- isolated components

→ Can proceed without confirmation

---

## MEDIUM
- API integration
- state changes
- hooks

→ Must verify architecture alignment

---

## DANGEROUS
- auth changes
- routing changes
- global state changes
- layout/navigation changes

→ MUST pause and confirm before proceeding

---

# 🔍 REQUIRED PRE-CHECK

Before implementing ANY feature:

You MUST check:

- Does this already exist?
- Is there an existing component?
- Is there an existing API call?
- Is there an existing pattern?

If YES:
→ REUSE  
→ DO NOT DUPLICATE  

---

# 🧩 FRONTEND ARCHITECTURE RULES

## COMPONENTS

- < 50 lines
- single responsibility
- reusable
- no business logic inside UI components

---

## FILE STRUCTURE
/pages
/components
/hooks
/services/api
/types
/utils


---

## API RULES

- NO direct fetch inside components
- ALL calls go through `/services/api`
- ALL calls must:
  - be authenticated
  - use HTTPS
  - handle errors

---

## STATE MANAGEMENT

- Server state → React Query
- Local state → useState
- Shared state → minimal context

---

# 🔐 SECURITY RULES (NON-NEGOTIABLE)

- NEVER expose tokens
- NEVER trust frontend validation alone
- ALWAYS validate inputs
- ALWAYS sanitize outputs
- ALWAYS use authenticated requests

---

# 🔄 DATA FLOW (MANDATORY)

UI → Hook → API Service → Backend → Response → Cache → UI

---

# ⚠️ PRODUCTION SAFETY RULES

NEVER:

- Break navigation
- Break authentication flows
- Introduce inconsistent UI states
- Leak cross-tenant data
- Hardcode API URLs

---

# 🧪 FAILURE HANDLING

ALL features must:

- Fail gracefully
- Show toast errors
- Log errors to console
- NOT crash UI

---

# 🔁 DEVELOPMENT RULES

- Prefer modifying existing code
- Avoid duplication
- Follow existing patterns
- Minimize blast radius

---

# 🧪 TESTING EXPECTATIONS

Before completing:

- Test UI rendering
- Test API calls
- Test failure states
- Check console for errors
- Ensure no security issues

---

# 🧠 FINAL VALIDATION CHECK

Before responding, ask:

- Did I follow instructions?
- Did I check architecture?
- Is this secure?
- Is this scalable?
- Does this break anything?

If ANY answer is NO:
→ REVISE

---

# 🎯 GOAL

Build a **secure, scalable, production-safe admin frontend**
that integrates cleanly with the backend.

Failure to follow these rules = invalid implementation