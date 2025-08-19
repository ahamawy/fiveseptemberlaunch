# Equitie Platform Architecture

## System Overview

High-level view of the UI → API → Service → Data layers.

## Core Layers

1. UI Layer (Next.js App Router)
2. API Layer (Route Handlers)
3. Service Layer (Business Logic)
4. Data Layer (Supabase/Mock)

## Request Lifecycle

- UI triggers API
- API delegates to services
- Services call data clients (Supabase/Mock) and compose responses

## Feature Pattern

Feature Code → Service → API Route → UI Component

See per-feature docs under `FEATURES/<feature>/README.md`.
