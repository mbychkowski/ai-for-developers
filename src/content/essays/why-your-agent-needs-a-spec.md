---
title: Why Your Agent Needs a Spec
description: An agent will happily build the wrong thing quickly. A short spec is the cheapest guardrail you have.
published: 2026-11-04
topics: [agentic-engineering, ai-developer-governance]
---

Hand an agent a vague request and it will do exactly what you asked, which is rarely what you meant. Speed makes this worse, not better: you get a confident, complete, wrong answer in minutes.

## A spec is a definition of done

A useful spec doesn't need to be long. It needs to answer three questions:

1. **What** should exist when the work is finished?
2. **How** will we know it works? Ideally, a test the agent can run.
3. **What's out of scope?** The no's matter as much as the yes's.

## Write it before the first prompt

The spec is also for you. Writing it forces the decisions you'd otherwise make halfway through a review, when changing course is expensive.

> If you can't describe "done", neither can your agent.
